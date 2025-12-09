
'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useUser } from '@/firebase';

// Routes that are only accessible to unauthenticated users
const PUBLIC_ONLY_ROUTES = ['/login', '/register', '/admin/login'];

// The root dashboard page for authenticated users
const AUTH_HOME_ROUTE = '/dashboard';

// The root landing page for unauthenticated users
const PUBLIC_HOME_ROUTE = '/';

export function useAuthRedirect() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Wait until authentication status and pathname are determined
    if (isUserLoading || !pathname) {
      return;
    }

    const isPublicOnlyRoute = PUBLIC_ONLY_ROUTES.some(route => pathname.startsWith(route));
    const isSetupRoute = pathname === '/account' && new URLSearchParams(window.location.search).has('setup');
    
    // Scenario 1: User is NOT logged in
    if (!user) {
      // If they are on an authenticated route, redirect them to the public landing page.
      if (!isPublicOnlyRoute && pathname !== PUBLIC_HOME_ROUTE) {
        router.replace(PUBLIC_HOME_ROUTE);
      }
    }
    // Scenario 2: User IS logged in
    else {
      // If the user is on the special setup route, don't redirect them.
      if (isSetupRoute) {
        return;
      }
        
      // If they are on a public-only route (e.g., they tried to go to /login),
      // redirect them to the main app dashboard.
      if (isPublicOnlyRoute) {
        router.replace(AUTH_HOME_ROUTE);
      }
      // If they are on the root landing page, redirect to dashboard.
      if (pathname === PUBLIC_HOME_ROUTE) {
        router.replace(AUTH_HOME_ROUTE);
      }
    }
  }, [user, isUserLoading, router, pathname]);
}
