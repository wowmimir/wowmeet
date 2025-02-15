import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

const protectedRoute = createRouteMatcher([
  '/',
  '/upcoming',
  '/meeting(.*)',
  '/previous',
  '/recordings',
  '/personal-room',
]);

export default clerkMiddleware(async (auth, req) => {
  if (protectedRoute(req)) {
    const authObject = await auth();

    if (!authObject.userId) {
      // Await headers() properly
      const headerList = await headers();  // Await headers correctly
      const host = headerList.get('host') || 'localhost:3000'; // Dev fallback
      const protocol = headerList.get('x-forwarded-proto') || 'http'; // Production
      const baseUrl = `${protocol}://${host}`;

      // OR, if you're using NEXT_PUBLIC_BASE_URL (recommended):
      // const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${protocol}://${host}`;

      const signInUrl = `${baseUrl}/sign-in`;
      return NextResponse.redirect(signInUrl);  // Use NextResponse.redirect for server-side redirect
    }
  }

  // Allow the request to continue if authenticated
  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
