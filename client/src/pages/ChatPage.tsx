import { useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useChatStore } from '@/store/chatStore'
import { socketService } from '@/services/socketService'
import ChatSidebar from '@/components/chat/ChatSidebar'
import ChatWindow from '@/components/chat/ChatWindow'
import { Separator } from '@/components/ui/separator'

export default function ChatPage() {
  const { user, token } = useAuthStore()
  const { loadChats, currentChat } = useChatStore()

  useEffect(() => {
    if (token && user) {
      // Connect to socket
      socketService.connect(token).then(() => {
        console.log('Socket connected successfully')
      }).catch((error) => {
        console.error('Socket connection failed:', error)
      })

      // Load initial data
      loadChats()

      // Cleanup on unmount
      return () => {
        socketService.disconnect()
      }
    }
  }, [token, user, loadChats])

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-80 border-r border-border">
        <ChatSidebar />
      </div>
      
      <Separator orientation="vertical" />
      
      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        {currentChat ? (
          <ChatWindow />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">💬</div>
              <h2 className="text-2xl font-semibold mb-2">Welcome to ChatApp</h2>
              <p className="text-muted-foreground">
                Select a chat to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
