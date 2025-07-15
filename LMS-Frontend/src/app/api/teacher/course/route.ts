import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

export async function PUT(req: NextRequest) {
  try {
    const { getToken } = await auth()
    const token = await getToken()
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const backendBaseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'
    const body = await req.json()
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get('courseId');

    const res = await fetch(`${backendBaseUrl}/courses/${courseId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    })

    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (error) {
    console.error('Update course error:', error)
    return NextResponse.json({ error: 'Failed to update course' }, { status: 500 })
  }
}