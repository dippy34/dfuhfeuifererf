import { useState, useRef, KeyboardEvent } from "react";
import { Send, Image, Loader2, Paperclip, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (message: string, isImageRequest: boolean, uploadedImage?: string) => void;
  isLoading: boolean;
}

export const ChatInput = ({ onSend, isLoading }: ChatInputProps) => {
  const [input, setInput] = useState("");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = (isImageRequest: boolean = false) => {
    if ((!input.trim() && !uploadedImage) || isLoading) return;
    
    const message = input.trim();
    setInput("");
    onSend(message, isImageRequest || message.toLowerCase().startsWith("/image"), uploadedImage || undefined);
    setUploadedImage(null);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadedImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeUploadedImage = () => {
    setUploadedImage(null);
  };

  return (
    <div className="border-t border-border bg-card/50 p-4">
      {/* Uploaded image preview */}
      {uploadedImage && (
        <div className="mb-3 relative inline-block">
          <img
            src={uploadedImage}
            alt="Upload preview"
            className="max-h-32 rounded-lg border border-border"
          />
          <button
            onClick={removeUploadedImage}
            className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/80"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      <div className="flex gap-2 items-end">
        <div className="flex-1 relative">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message... or /image [prompt] to generate images"
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
          {/* File upload button */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*"
            className="hidden"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            size="icon"
            variant="outline"
            className="border-muted-foreground/50 hover:border-muted-foreground hover:bg-muted/10 text-muted-foreground"
            title="Upload Image"
          >
            <Paperclip className="h-4 w-4" />
          </Button>

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
            disabled={(!input.trim() && !uploadedImage) || isLoading}
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
        Enter to send • Shift+Enter for new line • 📎 to attach image • 🖼️ or /image to generate
      </p>
    </div>
  );
};
