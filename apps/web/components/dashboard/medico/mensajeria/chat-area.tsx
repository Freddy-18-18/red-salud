// ============================================================================
// Chat Area - Messages Display (WhatsApp/Telegram style bubbles)
// ============================================================================

"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@red-salud/ui";
import { Button } from "@red-salud/ui";
import {
  Check,
  CheckCheck,
  Clock,
  AlertCircle,
  Reply,
  Pencil,
  Trash2,
  Copy,
  SmilePlus,
  Pin,
  Forward,
  MoreHorizontal,
  ChevronDown,
  ArrowDown,
} from "lucide-react";
import type { Message, TypingUser, UserProfile } from "./types";
import { cn } from "@/lib/utils";

interface ChatAreaProps {
  messages: Message[];
  typingUsers: TypingUser[];
  currentUserId?: string;
  isLoading: boolean;
  onReply: (message: Message) => void;
  onEdit: (message: Message) => void;
  onDelete: (messageId: string) => void;
  onReaction: (messageId: string, emoji: string) => void;
  onLoadMore: () => Promise<number | undefined>;
  channelName?: string;
  participants: Array<{ profile?: UserProfile; role: string; user_id: string }>;
}

// --- Quick Reactions ---
const QUICK_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

// --- Date separator ---
function formatDateSeparator(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return "Hoy";
  if (days === 1) return "Ayer";
  if (days < 7) {
    return date.toLocaleDateString("es-VE", { weekday: "long" });
  }
  return date.toLocaleDateString("es-VE", {
    day: "numeric",
    month: "long",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("es-VE", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// --- Delivery Status Icon ---
function DeliveryIcon({ status }: { status: string }) {
  switch (status) {
    case "sending":
      return <Clock className="h-3.5 w-3.5 text-gray-400" />;
    case "sent":
      return <Check className="h-3.5 w-3.5 text-gray-400" />;
    case "delivered":
      return <CheckCheck className="h-3.5 w-3.5 text-gray-400" />;
    case "read":
      return <CheckCheck className="h-3.5 w-3.5 text-blue-500" />;
    case "failed":
      return <AlertCircle className="h-3.5 w-3.5 text-red-500" />;
    default:
      return null;
  }
}

// --- Loading skeleton ---
function MessageSkeleton({ isOwn = false }: { isOwn: boolean }) {
  return (
    <div
      className={cn(
        "flex gap-2 px-4 py-1 animate-pulse",
        isOwn ? "justify-end" : "justify-start"
      )}
    >
      {!isOwn && (
        <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 shrink-0 mt-1" />
      )}
      <div
        className={cn(
          "rounded-2xl p-3 space-y-2",
          isOwn
            ? "bg-emerald-100 dark:bg-emerald-900/30"
            : "bg-gray-100 dark:bg-gray-800"
        )}
        style={{ width: `${Math.random() * 30 + 20}%` }}
      >
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
      </div>
    </div>
  );
}

// --- Typing Indicator ---
function TypingIndicator({ users }: { users: TypingUser[] }) {
  if (users.length === 0) return null;

  const names = users
    .map((u) => u.profile?.full_name || "Alguien")
    .slice(0, 3);

  let text: string;
  if (names.length === 1) {
    text = `${names[0]} está escribiendo`;
  } else if (names.length === 2) {
    text = `${names[0]} y ${names[1]} están escribiendo`;
  } else {
    text = `${names[0]} y ${names.length - 1} más están escribiendo`;
  }

  return (
    <div className="flex items-center gap-2 px-6 py-2 text-xs text-gray-500 dark:text-gray-400 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex gap-0.5">
        <span className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:0ms]" />
        <span className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:150ms]" />
        <span className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:300ms]" />
      </div>
      <span className="italic">{text}</span>
    </div>
  );
}

// --- Scroll to Bottom FAB ---
function ScrollToBottomFab({
  show,
  onClick,
  unreadCount = 0,
}: {
  show: boolean;
  onClick: () => void;
  unreadCount?: number;
}) {
  if (!show) return null;

  return (
    <button
      onClick={onClick}
      className="absolute bottom-24 right-6 h-10 w-10 rounded-full bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-all group z-10 animate-in fade-in zoom-in duration-200"
    >
      <ArrowDown className="h-5 w-5 text-gray-600 dark:text-gray-300 group-hover:text-emerald-600" />
      {unreadCount > 0 && (
        <span className="absolute -top-2 -right-1 bg-emerald-500 text-white text-[10px] font-bold h-5 min-w-[20px] px-1 rounded-full flex items-center justify-center">
          {unreadCount}
        </span>
      )}
    </button>
  );
}

// ============================================================================
// Main Chat Area Component
// ============================================================================

export function ChatArea({
  messages,
  typingUsers,
  currentUserId,
  isLoading,
  onReply,
  onEdit,
  onDelete,
  onReaction,
  onLoadMore,
  participants,
}: ChatAreaProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [showScrollFab, setShowScrollFab] = useState(false);
  const [hoveredMessage, setHoveredMessage] = useState<string | null>(null);
  const [showActionsFor, setShowActionsFor] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (bottomRef.current && !showScrollFab) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length, showScrollFab]);

  // Handle scroll
  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShowScrollFab(!isNearBottom);

    // Load more when scrolling to top
    if (scrollTop < 50 && !isLoadingMore && messages.length > 0) {
      setIsLoadingMore(true);
      onLoadMore().finally(() => setIsLoadingMore(false));
    }
  }, [isLoadingMore, messages.length, onLoadMore]);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Group messages by date
  const groupedMessages: Array<{
    date: string;
    messages: Message[];
  }> = [];

  messages.forEach((msg) => {
    const msgDate = new Date(msg.created_at).toDateString();
    const lastGroup = groupedMessages[groupedMessages.length - 1];
    if (lastGroup && lastGroup.date === msgDate) {
      lastGroup.messages.push(msg);
    } else {
      groupedMessages.push({ date: msgDate, messages: [msg] });
    }
  });

  // Find sender profile from participants
  const getParticipantProfile = (userId: string): UserProfile | undefined => {
    return participants.find((p) => p.user_id === userId)?.profile;
  };

  return (
    <div className="relative flex-1 flex flex-col min-h-0">
      {/* Messages area */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto scrollbar-thin px-2 py-4"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      >
        {/* Loading more indicator */}
        {isLoadingMore && (
          <div className="flex justify-center py-3">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <div className="h-4 w-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              Cargando mensajes anteriores...
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <MessageSkeleton key={i} isOwn={i % 3 === 0} />
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-20">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/20 dark:to-teal-900/20 flex items-center justify-center mb-4">
              <span className="text-4xl">💬</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
              Inicia la conversación
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-xs">
              Los mensajes están cifrados de extremo a extremo. Envía un saludo
              para comenzar.
            </p>
          </div>
        ) : (
          groupedMessages.map((group) => (
            <div key={group.date}>
              {/* Date Separator */}
              <div className="flex items-center justify-center my-4">
                <span className="px-4 py-1 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full text-[11px] font-medium text-gray-500 dark:text-gray-400 shadow-sm border border-gray-100 dark:border-gray-700">
                  {formatDateSeparator(group.messages[0]?.created_at ?? '')}
                </span>
              </div>

              {/* Messages */}
              {group.messages.map((message, idx) => {
                const isOwn = message.sender_id === currentUserId;
                const prevMsg = idx > 0 ? group.messages[idx - 1] : null;
                const isSameSender =
                  prevMsg?.sender_id === message.sender_id;
                const isConsecutive =
                  isSameSender &&
                  prevMsg &&
                  new Date(message.created_at).getTime() -
                    new Date(prevMsg.created_at).getTime() <
                    120000; // 2min

                const senderProfile =
                  message.sender ||
                  (message.sender_id
                    ? getParticipantProfile(message.sender_id)
                    : undefined);

                return (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    isOwn={isOwn}
                    isConsecutive={!!isConsecutive}
                    senderProfile={senderProfile}
                    isHovered={hoveredMessage === message.id}
                    showActions={showActionsFor === message.id}
                    onHover={(hovered) =>
                      setHoveredMessage(hovered ? message.id : null)
                    }
                    onToggleActions={() =>
                      setShowActionsFor(
                        showActionsFor === message.id ? null : message.id
                      )
                    }
                    onReply={() => onReply(message)}
                    onEdit={() => onEdit(message)}
                    onDelete={() => onDelete(message.id)}
                    onReaction={(emoji) => onReaction(message.id, emoji)}
                    currentUserId={currentUserId}
                  />
                );
              })}
            </div>
          ))
        )}

        {/* Typing Indicator */}
        <TypingIndicator users={typingUsers} />

        {/* Bottom anchor */}
        <div ref={bottomRef} />
      </div>

      {/* Scroll to bottom FAB */}
      <ScrollToBottomFab show={showScrollFab} onClick={scrollToBottom} />
    </div>
  );
}

