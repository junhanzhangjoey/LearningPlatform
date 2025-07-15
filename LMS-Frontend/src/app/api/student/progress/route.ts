// import { NextRequest, NextResponse } from 'next/server';

// export async function POST(req: NextRequest) {
//     const { searchParams } = new URL(req.url);
//     const userId = searchParams.get('userId');
//     const courseId = searchParams.get('courseId');
//     const moduleId = searchParams.get('moduleId');
//   const body = await req.json();
//   console.log('POST called', { userId, courseId, moduleId, body });
//   return NextResponse.json({ message: "POST works!", userId, courseId, moduleId, body });
// }

import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";


type ProgressUpdateBody = {
  userId: string;
  courseId: string;
  moduleId: string;
  completed: boolean;
};

async function apiPost<T>(url: string, body: ProgressUpdateBody,token:string): Promise<T> {
  const backendBaseUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL || 'http://backend:3001';

  const res = await fetch(`${backendBaseUrl}${url}`, {
    method: 'POST',
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
export async function POST(
  req: NextRequest,
) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const courseId = searchParams.get('courseId');
    const moduleId = searchParams.get('moduleId');

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
    const result = await apiPost(
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
