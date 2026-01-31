"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card } from "@red-salud/ui";
import { Button } from "@red-salud/ui";
import { Badge } from "@red-salud/ui";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@red-salud/ui";
import { Avatar, AvatarFallback, AvatarImage } from "@red-salud/ui";
import { Switch } from "@red-salud/ui";
import { Label } from "@red-salud/ui";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import {
  ArrowLeft,
  Users,
  Tag,
  FolderOpen,
  Bell,
  CheckCircle,
  Trash2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Subscription {
  id: string;
  type: "author" | "category" | "tag";
  name: string;
  avatar?: string;
  isVerified?: boolean;
  notifyPosts: boolean;
  notifyAnswers: boolean;
}

interface AuthorSubscriptionRow {
  id: string;
  notify_new_posts: boolean;
  notify_new_answers: boolean;
  author: {
    id: string;
    nombre_completo: string | null;
    avatar_url: string | null;
    doctor_details: {
      verified: boolean | null;
    } | null;
  } | null;
}

interface CategorySubscriptionRow {
  id: string;
  notify_new_posts: boolean;
  notify_new_questions: boolean;
  category: {
    id: string;
    name: string;
  } | null;
}

interface TagSubscriptionRow {
  id: string;
  tag: {
    id: string;
    name: string;
  } | null;
}

export default function SubscriptionsPage() {
  const supabase = createClient();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("autores");

  useEffect(() => {
    loadSubscriptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadSubscriptions() {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Load author subscriptions
      const { data: authorSubs } = await supabase
        .from("author_subscriptions")
        .select(
          `
          id, notify_new_posts, notify_new_answers,
          author:profiles!author_id(id, nombre_completo, avatar_url, doctor_details(verified))
        `,
        )
        .eq("subscriber_id", user.id);

      // Load category subscriptions
      const { data: categorySubs } = await supabase
        .from("category_subscriptions")
        .select(
          `
          id, notify_new_posts, notify_new_questions,
          category:blog_categories!category_id(id, name, color)
        `,
        )
        .eq("user_id", user.id);

      // Load tag subscriptions
      const { data: tagSubs } = await supabase
        .from("tag_subscriptions")
        .select(
          `
          id,
          tag:content_tags!tag_id(id, name)
        `,
        )
        .eq("user_id", user.id);

      const allSubs: Subscription[] = [
        ...(authorSubs || []).map((s: unknown) => {
          const row = s as AuthorSubscriptionRow;
          return {
            id: row.id,
            type: "author" as const,
            name: row.author?.nombre_completo || "Usuario",
            avatar: row.author?.avatar_url ?? undefined,
            isVerified: row.author?.doctor_details?.verified ?? undefined,
            notifyPosts: row.notify_new_posts,
            notifyAnswers: row.notify_new_answers,
          };
        }),
        ...(categorySubs || []).map((s: unknown) => {
          const row = s as CategorySubscriptionRow;
          return {
            id: row.id,
            type: "category" as const,
            name: row.category?.name || "Categoría",
            notifyPosts: row.notify_new_posts,
            notifyAnswers: row.notify_new_questions,
          };
        }),
        ...(tagSubs || []).map((s: unknown) => {
          const row = s as TagSubscriptionRow;
          return {
            id: row.id,
            type: "tag" as const,
            name: row.tag?.name || "Tag",
            notifyPosts: true,
            notifyAnswers: true,
          };
        }),
      ];

      setSubscriptions(allSubs);
    } catch (error) {
      console.error("Error loading subscriptions:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleUnsubscribe(subscription: Subscription) {
    try {
      const table =
        subscription.type === "author"
          ? "author_subscriptions"
          : subscription.type === "category"
            ? "category_subscriptions"
            : "tag_subscriptions";

      await supabase.from(table).delete().eq("id", subscription.id);
      setSubscriptions((prev) => prev.filter((s) => s.id !== subscription.id));
    } catch (error) {
      console.error("Error unsubscribing:", error);
    }
  }

  async function handleToggleNotification(
    subscription: Subscription,
    field: "notifyPosts" | "notifyAnswers",
  ) {
    try {
      const table =
        subscription.type === "author"
          ? "author_subscriptions"
          : "category_subscriptions";

      const updateField =
        field === "notifyPosts"
          ? subscription.type === "author"
            ? "notify_new_posts"
            : "notify_new_posts"
          : subscription.type === "author"
            ? "notify_new_answers"
            : "notify_new_questions";

      await supabase
        .from(table)
        .update({ [updateField]: !subscription[field] })
        .eq("id", subscription.id);

      setSubscriptions((prev) =>
        prev.map((s) =>
          s.id === subscription.id ? { ...s, [field]: !s[field] } : s,
        ),
      );
    } catch (error) {
      console.error("Error updating notification:", error);
    }
  }

  const authorSubs = subscriptions.filter((s) => s.type === "author");
  const categorySubs = subscriptions.filter((s) => s.type === "category");
  const tagSubs = subscriptions.filter((s) => s.type === "tag");

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

      {/* Hero */}
      <section className="bg-gradient-to-br from-teal-600 to-blue-600 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Bell className="h-12 w-12 mx-auto mb-4 text-teal-200" />
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">
              Mis Suscripciones
            </h1>
            <p className="text-lg text-teal-100 max-w-2xl mx-auto">
              Gestiona tus suscripciones y preferencias de notificación
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="autores">
                <Users className="h-4 w-4 mr-2" />
                Autores ({authorSubs.length})
              </TabsTrigger>
              <TabsTrigger value="categorias">
                <FolderOpen className="h-4 w-4 mr-2" />
                Categorías ({categorySubs.length})
              </TabsTrigger>
              <TabsTrigger value="tags">
                <Tag className="h-4 w-4 mr-2" />
                Tags ({tagSubs.length})
              </TabsTrigger>
            </TabsList>

            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Card key={i} className="p-4 animate-pulse">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <>
                <TabsContent value="autores">
                  {authorSubs.length === 0 ? (
                    <Card className="p-12 text-center">
                      <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-semibold mb-2">
                        No sigues a ningún autor
                      </h3>
                      <p className="text-gray-500 mb-4">
                        Sigue a médicos y expertos para recibir sus últimos
                        artículos
                      </p>
                      <Link href="/blog">
                        <Button>Explorar autores</Button>
                      </Link>
                    </Card>
                  ) : (
                    <motion.div
                      className="space-y-4"
                      variants={staggerContainer}
                      initial="initial"
                      animate="animate"
                    >
                      {authorSubs.map((sub) => (
                        <motion.div key={sub.id} variants={fadeInUp}>
                          <SubscriptionCard
                            subscription={sub}
                            onUnsubscribe={() => handleUnsubscribe(sub)}
                            onToggleNotification={(field) =>
                              handleToggleNotification(sub, field)
                            }
                          />
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </TabsContent>

                <TabsContent value="categorias">
                  {categorySubs.length === 0 ? (
                    <Card className="p-12 text-center">
                      <FolderOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-semibold mb-2">
                        No sigues ninguna categoría
                      </h3>
                      <p className="text-gray-500 mb-4">
                        Sigue categorías para recibir contenido de tus temas
                        favoritos
                      </p>
                      <Link href="/blog">
                        <Button>Explorar categorías</Button>
                      </Link>
                    </Card>
                  ) : (
                    <motion.div
                      className="space-y-4"
                      variants={staggerContainer}
                      initial="initial"
                      animate="animate"
                    >
                      {categorySubs.map((sub) => (
                        <motion.div key={sub.id} variants={fadeInUp}>
                          <SubscriptionCard
                            subscription={sub}
                            onUnsubscribe={() => handleUnsubscribe(sub)}
                            onToggleNotification={(field) =>
                              handleToggleNotification(sub, field)
                            }
                          />
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </TabsContent>

                <TabsContent value="tags">
                  {tagSubs.length === 0 ? (
                    <Card className="p-12 text-center">
                      <Tag className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-semibold mb-2">
                        No sigues ningún tag
                      </h3>
                      <p className="text-gray-500 mb-4">
                        Sigue tags para recibir contenido sobre temas
                        específicos
                      </p>
                      <Link href="/blog">
                        <Button>Explorar tags</Button>
                      </Link>
                    </Card>
                  ) : (
                    <motion.div
                      className="flex flex-wrap gap-3"
                      variants={staggerContainer}
                      initial="initial"
                      animate="animate"
                    >
                      {tagSubs.map((sub) => (
                        <motion.div key={sub.id} variants={fadeInUp}>
                          <Badge
                            variant="secondary"
                            className="px-4 py-2 text-sm cursor-pointer hover:bg-red-100 group"
                            onClick={() => handleUnsubscribe(sub)}
                          >
                            #{sub.name}
                            <Trash2 className="h-3 w-3 ml-2 opacity-0 group-hover:opacity-100 text-red-500 transition-opacity" />
                          </Badge>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </TabsContent>
              </>
            )}
          </Tabs>
        </div>
      </section>
    </div>
  );
}

function SubscriptionCard({
  subscription,
  onUnsubscribe,
  onToggleNotification,
}: {
  subscription: Subscription;
  onUnsubscribe: () => void;
  onToggleNotification: (field: "notifyPosts" | "notifyAnswers") => void;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-4">
        {subscription.type === "author" ? (
          <Avatar className="h-12 w-12">
            <AvatarImage src={subscription.avatar || ""} />
            <AvatarFallback>{subscription.name[0]}</AvatarFallback>
          </Avatar>
        ) : (
          <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
            {subscription.type === "category" ? (
              <FolderOpen className="h-6 w-6 text-blue-600" />
            ) : (
              <Tag className="h-6 w-6 text-blue-600" />
            )}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold truncate">{subscription.name}</h3>
            {subscription.isVerified && (
              <CheckCircle className="h-4 w-4 text-blue-500 flex-shrink-0" />
            )}
          </div>
          <p className="text-sm text-gray-500 capitalize">
            {subscription.type}
          </p>
        </div>

        {subscription.type !== "tag" && (
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Switch
                id={`posts-${subscription.id}`}
                checked={subscription.notifyPosts}
                onCheckedChange={() => onToggleNotification("notifyPosts")}
              />
              <Label
                htmlFor={`posts-${subscription.id}`}
                className="text-sm text-gray-500"
              >
                Artículos
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id={`answers-${subscription.id}`}
                checked={subscription.notifyAnswers}
                onCheckedChange={() => onToggleNotification("notifyAnswers")}
              />
              <Label
                htmlFor={`answers-${subscription.id}`}
                className="text-sm text-gray-500"
              >
                {subscription.type === "author" ? "Respuestas" : "Preguntas"}
              </Label>
            </div>
          </div>
        )}

        <Button
          variant="ghost"
          size="icon"
          className="text-red-500 hover:text-red-600 hover:bg-red-50"
          onClick={onUnsubscribe}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}