// ============================================================================
// Message Bubble Component
// ============================================================================

function MessageBubble({
  message,
  isOwn,
  isConsecutive,
  senderProfile,
  isHovered,
  showActions,
  onHover,
  onToggleActions,
  onReply,
  onEdit,
  onDelete,
  onReaction,
  currentUserId,
}: {
  message: Message;
  isOwn: boolean;
  isConsecutive: boolean;
  senderProfile?: UserProfile;
  isHovered: boolean;
  showActions: boolean;
  onHover: (hovered: boolean) => void;
  onToggleActions: () => void;
  onReply: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onReaction: (emoji: string) => void;
  currentUserId?: string;
}) {
  // System messages
  if (message.message_type === "system") {
    return (
      <div className="flex justify-center my-2">
        <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
          {message.content}
        </span>
      </div>
    );
  }

  const senderName = senderProfile?.full_name || "Usuario";

  return (
    <div
      className={cn(
        "flex gap-1.5 px-3 group relative",
        isOwn ? "justify-end" : "justify-start",
        isConsecutive ? "mt-0.5" : "mt-3"
      )}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => {
        onHover(false);
        if (showActions) {
          // Delay closing to allow clicking actions
          setTimeout(() => onToggleActions(), 300);
        }
      }}
    >
      {/* Avatar (only for other's messages, not consecutive) */}
      {!isOwn && !isConsecutive && (
        <Avatar className="h-8 w-8 mt-1 shrink-0">
          {senderProfile?.avatar_url ? (
            <AvatarImage
              src={senderProfile.avatar_url}
              alt={senderName}
            />
          ) : null}
          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-[10px] font-semibold">
            {getInitials(senderName)}
          </AvatarFallback>
        </Avatar>
      )}

      {/* Spacer for consecutive messages */}
      {!isOwn && isConsecutive && <div className="w-8 shrink-0" />}

      {/* Bubble */}
      <div className={cn("max-w-[75%] relative", isOwn && "order-1")}>
        {/* Reply preview */}
        {message.reply_to && (
          <div
            className={cn(
              "mb-0.5 px-3 py-1.5 rounded-t-xl text-xs border-l-2",
              isOwn
                ? "bg-emerald-200/50 dark:bg-emerald-900/40 border-emerald-400"
                : "bg-gray-200/50 dark:bg-gray-700/50 border-gray-400"
            )}
          >
            <p className="font-semibold text-[11px] text-gray-600 dark:text-gray-300">
              {(message.reply_to as unknown as { sender?: { full_name: string } })?.sender?.full_name || ""}
            </p>
            <p className="text-gray-500 dark:text-gray-400 truncate">
              {message.reply_to.content?.slice(0, 80)}
            </p>
          </div>
        )}

        {/* Main bubble */}
        <div
          className={cn(
            "relative px-3 py-2 rounded-2xl transition-shadow",
            isOwn
              ? "bg-emerald-500 text-white rounded-br-md"
              : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-md shadow-sm border border-gray-100 dark:border-gray-700",
            !isConsecutive && !isOwn && "rounded-tl-md",
            !isConsecutive && isOwn && "rounded-tr-md",
            message.reply_to && "rounded-t-sm"
          )}
        >
          {/* Sender name (groups, not own, not consecutive) */}
          {!isOwn && !isConsecutive && (
            <p className="text-[11px] font-semibold mb-0.5 text-emerald-600 dark:text-emerald-400">
              {senderName}
              {senderProfile?.specialty && (
                <span className="text-gray-400 dark:text-gray-500 font-normal ml-1">
                  · {senderProfile.specialty}
                </span>
              )}
            </p>
          )}

          {/* Content */}
          <div className="flex items-end gap-2">
            <p className="text-[14px] leading-relaxed whitespace-pre-wrap break-words flex-1">
              {message.content}
            </p>

            {/* Time + status */}
            <span
              className={cn(
                "flex items-center gap-0.5 text-[10px] shrink-0 -mb-0.5 select-none",
                isOwn
                  ? "text-emerald-100"
                  : "text-gray-400 dark:text-gray-500"
              )}
            >
              {message.edited_at && (
                <Pencil className="h-2.5 w-2.5 mr-0.5" />
              )}
              {formatTime(message.created_at)}
              {isOwn && (
                <DeliveryIcon status={message.delivery_status} />
              )}
            </span>
          </div>
        </div>

        {/* Reactions */}
        {message.reactions && message.reactions.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1 px-1">
            {message.reactions.map((reaction, idx) => (
              <button
                key={idx}
                onClick={() => onReaction(reaction.emoji)}
                className={cn(
                  "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border transition-colors",
                  reaction.user_ids.includes(currentUserId || "")
                    ? "bg-emerald-50 dark:bg-emerald-900/30 border-emerald-300 dark:border-emerald-700"
                    : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                )}
              >
                <span>{reaction.emoji}</span>
                <span className="text-gray-600 dark:text-gray-400 font-medium">
                  {reaction.count}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Hover actions */}
        {(isHovered || showActions) && (
          <div
            className={cn(
              "absolute -top-8 flex items-center gap-0.5 bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 p-0.5 z-20",
              "animate-in fade-in zoom-in-95 duration-150",
              isOwn ? "right-0" : "left-0"
            )}
          >
            {/* Quick Reactions */}
            <div className="flex items-center gap-0.5 px-1">
              {QUICK_REACTIONS.slice(0, 4).map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => onReaction(emoji)}
                  className="hover:scale-125 transition-transform p-0.5 text-sm"
                  title={emoji}
                >
                  {emoji}
                </button>
              ))}
            </div>

            <div className="h-5 w-px bg-gray-200 dark:bg-gray-700" />

            {/* Action buttons */}
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onReply}
              title="Responder"
            >
              <Reply className="h-3.5 w-3.5" />
            </Button>

            {isOwn && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={onEdit}
                title="Editar"
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => navigator.clipboard.writeText(message.content || "")}
              title="Copiar"
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>

            {isOwn && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                onClick={onDelete}
                title="Eliminar"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onToggleActions}
              title="Más"
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
