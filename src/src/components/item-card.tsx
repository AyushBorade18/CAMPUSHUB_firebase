import Image from "next/image";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useUser } from "@/firebase";
import { DeleteItemButton } from "./delete-item-button";
import { ClientOnly } from "./ClientOnly";

// This will be our new unified item type
export type Item = {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: 'buy-sell' | 'borrow-lend' | 'lost-found';
  itemType?: string;
  status: 'available' | 'sold' | 'borrowed' | 'lost' | 'found';
  datePosted: string;
  imageUrl?: string;
  price?: number;
  rate?: string;
  location?: string;
}

type ItemCardProps = {
  item: Item;
  type: 'buy-sell' | 'borrow-lend' | 'lost-found';
  className?: string;
};


export function ItemCard({ item, type, className }: ItemCardProps) {
  const { user } = useUser();
  const isOwner = user && user.uid === item.userId;

  return (
    <Card className={cn("overflow-hidden flex flex-col group", className)}>
        <div className="relative aspect-video">
            <Link href={`/items/${item.id}`} className="block h-full">
                {item.imageUrl && (
                    <Image
                    src={item.imageUrl}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    data-ai-hint="product image"
                    />
                )}
            </Link>
            
            <div className="absolute top-2 right-2 flex gap-1">
                {item.itemType && (
                    <Badge variant="secondary">{item.itemType}</Badge>
                )}
                {type === 'lost-found' && 'status' in item && (
                    <Badge variant={item.status === 'lost' ? 'destructive' : 'default'}>
                        {item.status.toUpperCase()}
                    </Badge>
                )}
            </div>

            {isOwner && (
              <ClientOnly>
                <div className="absolute top-2 left-2">
                  <DeleteItemButton itemId={item.id} itemTitle={item.title} />
                </div>
              </ClientOnly>
            )}
        </div>
        <Link href={`/items/${item.id}`} className="flex flex-col h-full flex-grow">
        <CardHeader className="flex-grow">
            <CardTitle className="font-headline text-lg group-hover:text-primary transition-colors">{item.title}</CardTitle>
            <CardDescription className="line-clamp-2">{item.description}</CardDescription>
        </CardHeader>
        <CardFooter>
            <div>
                {type === 'buy-sell' && 'price' in item && (
                    <p className="text-lg font-semibold">₹{item.price}</p>
                )}
                {type === 'borrow-lend' && 'rate' in item && (
                     <p className="text-lg font-semibold">₹{item.rate}</p>
                )}
                {type === 'lost-found' && 'location' in item && (
                    <p className="text-sm text-muted-foreground">{item.location}</p>
                )}
            </div>
        </CardFooter>
      </Link>
    </Card>
  );
}
