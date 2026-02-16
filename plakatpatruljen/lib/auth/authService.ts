import { supabase } from '@/lib/supabase/client';
import { AppError, ok, err, type Result } from '@/lib/errors';
import { createLogger } from '@/lib/logger';
import { normalizeDanishPhone } from '@/lib/validation/phone';
import * as AppleAuthentication from 'expo-apple-authentication';
import type { AuthUser, SignUpParams, SignInParams, UserRole, OrgStatus } from '@/types/auth';
import type { UserId } from '@/types/database';

const log = createLogger('authService');

export async function signUp(params: SignUpParams): Promise<Result<AuthUser>> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email: params.email,
      password: params.password,
      options: {
        data: {
          full_name: params.fullName,
          role: params.role,
          phone: params.phone,
        },
      },
    });

    if (error) return err(AppError.fromSupabaseError(error));
    if (!data.user) return err(new AppError('UNKNOWN', 'No user returned'));

    // Create user profile
    const { error: profileError } = await supabase.from('user_profiles').insert({
      user_id: data.user.id,
      role: params.role,
      full_name: params.fullName,
      phone: params.phone ?? null,
    });

    if (profileError) {
      log.warn('Failed to create user profile', profileError);
    }

    return ok(mapUser(data.user, params.role));
  } catch (e) {
    log.error('Sign up failed', e);
    return err(AppError.unknown(e));
  }
}

export async function signIn(params: SignInParams): Promise<Result<AuthUser>> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: params.email,
      password: params.password,
    });

    if (error) return err(AppError.fromSupabaseError(error));
    if (!data.user) return err(new AppError('UNKNOWN', 'No user returned'));

    const role = (data.user.user_metadata?.role as UserRole) ?? 'worker';
    return ok(mapUser(data.user, role));
  } catch (e) {
    log.error('Sign in failed', e);
    return err(AppError.unknown(e));
  }
}

export async function signInWithApple(): Promise<Result<AuthUser>> {
  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    if (!credential.identityToken) {
      return err(new AppError('UNKNOWN', 'No identity token from Apple'));
    }

    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'apple',
      token: credential.identityToken,
    });

    if (error) return err(AppError.fromSupabaseError(error));
    if (!data.user) return err(new AppError('UNKNOWN', 'No user returned'));

    // Apple only gives name on first sign-in, so update metadata if available
    const fullName = credential.fullName
      ? [credential.fullName.givenName, credential.fullName.familyName].filter(Boolean).join(' ')
      : undefined;

    if (fullName) {
      await supabase.auth.updateUser({ data: { full_name: fullName } });
    }

    const role = (data.user.user_metadata?.role as UserRole) ?? 'worker';
    return ok(mapUser(data.user, role));
  } catch (e: unknown) {
    // User cancelled — don't treat as error
    if (e && typeof e === 'object' && 'code' in e && e.code === 'ERR_REQUEST_CANCELED') {
      return err(new AppError('UNKNOWN', 'cancelled'));
    }
    log.error('Apple sign in failed', e);
    return err(AppError.unknown(e));
  }
}

export async function signOut(): Promise<Result<void>> {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) return err(AppError.fromSupabaseError(error));
    return ok(undefined);
  } catch (e) {
    log.error('Sign out failed', e);
    return err(AppError.unknown(e));
  }
}

export async function deleteAccount(userId: string, role: UserRole): Promise<Result<void>> {
  try {
    if (role === 'worker') {
      await supabase.from('task_claims').delete().eq('worker_id', userId);
      await supabase.from('poster_logs').delete().eq('worker_id', userId);
      await supabase.from('worker_profiles').delete().eq('user_id', userId);
    } else if (role === 'party_admin') {
      await supabase.from('organizations').delete().eq('created_by', userId);
    }

    await supabase.from('user_profiles').delete().eq('user_id', userId);
    const { error } = await supabase.auth.signOut();
    if (error) return err(AppError.fromSupabaseError(error));
    return ok(undefined);
  } catch (e) {
    log.error('Delete account failed', e);
    return err(AppError.unknown(e));
  }
}

export async function getCurrentUser(): Promise<Result<AuthUser | null>> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) return err(AppError.fromSupabaseError(error));
    if (!user) return ok(null);

    const role = (user.user_metadata?.role as UserRole) ?? 'worker';
    return ok(mapUser(user, role));
  } catch (e) {
    log.error('Get current user failed', e);
    return err(AppError.unknown(e));
  }
}

export async function resetPassword(email: string): Promise<Result<void>> {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) return err(AppError.fromSupabaseError(error));
    return ok(undefined);
  } catch (e) {
    log.error('Reset password failed', e);
    return err(AppError.unknown(e));
  }
}

export async function signInWithOtp(phone: string): Promise<Result<void>> {
  try {
    const { error } = await supabase.auth.signInWithOtp({
      phone: normalizeDanishPhone(phone),
    });
    if (error) return err(AppError.fromSupabaseError(error));
    return ok(undefined);
  } catch (e) {
    log.error('OTP send failed', e);
    return err(AppError.unknown(e));
  }
}

export async function verifyOtp(phone: string, token: string): Promise<Result<AuthUser>> {
  try {
    const { data, error } = await supabase.auth.verifyOtp({
      phone: normalizeDanishPhone(phone),
      token,
      type: 'sms',
    });
    if (error) return err(AppError.fromSupabaseError(error));
    if (!data.user) return err(new AppError('UNKNOWN', 'No user returned'));

    const role = (data.user.user_metadata?.role as UserRole) ?? 'worker';
    return ok(mapUser(data.user, role));
  } catch (e) {
    log.error('OTP verify failed', e);
    return err(AppError.unknown(e));
  }
}

export async function detectUserRole(userId: string): Promise<Result<{ role: UserRole; orgStatus?: OrgStatus }>> {
  try {
    // Check worker_profiles first
    const { data: workerProfile } = await supabase
      .from('worker_profiles')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (workerProfile) {
      return ok({ role: 'worker' as UserRole });
    }

    // Check organizations
    const { data: org } = await supabase
      .from('organizations')
      .select('status')
      .eq('created_by', userId)
      .single();

    if (org) {
      return ok({ role: 'party_admin' as UserRole, orgStatus: org.status as OrgStatus });
    }

    // Check user_profiles for platform_admin
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', userId)
      .single();

    if (profile?.role === 'platform_admin') {
      return ok({ role: 'platform_admin' as UserRole });
    }

    // Check user metadata as fallback (set during signUp)
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    const metadataRole = currentUser?.user_metadata?.role as UserRole | undefined;
    if (metadataRole && metadataRole !== 'worker') {
      return ok({ role: metadataRole });
    }

    // Default: no role found
    return ok({ role: 'worker' as UserRole });
  } catch (e) {
    log.error('Detect user role failed', e);
    return err(AppError.unknown(e));
  }
}

function mapUser(
  user: { id: string; email?: string; phone?: string; user_metadata?: Record<string, unknown>; email_confirmed_at?: string | null; created_at?: string },
  role: UserRole,
): AuthUser {
  return {
    id: user.id as UserId,
    email: user.email ?? '',
    phone: (user.phone as string) ?? null,
    role,
    organizationId: (user.user_metadata?.organization_id as string as never) ?? null,
    workerId: (user.user_metadata?.worker_id as string as never) ?? null,
    emailVerified: !!user.email_confirmed_at,
    createdAt: user.created_at ?? new Date().toISOString(),
  };
}
