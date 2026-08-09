import { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from './prisma';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 60_000; // 1 minute
const loginAttempts = new Map<string, { count: number; lockedUntil: number }>();

// Seed password from env, fallback only in development
const SEED_PASSWORD = process.env.SEED_PASSWORD || (process.env.NODE_ENV === 'production' ? null : 'ldz52385109');

async function ensureDbInitialized() {
  try {
    const count = await prisma.user.count();
    if (count >= 1) return;

    if (!SEED_PASSWORD) {
      console.warn('SEED_PASSWORD not set, skipping DB initialization');
      return;
    }

    const passwordHash = bcrypt.hashSync(SEED_PASSWORD, 12);

    // Single admin account — the only account that can upload/edit products
    const admin = await prisma.user.upsert({
      where: { email: 'yeatrusourcing@gmail.com' },
      update: { passwordHash, name: 'Yeatrusourcing', role: 'ADMIN' },
      create: { email: 'yeatrusourcing@gmail.com', passwordHash, name: 'Yeatrusourcing', role: 'ADMIN' },
    });

    // Import categories from categories-data.json
    try {
      const catDataPath = path.join(process.cwd(), 'categories-data.json');
      if (fs.existsSync(catDataPath)) {
        const catData = JSON.parse(fs.readFileSync(catDataPath, 'utf-8'));
        const catItems = catData.categories || [];
        const slugToId: Record<string, string> = {};

        for (const cat of catItems) {
          if (!cat.parentId) {
            const r = await prisma.category.upsert({
              where: { slug: cat.slug },
              update: { name: cat.name, sortOrder: cat.sortOrder || 0 },
              create: { name: cat.name, slug: cat.slug, sortOrder: cat.sortOrder || 0 },
            });
            slugToId[cat.slug] = r.id;
          }
        }
        for (const cat of catItems) {
          if (cat.parentId && slugToId[cat.parentId]) {
            const r = await prisma.category.upsert({
              where: { slug: cat.slug },
              update: { name: cat.name, parentId: slugToId[cat.parentId] },
              create: { name: cat.name, slug: cat.slug, parentId: slugToId[cat.parentId] },
            });
            slugToId[cat.slug] = r.id;
          }
        }
      }

      // Import products from site-data.json — all owned by the admin account
      const siteDataPath = path.join(process.cwd(), 'site-data.json');
      if (fs.existsSync(siteDataPath)) {
        const siteData = JSON.parse(fs.readFileSync(siteDataPath, 'utf-8'));
        const products = siteData.products || [];

        for (const p of products) {
          try {
            const catSlug = p.category?.slug || p.categorySlug;
            let categoryId = '';
            if (catSlug) {
              const cat = await prisma.category.findUnique({ where: { slug: catSlug } });
              if (cat) categoryId = cat.id;
            }
            if (!categoryId) {
              const catName = typeof p.category === 'object' ? p.category.name : (p.category || '');
              if (catName) {
                const cat = await prisma.category.findFirst({ where: { name: catName } });
                if (cat) categoryId = cat.id;
              }
            }
            if (!categoryId) {
              const firstCat = await prisma.category.findFirst();
              if (firstCat) categoryId = firstCat.id;
            }
            if (!categoryId) continue;

            const imagesArr = Array.isArray(p.images) ? p.images : [p.image];
            const keywordsStr = JSON.stringify(Array.isArray(p.keywords) ? p.keywords : [p.slug]);
            const priceMin = p.priceMin || p.price || 0;

            await prisma.product.create({
              data: {
                name: p.name,
                slug: p.slug,
                description: p.description || '',
                price: priceMin,
                originalPrice: p.priceMax || priceMin * 1.3,
                image: p.image,
                images: JSON.stringify(imagesArr),
                categoryId,
                stock: p.stock || 100,
                isPublished: p.isPublished !== false,
                sku: p.sku || null,
                material: p.material || null,
                plating: p.plating || null,
                process: p.process || null,
                color: p.color || null,
                size: p.size || null,
                packSize: p.packSize || 1,
                moq: p.moq || 1,
                keywords: keywordsStr,
                stockStatus: p.stockStatus || 'IN_STOCK',
                shippingCost: p.shippingCost ?? 0,
                shippingMethod: p.shippingMethod || 'Standard Shipping',
                aplus: p.aplus ? JSON.stringify(p.aplus) : null,
                authorId: admin.id,
                variants: {
                  create: [{ color: p.color || 'Default', size: p.size || 'One Size', price: priceMin, stock: p.stock || 100 }],
                },
              },
            });
          } catch (e: any) { if (typeof console !== 'undefined') console.warn('[auth.ts] credential inner block failed:', e?.message || e); }
        }
      }
    } catch (e: any) { if (typeof console !== 'undefined') console.warn('[auth.ts] provider auth block failed:', e?.message || e); }
  } catch (e: any) { if (typeof console !== 'undefined') console.warn('[auth.ts] signInCallback failed:', e?.message || e); }
}

export const authOptions: AuthOptions = {
  session: {
    strategy: 'jwt',
    maxAge: 60 * 60 * 24 * 7, // 7 days (reduced from 30)
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
        const password = credentials.password;

        // Rate limiting: check if locked
        const attempt = loginAttempts.get(email);
        if (attempt && attempt.lockedUntil > Date.now()) {
          return null;
        }

        // Try database
        try {
          await ensureDbInitialized();

          const user = await prisma.user.findUnique({
            where: { email },
          });

          if (user) {
            const isPasswordValid = bcrypt.compareSync(password, user.passwordHash);
            if (isPasswordValid) {
              loginAttempts.delete(email);
              return {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                allowedCategoryId: user.allowedCategoryId,
              };
            }
          }
        } catch (e: any) { if (typeof console !== 'undefined') console.warn('[auth.ts] signInCallback loop catch:', e?.message || e); }

        // Track failed attempts
        const current = loginAttempts.get(email) || { count: 0, lockedUntil: 0 };
        current.count++;
        if (current.count >= MAX_LOGIN_ATTEMPTS) {
          current.lockedUntil = Date.now() + LOCKOUT_DURATION;
        }
        loginAttempts.set(email, current);
        return null;
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
  secret: process.env.NEXTAUTH_SECRET,
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
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
