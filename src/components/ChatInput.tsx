import { useState, KeyboardEvent } from "react";
import { Send, Image, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (message: string, isImageRequest: boolean) => void;
  isLoading: boolean;
}

export const ChatInput = ({ onSend, isLoading }: ChatInputProps) => {
  const [input, setInput] = useState("");

  const handleSend = (isImageRequest: boolean = false) => {
    if (!input.trim() || isLoading) return;
    
    const message = input.trim();
    setInput("");
    onSend(message, isImageRequest || message.toLowerCase().startsWith("/image"));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-border bg-card/50 p-4">
      <div className="flex gap-2 items-end">
        <div className="flex-1 relative">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type some shit... or /image [prompt] to generate images"
            className={cn(
              "min-h-[60px] max-h-[200px] resize-none",
              "bg-background border-primary/30 focus:border-primary",
              "text-foreground placeholder:text-muted-foreground",
              "focus:ring-1 focus:ring-primary"
            )}
            disabled={isLoading}
          />
        </div>
        
        <div className="flex flex-col gap-2">
          <Button
            onClick={() => handleSend(true)}
            disabled={!input.trim() || isLoading}
            size="icon"
            variant="outline"
            className="border-accent/50 hover:border-accent hover:bg-accent/10 text-accent"
            title="Generate Image"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Image className="h-4 w-4" />
            )}
          </Button>
          
          <Button
            onClick={() => handleSend(false)}
            disabled={!input.trim() || isLoading}
            size="icon"
            className="bg-primary hover:bg-primary/80 text-primary-foreground pulse-glow"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
      
      <p className="text-xs text-muted-foreground mt-2">
        Press Enter to send • Shift+Enter for new line • Click 🖼️ or type /image for image generation
      </p>
    </div>
  );
};
