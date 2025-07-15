import {NextRequest, NextResponse} from 'next/server'
import {auth} from '@clerk/nextjs/server'

export async function PATCH(req:NextRequest){
    const {searchParams}=new URL(req.url);
    const moduleId=searchParams.get('moduleId');
    
    const token =await auth().then(a=>a.getToken());
    const backEndBaseUrl=process.env.NEXT_PUBLIC_BACKEND_URL||'http://localhost:3001'
    const body=await req.json();
    const res = await fetch(`${backEndBaseUrl}/modules/${moduleId}`,{
        method:'PATCH',
        headers:{
            'Content-Type':'application/json',
            'Authorization':`Bearer ${token}`,
        },
        body:JSON.stringify(body),
    });
    if(!res.ok){
        return NextResponse.json({error:'Failed to update module'},{status:res.status})
    }

    const result=await res.json();
    return NextResponse.json(result);
}