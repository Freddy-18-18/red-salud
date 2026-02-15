// ============================================================================
// Channel Info Panel - Right sidebar (Telegram/Discord style)
// ============================================================================

"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@red-salud/ui";
import { Badge } from "@red-salud/ui";
import { Button } from "@red-salud/ui";
import { Switch } from "@red-salud/ui";
import {
  X,
  Users,
  Lock,
  Shield,
  Bell,
  BellOff,
  Image as ImageIcon,
  File,
  Link2,
  Star,
  Search,
  UserPlus,
  LogOut,
  Trash2,
  ChevronRight,
  MoreHorizontal,
} from "lucide-react";
import type { Channel, UserProfile } from "./types";
import { cn } from "@/lib/utils";

interface ChannelInfoPanelProps {
  channel: Channel;
  participants: Array<{ profile?: UserProfile; role: string; user_id: string }>;
  currentUserId?: string;
  isOpen: boolean;
  onClose: () => void;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const ROLE_LABELS: Record<string, string> = {
  owner: "Creador",
  admin: "Admin",
  moderator: "Moderador",
  member: "Miembro",
  guest: "Invitado",
  observer: "Observador",
};

const ROLE_COLORS: Record<string, string> = {
  owner: "text-amber-600 bg-amber-50 dark:bg-amber-950/30",
  admin: "text-red-600 bg-red-50 dark:bg-red-950/30",
  moderator: "text-blue-600 bg-blue-50 dark:bg-blue-950/30",
};

export function ChannelInfoPanel({
  channel,
  participants,
  currentUserId,
  isOpen,
  onClose,
}: ChannelInfoPanelProps) {
  if (!isOpen) return null;

  const isGroup = channel.channel_type !== "direct";
  const otherUser = !isGroup
    ? participants.find((p) => p.user_id !== currentUserId)
    : null;

  const displayName = isGroup
    ? channel.name || "Grupo"
    : otherUser?.profile?.full_name || "Chat";

  const displayInfo = isGroup
    ? `${participants.length} miembro${participants.length !== 1 ? "s" : ""}`
    : otherUser?.profile?.specialty || otherUser?.profile?.role || "";

  // Shared media sections
  const mediaItems = [
    { icon: ImageIcon, label: "Fotos y Videos", count: 0, color: "text-blue-500" },
    { icon: File, label: "Archivos", count: 0, color: "text-purple-500" },
    { icon: Link2, label: "Enlaces", count: 0, color: "text-green-500" },
    { icon: Star, label: "Destacados", count: 0, color: "text-amber-500" },
  ];

  return (
    <div className="w-80 border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col h-full animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-[65px] border-b border-gray-100 dark:border-gray-800 shrink-0">
        <h3 className="font-semibold text-gray-900 dark:text-white">
          Info del {isGroup ? "grupo" : "contacto"}
        </h3>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-gray-400 hover:text-gray-600"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {/* Profile */}
        <div className="p-6 flex flex-col items-center text-center">
          <Avatar className="h-24 w-24 mb-4">
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
                "text-2xl font-bold",
                isGroup
                  ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white"
                  : "bg-gradient-to-br from-emerald-500 to-teal-600 text-white"
              )}
            >
              {isGroup ? (
                <Users className="h-10 w-10" />
              ) : (
                getInitials(displayName)
              )}
            </AvatarFallback>
          </Avatar>

          <h4 className="text-lg font-bold text-gray-900 dark:text-white">
            {displayName}
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {displayInfo}
          </p>

          {channel.is_encrypted && (
            <div className="flex items-center gap-1.5 mt-2 text-emerald-600 dark:text-emerald-400">
              <Lock className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">
                Cifrado de extremo a extremo
              </span>
            </div>
          )}

          {channel.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 leading-relaxed">
              {channel.description}
            </p>
          )}
        </div>

        {/* Settings */}
        <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <Bell className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Notificaciones
              </span>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <Star className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Marcar como favorito
              </span>
            </div>
            <Switch />
          </div>
        </div>

        {/* Shared Media */}
        <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-800">
          <h5 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            Contenido compartido
          </h5>
          {mediaItems.map((item) => (
            <button
              key={item.label}
              className="w-full flex items-center justify-between py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg px-2 transition-colors"
            >
              <div className="flex items-center gap-3">
                <item.icon className={cn("h-4 w-4", item.color)} />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {item.label}
                </span>
              </div>
              <div className="flex items-center gap-1 text-gray-400">
                <span className="text-xs">{item.count}</span>
                <ChevronRight className="h-4 w-4" />
              </div>
            </button>
          ))}
        </div>

        {/* Participants */}
        {isGroup && (
          <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <h5 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {participants.length} Participantes
              </h5>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <Search className="h-3.5 w-3.5 text-gray-400" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <UserPlus className="h-3.5 w-3.5 text-gray-400" />
                </Button>
              </div>
            </div>

            <div className="space-y-0.5">
              {participants.map((participant) => {
                const isCurrentUser =
                  participant.user_id === currentUserId;
                const name =
                  participant.profile?.full_name || "Usuario";
                const roleColor = ROLE_COLORS[participant.role];

                return (
                  <div
                    key={participant.user_id}
                    className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
                  >
                    <Avatar className="h-9 w-9 shrink-0">
                      {participant.profile?.avatar_url ? (
                        <AvatarImage
                          src={participant.profile.avatar_url}
                          alt={name}
                        />
                      ) : null}
                      <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-[10px] font-semibold">
                        {getInitials(name)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {name}
                          {isCurrentUser && (
                            <span className="text-gray-400 font-normal ml-1">
                              (tú)
                            </span>
                          )}
                        </span>
                      </div>
                      {participant.profile?.specialty && (
                        <p className="text-[11px] text-gray-500 truncate">
                          {participant.profile.specialty}
                        </p>
                      )}
                    </div>

                    {roleColor && (
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-[10px] px-1.5 py-0 shrink-0",
                          roleColor
                        )}
                      >
                        {ROLE_LABELS[participant.role]}
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Danger Zone */}
        <div className="px-4 py-4 border-t border-gray-100 dark:border-gray-800 mt-2 space-y-1">
          <button className="w-full flex items-center gap-3 py-2.5 px-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors text-red-600">
            <LogOut className="h-4 w-4" />
            <span className="text-sm">
              {isGroup ? "Salir del grupo" : "Bloquear contacto"}
            </span>
          </button>
          <button className="w-full flex items-center gap-3 py-2.5 px-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors text-red-600">
            <Trash2 className="h-4 w-4" />
            <span className="text-sm">
              {isGroup ? "Eliminar grupo" : "Eliminar chat"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
