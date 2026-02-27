"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@red-salud/design-system";
import { Button } from "@red-salud/design-system";
import { Avatar, AvatarFallback, AvatarImage } from "@red-salud/design-system";
import { Badge } from "@red-salud/design-system";
import {
  Share2,
  Bookmark,
  BookmarkCheck,
  ThumbsUp,
  MessageCircle,
  Eye,
  Clock,
  CheckCircle,
  Facebook,
  Twitter,
  Linkedin,
  Link as LinkIcon,
} from "lucide-react";
import type { BlogPost } from "@red-salud/types";

interface ArticleSidebarProps {
  post: BlogPost;
}

export default function ArticleSidebar({ post }: ArticleSidebarProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt || post.title,
          url,
        });
      } catch (err) {
        console.log("Share cancelled");
      }
    } else {
      setShowShareMenu(!showShareMenu);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const shareLinks = [
    {
      name: "Facebook",
      icon: Facebook,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`,
    },
    {
      name: "Twitter",
      icon: Twitter,
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(post.title)}`,
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`,
    },
  ];

  return (
    <div className="space-y-6">
      <Card className="p-5">
        <h3 className="font-bold text-lg mb-4">Compartir artículo</h3>
        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={handleShare}
          >
            <Share2 className="h-4 w-4" />
            Compartir
          </Button>
          
          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={handleCopyLink}
          >
            {copied ? (
              <>
                <CheckCircle className="h-4 w-4 text-green-500" />
                ¡Copiado!
              </>
            ) : (
              <>
                <LinkIcon className="h-4 w-4" />
                Copiar enlace
              </>
            )}
          </Button>

          {showShareMenu && (
            <div className="flex gap-2 pt-2">
              {shareLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <link.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          )}
        </div>
      </Card>

      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">Acciones</h3>
        </div>
        <div className="space-y-3">
          <Button
            variant={isBookmarked ? "secondary" : "outline"}
            className="w-full justify-start gap-2"
            onClick={() => setIsBookmarked(!isBookmarked)}
          >
            {isBookmarked ? (
              <>
                <BookmarkCheck className="h-4 w-4 text-blue-500" />
                Guardado
              </>
            ) : (
              <>
                <Bookmark className="h-4 w-4" />
                Guardar artículo
              </>
            )}
          </Button>

          <Button
            variant={isLiked ? "secondary" : "outline"}
            className="w-full justify-start gap-2"
            onClick={() => setIsLiked(!isLiked)}
          >
            <ThumbsUp className={`h-4 w-4 ${isLiked ? "text-blue-500" : ""}`} />
            {isLiked ? "Te gusta" : "Me gusta"}
          </Button>
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="font-bold text-lg mb-4">Información</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
            <Eye className="h-4 w-4" />
            <span>{post.view_count.toLocaleString()} vistas</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
            <ThumbsUp className="h-4 w-4" />
            <span>{post.like_count.toLocaleString()} likes</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
            <MessageCircle className="h-4 w-4" />
            <span>{post.comment_count.toLocaleString()} comentarios</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
            <Clock className="h-4 w-4" />
            <span>{post.reading_time} min de lectura</span>
          </div>
        </div>
      </Card>

      {post.author && (
        <Card className="p-5">
          <h3 className="font-bold text-lg mb-4">Sobre el autor</h3>
          <Link href={`/blog/autor/${post.author.id}`}>
            <div className="flex items-center gap-3 mb-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={post.author.avatar_url || ""} />
                <AvatarFallback>
                  {post.author.nombre_completo?.[0] || "A"}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-1">
                  <span className="font-medium">{post.author.nombre_completo}</span>
                  {(post.author.verified || post.author.doctor_details?.verified) && (
                    <CheckCircle className="h-4 w-4 text-blue-500" />
                  )}
                </div>
                {post.author.specialty_name && (
                  <p className="text-sm text-gray-500">{post.author.specialty_name}</p>
                )}
              </div>
            </div>
          </Link>
          {post.author.reputation && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {post.author.reputation.total_points} puntos
              </Badge>
              <Badge variant="outline" className="text-xs">
                Nivel {post.author.reputation.level_name}
              </Badge>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
