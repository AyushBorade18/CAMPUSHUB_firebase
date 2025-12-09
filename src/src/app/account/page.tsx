'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AccountProfileTab } from '@/components/settings/account-profile-tab';
import { AccountSettingsTab } from '@/components/settings/account-settings-tab';
import { AccountListingsTab } from '@/components/settings/account-listings-tab';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AccountPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tab = searchParams.get('tab') || 'profile';

  const [activeTab, setActiveTab] = useState(tab);

  useEffect(() => {
    setActiveTab(tab);
  }, [tab]);

  const onTabChange = (value: string) => {
    setActiveTab(value);
    // Update the URL without reloading the page
    router.replace(`/account?tab=${value}`, { scroll: false });
  };


  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold font-headline">
          Settings
        </h1>
        <p className="text-muted-foreground">
          Manage your account settings, profile, and theme preferences.
        </p>
      </div>
      <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="listings">My Listings</TabsTrigger>
          <TabsTrigger value="settings">Appearance</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <AccountProfileTab />
        </TabsContent>
        <TabsContent value="listings">
          <AccountListingsTab />
        </TabsContent>
        <TabsContent value="settings">
          <AccountSettingsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
