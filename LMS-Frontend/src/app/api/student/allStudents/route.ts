import { NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'

export async function GET() {
  try {
    const { userId } =await auth()



    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const client = await clerkClient()

    const user = await client.users.getUser(userId)

    if (user.publicMetadata.role !== 'Manager') {
      return NextResponse.json({ error: 'Only managers can access this page.' }, { status: 403 })
    }

    const userList = await client.users.getUserList()

    const studentUsers = userList.data.filter(u => u.publicMetadata.role === 'Student')

    const students = studentUsers.map((s) => ({
        userId: s.id,
        name: `${s.firstName ?? ''} ${s.lastName ?? ''}`.trim(),
        email: s.emailAddresses[0]?.emailAddress || '',
      }))
      

    return NextResponse.json(students)
  } catch (err) {
    console.error('API error:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
