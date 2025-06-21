'use client';

import { SignIn } from '@clerk/nextjs';
import { SignedOut, SignedIn, useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function SignInPage() {
  const { isSignedIn } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isSignedIn) {
      router.push('/student'); // ✅ 登录后才跳转
    }
  }, [isSignedIn,router]);

  return (
    <>
      <SignedIn>
        <div /> {/* 已登录状态什么都不显示 */}
      </SignedIn>
      <SignedOut>
        <SignIn afterSignInUrl="/student" />{/*go to signed in page*/}
      </SignedOut>
    </>
  );
}
