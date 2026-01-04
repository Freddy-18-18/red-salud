"use client";

import { Provider } from "react-redux";
import store from "@/lib/redux/store";
import { PreferencesProvider } from "@/lib/contexts/preferences-context";
import { ThemeProvider } from "@/lib/contexts/theme-context";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <PreferencesProvider>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </PreferencesProvider>
    </Provider>
  );
}
