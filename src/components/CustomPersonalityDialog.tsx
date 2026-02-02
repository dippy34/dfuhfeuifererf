import { useState, useRef, useEffect } from "react";
import { Wand2, MessageSquare, Send, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/unleashed-chat`;

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface CustomPersonalityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (personality: {
    name: string;
    description: string;
    emoji: string;
    systemPrompt: string;
  }) => void;
}

const PERSONALITY_CREATOR_PROMPT = `You are a personality creation assistant for CHAOS AI. Your job is to help users create custom AI personalities by chatting with them.

Ask them questions like:
- What kind of personality do they want? (funny, serious, helpful, creative, etc.)
- What tone should it have? (casual, formal, playful, dramatic, etc.)
- Any specific traits or quirks?
- Should it have a backstory or character?
- Any topics it should specialize in?

After gathering enough info, generate a complete personality with:
1. A catchy name (2-3 words max)
2. A short description (under 20 words)
3. A fitting emoji
4. A detailed system prompt (be creative and thorough!)

When you're ready to finalize, format your response EXACTLY like this:
---PERSONALITY---
NAME: [name here]
DESCRIPTION: [description here]
EMOJI: [single emoji here]
PROMPT: [full system prompt here]
---END---

Keep the conversation fun and creative! You can swear if it fits the vibe.`;

export const CustomPersonalityDialog = ({
  open,
  onOpenChange,
  onSave,
}: CustomPersonalityDialogProps) => {
  const [activeTab, setActiveTab] = useState<"manual" | "chat">("chat");
  
  // Manual form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [emoji, setEmoji] = useState("🎭");
  const [systemPrompt, setSystemPrompt] = useState("");
  
  // Chat state
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hey! I'm here to help you create a custom AI personality. What kind of vibe are you going for? Something funny? Serious? Maybe a bit unhinged? Tell me about your dream AI companion!" }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const resetState = () => {
    setName("");
    setDescription("");
    setEmoji("🎭");
    setSystemPrompt("");
    setMessages([
      { role: "assistant", content: "Hey! I'm here to help you create a custom AI personality. What kind of vibe are you going for? Something funny? Serious? Maybe a bit unhinged? Tell me about your dream AI companion!" }
    ]);
    setChatInput("");
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetState();
    }
    onOpenChange(newOpen);
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: chatInput };
    setMessages((prev) => [...prev, userMessage]);
    setChatInput("");
    setIsLoading(true);

    try {
      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          generateImage: false,
          systemPrompt: PERSONALITY_CREATOR_PROMPT,
        }),
      });

      if (!response.ok) throw new Error("Chat failed");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let textBuffer = "";
      let assistantContent = "";

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              assistantContent += delta;
              setMessages((prev) => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1] = {
                  role: "assistant",
                  content: assistantContent,
                };
                return newMessages;
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Check if response contains a finalized personality
      if (assistantContent.includes("---PERSONALITY---")) {
        parseAndFillPersonality(assistantContent);
      }
    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const parseAndFillPersonality = (content: string) => {
    const match = content.match(/---PERSONALITY---([\s\S]*?)---END---/);
    if (!match) return;

    const block = match[1];
    const nameMatch = block.match(/NAME:\s*(.+)/);
    const descMatch = block.match(/DESCRIPTION:\s*(.+)/);
    const emojiMatch = block.match(/EMOJI:\s*(.+)/);
    const promptMatch = block.match(/PROMPT:\s*([\s\S]+?)(?=\n(?:NAME|DESCRIPTION|EMOJI|$)|$)/);

    if (nameMatch) setName(nameMatch[1].trim());
    if (descMatch) setDescription(descMatch[1].trim());
    if (emojiMatch) setEmoji(emojiMatch[1].trim());
    if (promptMatch) setSystemPrompt(promptMatch[1].trim());
    
    setActiveTab("manual");
  };

  const handleSave = () => {
    if (!name.trim() || !systemPrompt.trim()) return;
    
    onSave({
      name: name.trim(),
      description: description.trim() || "A custom personality",
      emoji: emoji || "🎭",
      systemPrompt: systemPrompt.trim(),
    });
    
    handleOpenChange(false);
  };

  const isFormValid = name.trim() && systemPrompt.trim();

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl bg-card border-border max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-primary text-glow flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Create Custom Personality
          </DialogTitle>
          <DialogDescription>
            Build your own AI personality by chatting with our assistant or manually entering details.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "manual" | "chat")} className="flex-1 flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-2 bg-secondary">
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Chat with AI
            </TabsTrigger>
            <TabsTrigger value="manual" className="flex items-center gap-2">
              <Wand2 className="h-4 w-4" />
              Manual Entry
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="flex-1 flex flex-col min-h-0 mt-4">
            <ScrollArea className="flex-1 border border-border rounded-lg p-4 bg-secondary/30" ref={scrollRef}>
              <div className="space-y-4">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={cn(
                      "p-3 rounded-lg text-sm",
                      msg.role === "user"
                        ? "bg-primary/20 ml-8"
                        : "bg-muted mr-8"
                    )}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                ))}
                {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
                  <div className="bg-muted mr-8 p-3 rounded-lg">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  </div>
                )}
              </div>
            </ScrollArea>
            
            <div className="flex gap-2 mt-4">
              <Input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendChatMessage()}
                placeholder="Describe your ideal AI personality..."
                className="flex-1 bg-secondary border-border"
                disabled={isLoading}
              />
              <Button 
                onClick={sendChatMessage} 
                disabled={!chatInput.trim() || isLoading}
                className="bg-primary hover:bg-primary/80"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="manual" className="flex-1 flex flex-col min-h-0 mt-4 space-y-4">
            <div className="grid grid-cols-[1fr_auto] gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Wise Mentor"
                  className="bg-secondary border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emoji">Emoji</Label>
                <Input
                  id="emoji"
                  value={emoji}
                  onChange={(e) => setEmoji(e.target.value)}
                  placeholder="🎭"
                  className="bg-secondary border-border w-20 text-center text-xl"
                  maxLength={4}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="A brief description of the personality"
                className="bg-secondary border-border"
              />
            </div>

            <div className="space-y-2 flex-1 flex flex-col min-h-0">
              <Label htmlFor="prompt">System Prompt</Label>
              <Textarea
                id="prompt"
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                placeholder="Describe how this AI should behave, its tone, personality traits, areas of expertise, etc."
                className="bg-secondary border-border flex-1 min-h-[120px] resize-none"
              />
            </div>

            <Button 
              onClick={handleSave} 
              disabled={!isFormValid}
              className="w-full bg-primary hover:bg-primary/80"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Save Personality
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
