# Ejemplos de Uso - ICD-11 API

## 📋 Casos de Uso Comunes

### 1. Autocompletado en Formularios

```tsx
import { ICD10Autocomplete } from "@/components/dashboard/medico/icd10-autocomplete";

function ConsultaForm() {
  const [diagnosticos, setDiagnosticos] = useState<string[]>([]);

  return (
    <div>
      <label>Diagnósticos</label>
      <ICD10Autocomplete
        value={diagnosticos}
        onChange={setDiagnosticos}
        placeholder="Buscar diagnóstico..."
      />
    </div>
  );
}
```

### 2. Búsqueda Programática

```typescript
import { searchICD11 } from "@/lib/services/icd-api-service";

async function buscarDiagnosticos(sintomas: string[]) {
  const resultados = [];
  
  for (const sintoma of sintomas) {
    const codes = await searchICD11(sintoma);
    resultados.push(...codes);
  }
  
  return resultados;
}

// Uso
const diagnosticos = await buscarDiagnosticos([
  "fiebre",
  "tos",
  "dolor de cabeza"
]);
```

### 3. Validación de Códigos en Formulario

```typescript
import { validateICD11Code } from "@/lib/services/icd-api-service";

async function validarDiagnostico(codigo: string) {
  const esValido = await validateICD11Code(codigo);
  
  if (!esValido) {
    throw new Error(`Código ICD-11 inválido: ${codigo}`);
  }
  
  return true;
}
```

### 4. Búsqueda con Filtros

```typescript
import { searchICD11 } from "@/lib/services/icd-api-service";

async function buscarPorCategoria(termino: string, categoria: string) {
  const resultados = await searchICD11(termino);
  
  // Filtrar por capítulo/categoría
  return resultados.filter(r => 
    r.chapter?.toLowerCase().includes(categoria.toLowerCase())
  );
}

// Uso
const enfermedadesRespiratorias = await buscarPorCategoria(
  "infección",
  "respiratorias"
);
```

### 5. Obtener Detalles Completos

```typescript
import { getICD11Entity } from "@/lib/services/icd-api-service";

async function obtenerDetallesDiagnostico(entityId: string) {
  const entidad = await getICD11Entity(entityId);
  
  if (!entidad) {
    return null;
  }
  
  return {
    titulo: entidad.title?.["@value"],
    definicion: entidad.definition?.["@value"],
    codigo: entidad.code,
    padres: entidad.parent,
    hijos: entidad.child,
  };
}
```

### 6. Búsqueda con Sugerencias

```typescript
import { getICD11Suggestions } from "@/lib/services/icd-api-service";

async function obtenerSugerencias(textoLibre: string) {
  // Obtener sugerencias basadas en texto libre
  const sugerencias = await getICD11Suggestions(textoLibre);
  
  // Ordenar por score
  return sugerencias.sort((a, b) => (b.score || 0) - (a.score || 0));
}

// Uso
const sugerencias = await obtenerSugerencias(
  "paciente con dolor de pecho y dificultad para respirar"
);
```

### 7. Hook Personalizado para React

```typescript
// hooks/use-icd11-search.ts
import { useState, useEffect } from "react";

export function useICD11Search(query: string, minLength = 3) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (query.length < minLength) {
      setResults([]);
      return;
    }

    const search = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(
          `/api/icd11/search?q=${encodeURIComponent(query)}`
        );
        const data = await response.json();
        
        if (data.success) {
          setResults(data.data);
        } else {
          setError(data.error);
        }
      } catch (err) {
        setError("Error al buscar códigos");
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(search, 500);
    return () => clearTimeout(debounce);
  }, [query, minLength]);

  return { results, loading, error };
}

// Uso en componente
function MiComponente() {
  const [query, setQuery] = useState("");
  const { results, loading, error } = useICD11Search(query);

  return (
    <div>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      {loading && <p>Buscando...</p>}
      {error && <p>Error: {error}</p>}
      {results.map(r => <div key={r.id}>{r.code} - {r.title}</div>)}
    </div>
  );
}
```

### 8. Búsqueda Múltiple Paralela

