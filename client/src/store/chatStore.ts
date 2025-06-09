import { create } from 'zustand'
import { Chat, Message, User } from '../../../shared/types'
import { chatService } from '../services/chatService'

interface ChatState {
  chats: Chat[]
  currentChat: Chat | null
  messages: Record<string, Message[]>
  typingUsers: Record<string, string[]>
  onlineUsers: Set<string>
  loading: boolean
  error: string | null
}

interface ChatActions {
  // Chat management
  loadChats: () => Promise<void>
  selectChat: (chatId: string) => void
  createChat: (data: {
    type: 'direct' | 'group'
    name?: string
    participantIds: string[]
  }) => Promise<Chat>
  updateChat: (chatId: string, data: Partial<Chat>) => Promise<void>
  deleteChat: (chatId: string) => Promise<void>

  // Message management
  loadMessages: (chatId: string, page?: number) => Promise<void>
  sendMessage: (chatId: string, content: string, attachments?: File[]) => Promise<void>
  editMessage: (messageId: string, content: string) => Promise<void>
  deleteMessage: (messageId: string) => Promise<void>
  addReaction: (messageId: string, emoji: string) => Promise<void>
  removeReaction: (messageId: string, emoji: string) => Promise<void>

  // Real-time updates
  addMessage: (message: Message) => void
  updateMessage: (message: Message) => void
  removeMessage: (messageId: string) => void
  updateChat: (chat: Chat) => void

  // Typing indicators
  setTyping: (chatId: string, userId: string, isTyping: boolean) => void
  
  // User status
  setUserOnline: (userId: string, isOnline: boolean) => void
  
  // Utility
  clearError: () => void
  reset: () => void
}

export const useChatStore = create<ChatState & ChatActions>((set, get) => ({
  // State
  chats: [],
  currentChat: null,
  messages: {},
  typingUsers: {},
  onlineUsers: new Set(),
  loading: false,
  error: null,

  // Actions
  loadChats: async () => {
    set({ loading: true, error: null })
    try {
      const chats = await chatService.getChats()
      set({ chats, loading: false })
    } catch (error: any) {
      set({ error: error.message, loading: false })
    }
  },

  selectChat: (chatId: string) => {
    const { chats } = get()
    const chat = chats.find(c => c.id === chatId)
    if (chat) {
      set({ currentChat: chat })
      // Load messages if not already loaded
      if (!get().messages[chatId]) {
        get().loadMessages(chatId)
      }
    }
  },

  createChat: async (data) => {
    set({ loading: true, error: null })
    try {
      const chat = await chatService.createChat(data)
      set(state => ({
        chats: [chat, ...state.chats],
        currentChat: chat,
        loading: false
      }))
      return chat
    } catch (error: any) {
      set({ error: error.message, loading: false })
      throw error
    }
  },

  updateChat: async (chatId: string, data: Partial<Chat>) => {
    try {
      const updatedChat = await chatService.updateChat(chatId, data)
      set(state => ({
        chats: state.chats.map(chat => 
          chat.id === chatId ? updatedChat : chat
        ),
        currentChat: state.currentChat?.id === chatId ? updatedChat : state.currentChat
      }))
    } catch (error: any) {
      set({ error: error.message })
    }
  },

  deleteChat: async (chatId: string) => {
    try {
      await chatService.deleteChat(chatId)
      set(state => ({
        chats: state.chats.filter(chat => chat.id !== chatId),
        currentChat: state.currentChat?.id === chatId ? null : state.currentChat,
        messages: Object.fromEntries(
          Object.entries(state.messages).filter(([id]) => id !== chatId)
        )
      }))
    } catch (error: any) {
      set({ error: error.message })
    }
  },

  loadMessages: async (chatId: string, page = 1) => {
    set({ loading: true, error: null })
    try {
      const messages = await chatService.getMessages(chatId, page)
      set(state => ({
        messages: {
          ...state.messages,
          [chatId]: page === 1 ? messages : [...(state.messages[chatId] || []), ...messages]
        },
        loading: false
      }))
    } catch (error: any) {
      set({ error: error.message, loading: false })
    }
  },

  sendMessage: async (chatId: string, content: string, attachments?: File[]) => {
    try {
      const message = await chatService.sendMessage(chatId, {
        content,
        type: 'text',
        attachments
      })
      // Message will be added via socket event
    } catch (error: any) {
      set({ error: error.message })
    }
  },

  editMessage: async (messageId: string, content: string) => {
    try {
      await chatService.editMessage(messageId, content)
      // Message will be updated via socket event
    } catch (error: any) {
      set({ error: error.message })
    }
  },

  deleteMessage: async (messageId: string) => {
    try {
      await chatService.deleteMessage(messageId)
      // Message will be removed via socket event
    } catch (error: any) {
      set({ error: error.message })
    }
  },

  addReaction: async (messageId: string, emoji: string) => {
    try {
      await chatService.addReaction(messageId, emoji)
      // Reaction will be updated via socket event
    } catch (error: any) {
      set({ error: error.message })
    }
  },

  removeReaction: async (messageId: string, emoji: string) => {
    try {
      await chatService.removeReaction(messageId, emoji)
      // Reaction will be updated via socket event
    } catch (error: any) {
      set({ error: error.message })
    }
  },

  // Real-time updates
  addMessage: (message: Message) => {
    set(state => ({
      messages: {
        ...state.messages,
        [message.chatId]: [...(state.messages[message.chatId] || []), message]
      },
      chats: state.chats.map(chat => 
        chat.id === message.chatId 
          ? { ...chat, lastMessage: message, updatedAt: new Date() }
          : chat
      )
    }))
  },

  updateMessage: (message: Message) => {
    set(state => ({
      messages: {
        ...state.messages,
        [message.chatId]: (state.messages[message.chatId] || []).map(msg =>
          msg.id === message.id ? message : msg
        )
      }
    }))
  },

  removeMessage: (messageId: string) => {
    set(state => {
      const newMessages = { ...state.messages }
      Object.keys(newMessages).forEach(chatId => {
        newMessages[chatId] = newMessages[chatId].filter(msg => msg.id !== messageId)
      })
      return { messages: newMessages }
    })
  },

  updateChat: (chat: Chat) => {
    set(state => ({
      chats: state.chats.map(c => c.id === chat.id ? chat : c),
      currentChat: state.currentChat?.id === chat.id ? chat : state.currentChat
    }))
  },

  setTyping: (chatId: string, userId: string, isTyping: boolean) => {
    set(state => {
      const typingUsers = { ...state.typingUsers }
      const currentTyping = typingUsers[chatId] || []
      
      if (isTyping) {
        if (!currentTyping.includes(userId)) {
          typingUsers[chatId] = [...currentTyping, userId]
        }
      } else {
        typingUsers[chatId] = currentTyping.filter(id => id !== userId)
        if (typingUsers[chatId].length === 0) {
          delete typingUsers[chatId]
        }
      }
      
      return { typingUsers }
    })
  },

  setUserOnline: (userId: string, isOnline: boolean) => {
    set(state => {
      const onlineUsers = new Set(state.onlineUsers)
      if (isOnline) {
        onlineUsers.add(userId)
      } else {
        onlineUsers.delete(userId)
      }
      return { onlineUsers }
    })
  },

  clearError: () => {
    set({ error: null })
  },

  reset: () => {
    set({
      chats: [],
      currentChat: null,
      messages: {},
      typingUsers: {},
      onlineUsers: new Set(),
      loading: false,
      error: null
    })
  }
}))
