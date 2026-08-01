import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;
    const role = token?.role as string | undefined;

    // Admin-only routes
    const adminPaths = ['/shipping-admin', '/api/init', '/api/seed', '/api/products/batch'];
    if (adminPaths.some(p => path.startsWith(p))) {
      if (role !== 'ADMIN') {
        return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
      }
    }

    // Seller+ routes (ADMIN or OFFICIAL_SELLER)
    const sellerPaths = ['/sell', '/dashboard'];
    if (sellerPaths.some(p => path.startsWith(p))) {
      if (role !== 'ADMIN' && role !== 'OFFICIAL_SELLER') {
        return NextResponse.redirect(new URL('/login', req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;

        // Public API routes that don't require auth
        const publicApiPaths = ['/api/auth', '/api/products', '/api/categories', '/api/shipping'];
        // GET requests to public APIs are allowed without auth
        if (publicApiPaths.some(p => path.startsWith(p)) && req.method === 'GET') {
          return true;
        }

        // Public pages
        const publicPages = ['/', '/login', '/register', '/products', '/store', '/init'];
        if (publicPages.some(p => path === p || path.startsWith(p))) {
          return true;
        }

        // For everything else, require a token
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/sell/:path*',
    '/orders/:path*',
    '/shipping-admin/:path*',
    '/api/init',
    '/api/seed',
    '/api/products/batch',
    '/api/shipping/:path*',
  ],
};
