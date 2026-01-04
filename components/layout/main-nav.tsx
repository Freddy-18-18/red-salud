"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { ROUTES } from "@/lib/constants";
import {
    Users,
    Stethoscope,
    Building2,
    FlaskConical,
    Pill,
    UserCog,
    Ambulance,
    ShieldCheck,
    GraduationCap
} from "lucide-react";

interface MainNavProps {
    isScrolled: boolean;
}

const categories = [
    {
        title: "Profesionales",
        items: [
            {
                title: "Médicos",
                href: "/servicios/medicos",
                description: "Plataforma para profesionales.",
                icon: Stethoscope,
            },
            {
                title: "Secretarias",
                href: "/servicios/secretarias",
                description: "Gestión de agendas.",
                icon: UserCog,
            },
        ],
    },
    {
        title: "Instituciones",
        items: [
            {
                title: "Clínicas",
                href: "/servicios/clinicas",
                description: "Gestión de centros médicos.",
                icon: Building2,
            },
            {
                title: "Laboratorios",
                href: "/servicios/laboratorios",
                description: "Análisis y resultados.",
                icon: FlaskConical,
            },
            {
                title: "Farmacias",
                href: "/servicios/farmacias",
                description: "Control de inventario.",
                icon: Pill,
            },
        ],
    },
    {
        title: "Educación",
        items: [
            {
                title: "Academy",
                href: "/academy",
                description: "Aprende medicina jugando.",
                icon: GraduationCap,
            },
        ],
    },
];

