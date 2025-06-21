import { NextResponse, NextRequest } from 'next/server';
import { auth } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  try {
    const { getToken } = await auth();
    const token = await getToken();

    const body = await req.json();

    const backendBaseUrl =
      process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

    const res = await fetch(`${backendBaseUrl}/courses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      throw new Error(`Backend API request failed: ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating course:', error);
    return NextResponse.json(
      { error: 'Failed to create course' },
      { status: 500 }
    );
  }
}
