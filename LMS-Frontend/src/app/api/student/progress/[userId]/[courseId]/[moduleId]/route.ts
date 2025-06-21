import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";

type ProgressUpdateBody = {
  userId: string;
  courseId: string;
  moduleId: string;
  completed: boolean;
};

async function apiPatch<T>(url: string, body: ProgressUpdateBody,token:string): Promise<T> {
  const backendBaseUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL || 'http://backend:3001';

  const res = await fetch(`${backendBaseUrl}${url}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`Backend PATCH request failed: ${res.status}`);
  }

  const data = await res.json();
  return data as T;
}

// 处理前端PATCH请求
export async function PATCH(
  req: NextRequest,
) {
  try {
    const pathSegments = req.nextUrl.pathname.split('/');
    const moduleId = pathSegments[pathSegments.length - 1];
    const courseId = pathSegments[pathSegments.length - 2];
    const userId = pathSegments[pathSegments.length - 3];
    console.log('moduleId: ',moduleId);
    console.log('courseId: ',courseId);
    console.log('userId: ',userId);

    if (!userId || !courseId || !moduleId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const body: ProgressUpdateBody = await req.json();
    const { getToken } = await auth();
    const token = await getToken();

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const result = await apiPatch(
      `/progress/${userId}/${courseId}/${moduleId}`,
      body,
      token,
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error marking module as completed:', error);
    return NextResponse.json(
      { error: 'Failed to mark module as completed' },
      { status: 500 }
    );
  }
}
