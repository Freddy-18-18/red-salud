"use client";

import { MessageSquare, ArrowLeft } from "lucide-react";
import { useEffect, useState, useCallback } from "react";

import { ConversationList } from "@/components/messaging/conversation-list";
import { MessageInput } from "@/components/messaging/message-input";
import { MessageThread } from "@/components/messaging/message-thread";
import {
  getUserConversations,
  getConversationMessages,
  sendMessage,
  markMessagesAsRead,
  subscribeToMessages,
} from "@/lib/services/messaging-service";
import { supabase } from "@/lib/supabase/client";

interface MessageSender {
  id: string;
  full_name?: string;
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
  full_name?: string;
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
  counterpart?: ConversationUser;
  last_message?: LastMessage;
}

export default function MedicoMensajesPage() {
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
    if (!userId) return;
    void loadConversations();
  }, [userId, loadConversations]);

  const handleSelectConversation = async (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setShowMobileThread(true);
    const result = await getConversationMessages(conversation.id);
    if (result.success) setMessages(result.data as Message[]);
    if (userId) await markMessagesAsRead(conversation.id, userId);
  };

  useEffect(() => {
    if (!selectedConversation) return;
    const unsubscribe = subscribeToMessages(
      selectedConversation.id,
      (newMessage) => {
        setMessages((prev) => [...prev, newMessage as Message]);
        if (userId) markMessagesAsRead(selectedConversation.id, userId);
      },
    );
    return () => unsubscribe();
  }, [selectedConversation, userId]);

  const handleSendMessage = async (content: string) => {
    if (!userId || !selectedConversation) return;
    await sendMessage(userId, { conversation_id: selectedConversation.id, content });
  };

  const otherUserName = selectedConversation
    ? selectedConversation.counterpart?.full_name ||
      selectedConversation.patient?.full_name ||
      selectedConversation.doctor?.full_name ||
      "Paciente"
    : "";

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Mensajes</h1>
        <p className="text-gray-500 mt-1">Comunicate con tus pacientes</p>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden h-[calc(100vh-16rem)] lg:h-[calc(100vh-14rem)]">
        <div className="flex h-full">
          <div
            className={`w-full md:w-80 border-r border-gray-100 flex flex-col ${
              showMobileThread ? "hidden md:flex" : "flex"
            }`}
          >
            <div className="p-3 border-b border-gray-50">
              <h3 className="text-sm font-semibold text-gray-900">Conversaciones</h3>
            </div>
            {loading ? (
              <div className="p-4 space-y-3 text-sm text-gray-400">Cargando…</div>
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
                  <p className="text-sm text-gray-500">Sin conversaciones todavia</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Cuando un paciente te escriba, aparecera aqui.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className={`flex-1 flex flex-col ${showMobileThread ? "flex" : "hidden md:flex"}`}>
            {selectedConversation ? (
              <>
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
                    <h3 className="font-semibold text-gray-900 text-sm">{otherUserName}</h3>
                    {selectedConversation.subject && (
                      <p className="text-xs text-gray-500">{selectedConversation.subject}</p>
                    )}
                  </div>
                </div>

                <div className="flex-1 overflow-hidden">
                  <MessageThread messages={messages} currentUserId={userId || ""} />
                </div>

                <MessageInput onSend={handleSendMessage} />
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-center px-6">
                <div>
                  <MessageSquare className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">Selecciona una conversacion</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Elige una conversacion de la lista para responder.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
