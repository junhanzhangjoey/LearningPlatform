'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useUser, useAuth } from '@clerk/nextjs'

type Course = { courseId: string; title: string }

export default function TeacherPage() {
  const { user, isLoaded} = useUser()
  const { getToken } = useAuth()


  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    async function loadCourses() {
      try {
        const res = await fetch(`/api/teacher/course/courses/`)
        // const text = await res.text()
        // console.log('🐛 raw response:', text)
        const data: Course[] = await res.json()
        //setCourses(Array.isArray(data) ? data : []);
        setCourses(data);
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    loadCourses()
  }, [])

  const handleCreateCourse = async () => {
    setCreating(true)
    try {
      const token = await getToken()
      const res = await fetch('/api/teacher/course/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          teacherId: user?.id,
          teacherName: user?.fullName,
        }),
      })
  
      const result = await res.json()
  
      if (res.ok && result.data?.courseId) {
        setCourses((prev) => [
          ...prev,
          {
            courseId: result.data.courseId,
            title: 'Untitled Course',
          },
        ])
      } else {
        alert(result.message || 'Failed to create course')
      }
    } catch (err) {
      console.error('Create course failed:', err)
      alert('Error creating course')
    } finally {
      setCreating(false)
    }
  }

  if (isLoaded && user && user.publicMetadata?.role !== 'Teacher') {
    return (
      <main className="p-8">
        <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
        <p className="mt-2">Only teachers can view this page.</p>
      </main>
    )
  }

  return (
    <main className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
        <button
          onClick={handleCreateCourse}
          disabled={creating}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          {creating ? 'Creating...' : 'Create Course'}
        </button>
      </div>
      <p className="text-lg mb-4">Welcome, {user?.fullName}!</p>

      {loading ? (
        <p>Loading your courses...</p>
      ) : courses.length === 0 ? (
        <p>No courses created yet.</p>
      ) : (
        <ul className="space-y-4">
          {courses.map((course) => (
            <li key={course.courseId} className="p-4 border rounded shadow flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">{course.title}</h2>
              </div>
              <Link href={`/teacher/courses/${course.courseId}`} className="text-blue-600 hover:underline">
                Update Course
              </Link>
              <Link href={`/teacher/courses/${course.courseId}/modules`} className="text-blue-600 hover:underline">
                Update Modules
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
