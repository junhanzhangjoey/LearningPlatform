import {NextResponse} from 'next/server'
import {auth,clerkClient} from '@clerk/nextjs/server'

export async function GET(){//_req:NextRequest
    try{
        const {userId} = await auth();
        if(!userId){
            return NextResponse.json({error:'Unauthorized'},{status:401});
        }
        const client = await clerkClient();
        const user = await client.users.getUser(userId);
        if(user.publicMetadata.role!='Admin'){
            return NextResponse.json({error:'Only Administrator can access this page.'},{status:403});
        }
        const userList=await client.users.getUserList();
        const nonAdminUsers= userList.data.filter(u=>(u.publicMetadata.role!=='Admin'));
        const users=nonAdminUsers.map(u=>({
            userId:u.id,
            name:`${u.firstName??''} ${u.lastName ?? ''}`.trim(),
            email: u.emailAddresses[0]?.emailAddress||'',
            role:u.publicMetadata.role,
        }))
        return NextResponse.json(users);
    }catch(err){
        console.error('API error:',err)
        return NextResponse.json({error:'Internal Server Error'},{status:500})
    }
}