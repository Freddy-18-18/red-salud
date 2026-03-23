"use client";

import {
  MessageCircle,
  Eye,
  ChevronUp,
  Tag,
} from "lucide-react";
import { DoctorBadge } from "@/components/community/doctor-badge";
import type { CommunityPost } from "@/lib/services/community-service";

interface PostCardProps {
  post: CommunityPost;
  onClick: (postId: string) => void;
}

const CATEGORY_STYLES: Record<string, { label: string; color: string }> = {
  pregunta: { label: "Pregunta", color: "bg-blue-50 text-blue-700" },
  experiencia: { label: "Experiencia", color: "bg-purple-50 text-purple-700" },
  tip: { label: "Tip", color: "bg-amber-50 text-amber-700" },
  articulo: { label: "Articulo", color: "bg-emerald-50 text-emerald-700" },
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
  return `hace ${Math.floor(days / 30)} mes${Math.floor(days / 30) > 1 ? "es" : ""}`;
}

export function PostCard({ post, onClick }: PostCardProps) {
  const category = CATEGORY_STYLES[post.category] || CATEGORY_STYLES.pregunta;
  const authorName = post.author?.full_name || "Usuario";
  const isDoctor = post.author?.role === "medico";
  const initials = authorName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <button
      type="button"
      onClick={() => onClick(post.id)}
      className="w-full text-left p-4 bg-white border border-gray-100 rounded-xl hover:shadow-md hover:border-emerald-200 transition-all"
    >
      {/* Header row */}
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0 overflow-hidden">
          {post.author?.avatar_url ? (
            <img
              src={post.author.avatar_url}
              alt={authorName}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-xs font-semibold text-emerald-600">
              {initials}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-medium text-gray-900 truncate">
              {authorName}
            </span>
            {isDoctor && <DoctorBadge />}
          </div>
          <span className="text-xs text-gray-400">
            {timeAgo(post.created_at)}
          </span>
        </div>
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${category.color}`}
        >
          {category.label}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2">
        {post.title}
      </h3>

      {/* Content preview */}
      <p className="text-xs text-gray-500 line-clamp-2 mb-3">{post.content}</p>

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {post.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-gray-50 text-gray-500 rounded text-[10px]"
            >
              <Tag className="h-2.5 w-2.5" />
              {tag}
            </span>
          ))}
          {post.tags.length > 3 && (
            <span className="text-[10px] text-gray-400">
              +{post.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Footer stats */}
      <div className="flex items-center gap-4 text-xs text-gray-400">
        <span className="flex items-center gap-1">
          <ChevronUp className="h-3.5 w-3.5" />
          {post.upvotes}
        </span>
        <span className="flex items-center gap-1">
          <MessageCircle className="h-3.5 w-3.5" />
          {post.reply_count ?? 0}
        </span>
        <span className="flex items-center gap-1">
          <Eye className="h-3.5 w-3.5" />
          {post.views}
        </span>
        {post.specialty && (
          <span className="ml-auto text-[10px] text-emerald-600 font-medium truncate max-w-[100px]">
            {post.specialty.name}
          </span>
        )}
      </div>
    </button>
  );
}
