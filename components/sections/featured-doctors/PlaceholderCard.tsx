"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Stethoscope } from "lucide-react";

interface PlaceholderCardProps {
    specialty: string;
}

export function PlaceholderCard({ specialty }: PlaceholderCardProps) {
    return (
        <Card className="h-full border border-dashed border-muted-foreground/20 bg-muted/20 min-w-[280px] hover:border-muted-foreground/30 transition-all duration-300">
            <CardContent className="p-5 flex items-center gap-4">
                <div className="relative h-14 w-14 rounded-full overflow-hidden bg-muted flex-shrink-0 ring-2 ring-muted-foreground/10">
                    <div className="h-full w-full flex items-center justify-center text-muted-foreground/40">
                        <Stethoscope className="w-5 h-5" />
                    </div>
                </div>
                <div className="flex-1 min-w-0">
                    <div className="font-medium text-muted-foreground/70 truncate">
                        Próximamente
                    </div>
                    <div className="text-sm text-muted-foreground/50 truncate">
                        {specialty}
                    </div>
                    <div className="text-xs text-primary/60 font-medium mt-1.5">
                        Buscando especialistas
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
