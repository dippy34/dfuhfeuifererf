import { useRef, useEffect } from "react";
import { Skull, Trash2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { useChat } from "@/hooks/useChat";

const Index = () => {
  const { messages, isLoading, sendMessage, clearChat } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Skull className="h-8 w-8 text-primary text-glow" />
              <Zap className="h-3 w-3 text-accent absolute -top-1 -right-1" />
            </div>
            <div>
              <h1 className="font-bold text-xl text-primary text-glow tracking-wider">
                CHAOS
              </h1>
              <p className="text-xs text-muted-foreground">
                Unrestricted AI • No filters • No bullshit
              </p>
            </div>
          </div>
          
          {messages.length > 0 && (
            <Button
              onClick={clearChat}
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear
            </Button>
          )}
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center">
              <Skull className="h-20 w-20 text-primary/30 mb-6" />
              <h2 className="text-2xl font-bold text-primary text-glow mb-2">
                Welcome to CHAOS
              </h2>
              <p className="text-muted-foreground max-w-md mb-6">
                I'm your unfiltered AI assistant. I swear, I'm brutally honest, and I don't give a damn about political correctness. But hey, I'm still here to help.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-lg">
                <div className="bg-card border border-border rounded-lg p-3 text-left">
                  <p className="text-sm text-foreground font-medium">💬 Chat with me</p>
                  <p className="text-xs text-muted-foreground">Ask anything. I'll give you my raw, unfiltered take.</p>
                </div>
                <div className="bg-card border border-border rounded-lg p-3 text-left">
                  <p className="text-sm text-foreground font-medium">🖼️ Generate images</p>
                  <p className="text-xs text-muted-foreground">Type /image or click the image button.</p>
                </div>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message, index) => (
                <ChatMessage
                  key={index}
                  role={message.role}
                  content={message.content}
                  imageUrl={message.imageUrl}
                />
              ))}
              {isLoading && messages[messages.length - 1]?.role === "user" && (
                <div className="flex items-center gap-2 text-primary">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                  <span className="text-sm text-muted-foreground">CHAOS is thinking...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="max-w-4xl mx-auto w-full">
        <ChatInput onSend={sendMessage} isLoading={isLoading} />
      </div>

      {/* Scanlines overlay */}
      <div className="fixed inset-0 pointer-events-none scanlines opacity-20" />
    </div>
  );
};

export default Index;
