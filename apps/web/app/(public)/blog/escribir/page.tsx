"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card } from "@red-salud/ui";
import { Button } from "@red-salud/ui";
import { Input } from "@red-salud/ui";
import { Textarea } from "@red-salud/ui";
import { Label } from "@red-salud/ui";
import { Badge } from "@red-salud/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@red-salud/ui";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@red-salud/ui";
import {
  ArrowLeft, Save, Eye, Send, X, Plus,
  BookOpen, Shield, AlertCircle, CheckCircle
} from "lucide-react";
import { createPost, getCategories } from "@/lib/api/blog";
import type { BlogCategory, CreatePostInput, PostStatus } from "@red-salud/types";
import { createClient } from "@/lib/supabase/client";

export default function WritePostPage() {
  const router = useRouter();
  const supabase = createClient();

  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [isVerifiedDoctor, setIsVerifiedDoctor] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("escribir");

  const [post, setPost] = useState<CreatePostInput>({
    title: "",
    content: "",
    excerpt: "",
    category_id: undefined,
    tags: [],
    cover_image: "",
    status: "draft",
  });

  const [newTag, setNewTag] = useState("");

  useEffect(() => {
    checkUserAndLoadData();
  }, [checkUserAndLoadData]);

  const checkUserAndLoadData = useCallback(async () => {
    setLoading(true);
    try {
      // Check if user is logged in and is a verified doctor
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setIsVerifiedDoctor(false);
        setLoading(false);
        return;
      }

      // Check if user is a verified doctor
      const { data: doctorDetails } = await supabase
        .from('doctor_details')
        .select('verified')
        .eq('profile_id', user.id)
        .single();

      setIsVerifiedDoctor(doctorDetails?.verified || false);

      // Load categories
      const categoriesData = await getCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error("Error checking user:", error);
      setIsVerifiedDoctor(false);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  function handleAddTag() {
    if (newTag.trim() && !post.tags?.includes(newTag.trim())) {
      setPost(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()],
      }));
      setNewTag("");
    }
  }

  function handleRemoveTag(tag: string) {
    setPost(prev => ({
      ...prev,
      tags: prev.tags?.filter(t => t !== tag) || [],
    }));
  }

  async function handleSave(status: PostStatus) {
    if (!post.title.trim() || !post.content.trim()) {
      alert("Por favor completa el título y contenido del artículo");
      return;
    }

    setSaving(true);
    try {
      const createdPost = await createPost({
        ...post,
        status,
      });

      if (status === 'published') {
        router.push(`/blog/${createdPost.slug}`);
      } else {
        alert("Borrador guardado exitosamente");
      }
    } catch (error) {
      console.error("Error saving post:", error);
      alert("Error al guardar el artículo");
    } finally {
      setSaving(false);
    }
  }

  // Calculate reading time
  const wordCount = post.content.split(/\s+/).filter(Boolean).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!isVerifiedDoctor) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 border-b">
          <div className="container mx-auto px-4 py-4">
            <Link href="/blog" className="inline-flex items-center text-gray-600 hover:text-blue-600 transition-colors">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al blog
            </Link>
          </div>
        </div>

        <div className="container mx-auto px-4 py-16 max-w-2xl">
          <Card className="p-8 text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="h-8 w-8 text-yellow-600" />
            </div>
            <h1 className="text-2xl font-bold mb-4">Acceso Restringido</h1>
            <p className="text-gray-600 mb-6">
              Solo los médicos verificados pueden escribir artículos en el blog.
              Esto garantiza la calidad y veracidad del contenido médico.
            </p>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                ¿Eres médico?
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-400">
                Completa tu perfil profesional y verifica tu licencia médica para
                poder publicar artículos y responder preguntas de la comunidad.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/registro?role=medico">
                <Button>
                  Registrarme como Médico
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline">
                  Ya tengo cuenta
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/blog" className="inline-flex items-center text-gray-600 hover:text-blue-600 transition-colors">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al blog
            </Link>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => handleSave('draft')}
                disabled={saving}
              >
                <Save className="h-4 w-4 mr-2" />
                Guardar borrador
              </Button>
              <Button
                onClick={() => handleSave('published')}
                disabled={saving || !post.title.trim() || !post.content.trim()}
              >
                <Send className="h-4 w-4 mr-2" />
                {saving ? 'Publicando...' : 'Publicar'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Editor */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-6">
                  <TabsTrigger value="escribir">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Escribir
                  </TabsTrigger>
                  <TabsTrigger value="preview">
                    <Eye className="h-4 w-4 mr-2" />
                    Vista Previa
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="escribir">
                  <Card className="p-6">
                    {/* Title */}
                    <div className="mb-6">
                      <Input
                        placeholder="Título del artículo..."
                        value={post.title}
                        onChange={(e) => setPost(prev => ({ ...prev, title: e.target.value }))}
                        className="text-2xl font-bold border-0 border-b rounded-none px-0 focus-visible:ring-0 focus-visible:border-blue-500"
                      />
                    </div>

                    {/* Excerpt */}
                    <div className="mb-6">
                      <Label className="text-sm text-gray-500 mb-2 block">
                        Resumen (aparecerá en las tarjetas del blog)
                      </Label>
                      <Textarea
                        placeholder="Escribe un breve resumen del artículo..."
                        value={post.excerpt}
                        onChange={(e) => setPost(prev => ({ ...prev, excerpt: e.target.value }))}
                        rows={2}
                        className="resize-none"
                      />
                    </div>

                    {/* Content */}
                    <div className="mb-6">
                      <Label className="text-sm text-gray-500 mb-2 block">
                        Contenido del artículo
                      </Label>
                      <Textarea
                        placeholder="Escribe el contenido de tu artículo aquí...

Puedes usar formato Markdown:
- **negrita** para texto importante
- *cursiva* para énfasis
- ## para subtítulos
- - para listas

Recuerda citar fuentes cuando sea necesario."
                        value={post.content}
                        onChange={(e) => setPost(prev => ({ ...prev, content: e.target.value }))}
                        rows={20}
                        className="font-mono text-sm"
                      />
                    </div>

                    {/* Word count */}
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{wordCount} palabras</span>
                      <span>~{readingTime} min de lectura</span>
                    </div>
                  </Card>
                </TabsContent>

                <TabsContent value="preview">
                  <Card className="p-6">
                    {post.cover_image && (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={post.cover_image}
                        alt="Cover"
                        className="w-full h-64 object-cover rounded-lg mb-6"
                      />
                    )}
                    <h1 className="text-3xl font-bold mb-4">
                      {post.title || "Título del artículo"}
                    </h1>
                    {post.excerpt && (
                      <p className="text-lg text-gray-600 mb-6 italic">
                        {post.excerpt}
                      </p>
                    )}
                    <div className="prose dark:prose-invert max-w-none">
                      {post.content ? (
                        <div style={{ whiteSpace: 'pre-wrap' }}>{post.content}</div>
                      ) : (
                        <p className="text-gray-400">El contenido aparecerá aquí...</p>
                      )}
                    </div>
                  </Card>
                </TabsContent>
              </Tabs>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Category */}
            <Card className="p-5">
              <Label className="font-semibold mb-3 block">Categoría</Label>
              <Select
                value={post.category_id}
                onValueChange={(value) => setPost(prev => ({ ...prev, category_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: cat.color }}
                        />
                        {cat.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Card>

            {/* Tags */}
            <Card className="p-5">
              <Label className="font-semibold mb-3 block">Tags</Label>
              <div className="flex gap-2 mb-3">
                <Input
                  placeholder="Agregar tag..."
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                />
                <Button variant="outline" size="icon" onClick={handleAddTag}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {post.tags?.map((tag) => (
                  <Badge key={tag} variant="secondary" className="pr-1">
                    #{tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </Card>

            {/* Cover Image */}
            <Card className="p-5">
              <Label className="font-semibold mb-3 block">Imagen de portada</Label>
              <Input
                placeholder="URL de la imagen..."
                value={post.cover_image}
                onChange={(e) => setPost(prev => ({ ...prev, cover_image: e.target.value }))}
              />
              {post.cover_image && (
                <div className="mt-3 relative">
                  <img
                    src={post.cover_image}
                    alt="Preview"
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => setPost(prev => ({ ...prev, cover_image: '' }))}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </Card>

            {/* Tips */}
            <Card className="p-5 bg-blue-50 dark:bg-blue-900/20 border-blue-200">
              <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-3 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Consejos para un buen artículo
              </h3>
              <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-2">
                <li>• Usa un título claro y descriptivo</li>
                <li>• Incluye fuentes y referencias</li>
                <li>• Estructura el contenido con subtítulos</li>
                <li>• Evita jerga médica excesiva</li>
                <li>• Revisa la ortografía antes de publicar</li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
