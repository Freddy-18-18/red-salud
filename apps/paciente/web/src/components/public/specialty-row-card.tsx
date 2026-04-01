import {
  Stethoscope,
  Heart,
  Brain,
  Eye,
  Baby,
  Bone,
  Smile,
  Pill,
  Activity,
  Microscope,
  Ear,
  Syringe,
  Thermometer,
  Ribbon,
  ArrowRight,
  type LucideIcon,
  type LucideProps,
} from 'lucide-react'
import Link from 'next/link'
import { createElement } from 'react'

import type { PublicSpecialty } from '@/lib/types/public'

const iconMap: Record<string, LucideIcon> = {
  stethoscope: Stethoscope,
  heart: Heart,
  brain: Brain,
  eye: Eye,
  baby: Baby,
  bone: Bone,
  smile: Smile,
  pill: Pill,
  activity: Activity,
  microscope: Microscope,
  ear: Ear,
  syringe: Syringe,
  thermometer: Thermometer,
  ribbon: Ribbon,
}

function getIcon(iconName: string | null): LucideIcon {
  if (!iconName) return Stethoscope
  return iconMap[iconName.toLowerCase()] ?? Stethoscope
}

function SpecialtyIcon({ iconName, ...props }: { iconName: string | null } & LucideProps) {
  return createElement(getIcon(iconName), props)
}

interface SpecialtyRowCardProps {
  specialty: PublicSpecialty
}

export function SpecialtyRowCard({ specialty }: SpecialtyRowCardProps) {
  return (
    <Link
      href={`/especialidades/${specialty.slug}`}
      className="group flex items-center gap-3 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-3 transition-all hover:border-emerald-300 hover:shadow-sm dark:hover:border-emerald-700"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
        <SpecialtyIcon iconName={specialty.icon} className="h-4.5 w-4.5" />
      </div>
      <div className="min-w-0 flex-1">
        <span className="text-sm font-medium text-[hsl(var(--foreground))]">
          {specialty.name}
        </span>
        <span className="ml-2 text-xs text-[hsl(var(--muted-foreground))]">
          {specialty.doctorCount}{' '}
          {specialty.doctorCount === 1 ? 'doctor' : 'doctores'}
        </span>
      </div>
      <ArrowRight className="h-4 w-4 shrink-0 text-[hsl(var(--muted-foreground))] transition-transform group-hover:translate-x-0.5" />
    </Link>
  )
}
