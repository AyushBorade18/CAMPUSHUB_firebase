
'use client';
import { ItemCard } from '@/components/item-card';
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

export default function BuySellPage() {
  const { firestore, user } = useFirebase();
  const searchParams = useSearchParams();

  // Read filters from URL
  const searchQuery = searchParams.get('search')?.toLowerCase() || '';
  const sortOption = searchParams.get('sort') || 'newest';
  const priceFilter = searchParams.get('price');
  const conditions = searchParams.getAll('condition');
  const itemTypes = searchParams.getAll('itemType');

  const userDocRef = useMemo(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);
  
  const { data: userProfile } = useDoc<UserProfile>(userDocRef);

  const allItemsQuery = useMemo(() => {
    // This query is now guaranteed to have a collegeId because of the layout guard
    if (!firestore || !userProfile?.collegeId) {
      return null;
    }
    
    let q = query(
        collection(firestore, 'colleges', userProfile.collegeId, 'items'), 
        where('category', '==', 'buy-sell')
    );
    
    return q;
  }, [firestore, userProfile?.collegeId]);
  
  const { data: buySellItems, isLoading } = useCollection(allItemsQuery, !!allItemsQuery);

  const filteredAndSortedItems = useMemo(() => {
    if (!buySellItems) return [];
    
    let items = [...buySellItems]; // Create a mutable copy

    // Client-side filtering
    if (searchQuery) {
        items = items.filter(item => 
        item.title.toLowerCase().includes(searchQuery) || 
        item.description.toLowerCase().includes(searchQuery)
      );
    }
    
    if (priceFilter) {
      const [min, max] = priceFilter.split('-').map(Number);
      items = items.filter(item => item.price >= min && item.price <= max);
    }

    if (conditions.length > 0) {
      items = items.filter(item => item.condition && conditions.includes(item.condition));
    }
    
    if (itemTypes.length > 0) {
      items = items.filter(item => item.itemType && itemTypes.includes(item.itemType));
    }

    // Client-side sorting
    if (sortOption === 'newest') {
      items.sort((a, b) => new Date(b.datePosted).getTime() - new Date(a.datePosted).getTime());
    } else if (sortOption === 'price_asc') {
      items.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortOption === 'price_desc') {
      items.sort((a, b) => (b.price || 0) - (a.price || 0));
    }

    return items;

  }, [buySellItems, searchQuery, priceFilter, conditions, itemTypes, sortOption]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold font-headline">
            Buy & Sell Marketplace
          </h1>
          <p className="text-muted-foreground">
            Browse items from students at your college.
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
                        <MarketplaceFilters category="buy-sell" />
                    </div>
                </SheetContent>
            </Sheet>
            <PostItemDialog category="buy-sell" />
        </div>
      </div>

       <main>
            {isLoading && (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-72 w-full" />)}
              </div>
            )}
            
            {!isLoading && filteredAndSortedItems.length === 0 && (
              <div className="text-center py-16 text-muted-foreground">
                 {searchQuery || priceFilter || conditions.length > 0 || itemTypes.length > 0 ? (
                   <>
                    <p className="font-semibold">No results found</p>
                    <p className="text-sm">Try adjusting your filters or searching for something else.</p>
                   </>
                ) : (
                  <>
                    <p>No items for sale on your campus right now.</p>
                    <p className="text-sm">Be the first to list something!</p>
                  </>
                )}
              </div>
            )}

            {!isLoading && buySellItems && (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredAndSortedItems.map((item) => (
                  <ItemCard key={item.id} item={item} type="buy-sell" />
                ))}
              </div>
            )}
        </main>
    </div>
  );
}
