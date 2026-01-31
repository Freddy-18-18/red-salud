"use client";

import { Provider } from "react-redux";
import store from "@/lib/redux/store";
import { PreferencesProvider } from "@/lib/contexts/preferences-context";
import { ThemeProvider } from "@/lib/contexts/theme-context";
import { SupabaseAuthProvider } from "@/components/providers/supabase-auth-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { Toaster } from "sonner";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        // Optimistic configuration for client
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <PreferencesProvider>
          <SupabaseAuthProvider>
            <ThemeProvider defaultTheme="system" storageKey="theme">
              {children}
              <Toaster richColors position="top-center" />
            </ThemeProvider>
          </SupabaseAuthProvider>
        </PreferencesProvider>
      </QueryClientProvider>
    </Provider>
  );
}
