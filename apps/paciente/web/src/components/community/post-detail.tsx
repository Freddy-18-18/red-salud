"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Eye,
  Share2,
  MessageCircle,
  Send,
  Tag,
} from "lucide-react";
import { cn } from "@red-salud/core/utils";
import { DoctorBadge } from "@/components/community/doctor-badge";
import { VoteButton } from "@/components/community/vote-button";
import { ReplyCard } from "@/components/community/reply-card";
import type {
  CommunityPost,
  CommunityReply,
  VoteType,
} from "@/lib/services/community-service";

interface PostDetailProps {
  post: CommunityPost;
  replies: CommunityReply[];
  votes: Record<string, VoteType>;
  userId: string | null;
  onVote: (targetType: "post" | "reply", targetId: string, voteType: VoteType) => void;
  onReply: (content: string) => Promise<void>;
  onBack: () => void;
  repliesLoading: boolean;
}

const CATEGORY_LABELS: Record<string, string> = {
  pregunta: "Pregunta",
  experiencia: "Experiencia",
  tip: "Tip",
  articulo: "Articulo",
};

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
  if (days < 30) return `hace ${Math.floor(days / 7)} sem`;
  return new Date(dateStr).toLocaleDateString("es-VE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function PostDetail({
  post,
  replies,
  votes,
  userId,
  onVote,
  onReply,
  onBack,
  repliesLoading,
}: PostDetailProps) {
  const [replyContent, setReplyContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const authorName = post.author?.full_name || "Usuario";
  const isDoctor = post.author?.role === "medico";
  const initials = authorName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const postVote = votes[`post:${post.id}`] || null;

  const handleSubmitReply = async () => {
    if (!replyContent.trim() || submitting) return;
    setSubmitting(true);
    await onReply(replyContent.trim());
    setReplyContent("");
    setSubmitting(false);
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: post.title,
        text: post.content.slice(0, 120),
        url: window.location.href,
      });
    } else {
      await navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className="space-y-4">
      {/* Back button */}
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a la comunidad
      </button>

      {/* Post content */}
      <div className="bg-white border border-gray-100 rounded-xl p-4 sm:p-6">
        {/* Category & meta */}
        <div className="flex items-center gap-2 mb-3">
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700">
            {CATEGORY_LABELS[post.category] || post.category}
          </span>
          {post.specialty && (
            <span className="text-[10px] text-emerald-600 font-medium">
              {post.specialty.name}
            </span>
          )}
          <span className="flex items-center gap-1 text-xs text-gray-400 ml-auto">
            <Eye className="h-3 w-3" />
            {post.views} vistas
          </span>
        </div>

        {/* Title */}
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
          {post.title}
        </h1>

        {/* Author */}
        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
          <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0 overflow-hidden">
            {post.author?.avatar_url ? (
              <img
                src={post.author.avatar_url}
                alt={authorName}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-sm font-semibold text-emerald-600">
                {initials}
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold text-gray-900">
                {authorName}
              </span>
              {isDoctor && <DoctorBadge size="md" />}
            </div>
            <span className="text-xs text-gray-400">
              {timeAgo(post.created_at)}
            </span>
          </div>
        </div>

        {/* Content body */}
        <div className="prose prose-sm max-w-none mb-4">
          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
            {post.content}
          </p>
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-gray-50 text-gray-500 rounded-full text-xs"
              >
                <Tag className="h-3 w-3" />
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
          <VoteButton
            count={post.upvotes}
            currentVote={postVote}
            onVote={(type) => onVote("post", post.id, type)}
            disabled={!userId}
            vertical={false}
          />
          <span className="flex items-center gap-1 text-sm text-gray-500">
            <MessageCircle className="h-4 w-4" />
            {replies.length} respuesta{replies.length !== 1 ? "s" : ""}
          </span>
          <button
            type="button"
            onClick={handleShare}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-emerald-600 transition-colors ml-auto"
          >
            <Share2 className="h-4 w-4" />
            Compartir
          </button>
        </div>
      </div>

      {/* Replies section */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          Respuestas ({replies.length})
        </h2>

        {repliesLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse bg-gray-100 rounded-xl h-24"
              />
            ))}
          </div>
        ) : replies.length > 0 ? (
          <div className="space-y-3">
            {replies.map((reply) => (
              <ReplyCard
                key={reply.id}
                reply={reply}
                currentVote={votes[`reply:${reply.id}`] || null}
                onVote={(type) => onVote("reply", reply.id, type)}
                disabled={!userId}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Aun no hay respuestas. Se el primero.</p>
          </div>
        )}
      </div>

      {/* Reply input */}
      {userId && (
        <div className="sticky bottom-16 lg:bottom-0 bg-white border border-gray-100 rounded-xl p-3 shadow-lg">
          <div className="flex gap-2">
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Escribe tu respuesta..."
              className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent min-h-[40px] max-h-[120px]"
              rows={1}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = "auto";
                target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
              }}
            />
            <button
              type="button"
              onClick={handleSubmitReply}
              disabled={!replyContent.trim() || submitting}
              className={cn(
                "px-3 py-2 rounded-lg transition-colors flex items-center gap-1 text-sm font-medium",
                replyContent.trim() && !submitting
                  ? "bg-emerald-500 text-white hover:bg-emerald-600"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              )}
            >
              <Send className="h-4 w-4" />
              <span className="hidden sm:inline">
                {submitting ? "Enviando..." : "Responder"}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
