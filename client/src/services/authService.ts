import { User, LoginRequest, RegisterRequest } from '../../../shared/types'
import { apiService } from './api'

interface AuthResponse {
  user: User
  token: string
}

class AuthService {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    return await apiService.post<AuthResponse>('/api/auth/login', credentials)
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    return await apiService.post<AuthResponse>('/api/auth/register', userData)
  }

  async logout(): Promise<void> {
    try {
      await apiService.post('/api/auth/logout')
    } catch (error) {
      // Ignore logout errors, clear local storage anyway
      console.warn('Logout request failed:', error)
    }
  }

  async getCurrentUser(): Promise<User> {
    return await apiService.get<User>('/api/auth/me')
  }

  async refreshToken(): Promise<AuthResponse> {
    return await apiService.post<AuthResponse>('/api/auth/refresh')
  }

  async changePassword(data: {
    currentPassword: string
    newPassword: string
  }): Promise<void> {
    await apiService.post('/api/auth/change-password', data)
  }

  async requestPasswordReset(email: string): Promise<void> {
    await apiService.post('/api/auth/forgot-password', { email })
  }

  async resetPassword(data: {
    token: string
    newPassword: string
  }): Promise<void> {
    await apiService.post('/api/auth/reset-password', data)
  }

  async verifyEmail(token: string): Promise<void> {
    await apiService.post('/api/auth/verify-email', { token })
  }

  async resendVerificationEmail(): Promise<void> {
    await apiService.post('/api/auth/resend-verification')
  }
}

export const authService = new AuthService()
