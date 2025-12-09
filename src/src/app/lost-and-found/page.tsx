
'use client';
import { ItemCard } from '@/components/item-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCollection, useFirebase, useDoc } from '@/firebase';
import { collection, query, where, doc } from 'firebase/firestore';
import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { PostItemDialog } from '@/components/post-item-dialog';
import { MarketplaceFilters } from '@/components/marketplace-filters';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Filter } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

type UserProfile = {
  collegeId: string;
};

export default function LostFoundPage() {
  const { firestore, user } = useFirebase();
  const searchParams = useSearchParams();

  // Read filters from URL
  const searchQuery = searchParams.get('search')?.toLowerCase() || '';
  const sortOption = searchParams.get('sort') || 'newest';
  const itemTypes = searchParams.getAll('itemType');

  const userDocRef = useMemo(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);

  const { data: userProfile } = useDoc<UserProfile>(userDocRef);

  const lostFoundQuery = useMemo(() => {
    if (!firestore || !userProfile?.collegeId) {
        return null;
    }
    
    let q = query(
        collection(firestore, 'colleges', userProfile.collegeId, 'items'),
        where('category', '==', 'lost-found')
    );

    return q;
  }, [firestore, userProfile?.collegeId]);

  const { data: lostFoundItems, isLoading } = useCollection(lostFoundQuery, !!lostFoundQuery);

  const filteredAndSortedItems = useMemo(() => {
    if (!lostFoundItems) return [];
    
    let items = [...lostFoundItems]; // Create a mutable copy

    if (searchQuery) {
        items = items.filter(item => 
        item.title.toLowerCase().includes(searchQuery) || 
        item.description.toLowerCase().includes(searchQuery) ||
        (item.location && item.location.toLowerCase().includes(searchQuery))
      );
    }
    
    if (itemTypes.length > 0) {
      items = items.filter(item => item.itemType && itemTypes.includes(item.itemType));
    }
    
    // Client-side sorting
    if (sortOption === 'newest') {
      items.sort((a, b) => new Date(b.datePosted).getTime() - new Date(a.datePosted).getTime());
    }

    return items;

  }, [lostFoundItems, searchQuery, itemTypes, sortOption]);

  const lostItems = filteredAndSortedItems?.filter((item) => item.status === 'lost') || [];
  const foundItems = filteredAndSortedItems?.filter((item) => item.status === 'found') || [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold font-headline">
            Lost & Found
          </h1>
          <p className="text-muted-foreground">
            Help reconnect items with their owners.
          </p>
        </div>
         <div className="flex items-center gap-2">
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="outline">
                        <Filter className="mr-2 h-4 w-4" />
                        Filters
                    </Button>
                </SheetTrigger>
                <SheetContent>
                    <div className="pt-8">
                        <MarketplaceFilters category="lost-found" />
                    </div>
                </SheetContent>
            </Sheet>
            <PostItemDialog category="lost-found" />
        </div>
      </div>

       <main>
          <Tabs defaultValue="found" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="found">Found Items</TabsTrigger>
              <TabsTrigger value="lost">Lost Items</TabsTrigger>
            </TabsList>
            <TabsContent value="found" className="mt-6">
              {isLoading && (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-72 w-full" />)}
                  </div>
              )}
              {!isLoading && lostFoundItems && foundItems.length === 0 && (
                <div className="text-center py-16 text-muted-foreground">
                   {searchQuery || itemTypes.length > 0 ? (
                      <p className="font-semibold">No found items match your filters</p>
                  ) : (
                      <p>No found items reported on your campus recently.</p>
                  )}
                </div>
              )}
              {!isLoading && lostFoundItems && (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {foundItems.map((item) => (
                    <ItemCard key={item.id} item={item} type="lost-found" />
                  ))}
                </div>
              )}
            </TabsContent>
            <TabsContent value="lost" className="mt-6">
              {isLoading && (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-72 w-full" />)}
                  </div>
              )}
              {!isLoading && lostFoundItems && lostItems.length === 0 && (
                <div className="text-center py-16 text-muted-foreground">
                  {searchQuery || itemTypes.length > 0 ? (
                      <p className="font-semibold">No lost items match your filters</p>
                  ) : (
                      <p>No lost items reported on your campus recently.</p>
                  )}
                </div>
              )}
              {!isLoading && lostFoundItems && (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {lostItems.map((item) => (
                    <ItemCard key={item.id} item={item} type="lost-found" />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </main>
    </div>
  );
}
