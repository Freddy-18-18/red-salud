"use client";

import { CheckCircle2 } from "lucide-react";
import { cn } from "@red-salud/core/utils";
import { DoctorBadge } from "@/components/community/doctor-badge";
import { VoteButton } from "@/components/community/vote-button";
import type { CommunityReply } from "@/lib/services/community-service";
import type { VoteType } from "@/lib/services/community-service";

interface ReplyCardProps {
  reply: CommunityReply;
  currentVote?: VoteType | null;
  onVote: (voteType: VoteType) => void;
  disabled?: boolean;
}

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "hace un momento";
  if (minutes < 60) return `hace ${minutes} min`;
  if (hours < 24) return `hace ${hours}h`;
  if (days < 7) return `hace ${days}d`;
  return `hace ${Math.floor(days / 7)} sem`;
}

export function ReplyCard({
  reply,
  currentVote,
  onVote,
  disabled = false,
}: ReplyCardProps) {
  const authorName = reply.author?.full_name || "Usuario";
  const isDoctor = reply.is_doctor_reply || reply.author?.role === "medico";
  const initials = authorName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className={cn(
        "p-4 rounded-xl border transition-colors",
        isDoctor
          ? "border-l-4 border-l-emerald-400 border-gray-100 bg-emerald-50/30"
          : "border-gray-100 bg-white",
        reply.is_best_answer && "ring-2 ring-amber-300 border-amber-200"
      )}
    >
      {/* Best answer badge */}
      {reply.is_best_answer && (
        <div className="flex items-center gap-1 mb-2 text-amber-600">
          <CheckCircle2 className="h-4 w-4" />
          <span className="text-xs font-semibold">Mejor respuesta</span>
        </div>
      )}

      <div className="flex gap-3">
        {/* Vote column */}
        <div className="flex-shrink-0">
          <VoteButton
            count={reply.upvotes}
            currentVote={currentVote}
            onVote={onVote}
            disabled={disabled}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Author row */}
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0 overflow-hidden">
              {reply.author?.avatar_url ? (
                <img
                  src={reply.author.avatar_url}
                  alt={authorName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-[10px] font-semibold text-emerald-600">
                  {initials}
                </span>
              )}
            </div>
            <span className="text-sm font-medium text-gray-900">
              {authorName}
            </span>
            {isDoctor && <DoctorBadge />}
            <span className="text-xs text-gray-400">
              {timeAgo(reply.created_at)}
            </span>
          </div>

          {/* Reply content */}
          <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
            {reply.content}
          </p>
        </div>
      </div>
    </div>
  );
}
