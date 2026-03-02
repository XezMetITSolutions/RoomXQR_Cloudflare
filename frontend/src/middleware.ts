import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const supportedLocales = ['tr', 'de', 'en', 'ru', 'ar'];

export function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;

    // Skip middleware for API routes, static files, and special Next.js paths
    if (
        pathname.startsWith('/api/') ||
        pathname.startsWith('/_next/') ||
        pathname.startsWith('/static/') ||
        pathname.includes('.') ||
        pathname.startsWith('/management') ||
        pathname.startsWith('/guest') ||
        pathname.startsWith('/login') ||
        pathname.startsWith('/demo') ||
        pathname.startsWith('/system-admin') ||
        pathname.startsWith('/kitchen') ||
        pathname.startsWith('/reception') ||
        pathname.startsWith('/qr-menu') ||
        pathname.startsWith('/admin-login') ||
        pathname.startsWith('/panels')
    ) {
        return NextResponse.next();
    }

    // Check if pathname already has a locale
    const pathnameHasLocale = supportedLocales.some(
        (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
    );

    if (pathnameHasLocale) {
        return NextResponse.next();
    }

    // If it's the root page, redirect based on browser language
    if (pathname === '/') {
        const acceptLanguage = request.headers.get('accept-language');
        let targetLocale = 'en'; // Default to English

        if (acceptLanguage) {
            if (acceptLanguage.includes('tr')) targetLocale = 'tr';
            else if (acceptLanguage.includes('de')) targetLocale = 'de';
            else if (acceptLanguage.includes('ru')) targetLocale = 'ru';
            else if (acceptLanguage.includes('ar')) targetLocale = 'ar';
        }

        const url = new URL(`/${targetLocale}`, request.url);
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

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
