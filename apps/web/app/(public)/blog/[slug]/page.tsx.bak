"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Clock,
  Eye,
  ThumbsUp,
  MessageCircle,
  Bookmark,
  Share2,
  ArrowLeft,
  CheckCircle,
  ChevronRight,
  Send,
  Reply,
  Heart,
} from "lucide-react";
import {
  getPostBySlug,
  getPostComments,
  createComment,
  likeContent,
  bookmarkContent,
  subscribeToAuthor,
  getAuthorSubscribers,
} from "@/lib/api/blog";
import type {
  BlogPost,
  BlogComment,
  AuthorInfo,
  ContentTag,
} from "@/lib/types/blog";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [post, setPost] = useState<BlogPost | null>(null);
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (slug) {
      loadPost();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  async function loadPost() {
    setLoading(true);
    try {
      const [postData, commentsData] = await Promise.all([
        getPostBySlug(slug),
        getPostComments(slug),
      ]);
      setPost(postData);
      setComments(commentsData);

      if (postData?.author_id) {
        const count = await getAuthorSubscribers(postData.author_id);
        setSubscriberCount(count);
      }
    } catch (error) {
      console.error("Error loading post:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleLike() {
    if (!post) return;
    try {
      const liked = await likeContent("post", post.id);
      setIsLiked(liked);
      setPost((prev) =>
        prev
          ? {
              ...prev,
              like_count: liked ? prev.like_count + 1 : prev.like_count - 1,
            }
          : null,
      );
    } catch (error) {
      console.error("Error liking post:", error);
    }
  }

  async function handleBookmark() {
    if (!post) return;
    try {
      const bookmarked = await bookmarkContent("post", post.id);
      setIsBookmarked(bookmarked);
    } catch (error) {
      console.error("Error bookmarking post:", error);
    }
  }

  async function handleSubscribe() {
    if (!post?.author_id) return;
    try {
      const subscribed = await subscribeToAuthor(post.author_id);
      setIsSubscribed(subscribed);
      setSubscriberCount((prev) => (subscribed ? prev + 1 : prev - 1));
    } catch (error) {
      console.error("Error subscribing:", error);
    }
  }

  async function handleSubmitComment() {
    if (!post || !newComment.trim()) return;
    setSubmitting(true);
    try {
      const comment = await createComment({
        post_id: post.id,
        content: newComment,
      });
      setComments((prev) => [...prev, comment]);
      setNewComment("");
      setPost((prev) =>
        prev ? { ...prev, comment_count: prev.comment_count + 1 } : null,
      );
    } catch (error) {
      console.error("Error creating comment:", error);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSubmitReply(parentId: string) {
    if (!post || !replyContent.trim()) return;
    setSubmitting(true);
    try {
      const reply = await createComment({
        post_id: post.id,
        parent_id: parentId,
        content: replyContent,
      });
      setComments((prev) =>
        prev.map((c) =>
          c.id === parentId
            ? { ...c, replies: [...(c.replies || []), reply] }
            : c,
        ),
      );
      setReplyingTo(null);
      setReplyContent("");
    } catch (error) {
      console.error("Error creating reply:", error);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleShare() {
    if (navigator.share) {
      await navigator.share({
        title: post?.title,
        text: post?.excerpt || "",
        url: window.location.href,
      });
    } else {
      await navigator.clipboard.writeText(window.location.href);
      // TODO: Show toast
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h1 className="text-2xl font-bold mb-4">Artículo no encontrado</h1>
          <Link href="/blog">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al blog
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const author = post.author as AuthorInfo | undefined;
  const isVerifiedDoctor = author?.doctor_details?.verified;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b">
        <div className="container mx-auto px-4 py-4">
          <Link
            href="/blog"
            className="inline-flex items-center text-gray-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al blog
          </Link>
        </div>
      </div>

      <article className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {/* Category & Meta */}
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  {post.category && (
                    <Link href={`/blog?category=${post.category.id}`}>
                      <Badge
                        style={{
                          backgroundColor: `${post.category.color}20`,
                          color: post.category.color,
                        }}
                      >
                        {post.category.name}
                      </Badge>
                    </Link>
                  )}
                  <span className="text-sm text-gray-500 flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {post.reading_time} min de lectura
                  </span>
                </div>

                {/* Title */}
                <h1 className="text-3xl sm:text-4xl font-bold mb-6 leading-tight">
                  {post.title}
                </h1>

                {/* Author Info */}
                <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
                  <Link
                    href={`/blog/autor/${post.author_id}`}
                    className="flex items-center gap-3"
                  >
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={author?.avatar_url || ""} />
                      <AvatarFallback>
                        {author?.nombre_completo?.[0] || "A"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">
                          {author?.nombre_completo}
                        </span>
                        {isVerifiedDoctor && (
                          <CheckCircle className="h-4 w-4 text-blue-500" />
                        )}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-2">
                        {isVerifiedDoctor &&
                          author?.doctor_details?.specialty?.name && (
                            <span>{author.doctor_details.specialty.name}</span>
                          )}
                        <span>•</span>
                        <span>
                          {post.published_at &&
                            formatDistanceToNow(new Date(post.published_at), {
                              addSuffix: true,
                              locale: es,
                            })}
                        </span>
                      </div>
                    </div>
                  </Link>
                  <Button
                    variant={isSubscribed ? "secondary" : "default"}
                    size="sm"
                    onClick={handleSubscribe}
                  >
                    {isSubscribed ? "Siguiendo" : "Seguir"}
                  </Button>
                </div>

                {/* Cover Image */}
                {post.cover_image && (
                  <div className="rounded-xl overflow-hidden mb-8">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={post.cover_image}
                      alt={post.title}
                      className="w-full h-auto"
                    />
                  </div>
                )}

                {/* Content */}
                <Card className="p-6 sm:p-8 mb-8">
                  <div
                    className="prose prose-lg dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                  />
                </Card>

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-8">
                    {post.tags.map((tagWrapper: unknown) => {
                      const wrapper = tagWrapper as { tag: ContentTag };
                      return (
                        <Link
                          key={wrapper.tag.id}
                          href={`/blog?tag=${wrapper.tag.slug}`}
                        >
                          <Badge variant="outline" className="hover:bg-blue-50">
                            #{wrapper.tag.name}
                          </Badge>
                        </Link>
                      );
                    })}
                  </div>
                )}

                {/* Actions Bar */}
                <Card className="p-4 mb-8">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                      <Button
                        variant={isLiked ? "default" : "ghost"}
                        size="sm"
                        onClick={handleLike}
                        className={isLiked ? "bg-red-500 hover:bg-red-600" : ""}
                      >
                        <Heart
                          className={`h-4 w-4 mr-2 ${isLiked ? "fill-current" : ""}`}
                        />
                        {post.like_count}
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        {post.comment_count}
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        {post.view_count}
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant={isBookmarked ? "secondary" : "ghost"}
                        size="sm"
                        onClick={handleBookmark}
                      >
                        <Bookmark
                          className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`}
                        />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={handleShare}>
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>

                {/* Comments Section */}
                <Card className="p-6">
                  <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    Comentarios ({post.comment_count})
                  </h2>

                  {/* New Comment Form */}
                  <div className="mb-8">
                    <Textarea
                      placeholder="Escribe un comentario..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="mb-3"
                      rows={3}
                    />
                    <div className="flex justify-end">
                      <Button
                        onClick={handleSubmitComment}
                        disabled={!newComment.trim() || submitting}
                      >
                        <Send className="h-4 w-4 mr-2" />
                        {submitting ? "Enviando..." : "Comentar"}
                      </Button>
                    </div>
                  </div>

                  <Separator className="mb-6" />

                  {/* Comments List */}
                  {comments.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">
                      Sé el primero en comentar
                    </p>
                  ) : (
                    <div className="space-y-6">
                      {comments.map((comment) => (
                        <CommentItem
                          key={comment.id}
                          comment={comment}
                          replyingTo={replyingTo}
                          setReplyingTo={setReplyingTo}
                          replyContent={replyContent}
                          setReplyContent={setReplyContent}
                          onSubmitReply={handleSubmitReply}
                          submitting={submitting}
                        />
                      ))}
                    </div>
                  )}
                </Card>
              </motion.div>
            </div>

            {/* Sidebar */}
            <aside className="lg:col-span-4 space-y-6">
              {/* Author Card */}
              <Card className="p-6 sticky top-6">
                <h3 className="font-bold mb-4">Sobre el autor</h3>
                <div className="text-center mb-4">
                  <Avatar className="h-20 w-20 mx-auto mb-3">
                    <AvatarImage src={author?.avatar_url || ""} />
                    <AvatarFallback className="text-2xl">
                      {author?.nombre_completo?.[0] || "A"}
                    </AvatarFallback>
                  </Avatar>
                  <h4 className="font-semibold flex items-center justify-center gap-2">
                    {author?.nombre_completo}
                    {isVerifiedDoctor && (
                      <CheckCircle className="h-4 w-4 text-blue-500" />
                    )}
                  </h4>
                  {isVerifiedDoctor &&
                    author?.doctor_details?.specialty?.name && (
                      <p className="text-sm text-gray-500">
                        {author.doctor_details.specialty.name}
                      </p>
                    )}
                  <p className="text-sm text-gray-500 mt-1">
                    {subscriberCount} seguidores
                  </p>
                </div>
                <Button
                  className="w-full"
                  variant={isSubscribed ? "secondary" : "default"}
                  onClick={handleSubscribe}
                >
                  {isSubscribed ? "Siguiendo" : "Seguir autor"}
                </Button>
                <Link href={`/blog/autor/${post.author_id}`}>
                  <Button variant="ghost" className="w-full mt-2">
                    Ver perfil completo
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </Card>

              {/* Related Posts - Placeholder */}
              <Card className="p-6">
                <h3 className="font-bold mb-4">Artículos relacionados</h3>
                <p className="text-sm text-gray-500">Próximamente...</p>
              </Card>
            </aside>
          </div>
        </div>
      </article>
    </div>
  );
}

// Comment Item Component
function CommentItem({
  comment,
  replyingTo,
  setReplyingTo,
  replyContent,
  setReplyContent,
  onSubmitReply,
  submitting,
}: {
  comment: BlogComment;
  replyingTo: string | null;
  setReplyingTo: (id: string | null) => void;
  replyContent: string;
  setReplyContent: (content: string) => void;
  onSubmitReply: (parentId: string) => void;
  submitting: boolean;
}) {
  const author = comment.author as AuthorInfo | undefined;

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <Avatar className="h-10 w-10 flex-shrink-0">
          <AvatarImage src={author?.avatar_url || ""} />
          <AvatarFallback>{author?.nombre_completo?.[0] || "U"}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">
                  {author?.nombre_completo}
                </span>
                {comment.is_highlighted && (
                  <Badge variant="secondary" className="text-xs">
                    Destacado
                  </Badge>
                )}
              </div>
              <span className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(comment.created_at), {
                  addSuffix: true,
                  locale: es,
                })}
              </span>
            </div>
            <p className="text-sm">{comment.content}</p>
          </div>
          <div className="flex items-center gap-4 mt-2 text-sm">
            <button className="text-gray-500 hover:text-blue-600 flex items-center gap-1">
              <ThumbsUp className="h-3 w-3" />
              {comment.like_count > 0 && comment.like_count}
            </button>
            <button
              className="text-gray-500 hover:text-blue-600 flex items-center gap-1"
              onClick={() =>
                setReplyingTo(replyingTo === comment.id ? null : comment.id)
              }
            >
              <Reply className="h-3 w-3" />
              Responder
            </button>
          </div>

          {/* Reply Form */}
          {replyingTo === comment.id && (
            <div className="mt-3 pl-4 border-l-2 border-blue-200">
              <Textarea
                placeholder="Escribe una respuesta..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                className="mb-2"
                rows={2}
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => onSubmitReply(comment.id)}
                  disabled={!replyContent.trim() || submitting}
                >
                  {submitting ? "Enviando..." : "Responder"}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setReplyingTo(null);
                    setReplyContent("");
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}

          {/* Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-4 pl-4 border-l-2 border-gray-200 space-y-4">
              {comment.replies.map((reply) => {
                const replyAuthor = reply.author as AuthorInfo | undefined;
                return (
                  <div key={reply.id} className="flex gap-3">
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarImage src={replyAuthor?.avatar_url || ""} />
                      <AvatarFallback className="text-xs">
                        {replyAuthor?.nombre_completo?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-sm">
                            {replyAuthor?.nombre_completo}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(reply.created_at), {
                              addSuffix: true,
                              locale: es,
                            })}
                          </span>
                        </div>
                        <p className="text-sm">{reply.content}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
