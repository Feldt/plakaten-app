import type { UserRole } from '@/types/auth';

export function requireRole(userRole: UserRole | undefined, requiredRole: UserRole): boolean {
  if (!userRole) return false;
  if (userRole === 'platform_admin') return true;
  return userRole === requiredRole;
}

export function isPartyAdmin(role: UserRole | undefined): boolean {
  return requireRole(role, 'party_admin');
}

export function isWorker(role: UserRole | undefined): boolean {
  return requireRole(role, 'worker');
}

export function isPlatformAdmin(role: UserRole | undefined): boolean {
  return role === 'platform_admin';
}
