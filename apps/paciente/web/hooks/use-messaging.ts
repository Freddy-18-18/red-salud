"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getUserConversations,
  getConversation,
  createConversation,
  getConversationMessages,
  sendMessage,
  markMessagesAsRead,
  archiveConversation,
  reactivateConversation,
  getUnreadMessagesCount,
  subscribeToMessages,
} from "@/lib/supabase/services/messaging-service";
import type {
  Conversation,
  Message,
  CreateConversationData,
  SendMessageData,
} from "@/lib/supabase/types/messaging";

export function useMessaging(userId: string) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadConversations = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    const result = await getUserConversations(userId);

    if (result.success) {
      setConversations(result.data);
    } else {
      setError("Error al cargar conversaciones");
      console.error(result.error);
    }

    setLoading(false);
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      const result = await getUserConversations(userId);
      if (result.success) {
        setConversations(result.data);
      } else {
        setError("Error al cargar conversaciones");
        console.error(result.error);
      }
      
      const unreadResult = await getUnreadMessagesCount(userId);
      if (unreadResult.success) {
        setUnreadCount(unreadResult.data);
      }
      
      setLoading(false);
    };
    
    loadData();
  }, [userId]);

  const createNewConversation = async (data: CreateConversationData) => {
    const result = await createConversation(userId, data);

    if (result.success && result.data) {
      await loadConversations();
      return { success: true, data: result.data };
    } else {
      setError("Error al crear conversación");
      return { success: false, error: result.error ? String(result.error) : "Error desconocido" };
    }
  };

  const archiveConv = async (conversationId: string) => {
    const result = await archiveConversation(conversationId);

    if (result.success) {
      await loadConversations();
    } else {
      setError("Error al archivar conversación");
      throw result.error;
    }
  };

  const reactivateConv = async (conversationId: string) => {
    const result = await reactivateConversation(conversationId);

    if (result.success) {
      await loadConversations();
    } else {
      setError("Error al reactivar conversación");
      throw result.error;
    }
  };

  return {
    conversations,
    loading,
    error,
    unreadCount,
    refreshConversations: loadConversations,
    createConversation: createNewConversation,
    archiveConversation: archiveConv,
    reactivateConversation: reactivateConv,
  };
}

export function useConversation(conversationId: string, userId: string) {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMessages = useCallback(async () => {
    if (!conversationId) return;

    setLoading(true);
    setError(null);

    const result = await getConversationMessages(conversationId);

    if (result.success) {
      setMessages(result.data);
      // Marcar mensajes como leídos
      await markMessagesAsRead(conversationId, userId);
    } else {
      setError("Error al cargar mensajes");
      console.error(result.error);
    }

    setLoading(false);
  }, [conversationId, userId]);

  useEffect(() => {
    if (!conversationId) return;
    
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      const convResult = await getConversation(conversationId);
      if (convResult.success) {
        setConversation(convResult.data);
      } else {
        setError("Error al cargar conversación");
        console.error(convResult.error);
      }
      
      const msgsResult = await getConversationMessages(conversationId);
      if (msgsResult.success) {
        setMessages(msgsResult.data);
        await markMessagesAsRead(conversationId, userId);
      } else {
        setError("Error al cargar mensajes");
        console.error(msgsResult.error);
      }
      
      setLoading(false);
    };
    
    loadData();
  }, [conversationId, userId]);

  // Suscribirse a nuevos mensajes en tiempo real
  useEffect(() => {
    if (!conversationId) return;

    const unsubscribe = subscribeToMessages(conversationId, (newMessage) => {
      setMessages((prev) => [...prev, newMessage]);

      // Si el mensaje no es del usuario actual, marcarlo como leído
      if (newMessage.sender_id !== userId) {
        markMessagesAsRead(conversationId, userId);
      }
    });

    return unsubscribe;
  }, [conversationId, userId]);

  const sendNewMessage = async (data: SendMessageData) => {
    setSending(true);
    setError(null);

    const result = await sendMessage(userId, data);

    if (result.success) {
      // El mensaje se agregará automáticamente por la suscripción en tiempo real
      setSending(false);
      return result.data;
    } else {
      setError("Error al enviar mensaje");
      setSending(false);
      throw result.error;
    }
  };

  return {
    conversation,
    messages,
    loading,
    sending,
    error,
    sendMessage: sendNewMessage,
    refreshMessages: loadMessages,
  };
}
