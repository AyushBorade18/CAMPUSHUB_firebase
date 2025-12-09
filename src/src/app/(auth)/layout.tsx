'use client';
import { Logo } from "@/components/logo";
import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-secondary/50 p-4">
        <div className="mb-8">
            <Link href="/" aria-label="Back to Home page">
              <Logo />
            </Link>
        </div>
        {children}
    </main>
  );
}
