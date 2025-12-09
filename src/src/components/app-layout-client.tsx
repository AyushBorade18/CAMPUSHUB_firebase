
'use client';

import { usePathname } from 'next/navigation';
import { AppHeader } from '@/components/app-header';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { useUser, useFirebase, useDoc } from '@/firebase';
import { useAuthRedirect } from '@/hooks/use-auth-redirect';
import { ClientOnly } from './ClientOnly';
import { useEffect, useRef, useMemo } from 'react';
import { collection, query, where, onSnapshot, Timestamp, doc } from 'firebase/firestore';
import { useNotificationsStore } from '@/hooks/use-notifications-store';

const PUBLIC_ROUTES = ['/login', '/register', '/admin/login'];

type UserProfile = {
  collegeId: string;
};

export function AppLayoutClient({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const { firestore } = useFirebase();
  const addNotification = useNotificationsStore((state) => state.addNotification);
  
  const initialLoadTime = useRef(new Date());
  const pathname = usePathname();

  // The AuthRedirector hook handles all the redirection logic.
  useAuthRedirect();

  const userDocRef = useMemo(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userDocRef);
  const collegeId = userProfile?.collegeId;

  useEffect(() => {
    // This is the CRITICAL FIX: The query is now only created and executed when `collegeId` is a valid string.
    if (user && firestore && collegeId && collegeId !== 'unknown') {
      const itemsQuery = query(
        collection(firestore, 'colleges', collegeId, 'items'),
        where('datePosted', '>', Timestamp.fromDate(initialLoadTime.current))
      );

      const unsubscribe = onSnapshot(itemsQuery, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const newItem = { id: change.doc.id, ...change.doc.data() };
            // Do not notify the user who posted the item
            if (newItem.userId !== user.uid) {
              addNotification(newItem as any);
            }
          }
        });
      }, (error) => {
        console.error("Notification listener error:", error);
      });

      return () => unsubscribe();
    }
  }, [user, firestore, collegeId, addNotification]); // Dependency on `collegeId` ensures this only runs when it's available.

  const isAppRoute = user && (!PUBLIC_ROUTES.some(route => pathname.startsWith(route)));

  // Show a global loader while authentication or essential profile data is loading on app routes.
  if (isUserLoading || (isAppRoute && isProfileLoading)) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
            <p className="text-lg font-medium text-muted-foreground animate-pulse">
                Loading CampusHub...
            </p>
        </div>
      </div>
    );
  }

  // If there's a user show the full app layout.
  if (isAppRoute) {
    // Definitive Fix: Do not render children until collegeId is known, preventing bad queries.
    if (!collegeId || collegeId === 'unknown') {
      return (
        <div className="flex h-screen w-full items-center justify-center bg-background">
          <div className="flex flex-col items-center gap-4 text-center p-4">
              <p className="text-lg font-medium text-muted-foreground animate-pulse">
                  Finalizing your profile...
              </p>
              <p className="text-sm text-muted-foreground">
                  Waiting for college information to load.
              </p>
          </div>
        </div>
      );
    }

    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="flex flex-col flex-1 min-w-0">
          <AppHeader />
          <main className="flex-1 overflow-y-auto">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    );
  }
  
  // This handles the case for public routes. We still want to show a loader
  // while checking auth state, but then render the public content.
  if (isUserLoading) {
     return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
            <p className="text-lg font-medium text-muted-foreground animate-pulse">
                Loading CampusHub...
            </p>
        </div>
      </div>
    );
  }
  
  return <ClientOnly>{children}</ClientOnly>;
}
