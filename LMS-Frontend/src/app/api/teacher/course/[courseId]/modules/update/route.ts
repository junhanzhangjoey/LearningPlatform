import { NextRequest, NextResponse } from 'next/server';
import {auth} from "@clerk/nextjs/server"
export async function PUT(
  req: NextRequest
) {
  try {
    const {getToken}=await auth();
    const body = await req.json(); // 获取前端传来的 modules 新顺序
    const pathSegments=req.nextUrl.pathname.split('/');

    const courseId = pathSegments[pathSegments.length-3];

    const backendBaseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
    const res = await fetch(`${backendBaseUrl}/modules/${courseId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        "Authorization":`Bearer ${await getToken()}`
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error('Error updating modules:', error);
    return NextResponse.json({ error: 'Failed to update modules' }, { status: 500 });
  }
}