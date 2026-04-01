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
  type LucideIcon,
  type LucideProps,
} from 'lucide-react'
import Link from 'next/link'
import { createElement } from 'react'

import type { PublicSpecialty } from '@/lib/types/public'

/**
 * Map icon name strings from the database to actual lucide-react components.
 * Falls back to Stethoscope if the icon name is not recognized.
 */
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

interface SpecialtyCardProps {
  specialty: PublicSpecialty
}

/**
 * Renders the resolved icon via createElement to avoid triggering
 * react-hooks/static-components (dynamic component assignment).
 */
function SpecialtyIcon({ iconName, ...props }: { iconName: string | null } & LucideProps) {
  return createElement(getIcon(iconName), props)
}

export function SpecialtyCard({ specialty }: SpecialtyCardProps) {
  return (
    <Link
      href={`/especialidades/${specialty.slug}`}
      className="group flex flex-col items-center gap-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 transition-all hover:border-emerald-300 hover:shadow-md dark:hover:border-emerald-700"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 transition-transform group-hover:scale-110 dark:bg-emerald-950 dark:text-emerald-400">
        <SpecialtyIcon iconName={specialty.icon} className="h-5 w-5" />
      </div>
      <span className="text-center text-sm font-medium leading-tight text-[hsl(var(--foreground))]">
        {specialty.name}
      </span>
      <span className="text-xs text-[hsl(var(--muted-foreground))]">
        {specialty.doctorCount}{' '}
        {specialty.doctorCount === 1 ? 'doctor' : 'doctores'}
      </span>
    </Link>
  )
}
