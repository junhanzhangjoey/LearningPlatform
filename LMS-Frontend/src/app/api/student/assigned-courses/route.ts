import { NextResponse, NextRequest } from 'next/server';
import { auth } from "@clerk/nextjs/server";

// export async function GET() {
//   // Mock assigned courses data
//   const courses = [
//     { id: '1', title: 'Intro to React', progress: 20 },
//     { id: '2', title: 'Advanced TypeScript', progress: 80 },
//     { id: '3', title: 'LMS Fundamentals', progress: 50 },
//   ]
//   return NextResponse.json(courses)
// }
async function apiGet<T>(url: string,token:string): Promise<T> {
  const backendBaseUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL || 'http://backend:3001';

  try {
    const res = await fetch(`${backendBaseUrl}${url}`, {
      method: 'GET',
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
    console.error('API GET error:', error);
    throw error;
  }
}
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'No userId' }, { status: 400 });
    }
    const { getToken } = await auth();
    const token = await getToken();
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const progresses = await apiGet(`/progress/${userId}`,token);
    console.log('progresses from backend:', progresses);

    return NextResponse.json(progresses);
  } catch (error) {
    console.error('Error fetching progresses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch progresses' },
      { status: 500 }
    );
  }
}
