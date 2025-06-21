import {NextRequest,NextResponse} from 'next/server'
import {clerkClient} from '@clerk/clerk-sdk-node'

export async function POST(req:NextRequest){
    try{
        const {userId,role} = await req.json();
        if(!userId||!role){
            return NextResponse.json({error:'Missing userId or role'},{status:400});
        }
        await clerkClient.users.updateUserMetadata(userId,{
            publicMetadata:{role},
        })
        return NextResponse.json({success:true})
    }catch(err){
        console.log('Update role error:', err);
        return NextResponse.json({error:'Failed to update role'},{status:500})
    }
}