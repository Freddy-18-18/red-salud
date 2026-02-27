/**
 * @file lucide-icon-renderer.tsx
 * @description Renderiza dinámicamente cualquier icono de Lucide por nombre.
 *
 * Permite que los SpecialtyConfig definan iconos como strings (e.g. "Stethoscope")
 * y este componente los resuelve al componente React correspondiente.
 *
 * Usa un Map estático con los iconos más usados en el sistema médico
 * para evitar importar toda la librería de Lucide.
 */

"use client";

import { type CSSProperties, memo } from "react";
import {
  Activity,
  AlertTriangle,
  Baby,
  BarChart,
  Bell,
  BookOpen,
  Box,
  Calculator,
  Calendar,
  CalendarCheck,
  Camera,
  Clipboard,
  ClipboardCheck,
  ClipboardList,
  CreditCard,
  Database,
  DollarSign,
  Dumbbell,
  FileCheck,
  FileSignature,
  FileText,
  FlaskConical,
  GitCompare,
  Heart,
  HeartPulse,
  Layers,
  LineChart,
  ListChecks,
  MessageCircle,
  MessageSquare,
  Microscope,
  Monitor,
  NotebookPen,
  Package,
  Phone,
  Pill,
  Scan,
  ScanLine,
  Settings,
  Share2,
  Shield,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Syringe,
  Target,
  TestTube,
  TrendingUp,
  User,
  UserPlus,
  Users,
  Video,
  type LucideIcon,
} from "lucide-react";

// ============================================================================
// ICON MAP — All medical dashboard icons
// ============================================================================

const ICON_MAP: Record<string, LucideIcon> = {
  Activity,
  AlertTriangle,
  Baby,
  BarChart,
  Bell,
  BookOpen,
  Box,
  Calculator,
  Calendar,
  CalendarCheck,
  Camera,
  Clipboard,
  ClipboardCheck,
  ClipboardList,
  CreditCard,
  Database,
  DollarSign,
  Dumbbell,
  FileCheck,
  FileSignature,
  FileText,
  FlaskConical,
  GitCompare,
  Heart,
  HeartPulse,
  Layers,
  LineChart,
  ListChecks,
  MessageCircle,
  MessageSquare,
  Microscope,
  Monitor,
  NotebookPen,
  Package,
  Phone,
  Pill,
  Scan,
  ScanLine,
  Settings,
  Share2,
  Shield,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Syringe,
  Target,
  TestTube,
  TrendingUp,
  User,
  UserPlus,
  Users,
  Video,
};

// ============================================================================
// COMPONENT
// ============================================================================

interface LucideIconRendererProps {
  /** Icon name matching a Lucide icon (e.g. "Stethoscope", "Heart") */
  name: string;
  /** CSS class */
  className?: string;
  /** Inline style */
  style?: CSSProperties;
  /** Size override (default: inherits from className) */
  size?: number;
}

/**
 * Renders a Lucide icon by name.
 * Falls back to Stethoscope if the icon name is not found.
 */
export const LucideIconRenderer = memo(function LucideIconRenderer({
  name,
  className,
  style,
  size,
}: LucideIconRendererProps) {
  const IconComponent = ICON_MAP[name] ?? Stethoscope;
  return <IconComponent className={className} style={style} size={size} />;
});
