import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(req: NextRequest) {
  const pathSegments = req.nextUrl.pathname.split('/');
  console.log('PATCH called', pathSegments);
  return NextResponse.json({ message: "PATCH works!", pathSegments });
} 