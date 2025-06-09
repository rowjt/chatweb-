// User types
export interface User {
  id: string
  email: string
  username: string
  displayName: string
  avatar?: string
  bio?: string
  isOnline: boolean
  lastSeen: Date
  isAdmin: boolean
  createdAt: Date
  updatedAt: Date
}

export interface UserProfile {
  id: string
  userId: string
  displayName: string
  bio?: string
  avatar?: string
  theme: 'light' | 'dark' | 'system'
  notifications: NotificationSettings
  privacy: PrivacySettings
}

export interface NotificationSettings {
  messages: boolean
  mentions: boolean
  groups: boolean
  sounds: boolean
  desktop: boolean
}

export interface PrivacySettings {
  showOnlineStatus: boolean
  showLastSeen: boolean
  allowDirectMessages: boolean
  allowGroupInvites: boolean
}

// Chat types
export interface Chat {
  id: string
  type: 'direct' | 'group'
  name?: string
  description?: string
  avatar?: string
  participants: ChatParticipant[]
  lastMessage?: Message
  unreadCount: number
  createdAt: Date
  updatedAt: Date
}

export interface ChatParticipant {
  id: string
  chatId: string
  userId: string
  user: User
  role: 'member' | 'admin' | 'owner'
  joinedAt: Date
  permissions: ChatPermissions
}

export interface ChatPermissions {
  canSendMessages: boolean
  canSendMedia: boolean
  canAddMembers: boolean
  canRemoveMembers: boolean
  canEditChat: boolean
  canDeleteMessages: boolean
}

// Message types
export interface Message {
  id: string
  chatId: string
  senderId: string
  sender: User
  content: string
  type: MessageType
  attachments: MessageAttachment[]
  replyTo?: string
  replyToMessage?: Message
  reactions: MessageReaction[]
  isEdited: boolean
  isDeleted: boolean
  createdAt: Date
  updatedAt: Date
}

export type MessageType = 'text' | 'image' | 'file' | 'audio' | 'video' | 'system'

export interface MessageAttachment {
  id: string
  messageId: string
  type: 'image' | 'file' | 'audio' | 'video'
  name: string
  url: string
  size: number
  mimeType: string
  thumbnail?: string
}

export interface MessageReaction {
  id: string
  messageId: string
  userId: string
  user: User
  emoji: string
  createdAt: Date
}

// Group types
export interface Group {
  id: string
  name: string
  description?: string
  avatar?: string
  type: 'public' | 'private'
  memberCount: number
  maxMembers: number
  ownerId: string
  owner: User
  settings: GroupSettings
  createdAt: Date
  updatedAt: Date
}

export interface GroupSettings {
  allowMemberInvites: boolean
  requireApproval: boolean
  allowFileSharing: boolean
  allowVoiceMessages: boolean
  messageHistory: 'visible' | 'hidden'
  slowMode: number // seconds
}

// Socket events
export interface SocketEvents {
  // Connection
  connect: () => void
  disconnect: () => void
  
  // Authentication
  authenticate: (token: string) => void
  authenticated: (user: User) => void
  
  // Messages
  'message:send': (data: SendMessageData) => void
  'message:receive': (message: Message) => void
  'message:edit': (data: EditMessageData) => void
  'message:delete': (data: DeleteMessageData) => void
  'message:reaction': (data: MessageReactionData) => void
  
  // Typing
  'typing:start': (data: TypingData) => void
  'typing:stop': (data: TypingData) => void
  'typing:update': (data: TypingData) => void
  
  // User status
  'user:online': (userId: string) => void
  'user:offline': (userId: string) => void
  'user:status': (data: UserStatusData) => void
  
  // Chat events
  'chat:join': (chatId: string) => void
  'chat:leave': (chatId: string) => void
  'chat:update': (chat: Chat) => void
  
  // Group events
  'group:member:add': (data: GroupMemberData) => void
  'group:member:remove': (data: GroupMemberData) => void
  'group:update': (group: Group) => void
}

// Socket data types
export interface SendMessageData {
  chatId: string
  content: string
  type: MessageType
  attachments?: File[]
  replyTo?: string
}

export interface EditMessageData {
  messageId: string
  content: string
}

export interface DeleteMessageData {
  messageId: string
}

export interface MessageReactionData {
  messageId: string
  emoji: string
  action: 'add' | 'remove'
}

export interface TypingData {
  chatId: string
  userId: string
}

export interface UserStatusData {
  userId: string
  isOnline: boolean
  lastSeen?: Date
}

export interface GroupMemberData {
  groupId: string
  userId: string
  role?: 'member' | 'admin' | 'owner'
}

// API types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  username: string
  password: string
  displayName: string
}

export interface CreateChatRequest {
  type: 'direct' | 'group'
  name?: string
  description?: string
  participantIds: string[]
}

export interface UpdateProfileRequest {
  displayName?: string
  bio?: string
  avatar?: File
}

// Admin types
export interface AdminStats {
  totalUsers: number
  activeUsers: number
  totalChats: number
  totalMessages: number
  storageUsed: number
  serverUptime: number
}

export interface AdminUser extends User {
  messageCount: number
  chatCount: number
  lastActivity: Date
  status: 'active' | 'suspended' | 'banned'
}

export interface AdminChat extends Chat {
  messageCount: number
  activeMembers: number
  reportCount: number
  status: 'active' | 'archived' | 'suspended'
}

// Error types
export interface AppError {
  code: string
  message: string
  details?: any
}

export type ErrorCode = 
  | 'AUTH_REQUIRED'
  | 'INVALID_CREDENTIALS'
  | 'USER_NOT_FOUND'
  | 'CHAT_NOT_FOUND'
  | 'MESSAGE_NOT_FOUND'
  | 'PERMISSION_DENIED'
  | 'VALIDATION_ERROR'
  | 'SERVER_ERROR'
  | 'NETWORK_ERROR'
