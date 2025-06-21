import { NextResponse, NextRequest } from 'next/server';
import { auth } from "@clerk/nextjs/server";
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
export async function GET(
  req: NextRequest,
) {
  try {
    const pathSegments = req.nextUrl.pathname.split('/');
    const courseId = pathSegments[pathSegments.length - 2];
    
    // 从查询参数中获取userId
    const userId = req.nextUrl.searchParams.get('userId');

    if (!courseId) {
      return NextResponse.json({ error: 'No courseId' }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ error: 'No userId' }, { status: 400 });
    }

    const { getToken } = await auth();
    const token = await getToken();
    if (!token){
      return NextResponse.json({error:'Unauthorized'},{status:401});
    }
    const modules = await apiGet(`/progress/${userId}/${courseId}`,token);
    console.log('models from backend:', modules);

    return NextResponse.json(modules);
  } catch (error) {
    console.error('Error fetching models:', error);
    return NextResponse.json(
      { error: 'Failed to fetch models' },
      { status: 500 }
    );
  }
}
