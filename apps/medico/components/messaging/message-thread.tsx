"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@red-salud/design-system";
import { ScrollArea } from "@red-salud/design-system";
import { cn } from "@red-salud/core/utils";
import type { Message } from "@/lib/supabase/types/messaging";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useEffect, useRef } from "react";
import { FileText, Download } from "lucide-react";

interface MessageThreadProps {
  messages: Message[];
  currentUserId: string;
}

export function MessageThread({ messages, currentUserId }: MessageThreadProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll al final cuando hay nuevos mensajes
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        No hay mensajes aún. Envía el primero para iniciar la conversación.
      </div>
    );
  }

  return (
    <ScrollArea className="h-full p-4" ref={scrollRef}>
      <div className="space-y-4">
        {messages.map((message, index) => {
          const isOwn = message.sender_id === currentUserId;
          const showAvatar =
            index === 0 ||
            messages[index - 1]?.sender_id !== message.sender_id;

          const initials = message.sender?.nombre_completo
            ?.split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);

          return (
            <div
              key={message.id}
              className={cn(
                "flex gap-3",
                isOwn ? "flex-row-reverse" : "flex-row"
              )}
            >
              {showAvatar ? (
                <Avatar className="h-8 w-8">
                  <AvatarImage src={message.sender?.avatar_url} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
              ) : (
                <div className="w-8" />
              )}

              <div
                className={cn(
                  "flex flex-col max-w-[70%]",
                  isOwn ? "items-end" : "items-start"
                )}
              >
                {showAvatar && !isOwn && (
                  <span className="text-xs font-medium mb-1">
                    {message.sender?.nombre_completo}
                  </span>
                )}

                <div
                  className={cn(
                    "rounded-lg px-4 py-2",
                    isOwn
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {message.content}
                  </p>

                  {message.attachment_url && (
                    <div className="mt-2 pt-2 border-t border-current/20">
                      <a
                        href={message.attachment_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-xs hover:underline"
                      >
                        <FileText className="h-4 w-4" />
                        <span className="truncate">
                          {message.attachment_name || "Archivo adjunto"}
                        </span>
                        <Download className="h-3 w-3" />
                      </a>
                    </div>
                  )}
                </div>

                <span className="text-xs text-muted-foreground mt-1">
                  {format(new Date(message.created_at), "HH:mm", {
                    locale: es,
                  })}
                  {message.is_read && isOwn && " · Leído"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
