"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@red-salud/ui";
import { Badge } from "@red-salud/ui";
import { Button } from "@red-salud/ui";
import { ScrollArea } from "@red-salud/ui";
import { cn } from "@red-salud/core/utils";
import type { Conversation } from "@/lib/supabase/types/messaging";
import { MessageSquare, Archive } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface ConversationListProps {
  conversations: Conversation[];
  selectedId?: string;
  onSelect: (conversation: Conversation) => void;
  currentUserId: string;
  showArchived?: boolean;
}

export function ConversationList({
  conversations,
  selectedId,
  onSelect,
  currentUserId,
  showArchived = false,
}: ConversationListProps) {
  const filteredConversations = conversations.filter((conv) =>
    showArchived ? conv.status === "archived" : conv.status === "active"
  );

  if (filteredConversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">
          {showArchived
            ? "No hay conversaciones archivadas"
            : "No hay conversaciones activas"}
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-2 p-4">
        {filteredConversations.map((conversation) => {
          const otherUser =
            conversation.patient_id === currentUserId
              ? conversation.doctor
              : conversation.patient;

          const initials = otherUser?.nombre_completo
            ?.split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);

          const lastMessageTime = conversation.last_message_at
            ? formatDistanceToNow(new Date(conversation.last_message_at), {
              addSuffix: true,
              locale: es,
            })
            : null;

          return (
            <button
              key={conversation.id}
              onClick={() => onSelect(conversation)}
              className={cn(
                "w-full p-4 rounded-lg border text-left transition-colors hover:bg-accent",
                selectedId === conversation.id && "bg-accent border-primary"
              )}
            >
              <div className="flex items-start gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={otherUser?.avatar_url} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium truncate">
                      {otherUser?.nombre_completo}
                    </p>
                    {lastMessageTime && (
                      <span className="text-xs text-muted-foreground">
                        {lastMessageTime}
                      </span>
                    )}
                  </div>

                  {conversation.subject && (
                    <p className="text-sm text-muted-foreground truncate mb-1">
                      {conversation.subject}
                    </p>
                  )}

                  {conversation.last_message && (
                    <p className="text-sm text-muted-foreground truncate">
                      {conversation.last_message.content}
                    </p>
                  )}

                  <div className="flex items-center gap-2 mt-2">
                    {conversation.unread_count! > 0 && (
                      <Badge variant="default" className="text-xs">
                        {conversation.unread_count} nuevo
                        {conversation.unread_count! > 1 ? "s" : ""}
                      </Badge>
                    )}
                    {conversation.status === "archived" && (
                      <Badge variant="secondary" className="text-xs">
                        <Archive className="h-3 w-3 mr-1" />
                        Archivada
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </ScrollArea>
  );
}
