'use client';

import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Monitor, Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

export function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="flex items-center space-x-2 rounded-lg bg-muted p-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setTheme('light')}
        className={cn(
          'w-full justify-center',
          theme === 'light' && 'bg-background text-foreground shadow-sm'
        )}
      >
        <Sun className="mr-2 h-4 w-4" />
        Light
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setTheme('dark')}
        className={cn(
          'w-full justify-center',
          theme === 'dark' && 'bg-background text-foreground shadow-sm'
        )}
      >
        <Moon className="mr-2 h-4 w-4" />
        Dark
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setTheme('system')}
        className={cn(
          'w-full justify-center',
          theme === 'system' && 'bg-background text-foreground shadow-sm'
        )}
      >
        <Monitor className="mr-2 h-4 w-4" />
        System
      </Button>
    </div>
  );
}
