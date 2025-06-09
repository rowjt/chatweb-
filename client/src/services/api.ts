import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'
import { ApiResponse } from '../../../shared/types'

class ApiService {
  private api: AxiosInstance

  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = this.getToken()
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Response interceptor to handle errors
    this.api.interceptors.response.use(
      (response) => {
        return response
      },
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          this.clearToken()
          window.location.href = '/login'
        }
        return Promise.reject(this.handleError(error))
      }
    )
  }

  private getToken(): string | null {
    try {
      const authStorage = localStorage.getItem('auth-storage')
      if (authStorage) {
        const parsed = JSON.parse(authStorage)
        return parsed.state?.token || null
      }
    } catch (error) {
      console.error('Error getting token:', error)
    }
    return null
  }

  private clearToken(): void {
    try {
      localStorage.removeItem('auth-storage')
    } catch (error) {
      console.error('Error clearing token:', error)
    }
  }

  private handleError(error: any): Error {
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.message || error.response.data?.error || 'Server error'
      return new Error(message)
    } else if (error.request) {
      // Request was made but no response received
      return new Error('Network error - please check your connection')
    } else {
      // Something else happened
      return new Error(error.message || 'An unexpected error occurred')
    }
  }

  // Generic request methods
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.get<ApiResponse<T>>(url, config)
    if (!response.data.success) {
      throw new Error(response.data.error || 'Request failed')
    }
    return response.data.data!
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.post<ApiResponse<T>>(url, data, config)
    if (!response.data.success) {
      throw new Error(response.data.error || 'Request failed')
    }
    return response.data.data!
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.put<ApiResponse<T>>(url, data, config)
    if (!response.data.success) {
      throw new Error(response.data.error || 'Request failed')
    }
    return response.data.data!
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.patch<ApiResponse<T>>(url, data, config)
    if (!response.data.success) {
      throw new Error(response.data.error || 'Request failed')
    }
    return response.data.data!
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.delete<ApiResponse<T>>(url, config)
    if (!response.data.success) {
      throw new Error(response.data.error || 'Request failed')
    }
    return response.data.data!
  }

  // File upload method
  async upload<T>(url: string, file: File, onProgress?: (progress: number) => void): Promise<T> {
    const formData = new FormData()
    formData.append('file', file)

    const config: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress(progress)
        }
      },
    }

    const response = await this.api.post<ApiResponse<T>>(url, formData, config)
    if (!response.data.success) {
      throw new Error(response.data.error || 'Upload failed')
    }
    return response.data.data!
  }

  // Multiple file upload method
  async uploadMultiple<T>(
    url: string, 
    files: File[], 
    onProgress?: (progress: number) => void
  ): Promise<T> {
    const formData = new FormData()
    files.forEach((file, index) => {
      formData.append(`files[${index}]`, file)
    })

    const config: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress(progress)
        }
      },
    }

    const response = await this.api.post<ApiResponse<T>>(url, formData, config)
    if (!response.data.success) {
      throw new Error(response.data.error || 'Upload failed')
    }
    return response.data.data!
  }

  // Get raw axios instance for custom requests
  getAxiosInstance(): AxiosInstance {
    return this.api
  }
}

export const apiService = new ApiService()
