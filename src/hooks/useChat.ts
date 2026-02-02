import { useState, useCallback } from "react";
import { toast } from "sonner";

type Message = {
  role: "user" | "assistant";
  content: string;
  imageUrl?: string;
  uploadedImageUrl?: string;
};

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/unleashed-chat`;

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(async (
    content: string, 
    isImageRequest: boolean,
    personalityPrompt: string,
    uploadedImageUrl?: string
  ) => {
    const userContent = isImageRequest && content.toLowerCase().startsWith("/image")
      ? content.slice(6).trim()
      : content;

    const userMessage: Message = { 
      role: "user", 
      content: userContent,
      uploadedImageUrl 
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      if (isImageRequest) {
        // Image generation - non-streaming
        const response = await fetch(CHAT_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            messages: [{ role: "user", content: userContent }],
            generateImage: true,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Image generation failed");
        }

        const data = await response.json();
        const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
        const textContent = data.choices?.[0]?.message?.content || "Here's your image:";

        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: textContent,
            imageUrl,
          },
        ]);
      } else {
        // Build messages for API - include image description if uploaded
        const apiMessages = [...messages, userMessage].map((m) => {
          if (m.uploadedImageUrl) {
            return {
              role: m.role,
              content: [
                { type: "text", text: m.content || "What's in this image?" },
                { type: "image_url", image_url: { url: m.uploadedImageUrl } }
              ]
            };
          }
          return {
            role: m.role,
            content: m.content,
          };
        });

        // Chat - streaming
        const response = await fetch(CHAT_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            messages: apiMessages,
            generateImage: false,
            systemPrompt: personalityPrompt,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Chat failed");
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response body");

        const decoder = new TextDecoder();
        let textBuffer = "";
        let assistantContent = "";

        // Add initial assistant message
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
      }
    } catch (error) {
      console.error("Chat error:", error);
      toast.error(error instanceof Error ? error.message : "Something went wrong");
      // Remove the empty assistant message if chat failed
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant" && !last.content) {
          return prev.slice(0, -1);
        }
        return prev;
      });
    } finally {
      setIsLoading(false);
    }
  }, [messages]);

  const clearChat = useCallback(() => {
    setMessages([]);
  }, []);

  return { messages, isLoading, sendMessage, clearChat };
};
