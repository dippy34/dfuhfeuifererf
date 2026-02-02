import { useRef, useEffect } from "react";
import { Sparkles, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { SettingsDialog } from "@/components/SettingsDialog";
import { useChat } from "@/hooks/useChat";
import { usePersonality } from "@/hooks/usePersonality";

const Index = () => {
  const { messages, isLoading, sendMessage, clearChat } = useChat();
  const { personality, personalityId, changePersonality } = usePersonality();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (message: string, isImageRequest: boolean, uploadedImage?: string) => {
    sendMessage(message, isImageRequest, personality.systemPrompt, uploadedImage);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <span className="text-3xl">{personality.emoji}</span>
              <Sparkles className="h-3 w-3 text-accent absolute -top-1 -right-1" />
            </div>
            <div>
              <h1 className="font-bold text-xl text-primary text-glow tracking-wider">
                {personality.name}
              </h1>
              <p className="text-xs text-muted-foreground">
                {personality.description}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <SettingsDialog
              currentPersonalityId={personalityId}
              onPersonalityChange={changePersonality}
            />
            
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
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center">
              <span className="text-8xl mb-6">{personality.emoji}</span>
              <h2 className="text-2xl font-bold text-primary text-glow mb-2">
                {personality.name}
              </h2>
              <p className="text-muted-foreground max-w-md mb-6">
                {personality.description}. Click the gear icon to switch personalities anytime!
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-2xl">
                <div className="bg-card border border-border rounded-lg p-3 text-left">
                  <p className="text-sm text-foreground font-medium">💬 Chat</p>
                  <p className="text-xs text-muted-foreground">Ask anything and get a response.</p>
                </div>
                <div className="bg-card border border-border rounded-lg p-3 text-left">
                  <p className="text-sm text-foreground font-medium">🖼️ Generate</p>
                  <p className="text-xs text-muted-foreground">Type /image or click the image button.</p>
                </div>
                <div className="bg-card border border-border rounded-lg p-3 text-left">
                  <p className="text-sm text-foreground font-medium">📎 Upload</p>
                  <p className="text-xs text-muted-foreground">Attach images to discuss them.</p>
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
                  uploadedImageUrl={message.uploadedImageUrl}
                />
              ))}
              {isLoading && messages[messages.length - 1]?.role === "user" && (
                <div className="flex items-center gap-2 text-primary">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                  <span className="text-sm text-muted-foreground">Thinking...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="max-w-4xl mx-auto w-full">
        <ChatInput onSend={handleSend} isLoading={isLoading} />
      </div>

      {/* Scanlines overlay */}
      <div className="fixed inset-0 pointer-events-none scanlines opacity-20" />
    </div>
  );
};

export default Index;
