# 🌐 Sistema de Templates de Comunidad - Guía de Implementación Futura

## Visión General

Este documento describe cómo implementar el sistema completo de templates compartidos por la comunidad médica de RED-SALUD.

## Arquitectura Propuesta

### Base de Datos (Supabase)

```sql
-- Tabla principal de templates
CREATE TABLE medical_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('general', 'especialidad', 'emergencia', 'control', 'comunidad')),
  tags TEXT[] DEFAULT '{}',
  icon TEXT DEFAULT 'FileText',
  color TEXT DEFAULT 'blue',
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  author_name TEXT,
  is_public BOOLEAN DEFAULT false,
  is_official BOOLEAN DEFAULT false,
  ai_enabled BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para búsqueda rápida
CREATE INDEX idx_templates_category ON medical_templates(category);
CREATE INDEX idx_templates_author ON medical_templates(author_id);
CREATE INDEX idx_templates_public ON medical_templates(is_public);
CREATE INDEX idx_templates_tags ON medical_templates USING GIN(tags);

-- Favoritos de usuarios
CREATE TABLE template_favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  template_id UUID REFERENCES medical_templates(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, template_id)
);

-- Likes de templates
CREATE TABLE template_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  template_id UUID REFERENCES medical_templates(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, template_id)
);

-- Historial de uso
CREATE TABLE template_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  template_id UUID REFERENCES medical_templates(id) ON DELETE CASCADE,
  used_at TIMESTAMP DEFAULT NOW()
);

-- Comentarios/Reviews (opcional)
CREATE TABLE template_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID REFERENCES medical_templates(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Row Level Security (RLS)
ALTER TABLE medical_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_reviews ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
-- Templates: Todos pueden ver públicos, solo autor puede editar
CREATE POLICY "Templates públicos visibles para todos"
  ON medical_templates FOR SELECT
  USING (is_public = true OR author_id = auth.uid());

CREATE POLICY "Usuarios pueden crear templates"
  ON medical_templates FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Autores pueden actualizar sus templates"
  ON medical_templates FOR UPDATE
  USING (auth.uid() = author_id);

CREATE POLICY "Autores pueden eliminar sus templates"
  ON medical_templates FOR DELETE
  USING (auth.uid() = author_id);

-- Favoritos: Solo el usuario puede ver/modificar sus favoritos
CREATE POLICY "Usuarios pueden ver sus favoritos"
  ON template_favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden agregar favoritos"
  ON template_favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden eliminar favoritos"
  ON template_favorites FOR DELETE
  USING (auth.uid() = user_id);

-- Similar para likes y usage
CREATE POLICY "Usuarios pueden ver sus likes"
  ON template_likes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden dar like"
  ON template_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden quitar like"
  ON template_likes FOR DELETE
  USING (auth.uid() = user_id);

-- Función para actualizar contador de uso
CREATE OR REPLACE FUNCTION increment_template_usage()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE medical_templates
  SET usage_count = usage_count + 1
  WHERE id = NEW.template_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER template_usage_trigger
  AFTER INSERT ON template_usage
  FOR EACH ROW
  EXECUTE FUNCTION increment_template_usage();

-- Función para actualizar contador de likes
CREATE OR REPLACE FUNCTION update_template_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE medical_templates
    SET likes_count = likes_count + 1
    WHERE id = NEW.template_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE medical_templates
    SET likes_count = likes_count - 1
    WHERE id = OLD.template_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER template_likes_trigger
  AFTER INSERT OR DELETE ON template_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_template_likes_count();
```

### API Routes

#### 1. Listar Templates
```typescript
// app/api/templates/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = createClient();
  const searchParams = request.nextUrl.searchParams;
  
  const category = searchParams.get("category");
  const search = searchParams.get("search");
  const userId = searchParams.get("userId");
  const onlyFavorites = searchParams.get("favorites") === "true";
  const onlyMine = searchParams.get("mine") === "true";

  let query = supabase
    .from("medical_templates")
    .select(`
      *,
      author:profiles!medical_templates_author_id_fkey(nombre_completo),
      is_favorited:template_favorites!left(user_id),
      is_liked:template_likes!left(user_id)
    `)
    .eq("is_public", true)
    .order("usage_count", { ascending: false });

  if (category && category !== "all") {
    query = query.eq("category", category);
  }

  if (search) {
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,tags.cs.{${search}}`);
  }

  if (onlyMine && userId) {
    query = query.eq("author_id", userId);
  }

  if (onlyFavorites && userId) {
    query = query.in("id", 
      supabase
        .from("template_favorites")
        .select("template_id")
        .eq("user_id", userId)
    );
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data });
}
```

#### 2. Crear Template
```typescript
// app/api/templates/route.ts
export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ success: false, error: "No autenticado" }, { status: 401 });
  }

  const body = await request.json();
  const { name, description, content, category, tags, is_public, ai_enabled } = body;

  // Validaciones
  if (!name || !content || !category) {
    return NextResponse.json(
      { success: false, error: "Campos requeridos faltantes" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("medical_templates")
    .insert({
      name,
      description,
      content,
      category,
      tags: tags || [],
      author_id: user.id,
      is_public: is_public || false,
      ai_enabled: ai_enabled !== false,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data });
}
```

#### 3. Actualizar Template
```typescript
// app/api/templates/[id]/route.ts
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ success: false, error: "No autenticado" }, { status: 401 });
  }

  const body = await request.json();
  const { name, description, content, category, tags, is_public } = body;

  const { data, error } = await supabase
    .from("medical_templates")
    .update({
      name,
      description,
      content,
      category,
      tags,
      is_public,
      updated_at: new Date().toISOString(),
    })
    .eq("id", params.id)
    .eq("author_id", user.id) // Solo el autor puede actualizar
    .select()
    .single();

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data });
}
```

#### 4. Toggle Favorito
```typescript
// app/api/templates/[id]/favorite/route.ts
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ success: false, error: "No autenticado" }, { status: 401 });
  }

  // Verificar si ya es favorito
  const { data: existing } = await supabase
    .from("template_favorites")
    .select()
    .eq("user_id", user.id)
    .eq("template_id", params.id)
    .single();

  if (existing) {
    // Eliminar favorito
    const { error } = await supabase
      .from("template_favorites")
      .delete()
      .eq("user_id", user.id)
      .eq("template_id", params.id);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, isFavorite: false });
  } else {
    // Agregar favorito
    const { error } = await supabase
      .from("template_favorites")
      .insert({
        user_id: user.id,
        template_id: params.id,
      });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, isFavorite: true });
  }
}
```

#### 5. Registrar Uso
```typescript
// app/api/templates/[id]/use/route.ts
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ success: false, error: "No autenticado" }, { status: 401 });
  }

  const { error } = await supabase
    .from("template_usage")
    .insert({
      user_id: user.id,
      template_id: params.id,
    });

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
```

### Componentes UI

#### 1. Formulario de Crear/Editar Template
```typescript
// components/dashboard/medico/template-editor-dialog.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TemplateEditorDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (template: any) => void;
  template?: any; // Para edición
}

