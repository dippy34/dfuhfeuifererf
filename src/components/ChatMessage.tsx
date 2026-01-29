import { cn } from "@/lib/utils";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  imageUrl?: string;
}

export const ChatMessage = ({ role, content, imageUrl }: ChatMessageProps) => {
  const isUser = role === "user";

  return (
    <div
      className={cn(
        "flex w-full mb-4",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[85%] md:max-w-[70%] px-4 py-3 rounded-lg",
          isUser
            ? "bg-secondary border border-border text-foreground"
            : "bg-card border border-primary/30 box-glow"
        )}
      >
        {!isUser && (
          <div className="flex items-center gap-2 mb-2">
            <span className="text-primary text-glow font-bold text-sm">CHAOS</span>
            <span className="text-muted-foreground text-xs">›</span>
          </div>
        )}
        
        {imageUrl && (
          <div className="mb-3">
            <img
              src={imageUrl}
              alt="Generated image"
              className="max-w-full rounded-lg border border-primary/30"
            />
          </div>
        )}
        
        <p className={cn(
          "whitespace-pre-wrap text-sm leading-relaxed",
          isUser ? "text-foreground" : "text-foreground/90"
        )}>
          {content}
        </p>
      </div>
    </div>
  );
};
