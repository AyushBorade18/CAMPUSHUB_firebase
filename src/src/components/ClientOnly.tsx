'use client';

import { useState, useEffect, type ReactNode } from 'react';

/**
 * A wrapper component that ensures its children are only rendered on the client side.
 * This is useful for preventing server-side rendering (SSR) hydration mismatches
 * with components that are not SSR-safe (e.g., they rely on browser-specific APIs
 * or generate random values on each render).
 */
export function ClientOnly({ children }: { children: ReactNode }) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return null;
  }

  return <>{children}</>;
}
