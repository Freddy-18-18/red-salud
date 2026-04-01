import {
  Clock,
  Bell,
  MapPin,
  Users,
  Repeat,
  Lock,
  FileText,
  Search,
  TestTube,
  Heart,
  ListChecks,
  Send,
  BookOpen,
  AlertTriangle,
  PenTool,
  Copy,
  FileDown,
  Shield,
  Paperclip,
  AlertCircle,
  GitBranch,
  Share2,
  Smartphone,
  Zap,
  GitCompare,
  TrendingUp,
  ShieldCheck,
  UserCheck,
  RefreshCw,
  Ban,
  Palette,
  Globe,
  Activity,
  DollarSign,
  Target,
  CheckCircle,
  BadgeCheck,
  Building2,
  QrCode,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { FeatureHighlight } from '@/lib/data/features-data';

const highlightIconMap: Record<string, LucideIcon> = {
  Clock,
  Bell,
  MapPin,
  Users,
  Repeat,
  Lock,
  FileText,
  Search,
  TestTube,
  Heart,
  ListChecks,
  Send,
  BookOpen,
  AlertTriangle,
  PenTool,
  Copy,
  FileDown,
  Shield,
  Paperclip,
  AlertCircle,
  GitBranch,
  Share2,
  Smartphone,
  Zap,
  GitCompare,
  TrendingUp,
  ShieldCheck,
  UserCheck,
  RefreshCw,
  Ban,
  Palette,
  Globe,
  Activity,
  DollarSign,
  Target,
  CheckCircle,
  BadgeCheck,
  Building2,
  QrCode,
};

const accentStyles: Record<string, { iconBg: string; iconText: string }> = {
  teal: { iconBg: 'bg-teal-500/15', iconText: 'text-teal-400' },
  cyan: { iconBg: 'bg-cyan-500/15', iconText: 'text-cyan-400' },
  violet: { iconBg: 'bg-violet-500/15', iconText: 'text-violet-400' },
  blue: { iconBg: 'bg-blue-500/15', iconText: 'text-blue-400' },
  purple: { iconBg: 'bg-purple-500/15', iconText: 'text-purple-400' },
  orange: { iconBg: 'bg-orange-500/15', iconText: 'text-orange-400' },
  sky: { iconBg: 'bg-sky-500/15', iconText: 'text-sky-400' },
  emerald: { iconBg: 'bg-emerald-500/15', iconText: 'text-emerald-400' },
};

interface HighlightCardProps {
  highlight: FeatureHighlight;
  accentColor: string;
}

export function HighlightCard({ highlight, accentColor }: HighlightCardProps) {
  const Icon = highlightIconMap[highlight.iconName] ?? Clock;
  const styles = accentStyles[accentColor] ?? accentStyles.teal;

  return (
    <div className="group rounded-xl border border-white/[0.06] bg-white/[0.03] p-5 transition-all duration-300 hover:border-white/10 hover:bg-white/[0.05]">
      <div
        className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg ${styles.iconBg}`}
      >
        <Icon className={`h-5 w-5 ${styles.iconText}`} />
      </div>
      <h4 className="text-sm font-semibold text-white">{highlight.title}</h4>
      <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">
        {highlight.description}
      </p>
    </div>
  );
}
