"use client";

import { SOAPEditor } from "@/components/dashboard/medico/consulta/soap-notes/soap-editor";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@red-salud/design-system";

export default function SOAPNotesPage() {
  const handleSave = async (note: Record<string, unknown>) => {
    // TODO: persist to Supabase soap_notes table
    console.log("Saving SOAP note:", note);
    await new Promise((r) => setTimeout(r, 500));
  };

  return (
    <div className="container max-w-4xl mx-auto py-6 space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/consultorio/consulta">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notas Clínicas SOAP</h1>
          <p className="text-sm text-muted-foreground">
            Documentación clínica estandarizada — Subjetivo, Objetivo, Evaluación, Plan
          </p>
        </div>
      </div>

      <SOAPEditor
        onSave={handleSave}
        readOnly={false}
      />
    </div>
  );
}
