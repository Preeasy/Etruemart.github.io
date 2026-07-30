import { AuthOptions, Session } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

// Hardcoded demo accounts (no DB required)
// Set these via Vercel env vars or edit directly
const ACCOUNTS: Record<string, { password: string; name: string; role: string }> = {
  'yeatrusourcing@gmail.com': {
    password: process.env.ADMIN_PASSWORD || 'ldz52385109',
    name: 'Yeatrusourcing',
    role: 'ADMIN',
  },
  'neil6corrot@gmail.com': {
    password: process.env.SELLER_PASSWORD || 'ldz52385109',
    name: 'Official Seller',
    role: 'OFFICIAL_SELLER',
  },
};

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
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const account = ACCOUNTS[credentials.email.toLowerCase()];
        if (!account) {
          return null;
        }

        if (account.password !== credentials.password) {
          return null;
        }

        return {
          id: credentials.email,
          email: credentials.email,
          name: account.name,
          role: account.role,
          allowedCategoryId: null,
        };
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