```typescript
import { searchICD11 } from "@/lib/services/icd-api-service";

async function buscarMultiples(terminos: string[]) {
  // Ejecutar búsquedas en paralelo
  const promesas = terminos.map(termino => searchICD11(termino));
  const resultados = await Promise.all(promesas);
  
  // Combinar y eliminar duplicados
  const todosLosResultados = resultados.flat();
  const unicos = Array.from(
    new Map(todosLosResultados.map(r => [r.id, r])).values()
  );
  
  return unicos;
}

// Uso
const diagnosticos = await buscarMultiples([
  "diabetes",
  "hipertensión",
  "obesidad"
]);
```

### 9. Cache Local para Búsquedas Frecuentes

```typescript
// lib/services/icd11-cache.ts
const CACHE_KEY = "icd11_cache";
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas

interface CacheEntry {
  data: any;
  timestamp: number;
}

export function getCachedSearch(query: string): any | null {
  try {
    const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || "{}");
    const entry: CacheEntry = cache[query];
    
    if (!entry) return null;
    
    // Verificar si expiró
    if (Date.now() - entry.timestamp > CACHE_DURATION) {
      return null;
    }
    
    return entry.data;
  } catch {
    return null;
  }
}

export function setCachedSearch(query: string, data: any): void {
  try {
    const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || "{}");
    cache[query] = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.error("Error caching search:", error);
  }
}

// Uso con cache
import { searchICD11 } from "@/lib/services/icd-api-service";
import { getCachedSearch, setCachedSearch } from "@/lib/services/icd11-cache";

async function buscarConCache(query: string) {
  // Intentar obtener del cache
  const cached = getCachedSearch(query);
  if (cached) {
    return cached;
  }
  
  // Si no está en cache, buscar en API
  const results = await searchICD11(query);
  
  // Guardar en cache
  setCachedSearch(query, results);
  
  return results;
}
```

### 10. Integración con Formularios React Hook Form

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { validateICD11Code } from "@/lib/services/icd-api-service";

const consultaSchema = z.object({
  diagnosticos: z.array(z.string()).min(1, "Debe agregar al menos un diagnóstico"),
  notas: z.string().optional(),
});

function ConsultaForm() {
  const form = useForm({
    resolver: zodResolver(consultaSchema),
    defaultValues: {
      diagnosticos: [],
      notas: "",
    },
  });

  const onSubmit = async (data: any) => {
    // Validar todos los códigos antes de enviar
    const codigosValidos = await Promise.all(
      data.diagnosticos.map(async (diag: string) => {
        const codigo = diag.split(" - ")[0];
        return await validateICD11Code(codigo);
      })
    );

    if (codigosValidos.every(v => v)) {
      console.log("Todos los códigos son válidos", data);
      // Enviar formulario
    } else {
      console.error("Algunos códigos no son válidos");
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Campos del formulario */}
    </form>
  );
}
```

## 🎯 Mejores Prácticas

1. **Debounce**: Siempre usa debounce (500ms) para búsquedas en tiempo real
2. **Cache**: Implementa cache local para búsquedas frecuentes
3. **Error Handling**: Maneja errores de red y API gracefully
4. **Loading States**: Muestra indicadores de carga al usuario
5. **Validación**: Valida códigos antes de guardar en base de datos
6. **Límite de Resultados**: Limita resultados a 10-15 para mejor UX
7. **Accesibilidad**: Usa ARIA labels y keyboard navigation

## 🔒 Seguridad

- ✅ Las credenciales están en variables de entorno del servidor
- ✅ Los tokens OAuth2 nunca se exponen al cliente
- ✅ Las API routes actúan como proxy seguro
- ✅ Rate limiting implementado en el servicio

## 📊 Monitoreo

```typescript
// Agregar logging para monitorear uso
import { searchICD11 } from "@/lib/services/icd-api-service";

async function buscarConLog(query: string, userId: string) {
  const startTime = Date.now();
  
  try {
    const results = await searchICD11(query);
    
    // Log exitoso
    console.log({
      event: "icd11_search",
      userId,
      query,
      resultsCount: results.length,
      duration: Date.now() - startTime,
    });
    
    return results;
  } catch (error) {
    // Log error
    console.error({
      event: "icd11_search_error",
      userId,
      query,
      error: error.message,
      duration: Date.now() - startTime,
    });
    
    throw error;
  }
}
```

---

**Nota**: Todos estos ejemplos están listos para usar en tu proyecto Red-Salud.
