import { NextResponse, NextRequest } from 'next/server';
import { auth } from "@clerk/nextjs/server";
async function apiPost<T>(url: string,token:string): Promise<T> {
  const backendBaseUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL || 'http://backend:3001';

  try {
    const res = await fetch(`${backendBaseUrl}${url}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
    });

    if (!res.ok) {
      throw new Error(`API request failed: ${res.status}`);
    }

    const data = await res.json();
    return data as T;
  } catch (error) {
    console.error('API POST error:', error);
    throw error;
  }
}
export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const courseId = searchParams.get('courseId');
    // console.log('userId:', userId);
    // console.log('courseId:', courseId);

    if (!userId) {
      return NextResponse.json({ error: 'No userId' }, { status: 400 });
    }
    const { getToken } = await auth();
    const token = await getToken();
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const newProgress = await apiPost(`/progress/${userId}/${courseId}`,token);
    console.log('new Progressses from backend:', newProgress);

    return NextResponse.json(newProgress);
  } catch (error) {
    console.error('Error update newProgress:', error);
    return NextResponse.json(
      { error: 'Failed to update newProgress' },
      { status: 500 }
    );
  }
}
