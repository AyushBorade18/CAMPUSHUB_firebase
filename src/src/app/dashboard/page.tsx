'use client';

import Link from 'next/link';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ShoppingBag,
  ArrowRightLeft,
  Search,
  ArrowRight,
} from 'lucide-react';
import { useUser, useDoc, useFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { useMemo } from 'react';

type UserProfile = {
  firstName: string;
  lastName: string;
};

export default function Dashboard() {
  const { user } = useUser();
  const { firestore } = useFirebase();

  const userDocRef = useMemo(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);

  const { data: userProfile, isLoading: isProfileLoading } =
    useDoc<UserProfile>(userDocRef);

  const name = userProfile?.firstName || user?.displayName?.split(' ')[0] || 'There';
  
  // This check is important. If user data is still loading,
  // we show a skeleton UI. `useAuthRedirect` handles the case where the user is null.
  if (isProfileLoading || !user) {
    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-8">
            <div className="space-y-2">
                <Skeleton className="h-10 w-1/3" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-2/3" />
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-48 w-full" />
            </div>
        </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold font-headline">
          Welcome, {name}!
        </h1>
        <p className="text-muted-foreground">
          This is your central hub for campus life. Find great deals in the
          marketplace, borrow items from fellow students, or post in the lost
          & found. Dive in and see what's new.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 font-headline">
              <ShoppingBag className="h-6 w-6 text-primary" />
              Buy & Sell
            </CardTitle>
            <CardDescription className="flex-grow">
              Find deals on textbooks, furniture, and more from students you
              trust.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild variant="outline">
              <Link href="/buy-sell">
                Go to Marketplace <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 font-headline">
              <ArrowRightLeft className="h-6 w-6 text-primary" />
              Borrow & Lend
            </CardTitle>
            <CardDescription className="flex-grow">
              Need a tool for a project? Borrow items from your peers for a
              small fee.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild variant="outline">
              <Link href="/borrow-lend">
                Browse Items <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 font-headline">
              <Search className="h-6 w-6 text-primary" />
              Lost & Found
            </CardTitle>
            <CardDescription className="flex-grow">
              Help reconnect lost items with their owners within the campus
              community.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild variant="outline">
              <Link href="/lost-and-found">
                Visit Lost & Found <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
