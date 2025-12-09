'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ThemeSwitcher } from './theme-switcher';

export function AccountSettingsTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-xl">Appearance</CardTitle>
        <CardDescription>
          Customize the look and feel of the app.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <p className="text-sm font-medium">Theme</p>
          <p className="text-sm text-muted-foreground">
            Select the theme for the dashboard.
          </p>
          <ThemeSwitcher />
        </div>
      </CardContent>
    </Card>
  );
}
