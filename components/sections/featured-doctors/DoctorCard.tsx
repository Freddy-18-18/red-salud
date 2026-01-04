"use client";

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Stethoscope } from "lucide-react";
import type { Doctor } from "./featured-doctors-data";
import { formatUSD } from "./featured-doctors-data";

interface DoctorCardProps {
    doctor: Doctor;
}

export function DoctorCard({ doctor }: DoctorCardProps) {
    return (
        <Card className="h-full border border-border shadow-sm hover:shadow-lg hover:border-primary/50 group bg-card min-w-[280px] transition-all duration-300">
            <CardContent className="p-5 flex items-center gap-4">
                <div className="relative h-14 w-14 rounded-full overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/10 flex-shrink-0 ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all duration-300">
                    {doctor?.profile?.avatar_url ? (
                        <Image
                            src={doctor.profile.avatar_url}
                            alt={doctor?.profile?.nombre_completo || "Médico"}
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <div className="h-full w-full flex items-center justify-center text-primary font-bold bg-primary/5">
                            <Stethoscope className="w-5 h-5" />
                        </div>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="font-bold text-foreground truncate">
                        {doctor?.profile?.nombre_completo || "Dr. Especialista"}
                    </div>
                    <div className="text-sm text-muted-foreground truncate">
                        {doctor?.specialty?.name || "Medicina General"}
                    </div>
                    {typeof doctor?.tarifa_consulta !== "undefined" && (
                        <div className="flex items-center gap-2 text-sm text-primary font-semibold mt-1.5 tabular-nums">
                            <span>{formatUSD(doctor.tarifa_consulta)}</span>
                            <span className="text-muted-foreground/50">·</span>
                            <span className="flex items-center gap-1 text-muted-foreground font-normal text-xs">
                                <Clock className="w-3 h-3" />
                                {doctor?.consultation_duration || 30} min
                            </span>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
