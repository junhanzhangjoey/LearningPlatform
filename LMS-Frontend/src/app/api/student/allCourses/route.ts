import { NextResponse } from 'next/server';
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
export async function GET() {//_req: NextRequest
  try {
    const { getToken } = await auth();
    const token = await getToken();

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 临时：如果后端不可用，返回模拟数据
    try {
      const courses = await apiGet(`/courses`, token);
      console.log('courses from backend:', courses);
      return NextResponse.json(courses);
    } catch (backendError) {
      console.warn('Backend unavailable, using mock data:', backendError);
      
      // 返回模拟数据
      const mockCourses = [
        {
          id: 'course_1',
          title: 'Introduction to React',
          description: 'Learn the basics of React development',
          instructor: 'John Doe',
          duration: '8 weeks',
          level: 'Beginner',
          thumbnail: 'https://via.placeholder.com/300x200?text=React+Course'
        },
        {
          id: 'course_2',
          title: 'Advanced TypeScript',
          description: 'Master TypeScript for enterprise applications',
          instructor: 'Jane Smith',
          duration: '10 weeks',
          level: 'Intermediate',
          thumbnail: 'https://via.placeholder.com/300x200?text=TypeScript+Course'
        },
        {
          id: 'course_3',
          title: 'Full-Stack Development',
          description: 'Build complete web applications',
          instructor: 'Mike Johnson',
          duration: '12 weeks',
          level: 'Advanced',
          thumbnail: 'https://via.placeholder.com/300x200?text=FullStack+Course'
        }
      ];
      
      return NextResponse.json(mockCourses);
    }
  } catch (error) {
    console.error('Error fetching progresses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch progresses' },
      { status: 500 }
    );
  }
}
