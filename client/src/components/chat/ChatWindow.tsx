import { useState, useRef, useEffect } from 'react'
import { useChatStore } from '@/store/chatStore'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { 
  Send, 
  Paperclip, 
  Smile, 
  Phone, 
  Video, 
  MoreVertical,
  Users,
  Info
} from 'lucide-react'
import { formatTime, getInitials } from '@/lib/utils'

export default function ChatWindow() {
  const { user } = useAuthStore()
  const { currentChat, messages, sendMessage, loading } = useChatStore()
  const [messageText, setMessageText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const chatMessages = currentChat ? messages[currentChat.id] || [] : []

  useEffect(() => {
    scrollToBottom()
  }, [chatMessages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async () => {
    if (!messageText.trim() || !currentChat) return

    try {
      await sendMessage(currentChat.id, messageText.trim())
      setMessageText('')
      inputRef.current?.focus()
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const getChatDisplayName = () => {
    if (!currentChat) return ''
    
    if (currentChat.type === 'group') {
      return currentChat.name || 'Unnamed Group'
    } else {
      const otherParticipant = currentChat.participants.find(p => p.userId !== user?.id)
      return otherParticipant?.user.displayName || 'Unknown User'
    }
  }

  const getChatAvatar = () => {
    if (!currentChat) return undefined
    
    if (currentChat.type === 'group') {
      return currentChat.avatar
    } else {
      const otherParticipant = currentChat.participants.find(p => p.userId !== user?.id)
      return otherParticipant?.user.avatar
    }
  }

  const isMessageFromCurrentUser = (message: any) => {
    return message.senderId === user?.id
  }

  if (!currentChat) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">💬</div>
          <h2 className="text-2xl font-semibold mb-2">Welcome to ChatApp</h2>
          <p className="text-muted-foreground">
            Select a chat to start messaging
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center space-x-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={getChatAvatar()} />
            <AvatarFallback>
              {currentChat.type === 'group' ? (
                <Users className="w-5 h-5" />
              ) : (
                getInitials(getChatDisplayName())
              )}
            </AvatarFallback>
          </Avatar>
          
          <div>
            <h2 className="font-semibold">{getChatDisplayName()}</h2>
            <p className="text-sm text-muted-foreground">
              {currentChat.type === 'group' 
                ? `${currentChat.participants.length} members`
                : 'Online'
              }
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon">
            <Phone className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <Video className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <Info className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Loading messages...</div>
            </div>
          ) : chatMessages.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="text-4xl mb-4">👋</div>
                <p className="text-muted-foreground">
                  No messages yet. Start the conversation!
                </p>
              </div>
            </div>
          ) : (
            chatMessages.map((message, index) => {
              const isFromCurrentUser = isMessageFromCurrentUser(message)
              const showAvatar = !isFromCurrentUser && (
                index === 0 || 
                chatMessages[index - 1]?.senderId !== message.senderId
              )
              
              return (
                <div
                  key={message.id}
                  className={`flex ${isFromCurrentUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex max-w-[70%] ${isFromCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
                    {showAvatar && !isFromCurrentUser && (
                      <Avatar className="w-8 h-8 mr-2">
                        <AvatarImage src={message.sender?.avatar} />
                        <AvatarFallback>
                          {getInitials(message.sender?.displayName || 'U')}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div className={`${!showAvatar && !isFromCurrentUser ? 'ml-10' : ''}`}>
                      <div
                        className={`
                          px-4 py-2 rounded-lg
                          ${isFromCurrentUser 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted'
                          }
                        `}
                      >
                        {!isFromCurrentUser && showAvatar && currentChat.type === 'group' && (
                          <p className="text-xs font-medium mb-1 opacity-70">
                            {message.sender?.displayName}
                          </p>
                        )}
                        
                        <p className="text-sm">{message.content}</p>
                        
                        <div className={`flex items-center justify-end mt-1 space-x-1`}>
                          <span className="text-xs opacity-70">
                            {formatTime(message.createdAt)}
                          </span>
                          {isFromCurrentUser && (
                            <span className="text-xs opacity-70">
                              {message.status === 'sent' && '✓'}
                              {message.status === 'delivered' && '✓✓'}
                              {message.status === 'read' && '✓✓'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon">
            <Paperclip className="w-4 h-4" />
          </Button>
          
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              placeholder="Type a message..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pr-10"
            />
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-1 top-1/2 transform -translate-y-1/2"
            >
              <Smile className="w-4 h-4" />
            </Button>
          </div>
          
          <Button 
            onClick={handleSendMessage}
            disabled={!messageText.trim()}
            size="icon"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