export function MainNav({ isScrolled }: MainNavProps) {
    const triggerColorClass = "text-foreground hover:bg-primary/5 hover:text-primary transition-colors";

    return (
        <NavigationMenu>
            <NavigationMenuList>
                <NavigationMenuItem>
                    <NavigationMenuLink asChild>
                        <Link
                            href={ROUTES.HOME}
                            className={cn(
                                navigationMenuTriggerStyle(),
                                "bg-transparent hover:bg-transparent focus:bg-transparent data-[active]:bg-transparent data-[state=open]:bg-transparent",
                                triggerColorClass,
                                "text-sm font-medium transition-all duration-300 hover:scale-105 px-3 md:px-4"
                            )}
                        >
                            Inicio
                        </Link>
                    </NavigationMenuLink>
                </NavigationMenuItem>

                <NavigationMenuItem>
                    <NavigationMenuLink asChild>
                        <Link
                            href={ROUTES.NOSOTROS}
                            className={cn(
                                navigationMenuTriggerStyle(),
                                "bg-transparent hover:bg-transparent focus:bg-transparent data-[active]:bg-transparent data-[state=open]:bg-transparent",
                                triggerColorClass,
                                "text-sm font-medium transition-all duration-300 hover:scale-105 px-3 md:px-4"
                            )}
                        >
                            Nosotros
                        </Link>
                    </NavigationMenuLink>
                </NavigationMenuItem>

                <NavigationMenuItem>
                    <NavigationMenuTrigger
                        className={cn(
                            "bg-transparent hover:bg-transparent focus:bg-transparent data-[active]:bg-transparent data-[state=open]:bg-transparent",
                            triggerColorClass,
                            "text-sm font-medium transition-all duration-300 hover:scale-105 px-3 md:px-4"
                        )}
                    >
                        Servicios
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                        <div className="flex flex-col md:flex-row gap-6 p-6 w-[350px] md:w-[750px] lg:w-[850px]">
                            {/* Principal - Pacientes */}
                            <div className="flex-shrink-0 w-full md:w-[240px]">
                                <div className="mb-3 text-xs font-semibold uppercase text-muted-foreground tracking-wider px-1">
                                    Principal
                                </div>
                                <NavigationMenuLink asChild>
                                    <Link
                                        className="group relative flex h-full min-h-[280px] w-full select-none flex-col justify-between overflow-hidden rounded-xl bg-gradient-to-br from-primary via-primary/90 to-secondary p-6 no-underline outline-none shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/30 focus:shadow-xl"
                                        href="/servicios/pacientes"
                                    >
                                        {/* Decorative background elements */}
                                        <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                                        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
                                        <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-secondary/30 blur-2xl" />

                                        {/* Content */}
                                        <div className="relative z-10">
                                            <div className="mb-4 inline-flex rounded-lg bg-white/20 p-3 backdrop-blur-sm">
                                                <Users className="h-8 w-8 text-white" />
                                            </div>
                                            <div className="mb-2 text-2xl font-bold text-white">
                                                Pacientes
                                            </div>
                                            <p className="text-sm leading-relaxed text-white/95">
                                                Agenda citas, revisa tu historial y gestiona tu salud desde cualquier lugar.
                                            </p>
                                        </div>

                                        {/* Arrow indicator */}
                                        <div className="relative z-10 flex items-center gap-2 text-sm font-medium text-white/90 transition-all group-hover:gap-3 group-hover:text-white">
                                            <span>Explorar</span>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M5 12h14" />
                                                <path d="m12 5 7 7-7 7" />
                                            </svg>
                                        </div>
                                    </Link>
                                </NavigationMenuLink>
                            </div>

                            {/* Categorized Grid */}
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {categories.map((category) => (
                                    <div key={category.title} className="space-y-3">
                                        <div className="text-xs font-semibold uppercase text-muted-foreground tracking-wider px-2">
                                            {category.title}
                                        </div>
                                        <ul className="space-y-1">
                                            {category.items.map((item) => (
                                                <ListItem
                                                    key={item.title}
                                                    title={item.title}
                                                    href={item.href}
                                                    icon={item.icon}
                                                >
                                                    {item.description}
                                                </ListItem>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                    <NavigationMenuLink asChild>
                        <Link
                            href={ROUTES.PRECIOS}
                            className={cn(
                                navigationMenuTriggerStyle(),
                                "bg-transparent hover:bg-transparent focus:bg-transparent data-[active]:bg-transparent data-[state=open]:bg-transparent",
                                triggerColorClass,
                                "text-sm font-medium transition-all duration-300 hover:scale-105 px-3 md:px-4"
                            )}
                        >
                            Precios
                        </Link>
                    </NavigationMenuLink>
                </NavigationMenuItem>

                <NavigationMenuItem>
                    <NavigationMenuLink asChild>
                        <Link
                            href={ROUTES.BLOG}
                            className={cn(
                                navigationMenuTriggerStyle(),
                                "bg-transparent hover:bg-transparent focus:bg-transparent data-[active]:bg-transparent data-[state=open]:bg-transparent",
                                triggerColorClass,
                                "text-sm font-medium transition-all duration-300 hover:scale-105 px-3 md:px-4"
                            )}
                        >
                            Blog
                        </Link>
                    </NavigationMenuLink>
                </NavigationMenuItem>

                <NavigationMenuItem>
                    <NavigationMenuLink asChild>
                        <Link
                            href={ROUTES.SOPORTE}
                            className={cn(
                                navigationMenuTriggerStyle(),
                                "bg-transparent hover:bg-transparent focus:bg-transparent data-[active]:bg-transparent data-[state=open]:bg-transparent",
                                triggerColorClass,
                                "text-sm font-medium transition-all duration-300 hover:scale-105 px-3 md:px-4"
                            )}
                        >
                            Soporte
                        </Link>
                    </NavigationMenuLink>
                </NavigationMenuItem>
            </NavigationMenuList>
        </NavigationMenu>
    );
}

const ListItem = React.forwardRef<
    React.ElementRef<"a">,
    React.ComponentPropsWithoutRef<"a"> & { icon?: React.ComponentType<{ className?: string }> }
>(({ className, title, children, icon: Icon, href, ...props }, ref) => {
    return (
        <li>
            <NavigationMenuLink asChild>
                <Link
                    ref={ref as any}
                    href={href || "#"}
                    className={cn(
                        "block select-none space-y-1 rounded-lg p-3 leading-none no-underline outline-none transition-colors hover:bg-primary/5 hover:text-primary focus:bg-primary/5 focus:text-primary",
                        className
                    )}
                    {...props}
                >
                    <div className="flex items-center gap-2 text-sm font-semibold leading-none text-foreground">
                        {Icon && <Icon className="h-4 w-4 text-primary" />}
                        {title}
                    </div>
                    <p className="line-clamp-1 text-xs leading-snug text-muted-foreground mt-1.5 ml-6">
                        {children}
                    </p>
                </Link>
            </NavigationMenuLink>
        </li>
    );
});
ListItem.displayName = "ListItem";
