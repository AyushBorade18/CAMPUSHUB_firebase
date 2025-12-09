
'use client';

import { useMemo } from 'react';
import { collection, query, where, collectionGroup } from 'firebase/firestore';
import { useCollection, useFirebase, useUser } from '@/firebase';
import { ItemCard } from '@/components/item-card';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Button } from '../ui/button';

export function AccountListingsTab() {
  const { user } = useUser();
  const { firestore } = useFirebase();

  const userListingsQuery = useMemo(() => {
    if (!user || !firestore) return null;
    // Use a collection group query to find items by userId across all colleges
    return query(collectionGroup(firestore, 'items'), where('userId', '==', user.uid));
  }, [user, firestore]);

  const { data: listings, isLoading } = useCollection(userListingsQuery, !!userListingsQuery);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-xl">My Listings</CardTitle>
        <CardDescription>
          View and manage all the items you've posted for sale, for borrowing,
          or in lost & found.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-3">
                    <Skeleton className="h-[125px] w-full rounded-xl" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-[200px]" />
                        <Skeleton className="h-4 w-[150px]" />
                    </div>
                </div>
            ))}
          </div>
        )}
        {!isLoading && (!listings || listings.length === 0) && (
          <div className="text-center py-16 text-muted-foreground rounded-lg border border-dashed">
            <h3 className="text-lg font-semibold">You haven't listed any items yet.</h3>
            <p className="mt-2 text-sm">
              Ready to declutter or help out a fellow student?
            </p>
            <div className="mt-6 flex justify-center gap-4">
                <Button asChild>
                    <Link href="/buy-sell">List an Item for Sale</Link>
                </Button>
                 <Button variant="outline" asChild>
                    <Link href="/lost-and-found">Post to Lost & Found</Link>
                </Button>
            </div>
          </div>
        )}
        {!isLoading && listings && listings.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {listings.map((item) => (
              <ItemCard key={item.id} item={item} type={item.category} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
