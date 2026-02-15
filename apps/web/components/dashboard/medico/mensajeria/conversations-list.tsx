// ============================================================================
// Conversations List - Sidebar Panel (WhatsApp/Telegram style)
// ============================================================================

"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@red-salud/ui";
import { Badge } from "@red-salud/ui";
import { Input } from "@red-salud/ui";
import { Button } from "@red-salud/ui";
import {
  Search,
  Plus,
  Users,
  Hash,
  Lock,
  Megaphone,
  Star,
  Pin,
  Archive,
  Filter,
  MessageSquarePlus,
} from "lucide-react";
import type { Channel, UserProfile } from "./types";
import { cn } from "@/lib/utils";

interface ConversationsListProps {
  channels: Channel[];
  activeChannelId?: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectChannel: (channel: Channel) => void;
  onNewChat: () => void;
  isLoading: boolean;
  currentUserId?: string;
}

// Channel type icons
const channelIcons: Record<string, typeof Hash> = {
  direct: MessageSquarePlus,
  group: Users,
  patient_care: Star,
  multidisciplinary: Users,
  broadcast: Megaphone,
  announcement: Megaphone,
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatTime(dateStr?: string): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    return date.toLocaleTimeString("es-VE", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  if (days === 1) return "Ayer";
  if (days < 7) {
    return date.toLocaleDateString("es-VE", { weekday: "short" });
  }
  return date.toLocaleDateString("es-VE", {
    day: "2-digit",
    month: "2-digit",
  });
}

function getChannelDisplayName(
  channel: Channel,
  currentUserId?: string
): string {
  if (channel.name) return channel.name;
  if (channel.channel_type === "direct" && channel.other_participant) {
    return channel.other_participant.full_name;
  }
  // For DM without resolved name, use participants
  if (channel.channel_type === "direct" && channel.participants) {
    const other = channel.participants.find(
      (p) => p.user_id !== currentUserId
    );
    return other?.profile?.full_name || "Chat directo";
  }
  return "Canal sin nombre";
}

function getLastMessagePreview(channel: Channel): string {
  if (!channel.last_message) return "Sin mensajes aún";
  const msg = channel.last_message;
  if (msg.message_type === "image") return "📷 Imagen";
  if (msg.message_type === "video") return "🎥 Video";
  if (msg.message_type === "audio" || msg.message_type === "voice_note")
    return "🎵 Audio";
  if (msg.message_type === "file") return "📎 Archivo";
  if (msg.message_type === "location") return "📍 Ubicación";
  if (msg.message_type === "prescription") return "💊 Receta";
  if (msg.message_type === "lab_result") return "🧪 Resultado";
  if (msg.message_type === "poll") return "📊 Encuesta";
  return msg.content?.slice(0, 60) || "";
}

// --- Skeleton ---
function ConversationSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-3 animate-pulse">
      <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-700 shrink-0" />
      <div className="flex-1 min-w-0 space-y-2">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
      </div>
    </div>
  );
}

// --- Filter Tabs ---
type FilterTab = "all" | "unread" | "groups" | "direct";

