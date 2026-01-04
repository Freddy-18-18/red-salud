/**
 * @file page.tsx
 * @description Página de detalle de especialidad médica.
 * Muestra información completa sobre una especialidad: descripción, cuándo acudir,
 * importancia, preparación, tratamientos, FAQs, mapa de distribución y lista de doctores.
 *
 * @module Especialidades
 *
 * @example
 * // URL: /especialidades/cardiologia
 * // Muestra toda la información sobre cardiología
 */

import { notFound } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    Users,
    Star,
    ShieldCheck,
    Info,
    CheckCircle2,
    Activity,
    CalendarDays,
    Clock,
    MapPin,
    Award,
    TrendingUp,
} from "lucide-react";

import { MASTER_SPECIALTIES } from "@/components/sections/specialties/master-list";
import { VenezuelaMapSVG } from "@/components/sections/specialties/map";
import { SpecialtyFAQ } from "@/components/sections/specialties/SpecialtyFAQ";
import { SpecialtyPreparation } from "@/components/sections/specialties/SpecialtyPreparation";
import { SpecialtyTreatments } from "@/components/sections/specialties/SpecialtyTreatments";
import { RelatedSpecialties } from "@/components/sections/specialties/RelatedSpecialties";
import { createClient } from "@/lib/supabase/client";
import { Metadata } from "next";
import { cn, slugify } from "@/lib/utils";
import { getSpecialtyContent } from "@/components/sections/specialties/specialties-content.data";
import { FadeIn } from "@/components/ui/motion-wrapper";
import { getSpecialtyTheme } from "@/lib/specialty-theme";

/**
 * Genera los metadatos de la página dinámicamente.
 * Usado para SEO y compartir en redes sociales.
 */
export async function generateMetadata(
    props: { params: Promise<{ id: string }> }
): Promise<Metadata> {
    const params = await props.params;
    const supabase = createClient();
    let name = "";

    // 1. Intentar Master List primero
    const master = MASTER_SPECIALTIES.find(
        (s) => s.id === params.id || slugify(s.name) === params.id
    );
    if (master) {
        name = master.name;
    } else {
        // 2. Buscar en la DB
        const isUuid =
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
                params.id
            );

        if (isUuid) {
            const { data } = await supabase
                .from("specialties")
                .select("name")
                .eq("id", params.id)
                .single();
            if (data) name = data.name;
        } else {
            // Fallback: buscar por slug
            const { data: allSpecialties } = await supabase
                .from("specialties")
                .select("id, name");
            const found = allSpecialties?.find((s) => slugify(s.name) === params.id);
            if (found) name = found.name;
        }
    }

    if (!name) return { title: "Especialidad no encontrada" };

    // Obtener contenido para descripción enriquecida
    const content = getSpecialtyContent(slugify(name));
    const description =
        content?.description ||
        `Encuentra los mejores especialistas en ${name} en Venezuela. Reserva tu cita hoy mismo.`;

    return {
        title: `${name} | Red-Salud Venezuela`,
        description,
        openGraph: {
            title: `${name} | Red-Salud Venezuela`,
            description,
        },
    };
}

/**
 * Componente principal de la página de especialidad.
 * Renderiza toda la información educativa y la lista de doctores.
 */
