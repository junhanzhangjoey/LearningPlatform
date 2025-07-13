'use client'

import {useEffect, useState} from 'react'
import {useParams,useRouter} from 'next/navigation'
import VideoUpload from '../../../../../../../components/VideoUpload'

type Module={
    title:string;
    type:string;
    content:string;
    moduleVideo:string;
}
export default function UpdateModulePage(){
    const { moduleId,courseId} =useParams();
    const router =useRouter();
    const[module, setModule]=useState<Module|null>(null);
    const[submitting, setSubmitting]=useState(false);
    const[loading,setLoading]=useState(true);
    const[videoUrl, setVideoUrl]=useState<string>('');

    useEffect(()=>{
        async function loadModule(){
            try{
                const res=await fetch(`/api/teacher/course/module/${moduleId}`);
                const data=await res.json();
                setModule(data);
                setVideoUrl(data.moduleVideo || '');
            }catch(error){
                console.error('Failed to load module:',error)
            }finally{
                setLoading(false);
            }
        }
        loadModule();
    },[moduleId])

    const handleSubmit=async(e:React.FormEvent<HTMLFormElement>)=>{
        e.preventDefault()//prevent refresh page when submit
        setSubmitting(true)
        const formData=new FormData(e.currentTarget)
        const updated={
            title: formData.get('title') as string,
            type: formData.get('type') as string,
            content:formData.get('content') as string,
            moduleVideo: videoUrl, // 使用上传的视频URL
        }
        
        try{
            const res=await fetch(`/api/teacher/course/module/${moduleId}/update`,{
                method:'PATCH',
                headers:{
                    'Content-Type':'application/json',
                },
                body:JSON.stringify(updated),
            });
            const result=await res.json();
            alert(result.message||'Module updated!');
            router.push(`/teacher/courses/${courseId}/modules`);
        }catch(error){
            console.error('Update module failed:',error);
            alert('Failed to update module')
        }finally{
            setSubmitting(false)
        }
    }

    const handleVideoUploaded = (url: string) => {
        setVideoUrl(url);
    };

    if(loading||!module) return <p className="p-8">Loading module...</p>
    return (
        <main className="p-8 max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Edit Module</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-medium mb-1">Title</label>
              <input name="title" defaultValue={module.title} className="w-full border p-2 rounded" required />
            </div>
            <div>
              <label className="block font-medium mb-1">Type</label>
              <select name="type" defaultValue={module.type} className="w-full border p-2 rounded">
                <option>Text</option>
                <option>Video</option>
              </select>
            </div>
            <div>
              <label className="block font-medium mb-1">Description</label>
              <textarea name="content" defaultValue={module.content} className="w-full border p-2 rounded" />
            </div>
            <div>
              <label className="block font-medium mb-1">Video</label>
              <VideoUpload 
                onVideoUploaded={handleVideoUploaded}
                currentVideoUrl={videoUrl}
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              {submitting ? 'Updating...' : 'Update Module'}
            </button>
          </form>
        </main>
      )
}