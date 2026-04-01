import { ShieldCheck, Clock, Heart } from 'lucide-react'

const badges = [
  {
    icon: ShieldCheck,
    label: 'Doctores Verificados',
  },
  {
    icon: Clock,
    label: 'Citas en Minutos',
  },
  {
    icon: Heart,
    label: '100% Gratuito',
  },
] as const

export function TrustBadges() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-[hsl(var(--muted-foreground))]">
      {badges.map(({ icon: Icon, label }) => (
        <div key={label} className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-emerald-500" />
          <span>{label}</span>
        </div>
      ))}
    </div>
  )
}