export default async function SpecialtyPage(
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    const supabase = createClient();
    let specialty: { id?: string; name: string } | null = null;

    // 1. Resolver la especialidad
    const isUuid =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
            params.id
        );

    // Primero revisar Master List (prioridad para datos estáticos)
    const master = MASTER_SPECIALTIES.find(
        (s) => s.id === params.id || slugify(s.name) === params.id
    );
    if (master) {
        specialty = master;
    } else if (isUuid) {
        // Búsqueda directa por UUID
        const { data } = await supabase
            .from("specialties")
            .select("*")
            .eq("id", params.id)
            .single();
        if (data) specialty = data;
    } else {
        // Búsqueda por slug
        const { data: allSpecialties } = await supabase
            .from("specialties")
            .select("id, name");
        const found = allSpecialties?.find((s) => slugify(s.name) === params.id);
        if (found) specialty = found;
    }

    if (!specialty) {
        notFound();
    }

    // 2. Obtener contenido educativo
    const content = getSpecialtyContent(slugify(specialty.name));

    // 3. Obtener doctores de esta especialidad desde doctor_details
    // Buscamos el UUID real de la especialidad en la DB por nombre
    // Usamos match en JS para evitar problemas con caracteres especiales en Supabase
    const nameForSearch = specialty.name;
    const nameNoAccents = nameForSearch
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();

    // Obtener todas las especialidades y hacer match robusto en JS
    const { data: allSpecialties } = await supabase
        .from("specialties")
        .select("id, name");

    // Buscar coincidencia por nombre (con y sin acentos)
    const matchedSpecialty = (allSpecialties || []).find((s: { id: string; name: string }) => {
        const dbNameNormalized = s.name
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .trim();
        return dbNameNormalized === nameNoAccents ||
            s.name.toLowerCase().trim() === nameForSearch.toLowerCase().trim();
    });

    const specialtyDbId = matchedSpecialty?.id || null;

    // Debug log para desarrollo
    console.log(`[Specialty Page] Buscando: "${nameForSearch}" (normalizado: "${nameNoAccents}") -> DB ID: ${specialtyDbId || "NO ENCONTRADO"}`);

    // Consultar doctor_details con join a profiles (misma lógica que el ticker)
    let doctors: any[] = [];
    if (specialtyDbId) {
        const { data: doctorDetails } = await supabase
            .from("doctor_details")
            .select(`
                *,
                profile:profiles!doctor_details_profile_id_fkey(
                    id, nombre_completo, email, avatar_url, telefono, ciudad, estado
                )
            `)
            .eq("especialidad_id", specialtyDbId)
            .eq("verified", true);

        // Transformar para mantener compatibilidad con el template actual
        doctors = (doctorDetails || []).map((dd: any) => ({
            id: dd.profile?.id || dd.profile_id,
            nombre_completo: dd.profile?.nombre_completo,
            full_name: dd.profile?.nombre_completo,
            avatar_url: dd.profile?.avatar_url,
            foto_perfil_url: dd.profile?.avatar_url,
            ciudad: dd.profile?.ciudad,
            estado: dd.profile?.estado,
            state: dd.profile?.estado,
            verificado: dd.verified,
            verified: dd.verified,
        }));
    }

    // 4. Calcular distribución por estado
    const distribution: Record<string, number> = {};
    const activeDoctors = doctors;

    activeDoctors.forEach((doc: any) => {
        const rawState = doc.estado || doc.state;
        if (rawState) {
            const state = rawState.trim();
            distribution[state] = (distribution[state] || 0) + 1;
        }
    });

    const doctorCount = activeDoctors.length;

    // 5. Obtener el tema de color basado en la categoría
    // Intentamos obtener la categoría del master list o del objeto specialty
    const category = (specialty as any).category || MASTER_SPECIALTIES.find(s => s.name === specialty?.name)?.category;
    const theme = getSpecialtyTheme(category);
    const ThemeIcon = theme.icon;

    return (
        <div className="min-h-screen bg-background">
            {/* ===================== HERO SECTION ===================== */}
            <div className="relative pb-24 pt-32 lg:pt-40 overflow-hidden">
                {/* Background decorativo */}
                <div className="absolute inset-0 bg-grid-slate-900/[0.04] -z-10" />
                <div className={cn("absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-transparent -z-10 opacity-30", theme.gradientFrom)} />
                <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-t from-background to-transparent z-10" />

                <div className="container mx-auto px-4 relative z-20">
                    {/* Breadcrumb / Back */}
                    <FadeIn className="mb-8">
                        <Link
                            href="/"
                            className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors bg-background/50 backdrop-blur-sm px-3 py-1 rounded-full border border-border/50 text-sm"
                        >
                            <ArrowLeft className="w-3 h-3 mr-2" />
                            Explorar Especialidades
                        </Link>
                    </FadeIn>

                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
                        {/* Contenido de texto */}
                        <FadeIn delay={0.2}>
                            {/* Badge */}
                            <div className={cn("inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold mb-6 border", theme.bgLight, theme.textDark, "border-current/20")}>
                                <ShieldCheck className="w-4 h-4" />
                                Especialidad Médica Verificada
                            </div>

                            {/* Título */}
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-foreground mb-6">
                                {specialty.name}
                            </h1>

                            {/* Descripción */}
                            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8 font-light">
                                {content?.description ||
                                    `Encuentra a los especialistas más calificados en ${specialty.name}. Nuestra red cuenta con profesionales validados en todo el país, listos para brindarte la mejor atención médica.`}
                            </p>

                            {/* Estadísticas */}
                            <div className="flex flex-wrap gap-6 md:gap-8 items-center bg-white/50 dark:bg-slate-900/50 p-6 rounded-2xl border border-border/50 backdrop-blur-md shadow-sm">
                                <div className="flex flex-col">
                                    <span className={cn("text-3xl md:text-4xl font-bold", theme.primary)}>
                                        {doctorCount}
                                    </span>
                                    <span className="text-xs md:text-sm font-medium text-muted-foreground uppercase tracking-wide">
                                        Especialistas
                                    </span>
                                </div>
                                <div className="w-px h-12 bg-border hidden sm:block" />
                                <div className="flex flex-col">
                                    <span className="text-3xl md:text-4xl font-bold text-foreground">
                                        24/7
                                    </span>
                                    <span className="text-xs md:text-sm font-medium text-muted-foreground uppercase tracking-wide">
                                        Agendamiento
                                    </span>
                                </div>
                                {activeDoctors.length > 0 && (
                                    <>
                                        <div className="w-px h-12 bg-border hidden sm:block" />
                                        <div className="flex -space-x-3">
                                            {activeDoctors.slice(0, 4).map((doc: any, i: number) => (
                                                <div
                                                    key={i}
                                                    className="w-10 h-10 rounded-full border-2 border-background bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold overflow-hidden"
                                                >
                                                    {doc.avatar_url || doc.foto_perfil_url ? (
                                                        <img
                                                            src={doc.avatar_url || doc.foto_perfil_url}
                                                            alt=""
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        (doc.full_name || doc.nombre_completo)?.[0]
                                                    )}
                                                </div>
                                            ))}
                                            {activeDoctors.length > 4 && (
                                                <div className="w-10 h-10 rounded-full border-2 border-background bg-muted flex items-center justify-center text-xs font-bold">
                                                    +{activeDoctors.length - 4}
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        </FadeIn>

                        {/* Widget del Mapa */}
                        <FadeIn delay={0.4} className="relative group perspective-1000">
                            <div className={cn("absolute -inset-1 bg-gradient-to-r rounded-[2rem] blur opacity-25 group-hover:opacity-40 transition duration-1000", theme.gradientFrom, theme.gradientTo)} />
                            <div className="relative bg-white dark:bg-slate-900 rounded-[1.8rem] border border-border/50 shadow-2xl overflow-hidden h-[450px]">
                                <div className="absolute top-4 left-4 z-10 bg-background/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-border/50 shadow-sm text-xs font-medium">
                                    Distribución Nacional
                                </div>
                                <VenezuelaMapSVG
                                    doctorDistribution={distribution}
                                    height="100%"
                                />
                            </div>
                        </FadeIn>
                    </div>
                </div>
            </div>

            {/* ===================== SECCIÓN "QUÉ ES / CUÁNDO / POR QUÉ" ===================== */}
            {content && (
                <section className="py-20 bg-muted/30 border-y border-border/50">
                    <FadeIn delay={0.5} className="container mx-auto px-4">
                        <div className="grid md:grid-cols-3 gap-8">
                            {/* Qué es */}
                            <div className="bg-background p-8 rounded-2xl border border-border/50 shadow-sm hover:shadow-md transition-shadow group">
                                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-colors", theme.bgLight, theme.primary)}>
                                    <ThemeIcon className="w-6 h-6" />
                                </div>
                                <h3 className="text-lg font-bold mb-3 text-foreground">
                                    ¿Qué es {specialty.name}?
                                </h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    {content.whatIsIt}
                                </p>
                            </div>

                            {/* Cuándo acudir */}
                            <div className="bg-background p-8 rounded-2xl border border-border/50 shadow-sm hover:shadow-md transition-shadow">
                                <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/20 text-amber-600 flex items-center justify-center mb-6">
                                    <Activity className="w-6 h-6" />
                                </div>
                                <h3 className="text-lg font-bold mb-3 text-foreground">
                                    ¿Cuándo acudir?
                                </h3>
                                <ul className="space-y-3">
                                    {content.whenToGo.slice(0, 5).map((item, i) => (
                                        <li
                                            key={i}
                                            className="flex gap-3 text-muted-foreground text-sm"
                                        >
                                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Por qué es importante */}
                            <div className="bg-background p-8 rounded-2xl border border-border/50 shadow-sm hover:shadow-md transition-shadow">
                                <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 flex items-center justify-center mb-6">
                                    <CheckCircle2 className="w-6 h-6" />
                                </div>
                                <h3 className="text-lg font-bold mb-3 text-foreground">
                                    ¿Por qué es importante?
                                </h3>
                                <ul className="space-y-3">
                                    {content.whyItMatters.slice(0, 5).map((item, i) => (
                                        <li
                                            key={i}
                                            className="flex gap-3 text-muted-foreground text-sm"
                                        >
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </FadeIn>
                </section>
            )}

            {/* ===================== MAPA 3D VENEZUELA ===================== */}
            <FadeIn delay={0.45}>
                <section className="mb-16 container mx-auto px-4">
                    <div className="flex items-center gap-3 mb-8">
                        <div className={cn("p-3 rounded-xl", theme.bgLight)}>
                            <MapPin className={cn("w-6 h-6", theme.primary)} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-foreground">
                                Distribución en Venezuela
                            </h2>
                            <p className="text-muted-foreground">
                                Disponibilidad de especialistas por estado
                            </p>
                        </div>
                    </div>

                    <div className="h-[500px] w-full bg-slate-950/50 backdrop-blur-sm rounded-3xl border border-white/10 overflow-hidden shadow-2xl relative group">
                        <div className="absolute top-4 right-4 z-10 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-xs font-medium text-white/80">
                            Mapa Interactivo
                        </div>
                        <VenezuelaMapSVG
                            doctorDistribution={distribution}
                        />
                    </div>
                </section>
            </FadeIn>

            {/* ===================== SECCIÓN DE PREPARACIÓN ===================== */}
            {content?.preparation && content.preparation.length > 0 && (
                <SpecialtyPreparation
                    preparation={content.preparation}
                    specialtyName={specialty.name}
                />
            )}

            {/* ===================== SECCIÓN DE TRATAMIENTOS ===================== */}
            {content?.treatments && content.treatments.length > 0 && (
                <SpecialtyTreatments
                    treatments={content.treatments}
                    specialtyName={specialty.name}
                />
            )}

            {/* ===================== SECCIÓN DE FAQs ===================== */}
            {content?.faqs && content.faqs.length > 0 && (
                <SpecialtyFAQ faqs={content.faqs} specialtyName={specialty.name} />
            )}

            {/* ===================== LISTA DE DOCTORES ===================== */}
            <div className="py-20 container mx-auto px-4">
                <FadeIn delay={0.6} className="flex items-center justify-between mb-10">
                    <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                        <Users className={cn("w-8 h-8", theme.primary)} />
                        Especialistas Destacados
                    </h2>
                    {activeDoctors.length > 0 && (
                        <div className="text-muted-foreground text-sm">
                            Mostrando <strong>{activeDoctors.length}</strong> resultados
                        </div>
                    )}
                </FadeIn>

                {activeDoctors.length > 0 ? (
                    <FadeIn
                        delay={0.7}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {activeDoctors.map((doc: any) => (
                            <div
                                key={doc.id}
                                className="group flex flex-col p-6 rounded-2xl bg-white dark:bg-slate-900 border border-border/50 hover:border-primary/30 transition-all hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 duration-300"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-2xl overflow-hidden border-2 border-transparent group-hover:border-primary/20 transition-all">
                                        {doc.avatar_url || doc.foto_perfil_url ? (
                                            <img
                                                src={doc.avatar_url || doc.foto_perfil_url}
                                                alt={doc.full_name || doc.nombre_completo}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span>
                                                {(doc.full_name || doc.nombre_completo)?.[0] || "D"}
                                            </span>
                                        )}
                                    </div>
                                    {(doc.verificado || doc.verified) && (
                                        <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider flex items-center gap-1">
                                            <ShieldCheck className="w-3 h-3" />
                                            Verificado
                                        </span>
                                    )}
                                </div>

                                <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors mb-1">
                                    Dr. {doc.full_name || doc.nombre_completo}
                                </h3>
                                <p className="text-sm text-muted-foreground mb-4 font-medium">
                                    {specialty.name}
                                </p>

                                {/* Badge de ubicación */}
                                {doc.estado && (
                                    <div className="flex items-center text-xs text-slate-600 dark:text-slate-400 mb-6 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-md w-fit font-medium">
                                        <MapPin className="w-3 h-3 mr-1.5 text-primary" />
                                        {doc.city || doc.ciudad
                                            ? `${doc.city || doc.ciudad}, `
                                            : ""}
                                        {doc.estado}
                                    </div>
                                )}

                                <div className="mt-auto pt-5 border-t border-border/50 flex items-center justify-between text-sm">
                                    <div className="flex items-center text-amber-500 font-bold bg-amber-50 dark:bg-amber-900/10 px-2 py-1 rounded-md">
                                        <Star className="w-3.5 h-3.5 mr-1.5 fill-current" />
                                        4.9
                                    </div>
                                    <Link
                                        href={`/citas/nueva?doctor_id=${doc.id}`}
                                        className={cn("inline-flex items-center justify-center px-4 py-2 rounded-xl text-white text-sm font-semibold shadow-sm hover:opacity-90 transition-all", theme.accent)}
                                    >
                                        <CalendarDays className="w-4 h-4 mr-2" />
                                        Agendar
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </FadeIn>
                ) : (
                    <FadeIn
                        delay={0.7}
                        className="bg-muted/30 rounded-3xl p-16 text-center border border-dashed border-border flex flex-col items-center"
                    >
                        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6 text-muted-foreground">
                            <Users className="w-10 h-10" />
                        </div>
                        <h3 className="text-xl font-bold mb-3 text-foreground">
                            Aún no hay especialistas registrados
                        </h3>
                        <p className="text-muted-foreground max-w-md mx-auto mb-8 text-lg">
                            Actualmente estamos incorporando médicos en{" "}
                            <strong>{specialty.name}</strong>.
                        </p>
                        <Link
                            href="/"
                            className="text-primary font-semibold hover:underline"
                        >
                            Ver otras especialidades
                        </Link>
                    </FadeIn>
                )}
            </div>

            {/* ===================== ESPECIALIDADES RELACIONADAS ===================== */}
            {content?.relatedSpecialties &&
                content.relatedSpecialties.length > 0 && (
                    <RelatedSpecialties
                        relatedSlugs={content.relatedSpecialties}
                        currentSpecialty={specialty.name}
                    />
                )}

            {/* ===================== CTA FINAL ===================== */}
            <section className="py-16 bg-muted/30 relative overflow-hidden">
                <div className={cn("absolute inset-0 bg-gradient-to-r from-transparent to-transparent opacity-10", theme.gradientFrom)} />
                <div className="container mx-auto px-4 relative">
                    <FadeIn className="max-w-3xl mx-auto text-center">
                        <div className={cn("inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold mb-4", theme.bgLight, theme.primary)}>
                            <TrendingUp className="w-4 h-4" />
                            Agenda tu cita hoy
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                            ¿Listo para cuidar tu salud?
                        </h2>
                        <p className="text-muted-foreground mb-8">
                            Conecta con los mejores especialistas en {specialty.name} y agenda
                            tu cita en minutos.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/citas/nueva"
                                className={cn("inline-flex items-center justify-center px-6 py-3 rounded-xl text-white font-semibold shadow-lg hover:opacity-90 transition-all", theme.accent)}
                            >
                                <CalendarDays className="w-5 h-5 mr-2" />
                                Agendar Cita
                            </Link>
                            <Link
                                href="/"
                                className="inline-flex items-center justify-center px-6 py-3 rounded-xl border border-border bg-background text-foreground font-semibold hover:bg-muted transition-colors"
                            >
                                Explorar Especialidades
                            </Link>
                        </div>
                    </FadeIn>
                </div>
            </section>
        </div>
    );
}
