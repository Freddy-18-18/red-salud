"use client";

import type { LucideIcon } from "lucide-react";

import { useState, useEffect } from "react";
import { useMessaging, useConversation } from "@/hooks/use-messaging";
import { ConversationList } from "@/components/messaging/conversation-list";
import { MessageThread } from "@/components/messaging/message-thread";
import { MessageInput } from "@/components/messaging/message-input";
import { NewConversationDialog } from "@/components/messaging/new-conversation-dialog";
import { Button } from "@red-salud/ui";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@red-salud/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@red-salud/ui";
import { Avatar, AvatarFallback, AvatarImage } from "@red-salud/ui";
import { Badge } from "@red-salud/ui";
import {
  MessageSquare,
  Archive,
  ArchiveRestore,
  Loader2,
  Info,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import type { Conversation } from "@/lib/supabase/types/messaging";

export default function MensajeriaPage() {
  const [userId, setUserId] = useState<string>("");
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [activeTab, setActiveTab] = useState<"active" | "archived">("active");

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    getUser();
  }, []);

  const {
    conversations,
    loading: conversationsLoading,
    error: conversationsError,
    unreadCount,
    refreshConversations,
    createConversation,
    archiveConversation,
    reactivateConversation,
  } = useMessaging(userId);

  const {
    conversation: currentConversation,
    messages,
    loading: messagesLoading,
    sending,
    error: messagesError,
    sendMessage,
  } = useConversation(selectedConversation?.id || "", userId);

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
  };

  const handleSendMessage = async (content: string) => {
    if (!selectedConversation) return;

    await sendMessage({
      conversation_id: selectedConversation.id,
      content,
    });

    // Refrescar lista de conversaciones para actualizar último mensaje
    refreshConversations();
  };

  const handleArchive = async () => {
    if (!selectedConversation) return;

    await archiveConversation(selectedConversation.id);
    setSelectedConversation(null);
  };

  const handleReactivate = async () => {
    if (!selectedConversation) return;

    await reactivateConversation(selectedConversation.id);
    setSelectedConversation(null);
  };

  if (!userId) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const otherUser =
    selectedConversation?.patient_id === userId
      ? selectedConversation?.doctor
      : selectedConversation?.patient;

  const initials = otherUser?.nombre_completo
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mensajería</h1>
          <p className="text-muted-foreground">
            Comunícate con tus doctores de forma segura
          </p>
        </div>
        <NewConversationDialog onCreateConversation={createConversation} />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 h-[700px]">
            {/* Lista de conversaciones */}
            <div className="border-r">
              <div className="p-4 border-b">
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "active" | "archived")}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="active" className="relative">
                      Activas
                      {unreadCount > 0 && (
                        <Badge
                          variant="destructive"
                          className="ml-2 h-5 w-5 rounded-full p-0 text-xs"
                        >
                          {unreadCount}
                        </Badge>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="archived">
                      <Archive className="h-4 w-4 mr-2" />
                      Archivadas
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {conversationsLoading ? (
                <div className="flex items-center justify-center h-[600px]">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : conversationsError ? (
                <div className="flex items-center justify-center h-[600px] p-4 text-center">
                  <p className="text-destructive">{conversationsError}</p>
                </div>
              ) : (
                <ConversationList
                  conversations={conversations}
                  selectedId={selectedConversation?.id}
                  onSelect={handleSelectConversation}
                  currentUserId={userId}
                  showArchived={activeTab === "archived"}
                />
              )}
            </div>

            {/* Área de mensajes */}
            <div className="lg:col-span-2 flex flex-col">
              {selectedConversation ? (
                <>
                  {/* Header de conversación */}
                  <div className="p-4 border-b">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={otherUser?.avatar_url} />
                          <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {otherUser?.nombre_completo}
                          </p>
                          {selectedConversation.subject && (
                            <p className="text-sm text-muted-foreground">
                              {selectedConversation.subject}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {selectedConversation.status === "active" ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleArchive}
                          >
                            <Archive className="h-4 w-4 mr-2" />
                            Archivar
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleReactivate}
                          >
                            <ArchiveRestore className="h-4 w-4 mr-2" />
                            Reactivar
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Mensajes */}
                  <div className="flex-1 overflow-hidden">
                    {messagesLoading ? (
                      <div className="flex items-center justify-center h-full">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      </div>
                    ) : messagesError ? (
                      <div className="flex items-center justify-center h-full p-4 text-center">
                        <p className="text-destructive">{messagesError}</p>
                      </div>
                    ) : (
                      <MessageThread messages={messages} currentUserId={userId} />
                    )}
                  </div>

                  {/* Input de mensaje */}
                  {selectedConversation.status === "active" && (
                    <MessageInput
                      onSend={handleSendMessage}
                      disabled={sending}
                    />
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <MessageSquare className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    Selecciona una conversación
                  </h3>
                  <p className="text-muted-foreground max-w-sm">
                    Elige una conversación de la lista o inicia una nueva para
                    comenzar a comunicarte con tus doctores
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Información adicional */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Información sobre Mensajería
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            • Los mensajes son privados y seguros entre tú y tu doctor
          </p>
          <p>
            • Puedes adjuntar archivos relacionados con tu consulta
          </p>
          <p>
            • Las conversaciones archivadas se pueden reactivar en cualquier momento
          </p>
          <p>
            • Los doctores responderán en su horario de atención
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
