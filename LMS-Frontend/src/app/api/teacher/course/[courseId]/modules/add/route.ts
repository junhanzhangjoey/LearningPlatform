import {NextRequest,NextResponse} from "next/server";
import {auth} from "@clerk/nextjs/server"
export async function POST(req: NextRequest) {
    const pathSegments=req.nextUrl.pathname.split('/');

    const courseId=pathSegments[pathSegments.length-3];
    try{
        const token=await auth().then(a=>a.getToken());//if promise object is returned, then use the then method to get the token
        const backendBaseUrl=process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
        if(!token){
            return NextResponse.json({error:"Unathorized"},{status:401});
        }
        const res=await fetch(`${backendBaseUrl}/modules/${courseId}`,{
            method:"POST",
            headers:{
                'Content-Type':'application/json',
                'Authorization':`Bearer ${token}`
            },
            body: JSON.stringify({}),
        })
        const data=await res.json();
        return NextResponse.json(data);
    }catch(error){
        console.error('Error adding module:',error);
        return NextResponse.json({error:"Failed to add module"},{status:500})
    }
}