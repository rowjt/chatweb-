import { Chat, Message, CreateChatRequest, SendMessageData, PaginatedResponse } from '../../../shared/types'
import { apiService } from './api'

class ChatService {
  // Chat management
  async getChats(): Promise<Chat[]> {
    return await apiService.get<Chat[]>('/api/chats')
  }

  async getChat(chatId: string): Promise<Chat> {
    return await apiService.get<Chat>(`/api/chats/${chatId}`)
  }

  async createChat(data: CreateChatRequest): Promise<Chat> {
    return await apiService.post<Chat>('/api/chats', data)
  }

  async updateChat(chatId: string, data: Partial<Chat>): Promise<Chat> {
    return await apiService.put<Chat>(`/api/chats/${chatId}`, data)
  }

  async deleteChat(chatId: string): Promise<void> {
    await apiService.delete(`/api/chats/${chatId}`)
  }

  async leaveChat(chatId: string): Promise<void> {
    await apiService.post(`/api/chats/${chatId}/leave`)
  }

  // Message management
  async getMessages(chatId: string, page = 1, limit = 50): Promise<Message[]> {
    const response = await apiService.get<PaginatedResponse<Message>>(
      `/api/chats/${chatId}/messages?page=${page}&limit=${limit}`
    )
    return response.data
  }

  async sendMessage(chatId: string, data: Omit<SendMessageData, 'chatId'>): Promise<Message> {
    if (data.attachments && data.attachments.length > 0) {
      // Upload files first
      const uploadedFiles = await this.uploadFiles(data.attachments)
      return await apiService.post<Message>(`/api/chats/${chatId}/messages`, {
        content: data.content,
        type: data.type,
        attachments: uploadedFiles,
        replyTo: data.replyTo,
      })
    } else {
      return await apiService.post<Message>(`/api/chats/${chatId}/messages`, {
        content: data.content,
        type: data.type,
        replyTo: data.replyTo,
      })
    }
  }

  async editMessage(messageId: string, content: string): Promise<Message> {
    return await apiService.put<Message>(`/api/messages/${messageId}`, { content })
  }

  async deleteMessage(messageId: string): Promise<void> {
    await apiService.delete(`/api/messages/${messageId}`)
  }

  async addReaction(messageId: string, emoji: string): Promise<void> {
    await apiService.post(`/api/messages/${messageId}/reactions`, { emoji })
  }

  async removeReaction(messageId: string, emoji: string): Promise<void> {
    await apiService.delete(`/api/messages/${messageId}/reactions/${emoji}`)
  }

  // Group management
  async addMember(chatId: string, userId: string): Promise<void> {
    await apiService.post(`/api/chats/${chatId}/members`, { userId })
  }

  async removeMember(chatId: string, userId: string): Promise<void> {
    await apiService.delete(`/api/chats/${chatId}/members/${userId}`)
  }

  async updateMemberRole(chatId: string, userId: string, role: string): Promise<void> {
    await apiService.put(`/api/chats/${chatId}/members/${userId}`, { role })
  }

  async getChatMembers(chatId: string): Promise<any[]> {
    return await apiService.get(`/api/chats/${chatId}/members`)
  }

  // File upload
  async uploadFiles(files: File[]): Promise<any[]> {
    const uploadPromises = files.map(file => this.uploadFile(file))
    return await Promise.all(uploadPromises)
  }

  async uploadFile(file: File): Promise<any> {
    return await apiService.upload('/api/upload', file)
  }

  // Search
  async searchMessages(query: string, chatId?: string): Promise<Message[]> {
    const params = new URLSearchParams({ q: query })
    if (chatId) {
      params.append('chatId', chatId)
    }
    return await apiService.get<Message[]>(`/api/search/messages?${params}`)
  }

  async searchChats(query: string): Promise<Chat[]> {
    return await apiService.get<Chat[]>(`/api/search/chats?q=${encodeURIComponent(query)}`)
  }

  // Chat settings
  async updateChatSettings(chatId: string, settings: any): Promise<void> {
    await apiService.put(`/api/chats/${chatId}/settings`, settings)
  }

  async getChatSettings(chatId: string): Promise<any> {
    return await apiService.get(`/api/chats/${chatId}/settings`)
  }

  // Notifications
  async markAsRead(chatId: string): Promise<void> {
    await apiService.post(`/api/chats/${chatId}/read`)
  }

  async muteChat(chatId: string, duration?: number): Promise<void> {
    await apiService.post(`/api/chats/${chatId}/mute`, { duration })
  }

  async unmuteChat(chatId: string): Promise<void> {
    await apiService.post(`/api/chats/${chatId}/unmute`)
  }
}

export const chatService = new ChatService()
