"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageCircle, X, Send, Bot, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

interface ChatbotProps {
  currentPrediction: number
  currentItem: string
}

export function Chatbot({ currentPrediction, currentItem }: ChatbotProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: "Hello! I'm your KPDN Intelligence Assistant. Ask me about price trends, global factors, or specific item details." }
  ])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isLoading])

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage = inputValue
    setInputValue("")
    setMessages(prev => [...prev, { role: "user", content: userMessage }])
    setIsLoading(true)

    try {
      const response = await fetch(
        `http://localhost:8000/chat?user_query=${encodeURIComponent(userMessage)}&current_prediction=${currentPrediction}&item=${encodeURIComponent(currentItem)}`,
        {
          method: 'POST',
        }
      )

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`)
      }

      const data = await response.json()
      setMessages(prev => [...prev, { role: "assistant", content: data.reply }])
    } catch (error) {
       console.error('Chat error:', error)
       setMessages(prev => [...prev, { 
         role: "assistant", 
         content: "Sorry, I couldn't connect to the Intelligence Hub. Please ensure:\n1. The FastAPI server is running on http://localhost:8000\n2. Your GEMINI_API_KEY is configured\n3. The /chat endpoint is available" 
       }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-20 sm:bottom-20 right-3 sm:right-6 z-50 w-[calc(100vw-24px)] sm:w-[380px] max-w-md shadow-2xl"
          >
            <Card className="h-[400px] sm:h-[500px] flex flex-col border-primary/20 bg-background/95 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between border-b p-3 sm:p-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-primary">
                    <Bot className="h-4 w-4 sm:h-5 sm:w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-xs sm:text-sm">Intelligence Chat</CardTitle>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Powered by Gemini 2.5</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-7 w-7 sm:h-8 sm:w-8">
                  <X className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </CardHeader>
              
              <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4" ref={scrollRef}>
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "flex max-w-[85%] sm:max-w-[80%] flex-col gap-1 rounded-lg px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm",
                      msg.role === "user"
                        ? "ml-auto bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {msg.content}
                  </div>
                ))}
                
                {isLoading && (
                  <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2 text-[10px] sm:text-xs text-muted-foreground bg-muted/50 p-2 rounded-md self-start"
                  >
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Searching Bank Negara reports and News...
                  </motion.div>
                )}
              </div>

              <div className="p-3 sm:p-4 border-t">
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleSendMessage()
                  }}
                  className="flex gap-2"
                >
                  <Input
                    placeholder="Ask about price factors..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="flex-1 text-xs sm:text-sm"
                  />
                  <Button type="submit" size="icon" disabled={isLoading} className="h-9 w-9">
                    <Send className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </Button>
                </form>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 sm:bottom-6 right-3 sm:right-6 z-50 flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-primary shadow-lg hover:shadow-xl transition-shadow"
      >
        <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
      </motion.button>
    </>
  )
}
