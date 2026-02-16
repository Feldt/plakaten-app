import React, { createContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import * as authService from './authService';
import type { AuthUser, AuthState, SignUpParams, SignInParams, OrgStatus } from '@/types/auth';
import { createLogger } from '@/lib/logger';

const log = createLogger('AuthContext');

interface AuthContextValue extends AuthState {
  signUp: (params: SignUpParams) => Promise<void>;
  signIn: (params: SignInParams) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signInWithOtp: (phone: string) => Promise<{ success: boolean; error?: string }>;
  verifyOtp: (phone: string, token: string) => Promise<{ success: boolean; error?: string; userId?: string }>;
  signInWithApple: () => Promise<{ success: boolean; error?: string }>;
  deleteAccount: () => Promise<void>;
  orgStatus: OrgStatus | null;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,
    orgStatus: null,
  });

  const detectAndSetRole = useCallback(async (userId: string, currentUser: AuthUser) => {
    const roleResult = await authService.detectUserRole(userId);
    if (roleResult.success) {
      setState((s) => ({
        ...s,
        user: s.user ? { ...s.user, role: roleResult.data.role } : null,
        orgStatus: roleResult.data.orgStatus ?? null,
      }));
    }
  }, []);

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const role = (session.user.user_metadata?.role as AuthUser['role']) ?? 'worker';
        const user: AuthUser = {
          id: session.user.id as never,
          email: session.user.email ?? '',
          phone: session.user.phone ?? null,
          role,
          organizationId: (session.user.user_metadata?.organization_id as never) ?? null,
          workerId: (session.user.user_metadata?.worker_id as never) ?? null,
          emailVerified: !!session.user.email_confirmed_at,
          createdAt: session.user.created_at ?? '',
        };

        setState({
          user,
          session: {
            accessToken: session.access_token,
            refreshToken: session.refresh_token,
            expiresAt: session.expires_at ?? 0,
          },
          isLoading: false,
          isAuthenticated: true,
          error: null,
          orgStatus: null,
        });

        // Detect role after setting initial state
        await detectAndSetRole(session.user.id, user);
      } else {
        setState((s) => ({ ...s, isLoading: false }));
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const role = (session.user.user_metadata?.role as AuthUser['role']) ?? 'worker';
        const user: AuthUser = {
          id: session.user.id as never,
          email: session.user.email ?? '',
          phone: session.user.phone ?? null,
          role,
          organizationId: (session.user.user_metadata?.organization_id as never) ?? null,
          workerId: (session.user.user_metadata?.worker_id as never) ?? null,
          emailVerified: !!session.user.email_confirmed_at,
          createdAt: session.user.created_at ?? '',
        };

        setState({
          user,
          session: {
            accessToken: session.access_token,
            refreshToken: session.refresh_token,
            expiresAt: session.expires_at ?? 0,
          },
          isLoading: false,
          isAuthenticated: true,
          error: null,
          orgStatus: null,
        });

        await detectAndSetRole(session.user.id, user);
      } else {
        setState({
          user: null,
          session: null,
          isLoading: false,
          isAuthenticated: false,
          error: null,
          orgStatus: null,
        });
      }
    });

    return () => subscription.unsubscribe();
  }, [detectAndSetRole]);

  const handleSignUp = useCallback(async (params: SignUpParams) => {
    setState((s) => ({ ...s, isLoading: true, error: null }));
    const result = await authService.signUp(params);
    if (!result.success) {
      setState((s) => ({ ...s, isLoading: false, error: result.error.message }));
    }
  }, []);

  const handleSignIn = useCallback(async (params: SignInParams) => {
    setState((s) => ({ ...s, isLoading: true, error: null }));
    const result = await authService.signIn(params);
    if (!result.success) {
      setState((s) => ({ ...s, isLoading: false, error: result.error.message }));
    }
  }, []);

  const handleSignOut = useCallback(async () => {
    const result = await authService.signOut();
    if (!result.success) {
      log.error('Sign out failed', result.error);
    }
    // Immediately clear auth state so the root router redirects to welcome.
    // Don't set isLoading: true — that causes the spinner to flash
    // while onAuthStateChange races with router.replace('/').
    setState({
      user: null,
      session: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,
      orgStatus: null,
    });
  }, []);

  const handleResetPassword = useCallback(async (email: string) => {
    const result = await authService.resetPassword(email);
    if (!result.success) {
      setState((s) => ({ ...s, error: result.error.message }));
    }
  }, []);

  const handleSignInWithOtp = useCallback(async (phone: string) => {
    const result = await authService.signInWithOtp(phone);
    if (!result.success) {
      return { success: false, error: result.error.message };
    }
    return { success: true };
  }, []);

  const handleVerifyOtp = useCallback(async (phone: string, token: string) => {
    setState((s) => ({ ...s, isLoading: true, error: null }));
    const result = await authService.verifyOtp(phone, token);
    if (!result.success) {
      setState((s) => ({ ...s, isLoading: false, error: result.error.message }));
      return { success: false, error: result.error.message };
    }
    return { success: true, userId: result.data.id };
  }, []);

  const handleDeleteAccount = useCallback(async () => {
    if (!state.user) return;
    setState((s) => ({ ...s, isLoading: true }));
    const result = await authService.deleteAccount(state.user.id, state.user.role);
    if (!result.success) {
      log.error('Delete account failed', result.error);
      setState((s) => ({ ...s, isLoading: false }));
    }
  }, [state.user]);

  const handleSignInWithApple = useCallback(async () => {
    setState((s) => ({ ...s, isLoading: true, error: null }));
    const result = await authService.signInWithApple();
    if (!result.success) {
      const isCancelled = result.error.message === 'cancelled';
      setState((s) => ({ ...s, isLoading: false, error: isCancelled ? null : result.error.message }));
      return { success: false, error: isCancelled ? undefined : result.error.message };
    }
    return { success: true };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        signUp: handleSignUp,
        signIn: handleSignIn,
        signOut: handleSignOut,
        resetPassword: handleResetPassword,
        signInWithOtp: handleSignInWithOtp,
        verifyOtp: handleVerifyOtp,
        signInWithApple: handleSignInWithApple,
        deleteAccount: handleDeleteAccount,
        orgStatus: state.orgStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
