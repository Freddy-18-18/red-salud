"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TabsContent } from "@/components/ui/tabs";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  sender_id: string;
  message: string;
  created_at: string;
  sender?: { nombre_completo?: string } | null;
}

interface Props {
  messages: Message[];
  userId?: string;
  messageText: string;
  onMessageTextChange: (v: string) => void;
  onSend: () => void;
}

export function ChatPanel({ messages, userId, messageText, onMessageTextChange, onSend }: Props) {
  return (
    <TabsContent value="chat" className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Chat de la Consulta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {messages.map((msg) => {
                const isOwn = msg.sender_id === userId;
                return (
                  <div key={msg.id} className={cn("flex", isOwn ? "justify-end" : "justify-start")}> 
                    <div className={cn("max-w-[80%] rounded-lg px-4 py-2", isOwn ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900")}> 
                      {!isOwn && (<p className="text-xs font-semibold mb-1">{msg.sender?.nombre_completo || "Doctor"}</p>)}
                      <p className="text-sm">{msg.message}</p>
                      <p className={cn("text-xs mt-1", isOwn ? "text-blue-100" : "text-gray-500")}> 
                        {new Date(msg.created_at).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
          <div className="flex gap-2">
            <Input
              placeholder="Escribe un mensaje..."
              value={messageText}
              onChange={(e) => onMessageTextChange(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") onSend();
              }}
            />
            <Button onClick={onSend} size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
}

