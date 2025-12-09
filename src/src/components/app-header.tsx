
"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Search, User, LogOut, Settings, LayoutList } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Logo } from "./logo";
import { useUser, useAuth, useDoc, useFirebase } from "@/firebase";
import { signOut } from "firebase/auth";
import { ClientOnly } from "./ClientOnly";
import { cn } from "@/lib/utils";
import { useMemo, useState, useEffect } from "react";
import { doc } from 'firebase/firestore';
import { NotificationBell } from './notification-bell';

const navItems = [
  { href: '/buy-sell', label: 'Buy & Sell' },
  { href: '/borrow-lend', label: 'Borrow & Lend' },
  { href: '/lost-and-found', label: 'Lost & Found' },
];

const SEARCHABLE_PATHS = ['/buy-sell', '/borrow-lend', '/lost-and-found'];

type UserProfile = {
  collegeId: string;
};

export function AppHeader() {
  const { user } = useUser();
  const auth = useAuth();
  const { firestore } = useFirebase();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');

  // Update search query state if URL changes
  useEffect(() => {
    setSearchQuery(searchParams.get('search') || '');
  }, [searchParams]);

  const userDocRef = useMemo(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);

  const { data: userProfile } = useDoc<UserProfile>(userDocRef);

  const handleLogout = () => {
    if (auth) {
      signOut(auth);
    }
  };
  
  const getInitials = () => {
    const name = user?.displayName;
    if (name) {
        const nameParts = name.split(' ').filter(Boolean);
        if (nameParts.length === 0) return 'U';
        const first = nameParts[0][0];
        const last = nameParts.length > 1 ? nameParts[nameParts.length - 1][0] : '';
        return `${first}${last}`.toUpperCase();
    }
    if (user?.email) {
        return user.email[0].toUpperCase();
    }
    return 'U';
  }

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const current = new URLSearchParams(Array.from(searchParams.entries()));
      const value = (e.target as HTMLInputElement).value;

      if (!value) {
        current.delete('search');
      } else {
        current.set('search', value);
      }
      
      // If we are on a searchable page, just update the params. Otherwise, go to the main marketplace.
      const targetPath = SEARCHABLE_PATHS.some(p => pathname.startsWith(p)) ? pathname : '/buy-sell';

      const search = current.toString();
      const query = search ? `?${search}` : '';
      router.push(`${targetPath}${query}`);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 md:px-6 py-2">
      <SidebarTrigger className="sm:hidden" />
      <div className="md:hidden">
        <Link href="/dashboard" aria-label="Go to dashboard">
            <Logo collegeId={userProfile?.collegeId} />
        </Link>
      </div>

      <nav className="hidden md:flex items-center gap-6 flex-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              pathname.startsWith(item.href) ? "text-primary" : "text-muted-foreground"
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="ml-auto flex items-center gap-2">
        <div className="relative flex-1 md:grow-0">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
              className="w-full rounded-lg bg-secondary pl-8 md:w-[200px] lg:w-[240px]"
            />
        </div>

        <ClientOnly>
            <NotificationBell />
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                    {user?.photoURL && <AvatarImage src={user.photoURL} alt={user.displayName || ''} />}
                    <AvatarFallback>
                    {getInitials()}
                    </AvatarFallback>
                </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                <Link href="/account">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/account?tab=listings">
                    <LayoutList className="mr-2 h-4 w-4" />
                    <span>My Listings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                <Link href="/account?tab=settings">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
            </DropdownMenu>
        </ClientOnly>
      </div>
    </header>
  );
}
