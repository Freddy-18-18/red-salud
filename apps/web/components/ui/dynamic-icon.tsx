"use client";

// ============================================
// DYNAMIC ICON COMPONENT
// Resolves icon names (strings from DB/config) to Lucide React components
// Uses a static map for tree-shaking — only imported icons are bundled
// ============================================

import { type LucideProps } from "lucide-react";
import {
  Activity,
  AlignCenter,
  AlertTriangle,
  Apple,
  Atom,
  Baby,
  Bone,
  BookOpen,
  Box,
  Brain,
  BrainCircuit,
  BrainCog,
  Calendar,
  CheckSquare,
  ClipboardList,
  CreditCard,
  Dna,
  DollarSign,
  Droplet,
  Droplets,
  Dumbbell,
  Ear,
  Eye,
  FileText,
  Fingerprint,
  Flame,
  FlaskConical,
  Flower2,
  Focus,
  Footprints,
  Gauge,
  GitBranch,
  Glasses,
  Hand,
  // HandMetal mapped to Hand (HandMetal may not exist in all versions)
  HardHat,
  Heart,
  HeartHandshake,
  HeartPulse,
  MessageCircle,
  MessageSquare,
  Mic,
  Microscope,
  Moon,
  Package,
  Phone,
  Pill,
  Puzzle,
  Radiation,
  Radio,
  Receipt,
  Ribbon,
  Scale,
  Scan,
  ScanLine,
  Scissors,
  Search,
  Settings,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Siren,
  Skull,
  SmilePlus,
  Sparkle,
  Sparkles,
  Stethoscope,
  Syringe,
  Target,
  TrendingUp,
  User,
  Users,
  Utensils,
  Video,
  Volume2,
  Waves,
  Wind,
  Zap,
} from "lucide-react";
import type { ComponentType } from "react";

/**
 * Static icon map — maps string names to Lucide React components
 * Only icons in this map are bundled (tree-shaking friendly)
 */
const ICON_MAP: Record<string, ComponentType<LucideProps>> = {
  Activity,
  AlignCenter,
  AlertTriangle,
  Apple,
  Atom,
  Baby,
  Bone,
  BookOpen,
  Box,
  Brain,
  BrainCircuit,
  BrainCog,
  Calendar,
  CheckSquare,
  ClipboardList,
  CreditCard,
  Dna,
  DollarSign,
  Droplet,
  Droplets,
  Dumbbell,
  Ear,
  Eye,
  FileText,
  FileTemplate: FileText, // alias
  Fingerprint,
  Flame,
  FlaskConical,
  Flower2,
  Focus,
  Footprints,
  Gauge,
  GitBranch,
  Glasses,
  Gum: SmilePlus, // alias
  Hand,
  HandMetal: Hand, // alias
  HardHat,
  Heart,
  HeartHandshake,
  HeartPulse,
  MessageCircle,
  MessageSquare,
  Mic,
  Microscope,
  Moon,
  Package,
  Phone,
  Pill,
  Puzzle,
  Radiation,
  Radio,
  Receipt,
  Ribbon,
  Scale,
  Scan,
  ScanLine,
  Scissors,
  Search,
  Settings,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Siren,
  Skull,
  SmilePlus,
  Sparkle,
  Sparkles,
  Stethoscope,
  Syringe,
  Target,
  TrendingUp,
  User,
  Users,
  Utensils,
  Video,
  Volume2,
  Waves,
  Wind,
  Zap,
};

/** All available icon names */
export const AVAILABLE_ICONS = Object.keys(ICON_MAP);

/** Default fallback icon */
const DEFAULT_ICON = Stethoscope;

export interface DynamicIconProps extends LucideProps {
  /** Icon name string (e.g., "Heart", "Brain", "Stethoscope") */
  name: string;
}

/**
 * Renders a Lucide icon by name string.
 * Falls back to Stethoscope if the icon is not found in the map.
 *
 * @example
 * <DynamicIcon name="Heart" className="h-5 w-5" />
 * <DynamicIcon name={specialty.icon} size={24} color="red" />
 */
export function DynamicIcon({ name, ...props }: DynamicIconProps) {
  const IconComponent = ICON_MAP[name] || DEFAULT_ICON;
  return <IconComponent {...props} />;
}

/**
 * Check if an icon name is valid (exists in the map)
 */
export function isValidIconName(name: string): boolean {
  return name in ICON_MAP;
}

/**
 * Get the icon component by name (returns null if not found)
 */
export function getIconComponent(
  name: string
): ComponentType<LucideProps> | null {
  return ICON_MAP[name] || null;
}
