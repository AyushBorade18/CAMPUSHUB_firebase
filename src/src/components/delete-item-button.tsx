
'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useFirebase, useDoc, useUser } from '@/firebase';
import { deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { doc } from 'firebase/firestore';
import { Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMemo } from 'react';

interface DeleteItemButtonProps {
  itemId: string;
  itemTitle: string;
}

type UserProfile = {
  collegeId: string;
};

export function DeleteItemButton({
  itemId,
  itemTitle,
}: DeleteItemButtonProps) {
  const { firestore, user } = useFirebase();
  const { toast } = useToast();
  
  const userDocRef = useMemo(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);

  const { data: userProfile } = useDoc<UserProfile>(userDocRef);

  const handleDelete = () => {
    if (!firestore || !userProfile?.collegeId) return;
    const itemRef = doc(firestore, 'colleges', userProfile.collegeId, 'items', itemId);
    deleteDocumentNonBlocking(itemRef);
    toast({
      title: 'Item Deleted',
      description: `"${itemTitle}" has been removed.`,
    });
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="destructive"
          size="icon"
          className="h-8 w-8 bg-black/50 hover:bg-destructive/80 border-destructive-foreground/20 border"
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Delete item</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the item
            "{itemTitle}".
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive hover:bg-destructive/90"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
