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
import {
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  CheckCircle,
  Clock,
  Eye,
  MessageCircle,
  Bookmark,
  Share2,
  Shield,
  Send,
  Flag,
} from "lucide-react";
import {
  getQuestionBySlug,
  getAnswers,
  createAnswer,
  vote,
  bookmarkContent,
  acceptAnswer,
} from "@/lib/api/blog";
import type {
  QAQuestion,
  QAAnswer,
  AuthorInfo,
  ContentTag,
} from "@/lib/types/blog";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

export default function QuestionDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [question, setQuestion] = useState<QAQuestion | null>(null);
  const [answers, setAnswers] = useState<QAAnswer[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAnswer, setNewAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [userVotes, setUserVotes] = useState<
    Record<string, "upvote" | "downvote" | null>
  >({});

  useEffect(() => {
    if (slug) {
      loadQuestion();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  async function loadQuestion() {
    setLoading(true);
    try {
      const [questionData, answersData] = await Promise.all([
        getQuestionBySlug(slug),
        getAnswers(slug),
      ]);
      setQuestion(questionData);
      setAnswers(answersData);
    } catch (error) {
      console.error("Error loading question:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleVote(
    contentType: "question" | "answer",
    contentId: string,
    voteType: "upvote" | "downvote",
  ) {
    try {
      await vote(contentType, contentId, voteType);

      const currentVote = userVotes[contentId];
      let delta = 0;

      if (currentVote === voteType) {
        // Removing vote
        delta = voteType === "upvote" ? -1 : 1;
        setUserVotes((prev) => ({ ...prev, [contentId]: null }));
      } else if (currentVote) {
        // Changing vote
        delta = voteType === "upvote" ? 2 : -2;
        setUserVotes((prev) => ({ ...prev, [contentId]: voteType }));
      } else {
        // New vote
        delta = voteType === "upvote" ? 1 : -1;
        setUserVotes((prev) => ({ ...prev, [contentId]: voteType }));
      }

      if (contentType === "question") {
        setQuestion((prev) =>
          prev ? { ...prev, vote_count: prev.vote_count + delta } : null,
        );
      } else {
        setAnswers((prev) =>
          prev.map((a) =>
            a.id === contentId ? { ...a, vote_count: a.vote_count + delta } : a,
          ),
        );
      }
    } catch (error) {
      console.error("Error voting:", error);
    }
  }

  async function handleBookmark() {
    if (!question) return;
    try {
      const bookmarked = await bookmarkContent("question", question.id);
      setIsBookmarked(bookmarked);
    } catch (error) {
      console.error("Error bookmarking:", error);
    }
  }

  async function handleSubmitAnswer() {
    if (!question || !newAnswer.trim()) return;
    setSubmitting(true);
    try {
      const answer = await createAnswer({
        question_id: question.id,
        content: newAnswer,
      });
      setAnswers((prev) => [...prev, answer]);
      setNewAnswer("");
      setQuestion((prev) =>
        prev ? { ...prev, answer_count: prev.answer_count + 1 } : null,
      );
    } catch (error) {
      console.error("Error creating answer:", error);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAcceptAnswer(answerId: string) {
    if (!question) return;
    try {
      await acceptAnswer(question.id, answerId);
      setQuestion((prev) =>
        prev
          ? { ...prev, accepted_answer_id: answerId, status: "answered" }
          : null,
      );
      setAnswers((prev) =>
        prev.map((a) => ({ ...a, is_accepted: a.id === answerId })),
      );
    } catch (error) {
      console.error("Error accepting answer:", error);
    }
  }

  async function handleShare() {
    if (navigator.share) {
      await navigator.share({
        title: question?.title,
        url: window.location.href,
      });
    } else {
      await navigator.clipboard.writeText(window.location.href);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="h-40 bg-gray-200 dark:bg-gray-700 rounded"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h1 className="text-2xl font-bold mb-4">Pregunta no encontrada</h1>
          <Link href="/blog/preguntas">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a preguntas
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const author = question.author as AuthorInfo | undefined;
  const isVerifiedDoctor = author?.doctor_details?.verified;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b">
        <div className="container mx-auto px-4 py-4">
          <Link
            href="/blog/preguntas"
            className="inline-flex items-center text-gray-600 hover:text-purple-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a preguntas
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Question */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-6 mb-8">
            <div className="flex gap-4">
              {/* Voting */}
              <div className="flex flex-col items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`p-2 ${userVotes[question.id] === "upvote" ? "text-green-600 bg-green-50" : ""}`}
                  onClick={() => handleVote("question", question.id, "upvote")}
                >
                  <ArrowUp className="h-6 w-6" />
                </Button>
                <span
                  className={`text-xl font-bold ${
                    question.vote_count > 0
                      ? "text-green-600"
                      : question.vote_count < 0
                        ? "text-red-600"
                        : "text-gray-600"
                  }`}
                >
                  {question.vote_count}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`p-2 ${userVotes[question.id] === "downvote" ? "text-red-600 bg-red-50" : ""}`}
                  onClick={() =>
                    handleVote("question", question.id, "downvote")
                  }
                >
                  <ArrowDown className="h-6 w-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`p-2 mt-2 ${isBookmarked ? "text-yellow-600" : ""}`}
                  onClick={handleBookmark}
                >
                  <Bookmark
                    className={`h-5 w-5 ${isBookmarked ? "fill-current" : ""}`}
                  />
                </Button>
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <h1 className="text-2xl font-bold">{question.title}</h1>
                  {question.bounty_amount > 0 && (
                    <Badge className="bg-yellow-500 text-yellow-900 flex-shrink-0">
                      +{question.bounty_amount} pts
                    </Badge>
                  )}
                </div>

                <div className="prose dark:prose-invert max-w-none mb-4">
                  <p>{question.content}</p>
                </div>

                {/* Tags */}
                {question.tags && (question.tags as unknown[]).length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {(question.tags as unknown[]).map((tagItem: unknown) => {
                      const tagWrapper = tagItem as { tag: ContentTag };
                      return (
                        <Badge key={tagWrapper.tag.id} variant="secondary">
                          {tagWrapper.tag.name}
                        </Badge>
                      );
                    })}
                  </div>
                )}

                {/* Meta */}
                <div className="flex items-center justify-between flex-wrap gap-4 pt-4 border-t">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={author?.avatar_url || ""} />
                      <AvatarFallback>
                        {author?.nombre_completo?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {author?.nombre_completo}
                        </span>
                        {isVerifiedDoctor && (
                          <Shield className="h-4 w-4 text-blue-500" />
                        )}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(question.created_at), {
                          addSuffix: true,
                          locale: es,
                        })}
                        <span>•</span>
                        <Eye className="h-3 w-3" />
                        {question.view_count} vistas
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={handleShare}>
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Flag className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Answers Section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            {answers.length} {answers.length === 1 ? "Respuesta" : "Respuestas"}
          </h2>

          {answers.length === 0 ? (
            <Card className="p-8 text-center">
              <MessageCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">
                Sé el primero en responder esta pregunta
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {answers
                .sort((a, b) => {
                  if (a.is_accepted) return -1;
                  if (b.is_accepted) return 1;
                  return b.vote_count - a.vote_count;
                })
                .map((answer) => (
                  <AnswerCard
                    key={answer.id}
                    answer={answer}
                    userVote={userVotes[answer.id]}
                    onVote={(voteType) =>
                      handleVote("answer", answer.id, voteType)
                    }
                    onAccept={() => handleAcceptAnswer(answer.id)}
                  />
                ))}
            </div>
          )}
        </div>

        {/* New Answer Form */}
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4">Tu Respuesta</h3>
          <Textarea
            placeholder="Escribe tu respuesta aquí... Sé claro y detallado para ayudar mejor."
            value={newAnswer}
            onChange={(e) => setNewAnswer(e.target.value)}
            rows={6}
            className="mb-4"
          />
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">
              Usa formato claro y proporciona fuentes si es posible.
            </p>
            <Button
              onClick={handleSubmitAnswer}
              disabled={!newAnswer.trim() || submitting}
            >
              <Send className="h-4 w-4 mr-2" />
              {submitting ? "Enviando..." : "Publicar Respuesta"}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

// Answer Card Component
function AnswerCard({
  answer,
  userVote,
  onVote,
  onAccept,
}: {
  answer: QAAnswer;
  userVote: "upvote" | "downvote" | null | undefined;
  onVote: (voteType: "upvote" | "downvote") => void;
  onAccept: () => void;
}) {
  const author = answer.author as AuthorInfo | undefined;
  const isVerifiedDoctor = author?.doctor_details?.verified;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Card
        className={`p-6 ${answer.is_accepted ? "border-green-500 border-2 bg-green-50/50 dark:bg-green-900/10" : ""}`}
      >
        <div className="flex gap-4">
          {/* Voting */}
          <div className="flex flex-col items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className={`p-2 ${userVote === "upvote" ? "text-green-600 bg-green-50" : ""}`}
              onClick={() => onVote("upvote")}
            >
              <ArrowUp className="h-5 w-5" />
            </Button>
            <span
              className={`text-lg font-bold ${
                answer.vote_count > 0
                  ? "text-green-600"
                  : answer.vote_count < 0
                    ? "text-red-600"
                    : "text-gray-600"
              }`}
            >
              {answer.vote_count}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className={`p-2 ${userVote === "downvote" ? "text-red-600 bg-red-50" : ""}`}
              onClick={() => onVote("downvote")}
            >
              <ArrowDown className="h-5 w-5" />
            </Button>

            {answer.is_accepted ? (
              <div className="mt-2 p-2 bg-green-500 text-white rounded-full">
                <CheckCircle className="h-5 w-5" />
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 p-2 text-gray-400 hover:text-green-600"
                onClick={onAccept}
                title="Marcar como respuesta aceptada"
              >
                <CheckCircle className="h-5 w-5" />
              </Button>
            )}
          </div>

          {/* Content */}
          <div className="flex-1">
            {answer.is_accepted && (
              <Badge className="bg-green-500 text-white mb-3">
                <CheckCircle className="h-3 w-3 mr-1" />
                Respuesta Aceptada
              </Badge>
            )}

            <div className="prose dark:prose-invert max-w-none mb-4">
              <p>{answer.content}</p>
            </div>

            {/* Author Info */}
            <div className="flex items-center justify-between flex-wrap gap-4 pt-4 border-t">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={author?.avatar_url || ""} />
                  <AvatarFallback>
                    {author?.nombre_completo?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">
                      {author?.nombre_completo}
                    </span>
                    {isVerifiedDoctor && (
                      <Badge variant="secondary" className="text-xs">
                        <Shield className="h-3 w-3 mr-1" />
                        Médico Verificado
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(answer.created_at), {
                      addSuffix: true,
                      locale: es,
                    })}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <MessageCircle className="h-4 w-4 mr-1" />
                  Comentar
                </Button>
                <Button variant="ghost" size="sm">
                  <Flag className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
