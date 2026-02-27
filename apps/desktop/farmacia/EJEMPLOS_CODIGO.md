# 💻 Ejemplos de Código - App Tauri Farmacia

## 📝 Tabla de Contenidos

1. [Configuración](#configuración)
2. [Autenticación](#autenticación)
3. [Hooks de Supabase](#hooks-de-supabase)
4. [Servicios](#servicios)
5. [Componentes](#componentes)
6. [Stores](#stores)
7. [Comandos Tauri](#comandos-tauri)

---

## 🔧 Configuración

### `.env`
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### `.env.example`
```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

---

## 🔐 Autenticación

### `src/hooks/useAuth.ts`
```typescript
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import type { User } from '@supabase/supabase-js';

export function useAuth() {
  const [loading, setLoading] = useState(true);
  const { setUser, setToken, logout } = useAuthStore();

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
        setToken(session.access_token);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUser(session.user);
        setToken(session.access_token);
      } else {
        logout();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    logout();
  };

  return {
    loading,
    signIn,
    signOut,
  };
}
```

### `src/services/auth.service.ts`
```typescript
import { supabase } from '@/lib/supabase';

export class AuthService {
  static async login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // Get user role from pharmacy_users table
    const { data: userData, error: userError } = await supabase
      .from('pharmacy_users')
      .select('role, first_name, last_name')
      .eq('id', data.user.id)
      .single();

    if (userError) throw userError;

    return {
      user: data.user,
      session: data.session,
      role: userData.role,
      name: `${userData.first_name} ${userData.last_name}`,
    };
  }

  static async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  static async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  }
}
```

---

## 🪝 Hooks de Supabase

### `src/hooks/useProducts.ts`
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Product } from '@/types/product.types';

export function useProducts() {
  const queryClient = useQueryClient();

  // Get all products
  const { data: products, isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          batches (
            id,
            lot_number,
            expiry_date,
            quantity,
            warehouse_id
          )
        `)
        .order('name');

      if (error) throw error;
      return data as Product[];
    },
  });

  // Search products
  const searchProducts = async (query: string) => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .or(`name.ilike.%${query}%,sku.ilike.%${query}%,barcode.eq.${query}`)
      .limit(20);

    if (error) throw error;
    return data;
  };

  // Create product
  const createProduct = useMutation({
    mutationFn: async (product: Partial<Product>) => {
      const { data, error } = await supabase
        .from('products')
        .insert(product)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  // Update product
  const updateProduct = useMutation({
    mutationFn: async ({ id, ...product }: Partial<Product> & { id: string }) => {
      const { data, error } = await supabase
        .from('products')
        .update(product)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  // Delete product
  const deleteProduct = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  return {
    products,
    isLoading,
    error,
    searchProducts,
    createProduct: createProduct.mutate,
    updateProduct: updateProduct.mutate,
    deleteProduct: deleteProduct.mutate,
  };
}
```

### `src/hooks/useInvoices.ts`
```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Invoice, InvoiceItem } from '@/types/invoice.types';

export function useInvoices() {
  const queryClient = useQueryClient();

  const createInvoice = useMutation({
    mutationFn: async ({
      invoice,
      items,
    }: {
      invoice: Partial<Invoice>;
      items: InvoiceItem[];
    }) => {
      // Start transaction
      const { data: invoiceData, error: invoiceError } = await supabase
        .from('invoices')
        .insert(invoice)
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      // Insert items
      const itemsWithInvoiceId = items.map(item => ({
        ...item,
        invoice_id: invoiceData.id,
      }));

      const { error: itemsError } = await supabase
        .from('invoice_items')
        .insert(itemsWithInvoiceId);

      if (itemsError) throw itemsError;

      // Update stock (FEFO - First Expired First Out)
      for (const item of items) {
        // Get batches ordered by expiry date
        const { data: batches, error: batchError } = await supabase
          .from('batches')
          .select('*')
          .eq('product_id', item.product_id)
          .gt('quantity', 0)
          .order('expiry_date', { ascending: true });

        if (batchError) throw batchError;

        let remainingQty = item.quantity;

        for (const batch of batches) {
          if (remainingQty <= 0) break;

          const qtyToDeduct = Math.min(remainingQty, batch.quantity);

          const { error: updateError } = await supabase
            .from('batches')
            .update({ quantity: batch.quantity - qtyToDeduct })
            .eq('id', batch.id);

          if (updateError) throw updateError;

          remainingQty -= qtyToDeduct;
        }
      }

      return invoiceData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['batches'] });
    },
  });

  return {
    createInvoice: createInvoice.mutate,
    isCreating: createInvoice.isPending,
  };
}
```

---

## 🛠️ Servicios

### `src/services/products.service.ts`
```typescript
import { supabase } from '@/lib/supabase';
import type { Product } from '@/types/product.types';

export class ProductsService {
  static async getAll() {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('name');

    if (error) throw error;
    return data;
  }

  static async getById(id: string) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  static async search(query: string) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .or(`name.ilike.%${query}%,sku.ilike.%${query}%,barcode.eq.${query}`)
      .limit(20);

    if (error) throw error;
    return data;
  }

  static async create(product: Partial<Product>) {
    const { data, error } = await supabase
      .from('products')
      .insert(product)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async update(id: string, product: Partial<Product>) {
    const { data, error } = await supabase
      .from('products')
      .update(product)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async delete(id: string) {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  static async getLowStock(threshold: number = 10) {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        batches!inner (
          quantity
        )
      `)
      .lte('batches.quantity', threshold);

    if (error) throw error;
    return data;
  }

  static async getExpiringSoon(days: number = 30) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        batches!inner (
          expiry_date,
          quantity
        )
      `)
      .lte('batches.expiry_date', futureDate.toISOString());

    if (error) throw error;
    return data;
  }
}
```

---

## 🧩 Componentes

### `src/components/auth/PrivateRoute.tsx`
```typescript
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

interface PrivateRouteProps {
  children: React.ReactNode;
  requiredRole?: string[];
}

export function PrivateRoute({ children, requiredRole }: PrivateRouteProps) {
  const { user, token } = useAuthStore();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && !requiredRole.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
```

### `src/components/products/ProductSearch.tsx`
```typescript
import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@red-salud/design-system';
import { ProductsService } from '@/services/products.service';
import type { Product } from '@/types/product.types';

interface ProductSearchProps {
  onSelect: (product: Product) => void;
}

export function ProductSearch({ onSelect }: ProductSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const searchProducts = async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const products = await ProductsService.search(query);
        setResults(products);
      } catch (error) {
        console.error('Error searching products:', error);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(searchProducts, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar producto por nombre, SKU o código de barras..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {results.length > 0 && (
        <div className="absolute z-10 w-full mt-2 bg-white border rounded-lg shadow-lg max-h-96 overflow-y-auto">
          {results.map((product) => (
            <button
              key={product.id}
              onClick={() => {
                onSelect(product);
                setQuery('');
                setResults([]);
              }}
              className="w-full p-3 text-left hover:bg-muted/50 transition-colors"
            >
              <div className="font-medium">{product.name}</div>
              <div className="text-sm text-muted-foreground">
                {product.sku} - Stock: {product.stock_actual}
              </div>
              <div className="text-sm font-medium text-green-600">
                ${product.sale_price_usd?.toFixed(2)}
              </div>
            </button>
          ))}
        </div>
      )}

      {loading && (
        <div className="absolute z-10 w-full mt-2 bg-white border rounded-lg shadow-lg p-4 text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto" />
        </div>
      )}
    </div>
  );
}
```

---

## 🗄️ Stores

### `src/store/authStore.ts` (Mejorado)
```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  token: string | null;
  role: string | null;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setRole: (role: string | null) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
  hasRole: (roles: string[]) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      role: null,

      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      setRole: (role) => set({ role }),

      logout: () => set({ user: null, token: null, role: null }),

      isAuthenticated: () => {
        const { token, user } = get();
        return !!token && !!user;
      },

      hasRole: (roles) => {
        const { role } = get();
        return role ? roles.includes(role) : false;
      },
    }),
    {
      name: 'farmacia-auth',
    }
  )
);
```

### `src/store/cartStore.ts` (Mejorado)
```typescript
import { create } from 'zustand';
import type { Product } from '@/types/product.types';

