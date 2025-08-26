'use client'

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type CustomMetadata = {
  role?: string;
};

export default function HomePage() {
  const { user, isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Redirect signed-in users to their role dashboard
  useEffect(() => {
    if (isLoaded && isSignedIn && !isRedirecting) {
      setIsRedirecting(true);
      try {
        // Assuming role stored in publicMetadata.role
        const role = (user?.publicMetadata as CustomMetadata)?.role;
        const destination = role ? `/${role.toLowerCase()}` : '/student';
        router.push(destination);
      } catch (error) {
        console.error('Navigation error:', error);
        setIsRedirecting(false);
      }
    }
  }, [isLoaded, isSignedIn, user, router, isRedirecting]);

  // Show loading state while Clerk is initializing
  if (!isLoaded) {
    return (
      <main className="flex flex-col items-center justify-center h-[80vh]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        <p className="mt-4 text-lg">Loading...</p>
      </main>
    );
  }

  if (!isSignedIn) {
    return (
      <main className="flex flex-col items-center justify-center h-[80vh]">
        <h1 className="text-4xl font-bold mb-4">Welcome to NEXTGen LMS</h1>
        <p className="text-lg">Please sign in to access your dashboard.</p>
      </main>
    );
  }

  // Show loading state while redirecting
  if (isRedirecting) {
    return (
      <main className="flex flex-col items-center justify-center h-[80vh]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        <p className="mt-4 text-lg">Redirecting to dashboard...</p>
      </main>
    );
  }

  return null;
}
