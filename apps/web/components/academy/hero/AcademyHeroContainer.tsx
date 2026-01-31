"use client";

import dynamic from 'next/dynamic';

const AcademyHero3D = dynamic(() => import('./AcademyHero3D'), {
    ssr: false,
    loading: () => <div className="absolute inset-0 bg-slate-950/50" />
});

export function AcademyHeroContainer() {
    return <AcademyHero3D />;
}
