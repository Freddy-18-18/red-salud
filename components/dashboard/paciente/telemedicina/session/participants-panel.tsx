"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User } from "lucide-react";

interface Participant {
  id: string;
  role: string;
  connection_status: string;
}

interface Props {
  participants: Participant[];
  userName: string;
  doctorName?: string;
}

export function ParticipantsPanel({ participants, userName, doctorName }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Participantes ({participants.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {participants.map((participant) => (
            <div key={participant.id} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {participant.role === "patient" ? userName : `Dr. ${doctorName}`}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {participant.role === "patient" ? "Paciente" : "Doctor"}
                  </p>
                </div>
              </div>
              <Badge variant={participant.connection_status === "connected" ? "default" : "secondary"}>
                {participant.connection_status === "connected" ? "Conectado" : "Desconectado"}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

