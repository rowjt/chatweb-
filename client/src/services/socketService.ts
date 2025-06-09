import { io, Socket } from 'socket.io-client'
import { Message, User, Chat, SocketEvents } from '../../../shared/types'

class SocketService {
  private socket: Socket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000

  connect(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve()
        return
      }

      const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001'
      
      this.socket = io(socketUrl, {
        auth: {
          token
        },
        transports: ['websocket', 'polling'],
        timeout: 10000,
      })

      this.socket.on('connect', () => {
        console.log('Socket connected')
        this.reconnectAttempts = 0
        resolve()
      })

      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error)
        reject(error)
      })

      this.socket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason)
        if (reason === 'io server disconnect') {
          // Server disconnected, try to reconnect
          this.handleReconnect()
        }
      })

      this.socket.on('error', (error) => {
        console.error('Socket error:', error)
      })

      // Set up event listeners
      this.setupEventListeners()
    })
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)
      
      setTimeout(() => {
        console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
        this.socket?.connect()
      }, delay)
    } else {
      console.error('Max reconnection attempts reached')
    }
  }

  private setupEventListeners(): void {
    if (!this.socket) return

    // Authentication events
    this.socket.on('authenticated', (user: User) => {
      console.log('Socket authenticated for user:', user.username)
    })

    this.socket.on('authentication_error', (error: string) => {
      console.error('Socket authentication error:', error)
    })
  }

  // Message events
  onMessageReceive(callback: (message: Message) => void): void {
    this.socket?.on('message:receive', callback)
  }

  onMessageEdit(callback: (message: Message) => void): void {
    this.socket?.on('message:edit', callback)
  }

  onMessageDelete(callback: (messageId: string) => void): void {
    this.socket?.on('message:delete', callback)
  }

  onMessageReaction(callback: (data: { messageId: string; reactions: any[] }) => void): void {
    this.socket?.on('message:reaction', callback)
  }

  // Typing events
  onTypingStart(callback: (data: { chatId: string; userId: string; user: User }) => void): void {
    this.socket?.on('typing:start', callback)
  }

  onTypingStop(callback: (data: { chatId: string; userId: string }) => void): void {
    this.socket?.on('typing:stop', callback)
  }

  sendTypingStart(chatId: string): void {
    this.socket?.emit('typing:start', { chatId })
  }

  sendTypingStop(chatId: string): void {
    this.socket?.emit('typing:stop', { chatId })
  }

  // User status events
  onUserOnline(callback: (userId: string) => void): void {
    this.socket?.on('user:online', callback)
  }

  onUserOffline(callback: (userId: string) => void): void {
    this.socket?.on('user:offline', callback)
  }

  onUserStatusUpdate(callback: (data: { userId: string; isOnline: boolean; lastSeen?: Date }) => void): void {
    this.socket?.on('user:status', callback)
  }

  // Chat events
  onChatUpdate(callback: (chat: Chat) => void): void {
    this.socket?.on('chat:update', callback)
  }

  onChatJoin(callback: (data: { chatId: string; user: User }) => void): void {
    this.socket?.on('chat:join', callback)
  }

  onChatLeave(callback: (data: { chatId: string; userId: string }) => void): void {
    this.socket?.on('chat:leave', callback)
  }

  joinChat(chatId: string): void {
    this.socket?.emit('chat:join', chatId)
  }

  leaveChat(chatId: string): void {
    this.socket?.emit('chat:leave', chatId)
  }

  // Group events
  onGroupMemberAdd(callback: (data: { groupId: string; user: User; addedBy: User }) => void): void {
    this.socket?.on('group:member:add', callback)
  }

  onGroupMemberRemove(callback: (data: { groupId: string; userId: string; removedBy: User }) => void): void {
    this.socket?.on('group:member:remove', callback)
  }

  onGroupUpdate(callback: (group: any) => void): void {
    this.socket?.on('group:update', callback)
  }

  // Notification events
  onNotification(callback: (notification: any) => void): void {
    this.socket?.on('notification', callback)
  }

  // Utility methods
  isConnected(): boolean {
    return this.socket?.connected || false
  }

  emit(event: string, data?: any): void {
    this.socket?.emit(event, data)
  }

  on(event: string, callback: (...args: any[]) => void): void {
    this.socket?.on(event, callback)
  }

  off(event: string, callback?: (...args: any[]) => void): void {
    this.socket?.off(event, callback)
  }

  // Remove all listeners for cleanup
  removeAllListeners(): void {
    this.socket?.removeAllListeners()
  }
}

export const socketService = new SocketService()
