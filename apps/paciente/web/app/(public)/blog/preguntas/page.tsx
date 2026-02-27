"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card } from "@red-salud/design-system";
import { Button } from "@red-salud/design-system";
import { Input } from "@red-salud/design-system";
import { Badge } from "@red-salud/design-system";
import { Tabs, TabsList, TabsTrigger } from "@red-salud/design-system";
import { Avatar, AvatarFallback, AvatarImage } from "@red-salud/design-system";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@red-salud/design-system";
import { Textarea } from "@red-salud/design-system";
import { Label } from "@red-salud/design-system";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@red-salud/design-system";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import {
  Search,
  Eye,
  CheckCircle,
  Clock,
  Filter,
  Plus,
  TrendingUp,
  HelpCircle,
  Coins,
} from "lucide-react";
import {
  getQuestions,
  getCategories,
  getPopularTags,
  createQuestion,
} from "@/lib/api/blog";
import type {
  QAQuestion,
  BlogCategory,
  ContentTag,
  CreateQuestionInput,
  QuestionFilters,
  AuthorInfo,
} from "@red-salud/types";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<QAQuestion[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [popularTags, setPopularTags] = useState<ContentTag[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("recientes");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showNewQuestion, setShowNewQuestion] = useState(false);
  const [newQuestion, setNewQuestion] = useState<CreateQuestionInput>({
    title: "",
    content: "",
    category_id: undefined,
    tags: [],
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, searchQuery, activeTab, page]);

  async function loadInitialData() {
    try {
      const [categoriesData, tagsData] = await Promise.all([
        getCategories(),
        getPopularTags(15),
      ]);
      setCategories(categoriesData);
      setPopularTags(tagsData);
    } catch (error) {
      console.error("Error loading initial data:", error);
    }
  }

  async function loadQuestions() {
    setLoading(true);
    try {
      const filters: QuestionFilters = {
        category: selectedCategory || undefined,
        search: searchQuery || undefined,
      };

      if (activeTab === "sin-respuesta") {
        filters.unanswered = true;
      } else if (activeTab === "bounty") {
        filters.bounty = true;
      }

      const result = await getQuestions(filters, { page, limit: 10 });
      setQuestions((prev) =>
        page === 1 ? result.data : [...prev, ...result.data],
      );
      setHasMore(result.hasMore);
    } catch (error) {
      console.error("Error loading questions:", error);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
  }

  function handleTabChange(tab: string) {
    setActiveTab(tab);
    setPage(1);
  }

  async function handleCreateQuestion() {
    if (!newQuestion.title.trim() || !newQuestion.content.trim()) return;

    setSubmitting(true);
    try {
      const question = await createQuestion(newQuestion);
      setQuestions((prev) => [question, ...prev]);
      setShowNewQuestion(false);
      setNewQuestion({
        title: "",
        content: "",
        category_id: undefined,
        tags: [],
      });
    } catch (error) {
      console.error("Error creating question:", error);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-purple-600 via-purple-700 to-blue-600 text-white py-16 overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_2px_2px,white_1px,transparent_0)] bg-[length:50px_50px]" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            className="max-w-4xl mx-auto text-center"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            <motion.div
              variants={fadeInUp}
              className="flex items-center justify-center gap-2 mb-4"
            >
              <HelpCircle className="h-6 w-6 text-purple-200" />
              <span className="text-purple-200 font-medium">
                Comunidad de Salud
              </span>
            </motion.div>
            <motion.h1
              variants={fadeInUp}
              className="text-4xl sm:text-5xl font-bold mb-6"
            >
              Preguntas y Respuestas
            </motion.h1>
            <motion.p
              variants={fadeInUp}
              className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto"
            >
              Haz preguntas sobre salud y recibe respuestas de médicos
              verificados y la comunidad
            </motion.p>

            {/* Search Bar */}
            <motion.form
              variants={fadeInUp}
              onSubmit={handleSearch}
              className="max-w-2xl mx-auto mb-6"
            >
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Buscar preguntas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 py-6 text-lg rounded-full bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-purple-200 focus:bg-white focus:text-gray-900 transition-all"
                />
                <Button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white text-purple-600 hover:bg-purple-50"
                >
                  Buscar
                </Button>
              </div>
            </motion.form>

            <motion.div variants={fadeInUp}>
              <Dialog open={showNewQuestion} onOpenChange={setShowNewQuestion}>
                <DialogTrigger asChild>
                  <Button
                    size="lg"
                    className="bg-white text-purple-600 hover:bg-purple-50"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Hacer una Pregunta
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Nueva Pregunta</DialogTitle>
                    <DialogDescription>
                      Describe tu pregunta de forma clara y detallada para
                      obtener mejores respuestas.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div>
                      <Label htmlFor="title">Título de la pregunta</Label>
                      <Input
                        id="title"
                        placeholder="¿Cuál es tu pregunta?"
                        value={newQuestion.title}
                        onChange={(e) =>
                          setNewQuestion((prev) => ({
                            ...prev,
                            title: e.target.value,
                          }))
                        }
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="content">Descripción</Label>
                      <Textarea
                        id="content"
                        placeholder="Proporciona más detalles sobre tu pregunta..."
                        value={newQuestion.content}
                        onChange={(e) =>
                          setNewQuestion((prev) => ({
                            ...prev,
                            content: e.target.value,
                          }))
                        }
                        className="mt-1"
                        rows={5}
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Categoría</Label>
                      <Select
                        value={newQuestion.category_id}
                        onValueChange={(value) =>
                          setNewQuestion((prev) => ({
                            ...prev,
                            category_id: value,
                          }))
                        }
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Selecciona una categoría" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                      <Button
                        variant="outline"
                        onClick={() => setShowNewQuestion(false)}
                      >
                        Cancelar
                      </Button>
                      <Button
                        onClick={handleCreateQuestion}
                        disabled={submitting}
                      >
                        {submitting ? "Publicando..." : "Publicar Pregunta"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-white dark:bg-gray-800 border-b py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-8 text-center">
            <div>
              <p className="text-2xl font-bold text-purple-600">1,234</p>
              <p className="text-sm text-gray-500">Preguntas</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">5,678</p>
              <p className="text-sm text-gray-500">Respuestas</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">89%</p>
              <p className="text-sm text-gray-500">Resueltas</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600">456</p>
              <p className="text-sm text-gray-500">Médicos activos</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <aside className="lg:col-span-1 space-y-6">
              {/* Categories */}
              <Card className="p-5">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Filter className="h-5 w-5 text-purple-600" />
                  Categorías
                </h3>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setSelectedCategory(null);
                      setPage(1);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${!selectedCategory
                        ? "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
                        : "hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                  >
                    Todas
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => {
                        setSelectedCategory(category.id);
                        setPage(1);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${selectedCategory === category.id
                          ? "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
                          : "hover:bg-gray-100 dark:hover:bg-gray-800"
                        }`}
                    >
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      {category.name}
                    </button>
                  ))}
                </div>
              </Card>

              {/* Popular Tags */}
              <Card className="p-5">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                  Tags Populares
                </h3>
                <div className="flex flex-wrap gap-2">
                  {popularTags.map((tag) => (
                    <Badge
                      key={tag.id}
                      variant="outline"
                      className="cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-900/30"
                    >
                      #{tag.name}
                    </Badge>
                  ))}
                </div>
              </Card>

              {/* Bounty Questions */}
              <Card className="p-5 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
                  <Coins className="h-5 w-5" />
                  Con Recompensa
                </h3>
                <p className="text-sm text-yellow-700/80 dark:text-yellow-400/80 mb-3">
                  Preguntas con puntos extra por responder
                </p>
                <Button
                  variant="outline"
                  className="w-full border-yellow-400 text-yellow-700 hover:bg-yellow-100"
                  onClick={() => handleTabChange("bounty")}
                >
                  Ver preguntas
                </Button>
              </Card>
            </aside>

            {/* Questions List */}
            <div className="lg:col-span-3">
              <Tabs
                value={activeTab}
                onValueChange={handleTabChange}
                className="mb-6"
              >
                <TabsList>
                  <TabsTrigger value="recientes">Recientes</TabsTrigger>
                  <TabsTrigger value="populares">Populares</TabsTrigger>
                  <TabsTrigger value="sin-respuesta">Sin Respuesta</TabsTrigger>
                  <TabsTrigger value="bounty">
                    <Coins className="h-4 w-4 mr-1" />
                    Bounty
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {loading && page === 1 ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Card key={i} className="p-6 animate-pulse">
                      <div className="flex gap-4">
                        <div className="w-16 space-y-2">
                          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded" />
                          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded" />
                        </div>
                        <div className="flex-1 space-y-3">
                          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : questions.length === 0 ? (
                <Card className="p-12 text-center">
                  <HelpCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No hay preguntas
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {searchQuery
                      ? `No encontramos preguntas para "${searchQuery}"`
                      : "Sé el primero en hacer una pregunta"}
                  </p>
                  <Button onClick={() => setShowNewQuestion(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Hacer una pregunta
                  </Button>
                </Card>
              ) : (
                <>
                  <motion.div
                    className="space-y-4"
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                  >
                    {questions.map((question) => (
                      <motion.div key={question.id} variants={fadeInUp}>
                        <QuestionCard question={question} />
                      </motion.div>
                    ))}
                  </motion.div>

                  {hasMore && (
                    <div className="text-center mt-8">
                      <Button
                        variant="outline"
                        onClick={() => setPage((p) => p + 1)}
                        disabled={loading}
                      >
                        {loading ? "Cargando..." : "Cargar más preguntas"}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// Question Card Component
function QuestionCard({ question }: { question: QAQuestion }) {
  const author = question.author as AuthorInfo | undefined;
  const hasAcceptedAnswer = question.accepted_answer_id !== null;

  return (
    <Link href={`/blog/preguntas/${question.slug}`}>
      <Card className="p-5 hover:shadow-lg transition-all duration-300 hover:border-purple-200">
        <div className="flex gap-4">
          {/* Vote Stats */}
          <div className="flex flex-col items-center gap-2 text-center min-w-[60px]">
            <div
              className={`px-3 py-2 rounded-lg ${question.vote_count > 0
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : question.vote_count < 0
                    ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    : "bg-gray-100 text-gray-600 dark:bg-gray-800"
                }`}
            >
              <p className="text-lg font-bold">{question.vote_count}</p>
              <p className="text-xs">votos</p>
            </div>
            <div
              className={`px-3 py-2 rounded-lg ${hasAcceptedAnswer
                  ? "bg-green-500 text-white"
                  : question.answer_count > 0
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-300"
                    : "bg-gray-100 text-gray-600 dark:bg-gray-800"
                }`}
            >
              <p className="text-lg font-bold flex items-center justify-center gap-1">
                {hasAcceptedAnswer && <CheckCircle className="h-4 w-4" />}
                {question.answer_count}
              </p>
              <p className="text-xs">resp.</p>
            </div>
            <div className="text-gray-500 text-xs flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {question.view_count}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-semibold text-lg hover:text-purple-600 transition-colors line-clamp-2">
                {question.title}
              </h3>
              {question.bounty_amount > 0 && (
                <Badge className="bg-yellow-500 text-yellow-900 flex-shrink-0">
                  <Coins className="h-3 w-3 mr-1" />+{question.bounty_amount}
                </Badge>
              )}
            </div>

            <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-3">
              {question.content}
            </p>

            {/* Tags */}
            {question.tags && question.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {(question.tags as unknown[])
                  .slice(0, 4)
                  .map((tagItem: unknown) => {
                    const tagWrapper = tagItem as { tag: ContentTag };
                    return (
                      <Badge
                        key={tagWrapper.tag.id}
                        variant="secondary"
                        className="text-xs"
                      >
                        {tagWrapper.tag.name}
                      </Badge>
                    );
                  })}
              </div>
            )}

            {/* Meta */}
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Avatar className="h-5 w-5">
                  <AvatarImage src={author?.avatar_url || ""} />
                  <AvatarFallback className="text-[10px]">
                    {author?.nombre_completo?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
                <span className="truncate max-w-[100px]">
                  {author?.nombre_completo}
                </span>
                {question.category && (
                  <>
                    <span>•</span>
                    <Badge
                      variant="outline"
                      className="text-xs"
                      style={{
                        borderColor: question.category.color,
                        color: question.category.color,
                      }}
                    >
                      {question.category.name}
                    </Badge>
                  </>
                )}
              </div>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDistanceToNow(new Date(question.created_at), {
                  addSuffix: true,
                  locale: es,
                })}
              </span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
