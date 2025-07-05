import { useState } from 'react'
import { useChatStore } from '@/store/chatStore'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
// import { Separator } from '@/components/ui/separator'
import { 
  Search, 
  Plus, 
  Settings, 
  MessageSquare,
  Users,
  // MoreVertical
} from 'lucide-react'
import { formatTime, getInitials } from '@/lib/utils'

export default function ChatSidebar() {
  const { user } = useAuthStore()
  const { chats, currentChat, selectChat, loading } = useChatStore()
  const [searchQuery, setSearchQuery] = useState('')

  const filteredChats = chats.filter(chat => {
    if (!searchQuery) return true
    
    const searchLower = searchQuery.toLowerCase()
    
    // Search by chat name
    if (chat.name?.toLowerCase().includes(searchLower)) return true
    
    // Search by participant names (for direct chats)
    if (chat.type === 'direct') {
      const otherParticipant = chat.participants.find(p => p.userId !== user?.id)
      if (otherParticipant?.user.displayName?.toLowerCase().includes(searchLower)) return true
    }
    
    return false
  })

  const getChatDisplayName = (chat: any) => {
    if (chat.type === 'group') {
      return chat.name || 'Unnamed Group'
    } else {
      const otherParticipant = chat.participants.find((p: any) => p.userId !== user?.id)
      return otherParticipant?.user.displayName || 'Unknown User'
    }
  }

  const getChatAvatar = (chat: any) => {
    if (chat.type === 'group') {
      return chat.avatar
    } else {
      const otherParticipant = chat.participants.find((p: any) => p.userId !== user?.id)
      return otherParticipant?.user.avatar
    }
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold">Chats</h1>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon">
              <Plus className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Chat List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Loading chats...</div>
            </div>
          ) : filteredChats.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <MessageSquare className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="font-medium mb-2">No chats found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {searchQuery ? 'Try a different search term' : 'Start a new conversation'}
              </p>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                New Chat
              </Button>
            </div>
          ) : (
            filteredChats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => selectChat(chat.id)}
                className={`
                  flex items-center p-3 rounded-lg cursor-pointer transition-colors
                  hover:bg-accent hover:text-accent-foreground
                  ${currentChat?.id === chat.id ? 'bg-accent text-accent-foreground' : ''}
                `}
              >
                <div className="relative">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={getChatAvatar(chat)} />
                    <AvatarFallback>
                      {chat.type === 'group' ? (
                        <Users className="w-6 h-6" />
                      ) : (
                        getInitials(getChatDisplayName(chat))
                      )}
                    </AvatarFallback>
                  </Avatar>
                  {/* Online indicator for direct chats */}
                  {chat.type === 'direct' && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
                  )}
                </div>
                
                <div className="flex-1 ml-3 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium truncate">
                      {getChatDisplayName(chat)}
                    </h3>
                    <div className="flex items-center space-x-2">
                      {chat.lastMessage && (
                        <span className="text-xs text-muted-foreground">
                          {formatTime(chat.lastMessage.createdAt)}
                        </span>
                      )}
                      {chat.unreadCount > 0 && (
                        <Badge variant="default" className="text-xs">
                          {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {chat.lastMessage && (
                    <p className="text-sm text-muted-foreground truncate mt-1">
                      {chat.lastMessage.type === 'text' 
                        ? chat.lastMessage.content 
                        : `📎 ${chat.lastMessage.type}`
                      }
                    </p>
                  )}
                  
                  {chat.type === 'group' && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {chat.participants.length} members
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
