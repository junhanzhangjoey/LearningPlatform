'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { DndContext, closestCenter } from '@dnd-kit/core'
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {useRouter} from 'next/navigation'
import Link from 'next/link'
import type { DragEndEvent } from '@dnd-kit/core';

type Modules={
  moduleId:string;
  title:string;
  order:number;
}
function SortableItem({ id, title,courseId }: { id: string, title: string, courseId:string}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })
  const style = {//this style is used to animate the module when it is being dragged
    transform: CSS.Transform.toString(transform),
    transition,
  }
  return (
    <li ref={setNodeRef} style={style} {...attributes} {...listeners} className="p-4 border rounded shadow flex justify-between items-center">
      {title}
      <Link href={`/teacher/courses/${courseId}/modules/${id}/update`} className="text-blue-600 hover:underline">
      update
      </Link>
    </li>
  )
}

export default function ModulesPage() {
  const { courseId } = useParams()
  const [modules, setModules] = useState<Modules[]>([])
  const [loading, setLoading] = useState(true)
  const router=useRouter();

  // 加载模块数据
  useEffect(() => {
    async function fetchModules() {
      const res = await fetch(`/api/teacher/course/${courseId}/modules`)
      const data = await res.json()
      const sortedData=data.sort((a:Modules,b:Modules)=>a.order-b.order)
      setModules(sortedData)
      setLoading(false)
    }
    fetchModules()
  }, [courseId])

  // 拖拽排序
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over) return;
    if (active.id !== over.id) {//active and over are from the SortableContext items
      const oldIndex = modules.findIndex((m) => m.moduleId === active.id)
      const newIndex = modules.findIndex((m) => m.moduleId === over.id)
      setModules((item2s) => arrayMove(item2s, oldIndex, newIndex))//items is the current state of the modules
      // 这里可以调用 API 保存新顺序
    }
  }

  // 新增 module
    async function handleAddModule() {
        const res=await fetch(`/api/teacher/course/${courseId}/modules/add`,{
            method:"POST",
            headers:{
                'Content-Type':'application/json',
            },
            body: JSON.stringify({}),
        })
        
        const data=await res.json();
        setModules(prev=>[...prev,data])
    }

    async function handleSubmit() {
        await fetch(`/api/teacher/course/${courseId}/modules/update`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(modules),
        })
        alert("Modules updated successfully")
        router.push(`/teacher`)
    }

  if (loading) return <div>Loading...</div>


  return (
    <main className="p-8 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Manage Modules</h1>
        <button onClick={handleAddModule} className="px-4 py-2 mb-6 bg-blue-500 text-white rounded hover:bg-blue-600">
            Add Module
        </button>
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={modules.map((m) => m.moduleId)} strategy={verticalListSortingStrategy}>
            <ul className="space-y-2">
                {modules.map((mod) => (
                    <SortableItem key={mod.moduleId} id={mod.moduleId} title={mod.title} courseId={courseId as string}/>                 
                ))}
            </ul>
            </SortableContext>
        </DndContext>
        <button onClick={handleSubmit} className="px-4 py-2 mb-6 bg-blue-500 text-white rounded hover:bg-blue-600">
            Submit
        </button>
    </main>
  )
}
