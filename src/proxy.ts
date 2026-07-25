import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

let locales = ['ar', 'en'];
let defaultLocale = 'ar';

function getLocale(request: NextRequest) {
  // Simple locale detection based on accept-language or just default to AR
  // For a landing page in Egypt, defaulting to AR is best.
  return defaultLocale;
}

export default function proxy(request: NextRequest) {
  // Check if there is any supported locale in the pathname
  const { pathname } = request.nextUrl;
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) return;

  // Redirect if there is no locale
  const locale = getLocale(request);
  request.nextUrl.pathname = `/${locale}${pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  matcher: [
    // Skip all internal paths (_next, api, images)
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
