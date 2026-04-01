"use client";

import { cn } from "@red-salud/core/utils";
import { ArrowLeft, Eye, X, Plus } from "lucide-react";
import { useState } from "react";

import type { PostCategory, CreatePostData } from "@/lib/services/community-service";

interface CreatePostFormProps {
  specialties: { id: string; name: string }[];
  onSubmit: (data: CreatePostData) => Promise<boolean>;
  onBack: () => void;
  loading: boolean;
}

const CATEGORIES: { value: PostCategory; label: string; description: string }[] = [
  {
    value: "pregunta",
    label: "Pregunta",
    description: "Haz una consulta a la comunidad",
  },
  {
    value: "experiencia",
    label: "Experiencia",
    description: "Comparte tu experiencia de salud",
  },
  {
    value: "tip",
    label: "Tip",
    description: "Comparte un consejo util",
  },
];

export function CreatePostForm({
  specialties,
  onSubmit,
  onBack,
  loading,
}: CreatePostFormProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<PostCategory>("pregunta");
  const [specialtyId, setSpecialtyId] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !tags.includes(tag) && tags.length < 5) {
      setTags([...tags, tag]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = "El titulo es obligatorio";
    if (title.trim().length < 5)
      newErrors.title = "El titulo debe tener al menos 5 caracteres";
    if (!content.trim()) newErrors.content = "El contenido es obligatorio";
    if (content.trim().length < 20)
      newErrors.content = "El contenido debe tener al menos 20 caracteres";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    const success = await onSubmit({
      title: title.trim(),
      content: content.trim(),
      category,
      specialty_id: specialtyId || undefined,
      tags: tags.length > 0 ? tags : undefined,
    });
    if (success) {
      onBack();
    }
  };

  if (showPreview) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => setShowPreview(false)}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al editor
        </button>

        <div className="bg-white border border-gray-100 rounded-xl p-4 sm:p-6">
          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 mb-3">
            {CATEGORIES.find((c) => c.value === category)?.label || category}
          </span>
          <h1 className="text-xl font-bold text-gray-900 mb-4">{title}</h1>
          <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
            {content}
          </p>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-4">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 bg-gray-50 text-gray-500 rounded-full text-xs"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setShowPreview(false)}
            className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Editar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 px-4 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-medium hover:bg-emerald-600 transition-colors disabled:opacity-50"
          >
            {loading ? "Publicando..." : "Publicar"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Back */}
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver
      </button>

      <h1 className="text-xl font-bold text-gray-900">Crear publicacion</h1>

      {/* Category selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tipo de publicacion
        </label>
        <div className="grid grid-cols-3 gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => setCategory(cat.value)}
              className={cn(
                "p-3 rounded-xl border text-center transition-all",
                category === cat.value
                  ? "border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500"
                  : "border-gray-200 hover:border-emerald-300"
              )}
            >
              <p className="text-sm font-semibold text-gray-900">
                {cat.label}
              </p>
              <p className="text-[10px] text-gray-500 mt-0.5">
                {cat.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Titulo
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Escribe un titulo claro y descriptivo"
          maxLength={200}
          className={cn(
            "w-full px-3 py-2.5 bg-white border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition",
            errors.title ? "border-red-300" : "border-gray-200"
          )}
        />
        {errors.title && (
          <p className="text-xs text-red-500 mt-1">{errors.title}</p>
        )}
        <p className="text-xs text-gray-400 mt-1 text-right">
          {title.length}/200
        </p>
      </div>

      {/* Specialty (optional) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Especialidad{" "}
          <span className="text-gray-400 font-normal">(opcional)</span>
        </label>
        <select
          value={specialtyId}
          onChange={(e) => setSpecialtyId(e.target.value)}
          className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition appearance-none"
        >
          <option value="">Seleccionar especialidad</option>
          {specialties.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* Content */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Contenido
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Describe tu pregunta, experiencia o tip con el mayor detalle posible..."
          rows={6}
          className={cn(
            "w-full px-3 py-2.5 bg-white border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition resize-none",
            errors.content ? "border-red-300" : "border-gray-200"
          )}
        />
        {errors.content && (
          <p className="text-xs text-red-500 mt-1">{errors.content}</p>
        )}
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Etiquetas{" "}
          <span className="text-gray-400 font-normal">(max 5)</span>
        </label>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-xs"
            >
              #{tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="hover:text-red-500 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
        {tags.length < 5 && (
          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              placeholder="Escribe y presiona Enter"
              className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
            />
            <button
              type="button"
              onClick={addTag}
              disabled={!tagInput.trim()}
              className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={() => {
            if (validate()) setShowPreview(true);
          }}
          className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-1"
        >
          <Eye className="h-4 w-4" />
          Vista previa
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="flex-1 px-4 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-medium hover:bg-emerald-600 transition-colors disabled:opacity-50"
        >
          {loading ? "Publicando..." : "Publicar"}
        </button>
      </div>
    </div>
  );
}
