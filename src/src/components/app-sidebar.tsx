'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { Logo } from './logo';
import {
  Home,
  ShoppingBag,
  ArrowRightLeft,
  Search,
  HelpCircle,
  PlusCircle,
} from 'lucide-react';
import { useFirebase, useDoc, useUser } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useMemo } from 'react';
import { ClientOnly } from './ClientOnly';

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/buy-sell', label: 'Buy & Sell', icon: ShoppingBag },
  { href: '/borrow-lend', label: 'Borrow & Lend', icon: ArrowRightLeft },
  { href: '/lost-and-found', label: 'Lost & Found', icon: Search },
];

type UserProfile = {
  collegeId: string;
};

export function AppSidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const { firestore } = useFirebase();
  const contactEmails = "ayush.1251090413@vit.edu,shriman.1251090081@vit.edu,unnati.1251090430@vit.edu,mayuresh.1251090398@vit.edu";

  const userDocRef = useMemo(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);

  const { data: userProfile } = useDoc<UserProfile>(userDocRef);

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="px-2 py-4">
          <Link href="/dashboard" aria-label="Go to dashboard">
            <Logo collegeId={userProfile?.collegeId} />
          </Link>
        </div>
      </SidebarHeader>
      <SidebarMenu className="flex-grow">
        {menuItems.map((item) => (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton
              asChild
              isActive={pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))}
              tooltip={{ children: item.label, side: 'right', align: 'center' }}
            >
              <Link href={item.href}>
                <item.icon />
                <span>{item.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
      <SidebarFooter>
        <SidebarSeparator />
        <SidebarMenu>
           <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip={{ children: "Contact Us", side: 'right', align: 'center' }}
            >
              <a href={`mailto:${contactEmails}`}>
                <HelpCircle />
                <span>Contact Us</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
