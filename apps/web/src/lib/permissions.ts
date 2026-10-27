import { ForbiddenError } from './errors';

export type UserRole = 'MEMBER' | 'ADMIN' | 'SUPER_ADMIN';

export interface AuthContext {
  userId: string;
  role: UserRole;
  phone?: string;
}

export function requireRole(context: AuthContext, allowedRoles: UserRole[]) {
  if (!allowedRoles.includes(context.role)) {
    throw new ForbiddenError('You do not have permission to perform this action');
  }
}

export function requireAdmin(context: AuthContext) {
  requireRole(context, ['ADMIN', 'SUPER_ADMIN']);
}
