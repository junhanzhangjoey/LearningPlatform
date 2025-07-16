import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
  const { getToken } = await auth()
  const token = await getToken()

  try {
    const { fileName, fileType } = await request.json();
    // console.log("哇呃呃我",fileName, fileType);
    if (!fileName || !fileType) {
      return NextResponse.json(
        { error: 'File name and type are required' },
        { status: 400 }
      );
    }

    // 验证文件类型
    if (!fileType.startsWith('video/')) {
      return NextResponse.json(
        { error: 'Invalid file type. Only video files are allowed.' },
        { status: 400 }
      );
    }
    

    // 调用后端API获取预签名URL
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://backend:3001';
    const response = await fetch(`${backendUrl}/courses/upload/video-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ fileName, fileType }),
    });
    //console.log("哇呃呃我",await response.json());
    const res = await response.json();
    if (!response.ok) {
      const error = res;
      return NextResponse.json(
        { error: error.message || 'Failed to get upload URL' },
        { status: response.status }
      );
    }

    const data = res;
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error getting upload URL:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 