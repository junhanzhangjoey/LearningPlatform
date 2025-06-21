'use client'

import { useEffect, useState, useCallback} from 'react'
import { useUser, useAuth } from '@clerk/nextjs'
import Link from 'next/link'

type StudentDetail = {
  userId: string
  name: string
  email: string
}

export default function ManagerPage() {
  const { user } = useUser()
  const { getToken: originalGetToken } = useAuth()
  const [students, setStudents] = useState<StudentDetail[]>([])
  const [error, setError] = useState<string | null>(null)
  const getToken = useCallback(() => {
    return originalGetToken()
  }, [originalGetToken])
  useEffect(() => {
    const fetchStudents = async () => {
      const token = await getToken()
      const res = await fetch('/api/student/allStudents', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (!res.ok) {
        const err = await res.json()
        setError(err.error)
        return
      }

      const data: StudentDetail[] = await res.json()
      setStudents(data)
    }

    fetchStudents()
  }, [getToken])

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-4">Manager Dashboard</h1>
      <p className="text-lg mb-4">Welcome, {user?.fullName}!</p>
      <h2 className="text-2xl font-semibold mb-2">Students</h2>
  
      {error ? (
        <p className="text-red-500 text-lg">{error}</p>
      ) : students.length === 0 ? (
        <p className="text-gray-500 text-lg">No students to display.</p>
      ) : (
        <ul className="space-y-2">
          {students.map((student) => (
            <Link href={`/manager/student/${student.userId}`} key={student.userId}>
              <li key={student.userId} className="border p-4 rounded shadow">
                <p><strong>Name:</strong> {student.name}</p>
                <p><strong>Email:</strong> {student.email}</p>
              </li>
            </Link>
          ))}
        </ul>
      )}
    </main>
  )
}
