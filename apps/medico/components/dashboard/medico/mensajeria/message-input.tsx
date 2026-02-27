// ============================================================================
// Message Input - Rich input (WhatsApp/Telegram/Slack inspired)
// Supports: text, emoji, attachments, voice notes, replies, edit mode
// ============================================================================

"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@red-salud/design-system";
import {
  Send,
  Smile,
  Paperclip,
  Mic,
  X,
  Image as ImageIcon,
  FileText,
  Camera,
  MapPin,
  Reply,
  Pencil,
  Bold,
  Italic,
  Code,
  AtSign,
  Hash,
  Sticker,
  Plus,
  Keyboard,
} from "lucide-react";
import type { Message, UserProfile } from "./types";
import { cn } from "@/lib/utils";

interface MessageInputProps {
  onSend: (content: string) => void;
  onTyping: () => void;
  replyTo: Message | null;
  editMessage: Message | null;
  onCancelReply: () => void;
  onCancelEdit: () => void;
  onEditSubmit: (messageId: string, content: string) => void;
  isSending: boolean;
  isDisabled?: boolean;
  placeholder?: string;
}

// --- Emoji Picker (Quick inline) ---
const EMOJI_CATEGORIES = [
  {
    name: "Frecuentes",
    emojis: ["👍", "❤️", "😂", "🙏", "😊", "👏", "🎉", "💪"],
  },
  {
    name: "Caras",
    emojis: ["😀", "😃", "😄", "😁", "😅", "🤣", "😍", "🤩", "😎", "🤗", "🤔", "😮", "😢", "😤", "🥰", "😷"],
  },
  {
    name: "Gestos",
    emojis: ["👋", "🤝", "✌️", "🤞", "👌", "🙌", "💅", "🫶", "❤️‍🩹", "💊", "🩺", "🏥"],
  },
  {
    name: "Médico",
    emojis: ["💊", "🩺", "🏥", "🩻", "🧬", "🔬", "💉", "🩸", "🦷", "👁️", "🫀", "🧠"],
  },
  {
    name: "Objetos",
    emojis: ["📋", "📄", "📝", "📎", "📌", "📅", "⏰", "🔔", "✅", "❌", "⚠️", "💡"],
  },
];

