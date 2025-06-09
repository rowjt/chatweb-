import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User } from '../../../shared/types'
import { authService } from '../services/authService'

interface AuthState {
  user: User | null
  token: string | null
  loading: boolean
  error: string | null
}

interface AuthActions {
  login: (email: string, password: string) => Promise<void>
  register: (data: {
    email: string
    username: string
    password: string
    displayName: string
  }) => Promise<void>
  logout: () => void
  checkAuth: () => Promise<void>
  updateUser: (user: Partial<User>) => void
  clearError: () => void
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      loading: false,
      error: null,

      // Actions
      login: async (email: string, password: string) => {
        set({ loading: true, error: null })
        try {
          const response = await authService.login({ email, password })
          set({
            user: response.user,
            token: response.token,
            loading: false,
            error: null,
          })
        } catch (error: any) {
          set({
            loading: false,
            error: error.message || 'Login failed',
          })
          throw error
        }
      },

      register: async (data) => {
        set({ loading: true, error: null })
        try {
          const response = await authService.register(data)
          set({
            user: response.user,
            token: response.token,
            loading: false,
            error: null,
          })
        } catch (error: any) {
          set({
            loading: false,
            error: error.message || 'Registration failed',
          })
          throw error
        }
      },

      logout: () => {
        authService.logout()
        set({
          user: null,
          token: null,
          error: null,
        })
      },

      checkAuth: async () => {
        const { token } = get()
        if (!token) {
          set({ loading: false })
          return
        }

        set({ loading: true })
        try {
          const user = await authService.getCurrentUser()
          set({
            user,
            loading: false,
            error: null,
          })
        } catch (error) {
          set({
            user: null,
            token: null,
            loading: false,
            error: null,
          })
        }
      },

      updateUser: (userData) => {
        const { user } = get()
        if (user) {
          set({
            user: { ...user, ...userData },
          })
        }
      },

      clearError: () => {
        set({ error: null })
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
      }),
    }
  )
)
