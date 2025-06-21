import {NextRequest,NextResponse} from 'next/server'
import {auth } from '@clerk/nextjs/server'

export async function GET(req:NextRequest){
    try{
        const pathSegments=req.nextUrl.pathname.split('/');
        const moduleId=pathSegments[pathSegments.length-1];
        const token=await auth().then(a=>a.getToken());
        const backendBaseUrl=process.env.NEXT_PUBLIC_BACKEND_URL||'http://localhost:3001';
        if(!token){
            return NextResponse.json({error:'Unauthorized'},{status:401});
        }
        const res=await fetch(`${backendBaseUrl}/modules/module/${moduleId}`,{
            headers:{
                'Authorization':`Bearer ${token}`,
            }
        })
        if(!res.ok){
            return NextResponse.json({error:'Failed to fetch module'},{status:res.status})
        }
        const mod=await res.json();//get module data from backend and convert it to json
        return NextResponse.json(mod);//convert module data to json and send it to frontend
    }catch(error){
        console.error('Failed to fetch module:',error);
        return NextResponse.json({error:'Internal server error'},{status:500});
    }

}