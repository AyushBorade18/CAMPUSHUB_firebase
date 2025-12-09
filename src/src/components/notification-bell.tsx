'use client';

import Link from 'next/link';
import { Bell, ShoppingBag, ArrowRightLeft, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNotificationsStore } from '@/hooks/use-notifications-store';
import { formatDistanceToNow } from 'date-fns';

const categoryIcons = {
  'buy-sell': <ShoppingBag className="h-4 w-4 mr-2" />,
  'borrow-lend': <ArrowRightLeft className="h-4 w-4 mr-2" />,
  'lost-found': <Search className="h-4 w-4 mr-2" />,
};

// Helper function to safely convert Firestore timestamp or string to Date
const toDate = (dateValue: any): Date | null => {
  if (!dateValue) return null;
  if (dateValue && typeof dateValue.seconds === 'number') {
    return new Date(dateValue.seconds * 1000);
  }
  const date = new Date(dateValue);
  if (!isNaN(date.getTime())) {
    return date;
  }
  return null;
};

export function NotificationBell() {
  const notifications = useNotificationsStore((state) => state.notifications);
  const clearNotifications = useNotificationsStore((state) => state.clearNotifications);
  const notificationCount = notifications.length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full relative" aria-label="Toggle notifications">
          <Bell className="h-5 w-5" />
          {notificationCount > 0 && (
            <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
              {notificationCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex justify-between items-center">
          <span>Notifications</span>
          {notificationCount > 0 && (
            <Button
              variant="link"
              className="h-auto p-0 text-xs"
              onClick={clearNotifications}
            >
              Clear all
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notificationCount === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            No new notifications
          </p>
        ) : (
          notifications.map((item) => {
            const postedDate = toDate(item.datePosted);
            return (
              <DropdownMenuItem key={item.id} asChild>
                <Link
                  href={`/items/${item.id}`}
                  className="flex items-start gap-2"
                >
                  <div className="text-muted-foreground mt-1">
                    {categoryIcons[item.category]}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm line-clamp-1">
                      {item.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        {postedDate ? formatDistanceToNow(postedDate, { addSuffix: true }) : 'Recently'}
                    </p>
                  </div>
                </Link>
              </DropdownMenuItem>
            );
          })
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