function EmojiPickerInline({
  onSelect,
  onClose,
}: {
  onSelect: (emoji: string) => void;
  onClose: () => void;
}) {
  const [activeCategory, setActiveCategory] = useState(0);

  return (
    <div className="absolute bottom-full left-0 right-0 mb-2 mx-3 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-in slide-in-from-bottom-4 duration-200 z-30">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 dark:border-gray-700">
        <div className="flex gap-1 overflow-x-auto scrollbar-hide">
          {EMOJI_CATEGORIES.map((cat, idx) => (
            <button
              key={cat.name}
              onClick={() => setActiveCategory(idx)}
              className={cn(
                "px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition-colors",
                activeCategory === idx
                  ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
                  : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
        >
          <X className="h-4 w-4 text-gray-400" />
        </button>
      </div>

      {/* Emoji Grid */}
      <div className="p-3 grid grid-cols-8 gap-1 max-h-48 overflow-y-auto scrollbar-thin">
        {EMOJI_CATEGORIES[activeCategory]?.emojis.map((emoji) => (
          <button
            key={emoji}
            onClick={() => onSelect(emoji)}
            className="h-9 w-9 flex items-center justify-center text-xl hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all hover:scale-110"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}

// --- Attachment Menu ---
function AttachmentMenu({
  onSelect,
  onClose,
}: {
  onSelect: (type: string) => void;
  onClose: () => void;
}) {
  const items = [
    { icon: ImageIcon, label: "Fotos y Videos", type: "image", color: "text-blue-500 bg-blue-50 dark:bg-blue-950" },
    { icon: FileText, label: "Documento", type: "document", color: "text-purple-500 bg-purple-50 dark:bg-purple-950" },
    { icon: Camera, label: "Cámara", type: "camera", color: "text-pink-500 bg-pink-50 dark:bg-pink-950" },
    { icon: MapPin, label: "Ubicación", type: "location", color: "text-green-500 bg-green-50 dark:bg-green-950" },
  ];

  return (
    <div className="absolute bottom-full left-0 mb-2 ml-3 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-in slide-in-from-bottom-4 duration-200 z-30 p-2 min-w-[200px]">
      {items.map((item) => (
        <button
          key={item.type}
          onClick={() => {
            onSelect(item.type);
            onClose();
          }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
        >
          <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center", item.color)}>
            <item.icon className="h-5 w-5" />
          </div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {item.label}
          </span>
        </button>
      ))}
    </div>
  );
}

// ============================================================================
// Main Message Input Component
// ============================================================================

export function MessageInput({
  onSend,
  onTyping,
  replyTo,
  editMessage,
  onCancelReply,
  onCancelEdit,
  onEditSubmit,
  isSending,
  isDisabled = false,
  placeholder = "Escribe un mensaje...",
}: MessageInputProps) {
  const [text, setText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [showAttach, setShowAttach] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Populate edit message content
  useEffect(() => {
    if (editMessage) {
      setText(editMessage.content || "");
      textareaRef.current?.focus();
    }
  }, [editMessage]);

  // Focus on reply
  useEffect(() => {
    if (replyTo) {
      textareaRef.current?.focus();
    }
  }, [replyTo]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        160
      )}px`;
    }
  }, [text]);

  const handleSend = useCallback(() => {
    if (!text.trim() || isSending) return;

    if (editMessage) {
      onEditSubmit(editMessage.id, text.trim());
    } else {
      onSend(text.trim());
    }

    setText("");
    setShowEmoji(false);
    setShowAttach(false);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [text, isSending, editMessage, onSend, onEditSubmit]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    onTyping();
  };

  const insertEmoji = (emoji: string) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newText = text.slice(0, start) + emoji + text.slice(end);
      setText(newText);

      // Move cursor after emoji
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd =
          start + emoji.length;
        textarea.focus();
      }, 0);
    } else {
      setText((prev) => prev + emoji);
    }
  };

  const handleCancel = () => {
    if (editMessage) {
      onCancelEdit();
      setText("");
    } else if (replyTo) {
      onCancelReply();
    }
  };

  return (
    <div className="relative border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
      {/* Emoji Picker */}
      {showEmoji && (
        <EmojiPickerInline
          onSelect={insertEmoji}
          onClose={() => setShowEmoji(false)}
        />
      )}

      {/* Attachment Menu */}
      {showAttach && (
        <AttachmentMenu
          onSelect={(type) => {
            // TODO: Handle attachment type selection
            console.log("Attach type:", type);
          }}
          onClose={() => setShowAttach(false)}
        />
      )}

      {/* Reply / Edit Preview */}
      {(replyTo || editMessage) && (
        <div className="flex items-center gap-3 px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 animate-in slide-in-from-bottom-2 duration-200">
          <div
            className={cn(
              "w-1 h-10 rounded-full shrink-0",
              editMessage ? "bg-blue-500" : "bg-emerald-500"
            )}
          />
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              {editMessage ? (
                <>
                  <Pencil className="h-3 w-3" />
                  Editando mensaje
                </>
              ) : (
                <>
                  <Reply className="h-3 w-3" />
                  Respondiendo a{" "}
                  {(replyTo?.sender as unknown as UserProfile)?.full_name ||
                    "mensaje"}
                </>
              )}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {(editMessage || replyTo)?.content?.slice(0, 80)}
            </p>
          </div>
          <button
            onClick={handleCancel}
            className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors shrink-0"
          >
            <X className="h-4 w-4 text-gray-400" />
          </button>
        </div>
      )}

      {/* Input Area */}
      <div className="flex items-end gap-2 px-3 py-2.5">
        {/* Left Actions */}
        <div className="flex items-center gap-0.5 shrink-0 pb-1">
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-9 w-9 rounded-full",
              showEmoji
                ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-950"
                : "text-gray-500 hover:text-emerald-600 hover:bg-gray-100 dark:hover:bg-gray-800"
            )}
            onClick={() => {
              setShowEmoji(!showEmoji);
              setShowAttach(false);
            }}
          >
            {showEmoji ? (
              <Keyboard className="h-5 w-5" />
            ) : (
              <Smile className="h-5 w-5" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-9 w-9 rounded-full",
              showAttach
                ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-950 rotate-45"
                : "text-gray-500 hover:text-emerald-600 hover:bg-gray-100 dark:hover:bg-gray-800"
            )}
            onClick={() => {
              setShowAttach(!showAttach);
              setShowEmoji(false);
            }}
            style={{
              transition: "transform 0.2s ease, color 0.2s ease",
            }}
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>

        {/* Text Input */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isDisabled}
            rows={1}
            className={cn(
              "w-full resize-none rounded-2xl px-4 py-2.5 pr-12",
              "bg-gray-50 dark:bg-gray-800",
              "border border-gray-200 dark:border-gray-700",
              "focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500",
              "text-sm text-gray-900 dark:text-gray-100",
              "placeholder:text-gray-400 dark:placeholder:text-gray-500",
              "scrollbar-thin max-h-40",
              "transition-all duration-200",
              isDisabled && "opacity-50 cursor-not-allowed"
            )}
          />
        </div>

        {/* Send / Voice Button */}
        <div className="shrink-0 pb-1">
          {text.trim() ? (
            <Button
              onClick={handleSend}
              disabled={isSending || isDisabled}
              size="icon"
              className={cn(
                "h-10 w-10 rounded-full transition-all duration-200",
                "bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/30",
                "hover:shadow-lg hover:shadow-emerald-500/40 hover:scale-105",
                "active:scale-95",
                isSending && "opacity-70"
              )}
            >
              {isSending ? (
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="h-5 w-5 ml-0.5" />
              )}
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950"
              title="Nota de voz"
            >
              <Mic className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