interface CartItem {
  product: Product;
  quantity: number;
  batchId?: string;
}

interface CartState {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getSubtotal: () => { usd: number; ves: number };
  getIVA: () => { usd: number; ves: number };
  getTotal: () => { usd: number; ves: number };
  getItemCount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],

  addItem: (product, quantity = 1) => {
    set((state) => {
      const existingItem = state.items.find(
        (i) => i.product.id === product.id
      );

      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;

        // Validate stock
        if (newQuantity > product.stock_actual) {
          alert(`Stock insuficiente. Disponible: ${product.stock_actual}`);
          return state;
        }

        return {
          items: state.items.map((i) =>
            i.product.id === product.id
              ? { ...i, quantity: newQuantity }
              : i
          ),
        };
      }

      // Validate stock for new item
      if (quantity > product.stock_actual) {
        alert(`Stock insuficiente. Disponible: ${product.stock_actual}`);
        return state;
      }

      return {
        items: [...state.items, { product, quantity }],
      };
    });
  },

  removeItem: (productId) =>
    set((state) => ({
      items: state.items.filter((i) => i.product.id !== productId),
    })),

  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(productId);
      return;
    }

    set((state) => ({
      items: state.items.map((i) => {
        if (i.product.id === productId) {
          if (quantity > i.product.stock_actual) {
            alert(`Stock máximo: ${i.product.stock_actual}`);
            return i;
          }
          return { ...i, quantity };
        }
        return i;
      }),
    }));
  },

  clearCart: () => set({ items: [] }),

  getSubtotal: () => {
    const { items } = get();
    return items.reduce(
      (acc, item) => ({
        usd: acc.usd + item.product.sale_price_usd * item.quantity,
        ves: acc.ves + item.product.sale_price_ves * item.quantity,
      }),
      { usd: 0, ves: 0 }
    );
  },

  getIVA: () => {
    const { items } = get();
    return items.reduce(
      (acc, item) => {
        if (item.product.iva_exempt) return acc;

        const ivaRate = item.product.iva_rate || 0.16;
        return {
          usd: acc.usd + item.product.sale_price_usd * item.quantity * ivaRate,
          ves: acc.ves + item.product.sale_price_ves * item.quantity * ivaRate,
        };
      },
      { usd: 0, ves: 0 }
    );
  },

  getTotal: () => {
    const subtotal = get().getSubtotal();
    const iva = get().getIVA();
    return {
      usd: subtotal.usd + iva.usd,
      ves: subtotal.ves + iva.ves,
    };
  },

  getItemCount: () => {
    const { items } = get();
    return items.reduce((count, item) => count + item.quantity, 0);
  },
}));
```

---

## 🦀 Comandos Tauri (Rust)

### `src-tauri/src/main.rs`
```rust
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Manager;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
async fn get_products_local() -> Result<Vec<serde_json::Value>, String> {
    // TODO: Implement SQLite query
    Ok(vec![])
}

#[tauri::command]
async fn save_product_local(product: serde_json::Value) -> Result<(), String> {
    // TODO: Implement SQLite insert
    Ok(())
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_sql::Builder::default().build())
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_process::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            get_products_local,
            save_product_local
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

---

Estos ejemplos te dan una base sólida para implementar cada parte! 🚀
