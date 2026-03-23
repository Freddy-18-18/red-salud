"use client";

import React, { createContext, useContext, useState, useRef, useCallback } from "react";

export type SidebarMode = "expanded" | "collapsed" | "hover";

interface SidebarContextType {
  mode: SidebarMode;
  isExpanded: boolean;
  isHovered: boolean;
  setMode: (mode: SidebarMode) => void;
  handleMouseEnter: () => void;
  handleMouseLeave: () => void;
  sidebarWidth: number;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

// Función helper para obtener el modo inicial
function getInitialMode(): SidebarMode {
  if (typeof window === "undefined") return "hover";
  
  const saved = localStorage.getItem("sidebar-mode");
  if (saved && ["expanded", "collapsed", "hover"].includes(saved)) {
    return saved as SidebarMode;
  }
  return "hover";
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<SidebarMode>(getInitialMode);
  const [isHovered, setIsHovered] = useState(false);
  const blockHoverUntilLeaveRef = useRef(false);

  const getIsExpanded = useCallback((currentMode: SidebarMode, hovered: boolean): boolean => {
    switch (currentMode) {
      case "expanded":
        return true;
      case "collapsed":
        return false;
      case "hover":
        return hovered;
      default:
        return false;
    }
  }, []);

  const isExpanded = getIsExpanded(mode, isHovered);

  const setMode = useCallback((newMode: SidebarMode) => {
    console.log("🔄 Cambiando modo a:", newMode);
    
    // Bloquear hover hasta que el mouse salga del sidebar
    blockHoverUntilLeaveRef.current = true;
    
    // Forzar colapsar si estaba en hover
    setIsHovered(false);
    
    // Cambiar modo inmediatamente
    setModeState(newMode);
    
    // Persistir en localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("sidebar-mode", newMode);
    }
    
    // Dispatch event para otros componentes
    const expanded = getIsExpanded(newMode, false);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("sidebar-mode-change", { 
        detail: { mode: newMode, isExpanded: expanded } 
      }));
    }
  }, [getIsExpanded]);

  const handleMouseEnter = useCallback(() => {
    // Solo permitir hover si el modo es hover y no está bloqueado
    if (mode === "hover" && !blockHoverUntilLeaveRef.current) {
      console.log("🖱️ Mouse enter - expandiendo");
      setIsHovered(true);
    }
  }, [mode]);

  const handleMouseLeave = useCallback(() => {
    // Desbloquear cuando el mouse sale
    blockHoverUntilLeaveRef.current = false;
    
    // Solo colapsar si está en modo hover
    if (mode === "hover") {
      console.log("🖱️ Mouse leave - colapsando");
      setIsHovered(false);
    }
  }, [mode]);

  const value: SidebarContextType = {
    mode,
    isExpanded,
    isHovered,
    setMode,
    handleMouseEnter,
    handleMouseLeave,
    sidebarWidth: isExpanded ? 256 : 48,
  };

  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebarContext() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error("useSidebarContext debe usarse dentro de un SidebarProvider");
  }
  return context;
}
