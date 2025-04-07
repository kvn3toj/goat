import { create } from 'zustand'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '../services/supabaseClient'

interface AuthState {
  user: User | null
  session: Session | null
  setUser: (user: User | null) => void
  setSession: (session: Session | null) => void
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),
  logout: async () => {
    try {
      await supabase.auth.signOut()
      set({ user: null, session: null })
    } catch (error) {
      console.error('Error during logout:', error)
      throw error
    }
  },
})) 