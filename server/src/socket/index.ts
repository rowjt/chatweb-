import { Server, Socket } from 'socket.io'
import jwt from 'jsonwebtoken'

interface AuthenticatedSocket extends Socket {
  userId?: string
  user?: any
}

// Store active connections
const activeConnections = new Map<string, AuthenticatedSocket>()

export function setupSocketHandlers(io: Server) {
  // Authentication middleware
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '')
      
      if (!token) {
        return next(new Error('Authentication error: No token provided'))
      }

      // TODO: Verify JWT token and get user
      // For now, just mock the authentication
      const decoded = { userId: 'user-1', email: 'user@example.com' }
      
      socket.userId = decoded.userId
      socket.user = decoded
      next()
    } catch (error) {
      next(new Error('Authentication error: Invalid token'))
    }
  })

  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`User ${socket.userId} connected`)
    
    // Store the connection
    if (socket.userId) {
      activeConnections.set(socket.userId, socket)
    }

    // Join user to their personal room
    if (socket.userId) {
      socket.join(`user:${socket.userId}`)
    }

    // Handle joining chat rooms
    socket.on('join_chat', (chatId: string) => {
      socket.join(`chat:${chatId}`)
      console.log(`User ${socket.userId} joined chat ${chatId}`)
    })

    // Handle leaving chat rooms
    socket.on('leave_chat', (chatId: string) => {
      socket.leave(`chat:${chatId}`)
      console.log(`User ${socket.userId} left chat ${chatId}`)
    })

    // Handle sending messages
    socket.on('send_message', async (data: {
      chatId: string
      content: string
      type?: string
      replyTo?: string
    }) => {
      try {
        // TODO: Save message to database
        const message = {
          id: `msg-${Date.now()}`,
          chatId: data.chatId,
          senderId: socket.userId,
          content: data.content,
          type: data.type || 'text',
          replyTo: data.replyTo,
          createdAt: new Date(),
          sender: socket.user
        }

        // Broadcast to all users in the chat
        socket.to(`chat:${data.chatId}`).emit('new_message', message)
        
        // Send confirmation back to sender
        socket.emit('message_sent', { messageId: message.id, status: 'sent' })
        
        console.log(`Message sent in chat ${data.chatId} by user ${socket.userId}`)
      } catch (error) {
        socket.emit('error', { message: 'Failed to send message' })
      }
    })

    // Handle typing indicators
    socket.on('typing_start', (chatId: string) => {
      socket.to(`chat:${chatId}`).emit('user_typing', {
        userId: socket.userId,
        chatId,
        isTyping: true
      })
    })

    socket.on('typing_stop', (chatId: string) => {
      socket.to(`chat:${chatId}`).emit('user_typing', {
        userId: socket.userId,
        chatId,
        isTyping: false
      })
    })

    // Handle message reactions
    socket.on('add_reaction', async (data: {
      messageId: string
      emoji: string
    }) => {
      try {
        // TODO: Save reaction to database
        const reaction = {
          messageId: data.messageId,
          userId: socket.userId,
          emoji: data.emoji,
          createdAt: new Date()
        }

        // Broadcast to all connected users
        io.emit('reaction_added', reaction)
        
        console.log(`Reaction ${data.emoji} added to message ${data.messageId} by user ${socket.userId}`)
      } catch (error) {
        socket.emit('error', { message: 'Failed to add reaction' })
      }
    })

    // Handle message status updates
    socket.on('message_read', async (data: {
      messageId: string
      chatId: string
    }) => {
      try {
        // TODO: Update message read status in database
        
        // Notify sender that message was read
        socket.to(`chat:${data.chatId}`).emit('message_status_updated', {
          messageId: data.messageId,
          status: 'read',
          readBy: socket.userId,
          readAt: new Date()
        })
        
        console.log(`Message ${data.messageId} marked as read by user ${socket.userId}`)
      } catch (error) {
        socket.emit('error', { message: 'Failed to update message status' })
      }
    })

    // Handle user presence
    socket.on('update_presence', (status: 'online' | 'away' | 'busy' | 'offline') => {
      // TODO: Update user presence in database
      
      // Broadcast presence update to all connected users
      socket.broadcast.emit('user_presence_updated', {
        userId: socket.userId,
        status,
        lastSeen: new Date()
      })
      
      console.log(`User ${socket.userId} presence updated to ${status}`)
    })

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      console.log(`User ${socket.userId} disconnected: ${reason}`)
      
      // Remove from active connections
      if (socket.userId) {
        activeConnections.delete(socket.userId)
      }

      // Update user presence to offline
      socket.broadcast.emit('user_presence_updated', {
        userId: socket.userId,
        status: 'offline',
        lastSeen: new Date()
      })
    })

    // Handle errors
    socket.on('error', (error) => {
      console.error(`Socket error for user ${socket.userId}:`, error)
    })
  })

  // Helper function to send message to specific user
  const sendToUser = (userId: string, event: string, data: any) => {
    const userSocket = activeConnections.get(userId)
    if (userSocket) {
      userSocket.emit(event, data)
      return true
    }
    return false
  }

  // Helper function to send message to chat
  const sendToChat = (chatId: string, event: string, data: any) => {
    io.to(`chat:${chatId}`).emit(event, data)
  }

  // Export helper functions for use in other parts of the application
  return {
    sendToUser,
    sendToChat,
    getActiveConnections: () => activeConnections,
    getConnectionCount: () => activeConnections.size
  }
}
