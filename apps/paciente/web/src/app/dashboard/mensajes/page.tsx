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
import { MessageSquare } from "lucide-react";

// TODO: Import types from shared package once available
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
    // TODO: Replace with proper API client call
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Mensajes</h1>
        <NewConversationDialog
          onCreateConversation={handleCreateConversation}
          onLoadDoctors={handleLoadDoctors}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-200px)]">
        {/* Conversation List */}
        <div className="border rounded-lg overflow-hidden">
          {loading ? (
            <p className="p-4 text-gray-500 text-center">Cargando conversaciones...</p>
          ) : (
            <ConversationList
              conversations={conversations}
              selectedId={selectedConversation?.id}
              onSelect={handleSelectConversation}
              currentUserId={userId || ""}
            />
          )}
        </div>

        {/* Message Thread */}
        <div className="md:col-span-2 border rounded-lg flex flex-col overflow-hidden">
          {selectedConversation ? (
            <>
              {/* Conversation Header */}
              <div className="p-4 border-b bg-gray-50">
                <h3 className="font-semibold">
                  {selectedConversation.patient_id === userId
                    ? selectedConversation.doctor?.nombre_completo
                    : selectedConversation.patient?.nombre_completo}
                </h3>
                {selectedConversation.subject && (
                  <p className="text-sm text-gray-500">{selectedConversation.subject}</p>
                )}
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
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Selecciona una conversación</p>
                <p className="text-sm">o inicia una nueva con un doctor</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
