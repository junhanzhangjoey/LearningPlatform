'use client'

import { useUser} from '@clerk/nextjs'
import {useEffect,useState} from 'react'

type userDetail={
  userId:string
  name:string
  email:string
  role:string
}
const ROLE_OPTIONS=['Student','Teacher','Manager']

export default function AdminPage() {
  const { user, isLoaded, isSignedIn} = useUser()
  const [users,setUsers]=useState<userDetail[]>([])
  const [error,setError]=useState<string|null>(null)
  const [roleEdits,setRoleEdits]=useState<{[userId:string]:string}>({})
  useEffect(()=>{
    const getAllUsers = async ()=>{
      const res = await fetch('/api/user/allUsers');
      if(!res.ok){
        const err= await res.json();
        setError(err.error);
        return
      }
      const data:userDetail[]=await res.json();
      setUsers(data);
    }
    getAllUsers();
  },[isLoaded,isSignedIn, user]);

  const handleRoleChange = (userId: string, newRole: string) => {
    setRoleEdits((prev) => ({ ...prev, [userId]: newRole }))
  }
  const handleSaveRole=async (userId:string)=>{
    const newRole =roleEdits[userId]
    if(!newRole) return
    const res= await fetch('/api/user/updateRole',{
      method:'POST',
      headers:{'Content-Type': 'application/json'},
      body:JSON.stringify({userId,role:newRole}),
    })
    const d =await res.json();
    if(res.ok && d.success){
      setUsers((prev)=>
        prev.map((u)=>
          u.userId===userId ? {...u,role:newRole}:u 
        )
      )
      alert('update role succeed');
      setError(null)
    }else{
      const err =await res.json()
      setError(err.error)
      alert(error);
    }
  }

  if(!isLoaded) return <div>Loading...</div>;
  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
      <p className="text-lg">Welcome, {user?.fullName}!</p>
      <h2 className="text-2xl font-semibold mb-2">users</h2>
      {error ? (<p className="text-red-500 text-lg">{error}</p>
      ) : users.length===0 ? ( 
        <p className="text-gray-500 text-lg">No users to display.</p>
      ):(
        <ul className="space-y-2">
          {
            users.map((u)=>(
                <li key={u.userId} className="border p-4 rounded shadow">
                  <p><strong>Name:</strong> {u.name}</p>
                  <p><strong>Email:</strong> {u.email}</p>
                  <p><strong>role:</strong> {u.role}</p>
                  <select
                    value={roleEdits[u.userId]?? u.role}
                    onChange={(e)=>handleRoleChange(u.userId,e.target.value)}
                    className="border p-1 rounded mx-2"
                  >
                    {ROLE_OPTIONS.map(role=>(
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                  <button
                    className="ml-2 px-2 py-1 bg-blue-500 text-white rounded"
                    onClick={()=>handleSaveRole(u.userId)}
                  >
                    save
                  </button>
                </li>
          ))}
        </ul>
      )}
    </main>
  )
}
  