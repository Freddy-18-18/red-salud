"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  notes: string;
  onNotesChange: (v: string) => void;
}

export function NotesPanel({ notes, onNotesChange }: Props) {
  return (
    <TabsContent value="notes" className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notas de la Sesión</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea placeholder="Escribe tus notas aquí..." value={notes} onChange={(e) => onNotesChange(e.target.value)} rows={15} className="resize-none" />
        </CardContent>
      </Card>
    </TabsContent>
  );
}