export function TemplateEditorDialog({
  open,
  onClose,
  onSave,
  template,
}: TemplateEditorDialogProps) {
  const [formData, setFormData] = useState({
    name: template?.name || "",
    description: template?.description || "",
    content: template?.content || "",
    category: template?.category || "general",
    tags: template?.tags?.join(", ") || "",
    is_public: template?.is_public || false,
    ai_enabled: template?.ai_enabled !== false,
  });

  const handleSubmit = async () => {
    const templateData = {
      ...formData,
      tags: formData.tags.split(",").map((t) => t.trim()).filter(Boolean),
    };

    onSave(templateData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {template ? "Editar Template" : "Crear Nuevo Template"}
          </DialogTitle>
          <DialogDescription>
            Crea un template personalizado para tus notas médicas
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 p-6">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre del Template *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ej: Consulta Cardiológica"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Breve descripción del template"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoría *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="especialidad">Especialidad</SelectItem>
                <SelectItem value="emergencia">Emergencia</SelectItem>
                <SelectItem value="control">Control</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Etiquetas (separadas por comas)</Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="cardiología, hipertensión, control"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Contenido del Template *</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Escribe el contenido del template..."
              className="min-h-[300px] font-mono"
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <Label htmlFor="is_public">Template Público</Label>
              <p className="text-xs text-gray-500">
                Permitir que otros médicos usen este template
              </p>
            </div>
            <Switch
              id="is_public"
              checked={formData.is_public}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, is_public: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <Label htmlFor="ai_enabled">Autocompletado IA</Label>
              <p className="text-xs text-gray-500">
                Habilitar sugerencias inteligentes al usar este template
              </p>
            </div>
            <Switch
              id="ai_enabled"
              checked={formData.ai_enabled}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, ai_enabled: checked })
              }
            />
          </div>
        </div>

        <div className="flex gap-2 p-6 border-t">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button onClick={handleSubmit} className="flex-1">
            {template ? "Actualizar" : "Crear"} Template
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

### Integración con Marketplace Existente

Actualizar `template-marketplace.tsx` para cargar templates de Supabase:

```typescript
// En template-marketplace.tsx
useEffect(() => {
  const loadTemplates = async () => {
    try {
      const response = await fetch(`/api/templates?userId=${userId}`);
      const data = await response.json();
      
      if (data.success) {
        // Combinar templates oficiales con los de la comunidad
        setTemplates([...OFFICIAL_TEMPLATES, ...data.data]);
      }
    } catch (error) {
      console.error("Error loading templates:", error);
    }
  };

  if (open && userId) {
    loadTemplates();
  }
}, [open, userId]);
```

## Roadmap de Implementación

### Fase 1: Base de Datos (1-2 días)
- [ ] Crear tablas en Supabase
- [ ] Configurar RLS
- [ ] Migrar templates oficiales a BD
- [ ] Testing de queries

### Fase 2: API Routes (2-3 días)
- [ ] CRUD de templates
- [ ] Sistema de favoritos
- [ ] Sistema de likes
- [ ] Registro de uso
- [ ] Testing de endpoints

### Fase 3: UI Components (3-4 días)
- [ ] Formulario de crear/editar
- [ ] Integración con marketplace
- [ ] Mis templates (página dedicada)
- [ ] Estadísticas de uso
- [ ] Testing de componentes

### Fase 4: Features Avanzados (5-7 días)
- [ ] Sistema de reviews/comentarios
- [ ] Búsqueda avanzada
- [ ] Recomendaciones personalizadas
- [ ] Exportar/importar templates
- [ ] Moderación de contenido

## Consideraciones de Seguridad

1. **Validación de Contenido:**
   - Sanitizar HTML/scripts en templates
   - Limitar tamaño de templates (max 50KB)
   - Validar estructura de datos

2. **Rate Limiting:**
   - Máximo 10 templates por usuario
   - Máximo 100 usos por día
   - Cooldown de 1 minuto entre creaciones

3. **Moderación:**
   - Flag de templates inapropiados
   - Review manual de templates públicos
   - Sistema de reportes

## Métricas y Analytics

Trackear:
- Templates más usados
- Templates más gustados
- Usuarios más activos
- Categorías populares
- Tiempo promedio de uso

## Conclusión

Este sistema permitirá a la comunidad médica de RED-SALUD compartir conocimiento y mejorar la eficiencia en la documentación clínica.