export function ConversationsList({
  channels,
  activeChannelId,
  searchQuery,
  onSearchChange,
  onSelectChannel,
  onNewChat,
  isLoading,
  currentUserId,
}: ConversationsListProps) {
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");

  const filteredChannels = channels.filter((ch) => {
    switch (activeFilter) {
      case "unread":
        return (ch.unread_count ?? 0) > 0;
      case "groups":
        return ch.channel_type !== "direct";
      case "direct":
        return ch.channel_type === "direct";
      default:
        return true;
    }
  });

  const filters: { key: FilterTab; label: string }[] = [
    { key: "all", label: "Todos" },
    { key: "unread", label: "No leídos" },
    { key: "direct", label: "Directos" },
    { key: "groups", label: "Grupos" },
  ];

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Chats
          </h2>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950"
              onClick={onNewChat}
              title="Nuevo chat"
            >
              <Plus className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950"
              title="Filtros"
            >
              <Filter className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar o iniciar chat..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 h-10 bg-gray-50 dark:bg-gray-800 border-0 focus-visible:ring-1 focus-visible:ring-emerald-500 rounded-xl"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1.5 mt-3 overflow-x-auto scrollbar-hide">
          {filters.map((filter) => (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200",
                activeFilter === filter.key
                  ? "bg-emerald-500 text-white shadow-sm shadow-emerald-500/30"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Channels List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {isLoading ? (
          <div className="py-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <ConversationSkeleton key={i} />
            ))}
          </div>
        ) : filteredChannels.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-12 px-6 text-center">
            <div className="h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
              <MessageSquarePlus className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {searchQuery
                ? "No se encontraron conversaciones"
                : "No hay conversaciones aún"}
            </p>
            <Button
              variant="link"
              className="text-emerald-600 mt-2 text-sm"
              onClick={onNewChat}
            >
              Iniciar una conversación
            </Button>
          </div>
        ) : (
          <div className="py-1">
            {filteredChannels.map((channel) => (
              <ConversationItem
                key={channel.id}
                channel={channel}
                isActive={channel.id === activeChannelId}
                onClick={() => onSelectChannel(channel)}
                currentUserId={currentUserId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// --- Individual Conversation Item ---
function ConversationItem({
  channel,
  isActive,
  onClick,
  currentUserId,
}: {
  channel: Channel;
  isActive: boolean;
  onClick: () => void;
  currentUserId?: string;
}) {
  const displayName = getChannelDisplayName(channel, currentUserId);
  const preview = getLastMessagePreview(channel);
  const time = formatTime(channel.last_message_at);
  const unread = channel.unread_count ?? 0;
  const ChannelIcon = channelIcons[channel.channel_type] || Hash;
  const isGroup = channel.channel_type !== "direct";

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-150",
        "hover:bg-gray-50 dark:hover:bg-gray-800/50",
        "group relative",
        isActive &&
          "bg-emerald-50 dark:bg-emerald-950/30 hover:bg-emerald-50 dark:hover:bg-emerald-950/30",
        isActive && "border-r-2 border-emerald-500"
      )}
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        <Avatar className="h-12 w-12">
          {channel.avatar_url || channel.other_participant?.avatar_url ? (
            <AvatarImage
              src={
                channel.avatar_url || channel.other_participant?.avatar_url
              }
              alt={displayName}
            />
          ) : null}
          <AvatarFallback
            className={cn(
              "text-sm font-semibold",
              isGroup
                ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white"
                : "bg-gradient-to-br from-emerald-500 to-teal-600 text-white"
            )}
          >
            {isGroup ? (
              <ChannelIcon className="h-5 w-5" />
            ) : (
              getInitials(displayName)
            )}
          </AvatarFallback>
        </Avatar>

        {/* Online indicator for DMs */}
        {!isGroup && channel.online_count && channel.online_count > 0 && (
          <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-gray-900" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span
            className={cn(
              "font-semibold text-sm truncate",
              unread > 0
                ? "text-gray-900 dark:text-white"
                : "text-gray-700 dark:text-gray-300"
            )}
          >
            {displayName}
          </span>
          <span
            className={cn(
              "text-[11px] shrink-0",
              unread > 0
                ? "text-emerald-600 font-semibold"
                : "text-gray-400 dark:text-gray-500"
            )}
          >
            {time}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2 mt-0.5">
          <p
            className={cn(
              "text-[13px] truncate",
              unread > 0
                ? "text-gray-700 dark:text-gray-300 font-medium"
                : "text-gray-500 dark:text-gray-500"
            )}
          >
            {channel.is_encrypted && (
              <Lock className="h-3 w-3 inline mr-1 text-emerald-500" />
            )}
            {preview}
          </p>

          {/* Unread Badge */}
          {unread > 0 && (
            <Badge className="h-5 min-w-[20px] px-1.5 bg-emerald-500 hover:bg-emerald-500 text-white text-[11px] font-bold rounded-full flex items-center justify-center shrink-0">
              {unread > 99 ? "99+" : unread}
            </Badge>
          )}

          {/* Muted / Pinned icons */}
          {channel.is_archived && (
            <Archive className="h-3.5 w-3.5 text-gray-400 shrink-0" />
          )}
        </div>
      </div>
    </button>
  );
}
