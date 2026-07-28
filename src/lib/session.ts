import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth';

const mockUsers = [
  {
    id: '1',
    email: 'Yeatrusourcing',
    name: 'Yeatrusourcing',
    role: 'ADMIN',
    avatar: null,
  },
];

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return null;
  }

  const user = mockUsers.find((u) => u.id === session.user.id);
  return user || null;
}

export async function requireAuth() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return null;
  }
  return session.user;
}

export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'ADMIN') {
    return null;
  }
  return session.user;
}
