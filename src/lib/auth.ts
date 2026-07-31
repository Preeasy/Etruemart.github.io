import { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from './prisma';
import bcrypt from 'bcryptjs';

export const authOptions: AuthOptions = {
  session: {
    strategy: 'jwt',
  },
  providers: [
    CredentialsProvider({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        console.log('[AUTH] authorize called with:', credentials?.email);
        if (!credentials?.email || !credentials?.password) {
          console.log('[AUTH] missing credentials');
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        console.log('[AUTH] user found:', user ? user.email : 'NOT FOUND');

        if (!user) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );
        console.log('[AUTH] password valid:', isPasswordValid);

        if (!isPasswordValid) {
          return null;
        }

        const result = {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          allowedCategoryId: user.allowedCategoryId,
        };
        console.log('[AUTH] login success:', result.email, 'role:', result.role);
        return result;
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id as string,
          role: token.role as string,
          allowedCategoryId: token.allowedCategoryId as string | null,
        },
      };
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as unknown as { role: string }).role;
        token.allowedCategoryId = (user as unknown as { allowedCategoryId: string | null }).allowedCategoryId;
      }
      return token;
    },
  },
  pages: {
    signIn: '/login',
  },
};

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
      allowedCategoryId: string | null;
    };
  }
}
