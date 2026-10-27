import { type NextRequest } from 'next/server';
import { UnauthorizedError } from './errors';
import { type AuthContext } from './permissions';

export async function getAuthContext(request: NextRequest): Promise<AuthContext | null> {
  const customUserId = request.headers.get('x-user-id');
  if (customUserId) {
    return {
      userId: customUserId,
      role: 'MEMBER',
    };
  }

  const authHeader = request.headers.get('authorization');
  const sessionCookie = request.cookies.get('session_id')?.value;

  if (!authHeader && !sessionCookie) {
    return null;
  }

  // Header or cookie based authentication extraction
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    if (token) {
      return {
        userId: token,
        role: 'MEMBER',
      };
    }
  }

  if (sessionCookie) {
    return {
      userId: sessionCookie,
      role: 'MEMBER',
    };
  }

  return null;
}

export async function requireAuth(request: NextRequest): Promise<AuthContext> {
  const context = await getAuthContext(request);
  if (!context) {
    throw new UnauthorizedError('Authentication required');
  }
  return context;
}
