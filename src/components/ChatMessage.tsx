import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  imageUrl?: string;
  uploadedImageUrl?: string;
}

export const ChatMessage = ({ role, content, imageUrl, uploadedImageUrl }: ChatMessageProps) => {
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
            <span className="text-primary text-glow font-bold text-sm">AI</span>
            <span className="text-muted-foreground text-xs">›</span>
          </div>
        )}

        {/* User uploaded image */}
        {uploadedImageUrl && (
          <div className="mb-3">
            <img
              src={uploadedImageUrl}
              alt="Uploaded image"
              className="max-w-full max-h-64 rounded-lg border border-border object-contain"
            />
          </div>
        )}
        
        {/* AI generated image */}
        {imageUrl && (
          <div className="mb-3">
            <img
              src={imageUrl}
              alt="Generated image"
              className="max-w-full rounded-lg border border-primary/30"
            />
          </div>
        )}
        
        <div className={cn(
          "prose prose-sm max-w-none",
          isUser ? "prose-invert" : "prose-invert",
          "[&_p]:my-1 [&_ul]:my-2 [&_ol]:my-2 [&_li]:my-0.5",
          "[&_h1]:text-lg [&_h1]:font-bold [&_h1]:my-2 [&_h1]:text-foreground",
          "[&_h2]:text-base [&_h2]:font-bold [&_h2]:my-2 [&_h2]:text-foreground",
          "[&_h3]:text-sm [&_h3]:font-semibold [&_h3]:my-1 [&_h3]:text-foreground",
          "[&_strong]:text-primary [&_strong]:font-semibold",
          "[&_em]:text-foreground/80 [&_em]:italic",
          "[&_code]:bg-secondary [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_code]:text-accent",
          "[&_pre]:bg-secondary [&_pre]:p-3 [&_pre]:rounded-lg [&_pre]:overflow-x-auto",
          "[&_blockquote]:border-l-2 [&_blockquote]:border-primary/50 [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-muted-foreground",
          "[&_a]:text-primary [&_a]:underline [&_a]:hover:text-primary/80",
          "[&_hr]:border-border [&_hr]:my-4",
          "[&_table]:w-full [&_th]:text-left [&_th]:p-2 [&_th]:border-b [&_th]:border-border",
          "[&_td]:p-2 [&_td]:border-b [&_td]:border-border/50"
        )}>
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
};
