import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Enums } from '@/lib/supabase/database.types'

type UserRole = Enums<'user_role'>

export async function requireRole(allowed: UserRole[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !allowed.includes(profile.role as UserRole)) {
    redirect('/unauthorized')
  }

  return { user, role: profile.role as UserRole }
}