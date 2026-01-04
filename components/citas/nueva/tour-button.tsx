/**
 * Botón de Tour para iniciar el tour interactivo
 */

"use client";

import { useEffect, useState } from "react";
import { HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCitaTourGuide } from "@/hooks/use-cita-tour-guide";

interface TourButtonProps {
  tourType?: "nueva-cita" | "calendario";
}

export function TourButton({ tourType = "nueva-cita" }: TourButtonProps) {
  const { startTour } = useCitaTourGuide();
  const [isLoading, setIsLoading] = useState(false);

  const handleStartTour = async () => {
    setIsLoading(true);
    try {
      await startTour();
    } catch (error) {
      console.error("Error iniciando tour:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={handleStartTour}
      disabled={isLoading}
      className="w-10 h-10 rounded-full p-0 hover:bg-blue-100"
      title="Iniciar tour de ayuda"
    >
      <HelpCircle className="h-5 w-5 text-blue-600" />
    </Button>
  );
}
