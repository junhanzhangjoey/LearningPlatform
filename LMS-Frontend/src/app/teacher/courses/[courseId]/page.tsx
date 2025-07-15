'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
type Course={
  title:string;
  description:string;
  category:string;
  image:string;
  price:string;
  level:string;
}
export default function EditCoursePage() {
  const { courseId } = useParams()
  const router = useRouter()

  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function loadCourse() {
      try {
        const res = await fetch(`/api/teacher/course/get/${courseId}`)
        const data:Course = await res.json()
        setCourse(data)
      } catch (error) {
        console.error('Failed to load course:', error)
      } finally {
        setLoading(false)
      }
    }

    loadCourse()
  }, [courseId])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)

    const formData = new FormData(e.currentTarget)

    const updated = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      category: formData.get('category') as string,
      image: formData.get('image') as string,
      price: parseFloat(formData.get('price') as string),
      level: formData.get('level') as string,
    }

    try {
      const res = await fetch(`/api/teacher/course/?courseId=${courseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updated),
      })

      const result = await res.json()
      alert(result.message || 'Course updated!')
      router.push('/teacher')
    } catch (error) {
      console.error('Update failed:', error)
      alert('Failed to update course')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading || !course) return <p className="p-8">Loading course...</p>

  return (
    <main className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Edit Course</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium mb-1">Title</label>
          <input name="title" defaultValue={course.title} className="w-full border p-2 rounded" required />
        </div>
        <div>
          <label className="block font-medium mb-1">Description</label>
          <textarea name="description" defaultValue={course.description} className="w-full border p-2 rounded" />
        </div>
        <div>
          <label className="block font-medium mb-1">Category</label>
          <input name="category" defaultValue={course.category} className="w-full border p-2 rounded" required />
        </div>
        <div>
          <label className="block font-medium mb-1">Image URL</label>
          <input name="image" defaultValue={course.image} className="w-full border p-2 rounded" />
        </div>
        <div>
          <label className="block font-medium mb-1">Price</label>
          <input name="price" defaultValue={course.price} type="number" step="0.01" className="w-full border p-2 rounded" />
        </div>
        <div>
          <label className="block font-medium mb-1">Level</label>
          <select name="level" defaultValue={course.level} className="w-full border p-2 rounded">
            <option>Beginner</option>
            <option>Intermediate</option>
            <option>Advanced</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {submitting ? 'Updating...' : 'Update Course'}
        </button>
      </form>
    </main>
  )
}
