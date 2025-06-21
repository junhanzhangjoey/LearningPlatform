'use client';
import { useParams } from 'next/navigation'; //the parameter from the other page
import { useState, useEffect } from 'react';
import {useAuth} from '@clerk/nextjs';


//type Course = { id: string; title: string; progress: number; price:number }
type ModuleStatus = {
  moduleId: string;
  completed: boolean;
};

type EnrolledCourses = {
  userId: string;
  courseId: string;
  courseTitle: string;
  progressPercentage: number;
  modules: ModuleStatus[];
};

type AllCourses = {
  courseId: string;
  teacherName: string;
  title: string;
  image: string;
  price: number;
  description: string;
  level: string;
};

export default function StudentPage() {
  const params = useParams() as { studentId: string };
  const { studentId } = params;
  const { getToken } = useAuth(); //get token

  const [progresses, setProgresses] = useState<EnrolledCourses[]>([]);
  const [loading, setLoading] = useState(true);

  const [courses, setCourses] = useState<AllCourses[]>([]);
  const [studentName, setStudentName] = useState<string>('')

  useEffect(() => {
    async function loadStudentInfo() {
      try {
        const token = await getToken();
        const res = await fetch(`/api/studentName/${studentId}`,
          {headers: {
            Authorization: `Bearer ${token}`,
          },}
        )
        if (res.ok) {
          const data = await res.json()
          setStudentName(data.fullName)
        }
      } catch (err) {
        console.error('Failed to fetch student name:', err)
      }
    }
  
    if (studentId) {
      loadStudentInfo()
    }
  }, [studentId, getToken])
  

  useEffect(() => {
    async function loadCourses() {
      const userId = studentId;
      console.log('Current user id:', userId);
      try {
        
        const token = await getToken();
        const res = await fetch(
          `/api/student/assigned-courses?userId=${userId}`,//get all enrolled courses
          {headers: {
            Authorization: `Bearer ${token}`,
          },}

        );
        const res2 = await fetch(
          `/api/student/allCourses`, //get all courses
          {headers: {
            Authorization: `Bearer ${token}`,
          },}
        );
        // if (!res.ok) {
        //   throw new Error(`HTTP error! status: ${res.status}`);
        // }
        const data: EnrolledCourses[] = await res.json();
        const data2: AllCourses[] = await res2.json();
        setProgresses(data);
        setCourses(data2);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    loadCourses();
  }, [studentId, getToken]);
  console.log("progresses state value:", progresses);
  const enrolledIds = new Set(progresses.map((c) => c.courseId));
  const unenrolledCourses = courses.filter(
    (course) => !enrolledIds.has(course.courseId)
  ); //filter out enrolled courses

  async function handleDrop(courseId: string) {
    try {
      const token = await getToken();
      const userId = studentId;
      await fetch(`/api/student/drop?userId=${userId}&courseId=${courseId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json',Authorization: `Bearer ${token}`, },
        body: JSON.stringify({ userId, courseId }),
      });

      const res = await fetch(`/api/student/assigned-courses?userId=${userId}`);
      const data = await res.json();
      setProgresses(data);
    } catch (err) {
      console.error('Enroll failed:', err);
    }
  }

  async function handleEnroll(courseId: string) {
    try {
      const token = await getToken();
      const userId = studentId;
      await fetch(`/api/student/enroll?userId=${userId}&courseId=${courseId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json',Authorization: `Bearer ${token}`, },
        body: JSON.stringify({ userId, courseId }),
      });

      const res = await fetch(`/api/student/assigned-courses?userId=${userId}`);
      const data = await res.json();
      setProgresses(data);
    } catch (err) {
      console.error('Enroll failed:', err);
    }
  }

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-4">Student {studentName} courses assignment</h1>
  
      {loading ? (
        <p>Loading courses...</p>
      ) : (
        <>
          <h2 className="text-2xl font-bold mb-4">Assigned Courses</h2>
          {progresses.length === 0 ? (
            <p>No assigned courses.</p>
          ) : (
            <ul className="space-y-4">
              {progresses.map((course) => (
                <li key={course.courseId} className="p-4 border rounded shadow">
                    <h2 className="text-xl font-semibold mb-2">
                      {course.courseTitle}
                    </h2>
                  <div className="w-full bg-gray-200 rounded h-2 mb-2">
                    <div
                      className="bg-blue-500 h-2 rounded"
                      style={{ width: `${course.progressPercentage}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-600">
                    {course.progressPercentage}% complete
                  </p>
                  <button
                    onClick={() => handleDrop(course.courseId)}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mt-2"
                  >
                    Drop
                  </button>
                </li>
              ))}
            </ul>
          )}
  
          <h2 className="text-2xl font-bold mt-10 mb-4">Available Courses</h2>
          {unenrolledCourses.length === 0 ? (
            <p>No available courses.</p>
          ) : (
            <ul className="space-y-4">
              {unenrolledCourses.map((course) => (
                <li key={course.courseId} className="p-4 border rounded shadow">
                  <h3 className="text-xl font-semibold mb-2">{course.title}</h3>
                  <p className="text-sm text-gray-600 mb-1">
                    <strong>Teacher:</strong> {course.teacherName}
                  </p>
                  <p className="text-sm text-gray-600 mb-1">
                    <strong>Level:</strong> {course.level}
                  </p>
                  <p className="text-sm text-gray-800 font-medium mb-3">
                    <strong>Price:</strong> ${course.price}
                  </p>
                  <div className="w-1/2 text-sm text-gray-600">
                    {course.description}
                  </div>
                  <button
                    onClick={() => handleEnroll(course.courseId)}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mt-2"
                  >
                    Enroll
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </main>
  )
  
}