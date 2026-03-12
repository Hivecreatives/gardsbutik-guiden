'use client'
import { useEffect, useState } from 'react'
import { createClient } from '../lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { Database } from '../lib/supabase/database.types'
import type { Enums } from '../lib/supabase/database.types'

type Profile = Database['public']['Tables']['profiles']['Row']
type UserRole = Enums<'user_role'>

export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        setProfile(data)
      }
      setLoading(false)
    }

    fetchUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (!session?.user) setProfile(null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const role = profile?.role as UserRole | undefined

  return {
    user,
    profile,
    loading,
    role,
    isAdmin: role === 'admin',
    isFarmOwner: role === 'farm_owner',
    isUser: role === 'user',
  }
}