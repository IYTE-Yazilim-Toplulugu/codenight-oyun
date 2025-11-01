import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/api';

// Define which routes are considered authentication routes
const authRoutes = ['/login'];

// Define which routes are public (don't require authentication)
const publicRoutes = ['/login', '/', ''];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Skip middleware for API routes and static assets
    if (pathname.startsWith('/api') || pathname.startsWith('/_next') || pathname.includes('.')) {
        return NextResponse.next();
    }

    // Check if the user is authenticated by checking the auth status
    const token = request.cookies.get('authToken')?.value;
    let isAuthenticated = false;

    if (token) {
        try {
            // Verify the authentication status with your API
            // isAuthenticated = await auth.getStatus();
            isAuthenticated = true; // For demonstration purposes, assume token presence means authenticated
        } catch (error) {
            // If there's an error checking auth status, consider user not authenticated
            isAuthenticated = false;
        }
    }

    // If user is authenticated and trying to access auth routes, redirect to home
    if (isAuthenticated && authRoutes.some(route => pathname.startsWith(route))) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    // If user is not authenticated and trying to access protected routes, redirect to login
    if (!isAuthenticated && !publicRoutes.some(route => pathname.startsWith(route))) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
