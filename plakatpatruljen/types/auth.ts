import { UserId, OrganizationId, WorkerId } from './database';

export type UserRole = 'party_admin' | 'worker' | 'platform_admin';

export type OrgStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export interface AuthUser {
  id: UserId;
  email: string;
  phone: string | null;
  role: UserRole;
  organizationId: OrganizationId | null;
  workerId: WorkerId | null;
  emailVerified: boolean;
  createdAt: string;
}

export interface AuthState {
  user: AuthUser | null;
  session: { accessToken: string; refreshToken: string; expiresAt: number } | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  orgStatus: OrgStatus | null;
}

export interface SignUpParams {
  email: string;
  password: string;
  role: UserRole;
  fullName: string;
  phone?: string;
}

export interface SignInParams {
  email: string;
  password: string;
}

