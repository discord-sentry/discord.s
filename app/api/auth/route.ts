// app/api/auth/route.ts

import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { password } = await request.json()
  
  if (password === process.env.DASHBOARD_PASSWORD) {
    const response = NextResponse.json({ success: true })
    response.cookies.set('auth', 'true', { httpOnly: true, secure: true, sameSite: 'strict', maxAge: 3600 })
    return response
  }
  
  return NextResponse.json({ success: false }, { status: 401 })
}
