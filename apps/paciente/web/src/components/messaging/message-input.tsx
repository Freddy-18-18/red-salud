"use client";

import { useState } from "react";
import { Button } from "@red-salud/design-system";
import { Textarea } from "@red-salud/design-system";
import { Send, Loader2 } from "lucide-react";

interface MessageInputProps {
  onSend: (content: string) => Promise<void>;
  disabled?: boolean;
  placeholder?: string;
}

export function MessageInput({
  onSend,
  disabled = false,
  placeholder = "Escribe tu mensaje...",
}: MessageInputProps) {
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim() || sending || disabled) return;

    setSending(true);
    try {
      await onSend(content.trim());
      setContent("");
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t p-4">
      <div className="flex gap-2">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || sending}
          className="min-h-[60px] max-h-[120px] resize-none"
          rows={2}
        />

        <div className="flex flex-col gap-2">
          <Button
            type="submit"
            size="icon"
            disabled={!content.trim() || disabled || sending}
            className="h-[60px]"
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      <p className="text-xs text-muted-foreground mt-2">
        Presiona Enter para enviar, Shift+Enter para nueva línea
      </p>
    </form>
  );
}
