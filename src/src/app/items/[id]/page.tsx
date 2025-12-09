
'use client';

import { useParams } from 'next/navigation';
import { useFirebase, useUser, useDoc } from '@/firebase';
import { collection, query, where, getDocs, type DocumentData, doc } from 'firebase/firestore';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { Mail, Phone } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';


type Item = {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: 'buy-sell' | 'borrow-lend' | 'lost-found';
  itemType?: string;
  condition?: string;
  status: 'available' | 'sold' | 'borrowed' | 'lost' | 'found';
  datePosted: any; // Can be string or Firestore Timestamp
  imageUrl?: string;
  price?: number;
  rate?: string;
  location?: string;
  contactName?: string;
  contactNumber?: string;
  contactEmail?: string;
};

type UserProfile = {
  collegeId: string;
};


// Helper function to safely convert Firestore timestamp or string to Date
const toDate = (dateValue: any): Date | null => {
  if (!dateValue) return null;
  // Firestore Timestamp object
  if (dateValue && typeof dateValue.seconds === 'number') {
    return new Date(dateValue.seconds * 1000);
  }
  // ISO string or other date string
  const date = new Date(dateValue);
  if (!isNaN(date.getTime())) {
    return date;
  }
  return null;
};

const getInitials = (nameStr: string) => {
    if (!nameStr || nameStr.trim() === '') return 'U';
    const nameParts = nameStr.trim().split(' ').filter(Boolean);
    if (nameParts.length === 0) return 'U';
    const first = nameParts[0][0];
    const last = nameParts.length > 1 ? nameParts[nameParts.length - 1][0] : '';
    return (first + last).toUpperCase();
};


export default function ItemDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const { firestore, user } = useFirebase();
  const [item, setItem] = useState<Item | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const userDocRef = useMemo(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);

  const { data: userProfile } = useDoc<UserProfile>(userDocRef);
  const collegeId = userProfile?.collegeId;

  useEffect(() => {
    // We must have the collegeId to query the correct collection.
    if (!firestore || !id || !collegeId || collegeId === 'unknown') {
      if(user && collegeId === 'unknown') {
        // If we know the user exists but their collegeId is not set, we can stop loading.
        setIsLoading(false);
      }
      return;
    }
    
    const findItem = async () => {
        setIsLoading(true);
        
        const itemsRef = collection(firestore, 'colleges', collegeId, 'items');
        const q = query(itemsRef, where('id', '==', id));
        
        getDocs(q).then(querySnapshot => {
            if (!querySnapshot.empty) {
                const docSnapshot = querySnapshot.docs[0];
                setItem({ id: docSnapshot.id, ...docSnapshot.data() } as Item);
            } else {
                console.warn(`Item with ID "${id}" not found in college "${collegeId}".`);
                setItem(null);
            }
        }).catch(serverError => {
            const permissionError = new FirestorePermissionError({
                path: `colleges/${collegeId}/items`,
                operation: 'list',
            });
            errorEmitter.emit('permission-error', permissionError);
            setItem(null);
        }).finally(() => {
            setIsLoading(false);
        });
    };
    
    findItem();
  }, [firestore, id, collegeId, user]);

  
  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Skeleton className="aspect-video w-full rounded-lg" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-12 w-full mt-4" />
        </div>
      </div>
    );
  }

  if (!item) {
    return <div className="text-center p-8">Item not found.</div>;
  }

  const postedDate = toDate(item.datePosted);
  const sellerName = item.contactName || 'CampusHub User';

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="overflow-hidden">
            <div className="relative aspect-video bg-muted">
              {item.imageUrl ? (
                <Image
                  src={item.imageUrl}
                  alt={item.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No Image Available
                </div>
              )}
            </div>
            <CardHeader>
              <CardTitle className="font-headline text-3xl">
                {item.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{item.description}</p>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-shrink-0">
                  {item.category === 'buy-sell' && item.price != null && (
                    <p className="text-3xl font-bold">₹{item.price}</p>
                  )}
                  {item.category === 'borrow-lend' && item.rate && (
                    <p className="text-3xl font-bold">{item.rate}</p>
                  )}
                  {item.category === 'lost-found' && (
                    <Badge
                      variant={item.status === 'lost' ? 'destructive' : 'default'}
                      className="text-lg"
                    >
                      {item.status === 'lost' ? 'Lost Item' : 'Found Item'}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-headline">Details</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2 text-muted-foreground">
              <p>
                <strong>Posted:</strong>{' '}
                {postedDate
                  ? formatDistanceToNow(postedDate, { addSuffix: true })
                  : 'a while ago'}
              </p>
              <p>
                <strong>Category:</strong> {item.category}
              </p>
              {item.itemType && (
                <p>
                  <strong>Type:</strong> {item.itemType}
                </p>
              )}
              {item.condition && (
                 <p>
                    <strong>Condition:</strong> {item.condition}
                </p>
              )}
              {item.location && (
                <p>
                  <strong>Location:</strong> {item.location}
                </p>
              )}
            </CardContent>
          </Card>
          
           <Card>
            <CardHeader>
              <CardTitle className="text-lg font-headline">About The Poster</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-4">
                    <Avatar>
                        {/* We don't have avatar URLs in the user profile yet */}
                        <AvatarFallback>{getInitials(sellerName)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-semibold">{sellerName}</p>
                    </div>
                </div>
            </CardContent>
          </Card>

           <Card>
                <CardHeader>
                    <CardTitle className="text-lg font-headline">Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex items-center gap-3">
                        <Phone className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm">{item.contactNumber || 'Not provided'}</span>
                    </div>
                    {item.contactEmail && (
                        <div className="flex items-center gap-3">
                            <Mail className="h-5 w-5 text-muted-foreground" />
                            <a href={`mailto:${item.contactEmail}`} className="text-sm text-primary hover:underline">
                                {item.contactEmail}
                            </a>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
