"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface Props {
  status: string;
}

export function SessionHeader({ status }: Props) {
  const router = useRouter();
  const isActive = status === "active";
  const isWaiting = status === "waiting";

  return (
    <div className="flex items-center justify-between">
      <Button variant="ghost" onClick={() => router.push("/dashboard/paciente/telemedicina")}> 
        <ArrowLeft className="h-4 w-4 mr-2" />
        Volver
      </Button>
      <Badge variant={isActive ? "default" : "secondary"}>
        {isActive && "En Curso"}
        {isWaiting && "En Espera"}
        {status === "scheduled" && "Programada"}
        {status === "completed" && "Completada"}
        {status === "cancelled" && "Cancelada"}
      </Badge>
    </div>
  );
}

