import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

export async function GET(req: NextRequest) {
  try {
    const { getToken } = await auth()
    const token = await getToken()

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const backendBaseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'

    const pathSegments=req.nextUrl.pathname.split('/');
    const courseId=pathSegments[pathSegments.length-1];
    const res = await fetch(`${backendBaseUrl}/courses/${courseId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!res.ok) {
      return NextResponse.json({ message: 'Course not found' }, { status: res.status })
    }

    const course = await res.json()
    return NextResponse.json(course)
  } catch (error) {
    console.error('❌ Failed to fetch course:', error)
    return NextResponse.json({ message: 'Internal error', error: String(error) }, { status: 500 })
  }
}
