import { NextResponse} from 'next/server';
import { auth } from "@clerk/nextjs/server";

async function apiGet<T>(url: string,token:string): Promise<T> {
    const backendBaseUrl =
      process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
  
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
        const { userId } = await auth();
        if (!userId) {
          return new NextResponse("Unauthorized", { status: 401 });
        }
        if (!token) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const courses = await apiGet(`/courses/teacher/${userId}`,token);
      console.log('courses from backend:', courses);
  
      return NextResponse.json(courses);
    } catch (error) {
      console.error('Error fetching progresses:', error);
      return NextResponse.json(
        { error: 'Failed to fetch progresses' },
        { status: 500 }
      );
    }
  }