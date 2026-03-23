"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import {
  getUserConversations,
  getConversationMessages,
  sendMessage,
  markMessagesAsRead,
  subscribeToMessages,
  createConversation,
} from "@/lib/services/messaging-service";
import { ConversationList } from "@/components/messaging/conversation-list";
import { MessageThread } from "@/components/messaging/message-thread";
import { MessageInput } from "@/components/messaging/message-input";
import { NewConversationDialog } from "@/components/messaging/new-conversation-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare, ArrowLeft } from "lucide-react";

interface MessageSender {
  id: string;
  nombre_completo?: string;
  avatar_url?: string;
  role?: string;
}

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  attachment_url?: string;
  attachment_name?: string;
  is_read?: boolean;
  created_at: string;
  sender?: MessageSender;
}

interface ConversationUser {
  id: string;
  nombre_completo?: string;
  email?: string;
  avatar_url?: string;
}

interface LastMessage {
  content: string;
}

interface Conversation {
  id: string;
  patient_id: string;
  doctor_id: string;
  subject?: string;
  status: "active" | "archived";
  last_message_at?: string;
  unread_count?: number;
  patient?: ConversationUser;
  doctor?: ConversationUser;
  last_message?: LastMessage;
}

export default function MensajesPage() {
  const [userId, setUserId] = useState<string | undefined>();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMobileThread, setShowMobileThread] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id);
    };
    getUser();
  }, []);

  const loadConversations = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const result = await getUserConversations(userId);
    if (result.success) {
      setConversations(result.data as Conversation[]);
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    if (userId) {
      loadConversations();
    }
  }, [userId, loadConversations]);

  const handleSelectConversation = async (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setShowMobileThread(true);

    const result = await getConversationMessages(conversation.id);
    if (result.success) {
      setMessages(result.data as Message[]);
    }

    if (userId) {
      await markMessagesAsRead(conversation.id, userId);
    }
  };

  // Real-time subscription
  useEffect(() => {
    if (!selectedConversation) return;

    const unsubscribe = subscribeToMessages(
      selectedConversation.id,
      (newMessage) => {
        setMessages((prev) => [...prev, newMessage as Message]);
        if (userId) {
          markMessagesAsRead(selectedConversation.id, userId);
        }
      }
    );

    return () => unsubscribe();
  }, [selectedConversation, userId]);

  const handleSendMessage = async (content: string) => {
    if (!userId || !selectedConversation) return;
    await sendMessage(userId, {
      conversation_id: selectedConversation.id,
      content,
    });
  };

  const handleCreateConversation = async (data: { doctor_id: string; subject?: string; initial_message: string }) => {
    if (!userId) return { success: false, error: "No user" };
    const result = await createConversation(userId, data);
    if (result.success) {
      await loadConversations();
    }
    return result;
  };

  const handleLoadDoctors = async () => {
    const { data } = await supabase
      .from("doctor_details")
      .select(`
        id,
        specialty:specialties(name),
        profile:profiles!inner(nombre_completo, avatar_url)
      `)
      .eq("verified", true);

    return (data || []).map((d: Record<string, unknown>) => ({
      id: d.id as string,
      profile: d.profile as { nombre_completo?: string; avatar_url?: string },
      specialty: d.specialty as { name: string },
    }));
  };

  const otherUserName = selectedConversation
    ? (selectedConversation.patient_id === userId
        ? selectedConversation.doctor?.nombre_completo
        : selectedConversation.patient?.nombre_completo) || "Doctor"
    : "";

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Mensajes</h1>
          <p className="text-gray-500 mt-1">Comunicate con tus doctores</p>
        </div>
        <NewConversationDialog
          onCreateConversation={handleCreateConversation}
          onLoadDoctors={handleLoadDoctors}
        />
      </div>

      {/* Messaging area */}
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden h-[calc(100vh-16rem)] lg:h-[calc(100vh-14rem)]">
        <div className="flex h-full">
          {/* Conversation list */}
          <div className={`w-full md:w-80 border-r border-gray-100 flex flex-col ${
            showMobileThread ? "hidden md:flex" : "flex"
          }`}>
            <div className="p-3 border-b border-gray-50">
              <h3 className="text-sm font-semibold text-gray-900">Conversaciones</h3>
            </div>
            {loading ? (
              <div className="p-4 space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                ))}
              </div>
            ) : conversations.length > 0 ? (
              <div className="flex-1 overflow-y-auto">
                <ConversationList
                  conversations={conversations}
                  selectedId={selectedConversation?.id}
                  onSelect={handleSelectConversation}
                  currentUserId={userId || ""}
                />
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center p-6">
                <div className="text-center">
                  <MessageSquare className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No tienes conversaciones</p>
                  <p className="text-xs text-gray-400 mt-1">Inicia una nueva con un doctor</p>
                </div>
              </div>
            )}
          </div>

          {/* Message thread */}
          <div className={`flex-1 flex flex-col ${
            showMobileThread ? "flex" : "hidden md:flex"
          }`}>
            {selectedConversation ? (
              <>
                {/* Conversation header */}
                <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                  <button
                    onClick={() => setShowMobileThread(false)}
                    className="md:hidden p-1 text-gray-400 hover:text-gray-600"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center">
                    <span className="text-sm font-semibold text-emerald-600">
                      {otherUserName.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">
                      Dr. {otherUserName}
                    </h3>
                    {selectedConversation.subject && (
                      <p className="text-xs text-gray-500">{selectedConversation.subject}</p>
                    )}
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-hidden">
                  <MessageThread
                    messages={messages}
                    currentUserId={userId || ""}
                  />
                </div>

                {/* Input */}
                <MessageInput onSend={handleSendMessage} />
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <EmptyState
                  icon={MessageSquare}
                  title="Selecciona una conversacion"
                  description="Elige una conversacion de la lista o inicia una nueva con un doctor"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
