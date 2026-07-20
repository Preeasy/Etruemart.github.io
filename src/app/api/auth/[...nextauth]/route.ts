import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

const handler = (NextAuth as unknown as (opts: typeof authOptions) => ReturnType<typeof NextAuth>)(authOptions);

export { handler as GET, handler as POST };
