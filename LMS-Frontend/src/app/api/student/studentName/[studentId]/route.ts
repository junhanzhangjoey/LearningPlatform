import { clerkClient } from '@clerk/nextjs/server'
import { NextRequest,NextResponse } from 'next/server'

export async function GET(
    req: NextRequest,
  ) {
    const pathSegments=req.nextUrl.pathname.split('/');
    const userId=pathSegments[pathSegments.length-2];
    console.log('🧾 Received userId:', userId)
  
    // use it with Clerk
    const user = await(await clerkClient()).users.getUser(userId)
  
    return NextResponse.json({
      fullName: `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim(),
      email: user.emailAddresses[0]?.emailAddress ?? '',
    })
  }
  