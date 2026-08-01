import { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from './prisma';
import bcrypt from 'bcryptjs';

const MAX_LOGIN_ATTEMPTS = 5;
const loginAttempts = new Map<string, { count: number; lockedUntil: number }>();

export const authOptions: AuthOptions = {
  session: {
    strategy: 'jwt',
    maxAge: 60 * 60 * 24 * 30,
  },
  providers: [
    CredentialsProvider({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email.toLowerCase().trim();

        // Rate limiting
        const attempt = loginAttempts.get(email);
        if (attempt) {
          if (attempt.lockedUntil > Date.now()) {
            return null;
          }
          if (attempt.count >= MAX_LOGIN_ATTEMPTS) {
            loginAttempts.delete(email);
          }
        }

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) {
          // Track failed attempts
          const current = loginAttempts.get(email) || { count: 0, lockedUntil: 0 };
          current.count++;
          if (current.count >= 3) {
            current.lockedUntil = Date.now() + 60_000;
          }
          loginAttempts.set(email, current);
          return null;
        }

        // Use sync bcrypt for speed (no need for async salt generation)
        const isPasswordValid = bcrypt.compareSync(
          credentials.password,
          user.passwordHash
        );

        if (!isPasswordValid) {
          const current = loginAttempts.get(email) || { count: 0, lockedUntil: 0 };
          current.count++;
          if (current.count >= 3) {
            current.lockedUntil = Date.now() + 60_000;
          }
          loginAttempts.set(email, current);
          return null;
        }

        // Clear attempts on success
        loginAttempts.delete(email);

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          allowedCategoryId: user.allowedCategoryId,
        };
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token?.id) {
        session.user = {
          ...session.user,
          id: token.id as string,
          role: (token as { role?: string }).role as string,
          allowedCategoryId: (token as { allowedCategoryId?: string | null }).allowedCategoryId as string | null,
        };
      }
      return session;
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
  secret: process.env.NEXTAUTH_SECRET || 'etruemart-secret',
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
