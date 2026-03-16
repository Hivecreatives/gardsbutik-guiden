import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { headers } from 'next/headers'

export async function POST() {
  const supabase = await createClient()
  await supabase.auth.signOut()

  const headersList = await headers()

  // Fix: resolve each header independently to avoid precedence bugs
  const origin =
    headersList.get('origin') ??
    (headersList.get('x-forwarded-host')
      ? `https://${headersList.get('x-forwarded-host')}`
      : null) ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    'http://localhost:3000'

  // Fix: use 302 so the browser does a GET on the redirected URL,
  // not 307 which replays the POST request
  return NextResponse.redirect(new URL('/login', origin), { status: 302 })
}