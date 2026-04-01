'use client'

import { useState } from 'react'

import { DoctorInfoTab } from './doctor-info-tab'
import { DoctorReviewsTab } from './doctor-reviews-tab'

import type { PublicDoctorDetail } from '@/lib/types/public'

interface DoctorProfileTabsProps {
  doctor: PublicDoctorDetail
}

type TabId = 'info' | 'ubicacion' | 'opiniones'

const TABS: { id: TabId; label: string }[] = [
  { id: 'info', label: 'Informacion' },
  { id: 'ubicacion', label: 'Ubicacion' },
  { id: 'opiniones', label: 'Opiniones' },
]

export function DoctorProfileTabs({ doctor }: DoctorProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>('info')

  return (
    <div>
      {/* Tab header */}
      <div className="border-b border-[hsl(var(--border))]">
        <nav className="-mb-px flex gap-6" aria-label="Tabs">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap border-b-2 pb-3 pt-1 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400'
                  : 'border-transparent text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--border))] hover:text-[hsl(var(--foreground))]'
              }`}
            >
              {tab.label}
              {tab.id === 'opiniones' && doctor.reviewCount > 0 && (
                <span className="ml-1.5 rounded-full bg-[hsl(var(--muted))] px-2 py-0.5 text-xs">
                  {doctor.reviewCount}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      <div className="pt-6">
        {activeTab === 'info' && <DoctorInfoTab doctor={doctor} />}
        {activeTab === 'ubicacion' && <LocationTabContent doctor={doctor} />}
        {activeTab === 'opiniones' && <DoctorReviewsTab doctorId={doctor.id} initialReviews={doctor.reviews} />}
      </div>
    </div>
  )
}

function LocationTabContent({ doctor }: { doctor: PublicDoctorDetail }) {
  const location = [doctor.profile.city, doctor.profile.state]
    .filter(Boolean)
    .join(', ')

  return (
    <div className="space-y-4">
      {location ? (
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
          <h3 className="mb-2 font-semibold text-[hsl(var(--foreground))]">
            Ubicacion del consultorio
          </h3>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            {location}, Venezuela
          </p>
          <div className="mt-4 flex h-48 items-center justify-center rounded-lg bg-[hsl(var(--muted))]">
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              Mapa disponible proximamente
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 text-center">
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Ubicacion no disponible
          </p>
        </div>
      )}
    </div>
  )
}
