// ============================================================================
// Chat Header - Channel info bar (WhatsApp/Telegram top bar)
// ============================================================================

"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@red-salud/ui";
import { Button } from "@red-salud/ui";
import {
  Phone,
  Video,
  Search,
  MoreVertical,
  ArrowLeft,
  Users,
  Lock,
  Star,
  Bell,
  BellOff,
  Pin,
  Info,
  Settings,
} from "lucide-react";
import type { Channel, UserProfile, PresenceStatus } from "./types";
import { cn } from "@/lib/utils";

interface ChatHeaderProps {
  channel: Channel;
  participants: Array<{ profile?: UserProfile; role: string; user_id: string }>;
  currentUserId?: string;
  onBack: () => void;
  onSearch: () => void;
  onInfo: () => void;
  onCall?: (type: "audio" | "video") => void;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getOnlineText(
  channel: Channel,
  participants: Array<{ profile?: UserProfile; role: string; user_id: string }>,
  currentUserId?: string
): string {
  if (channel.channel_type === "direct") {
    // For DM, show "en línea" or "última vez..."
    const other = participants.find((p) => p.user_id !== currentUserId);
    return other ? "en línea" : "";
  }

  const count = participants.length;
  const online = channel.online_count || 0;
  return `${count} miembro${count !== 1 ? "s" : ""}${
    online > 0 ? ` · ${online} en línea` : ""
  }`;
}

function getChannelDisplayName(
  channel: Channel,
  participants: Array<{ profile?: UserProfile; role: string; user_id: string }>,
  currentUserId?: string
): string {
  if (channel.name) return channel.name;
  if (channel.channel_type === "direct") {
    const other = participants.find((p) => p.user_id !== currentUserId);
    return other?.profile?.full_name || "Chat directo";
  }
  return "Canal";
}

export function ChatHeader({
  channel,
  participants,
  currentUserId,
  onBack,
  onSearch,
  onInfo,
  onCall,
}: ChatHeaderProps) {
  const displayName = getChannelDisplayName(
    channel,
    participants,
    currentUserId
  );
  const subtitle = getOnlineText(channel, participants, currentUserId);
  const isGroup = channel.channel_type !== "direct";
  const otherUser = !isGroup
    ? participants.find((p) => p.user_id !== currentUserId)
    : undefined;

  return (
    <div className="flex items-center gap-3 px-4 h-[65px] bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 shrink-0">
      {/* Back button (mobile) */}
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 lg:hidden text-gray-500"
        onClick={onBack}
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>

      {/* Avatar */}
      <button onClick={onInfo} className="shrink-0 group">
        <Avatar className="h-10 w-10 ring-2 ring-transparent group-hover:ring-emerald-200 dark:group-hover:ring-emerald-800 transition-all">
          {channel.avatar_url || otherUser?.profile?.avatar_url ? (
            <AvatarImage
              src={
                channel.avatar_url || otherUser?.profile?.avatar_url || ""
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
              <Users className="h-4 w-4" />
            ) : (
              getInitials(displayName)
            )}
          </AvatarFallback>
        </Avatar>
      </button>

      {/* Channel Info */}
      <button
        onClick={onInfo}
        className="flex-1 min-w-0 text-left group"
      >
        <div className="flex items-center gap-1.5">
          <h3 className="font-semibold text-sm text-gray-900 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
            {displayName}
          </h3>
          {channel.is_encrypted && (
            <Lock className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
          )}
        </div>
        <p className="text-[12px] text-gray-500 dark:text-gray-400 truncate">
          {subtitle}
        </p>
      </button>

      {/* Actions */}
      <div className="flex items-center gap-0.5 shrink-0">
        {channel.channel_type === "direct" && onCall && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950"
              onClick={() => onCall("video")}
              title="Videollamada"
            >
              <Video className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950"
              onClick={() => onCall("audio")}
              title="Llamada de voz"
            >
              <Phone className="h-5 w-5" />
            </Button>
          </>
        )}

        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950"
          onClick={onSearch}
          title="Buscar en chat"
        >
          <Search className="h-5 w-5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950"
          onClick={onInfo}
          title="Información del canal"
        >
          <Info className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
