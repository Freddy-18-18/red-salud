// ============================================================================
// Red Salud Messenger - useMessaging Hook
// Main composable hook for the messaging system
// ============================================================================

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import type { Channel, Message, TypingUser, UserProfile } from "./types";
import {
  getUserChannels,
  getChannelMessages,
  getChannelWithParticipants,
  sendMessage as sendMessageService,
  editMessage as editMessageService,
  deleteMessage as deleteMessageService,
  toggleReaction as toggleReactionService,
  markChannelAsRead,
  setTypingIndicator,
  clearTypingIndicator,
  updatePresence,
  searchUsers as searchUsersService,
  createDirectChannel,
  createGroupChannel,
  subscribeToMessages,
  subscribeToTyping,
  subscribeToChannelUpdates,
} from "./messaging-service";

export function useMessaging() {
  const { user } = useAuth();
  const userId = user?.id;

  // --- State ---
  const [channels, setChannels] = useState<Channel[]>([]);
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [isLoadingChannels, setIsLoadingChannels] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [editMsg, setEditMsg] = useState<Message | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [participants, setParticipants] = useState<
    Array<{ profile?: UserProfile; role: string; user_id: string }>
  >([]);

  // Refs for subscriptions
  const msgSubscriptionRef = useRef<ReturnType<typeof subscribeToMessages> | null>(null);
  const typingSubscriptionRef = useRef<ReturnType<typeof subscribeToTyping> | null>(null);
  const channelSubscriptionRef = useRef<ReturnType<typeof subscribeToChannelUpdates> | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // --- Load channels ---
  const loadChannels = useCallback(async () => {
    if (!userId) return;
    setIsLoadingChannels(true);
    try {
      const data = await getUserChannels(userId);
      setChannels(data);
    } catch (err) {
      console.error("Error loading channels:", err);
    } finally {
      setIsLoadingChannels(false);
    }
  }, [userId]);

  // --- Select channel ---
  const selectChannel = useCallback(
    async (channel: Channel) => {
      if (!userId) return;

      setActiveChannel(channel);
      setMessages([]);
      setIsLoadingMessages(true);
      setReplyTo(null);
      setEditMsg(null);

      try {
        // Load messages
        const msgs = await getChannelMessages(channel.id);
        setMessages(msgs);

        // Load participants
        const result = await getChannelWithParticipants(channel.id);
        if (result) {
          setParticipants(result.participants);
        }

        // Mark as read
        await markChannelAsRead(channel.id, userId);

        // Update channel in list to clear unread
        setChannels((prev) =>
          prev.map((ch) =>
            ch.id === channel.id ? { ...ch, unread_count: 0 } : ch
          )
        );
      } catch (err) {
        console.error("Error loading channel:", err);
      } finally {
        setIsLoadingMessages(false);
      }

      // Setup real-time subscriptions
      // Remove old subscriptions
      if (msgSubscriptionRef.current) {
        msgSubscriptionRef.current.unsubscribe();
      }
      if (typingSubscriptionRef.current) {
        typingSubscriptionRef.current.unsubscribe();
      }

      // Subscribe to new messages
      msgSubscriptionRef.current = subscribeToMessages(
        channel.id,
        (newMsg) => {
          setMessages((prev) => {
            // Check if message already exists (update case)
            const existingIdx = prev.findIndex((m) => m.id === newMsg.id);
            if (existingIdx >= 0) {
              const updated = [...prev];
              updated[existingIdx] = newMsg;
              return updated;
            }
            return [...prev, newMsg];
          });

          // Mark as read if it's not our message
          if (newMsg.sender_id !== userId) {
            markChannelAsRead(channel.id, userId);
          }
        }
      );

      // Subscribe to typing
      typingSubscriptionRef.current = subscribeToTyping(
        channel.id,
        (typingUserId, isTyping) => {
          if (typingUserId === userId) return;
          setTypingUsers((prev) => {
            if (isTyping) {
              if (prev.some((t) => t.user_id === typingUserId)) return prev;
              return [
                ...prev,
                { user_id: typingUserId, last_typing_at: new Date().toISOString() },
              ];
            }
            return prev.filter((t) => t.user_id !== typingUserId);
          });
        }
      );
    },
    [userId]
  );

  // --- Send message ---
  const sendMessage = useCallback(
    async (content: string, messageType: "text" | "image" | "file" = "text") => {
      if (!userId || !activeChannel || !content.trim()) return;

      setIsSending(true);
      try {
        const msg = await sendMessageService({
          channelId: activeChannel.id,
          senderId: userId,
          content: content.trim(),
          messageType,
          replyToId: replyTo?.id,
        });

        if (msg) {
          // Message will arrive via subscription, but add optimistically
          setMessages((prev) => {
            if (prev.some((m) => m.id === msg.id)) return prev;
            return [...prev, { ...msg, is_own: true }];
          });
          setReplyTo(null);
          setEditMsg(null);

          // Clear typing
          clearTypingIndicator(activeChannel.id, userId);
        }
      } catch (err) {
        console.error("Error sending message:", err);
      } finally {
        setIsSending(false);
      }
    },
    [userId, activeChannel, replyTo]
  );

  // --- Edit message ---
  const handleEditMessage = useCallback(
    async (messageId: string, newContent: string) => {
      const success = await editMessageService(messageId, newContent);
      if (success) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === messageId
              ? {
                  ...m,
                  content: newContent,
                  edited_at: new Date().toISOString(),
                  edit_count: m.edit_count + 1,
                }
              : m
          )
        );
        setEditMsg(null);
      }
    },
    []
  );

  // --- Delete message ---
  const handleDeleteMessage = useCallback(
    async (messageId: string) => {
      if (!userId) return;
      const success = await deleteMessageService(messageId, userId);
      if (success) {
        setMessages((prev) => prev.filter((m) => m.id !== messageId));
      }
    },
    [userId]
  );

  // --- Toggle reaction ---
  const handleToggleReaction = useCallback(
    async (messageId: string, emoji: string) => {
      if (!userId) return;
      await toggleReactionService(messageId, userId, emoji);
    },
    [userId]
  );

  // --- Typing ---
  const handleTyping = useCallback(() => {
    if (!userId || !activeChannel) return;

    setTypingIndicator(activeChannel.id, userId);

    // Clear typing after 3 seconds of no input
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      if (activeChannel) {
        clearTypingIndicator(activeChannel.id, userId);
      }
    }, 3000);
  }, [userId, activeChannel]);

  // --- Load more messages (pagination) ---
  const loadMoreMessages = useCallback(async () => {
    if (!activeChannel || messages.length === 0) return;

    const oldestMessage = messages[0];
    if (!oldestMessage) return;
    const olderMessages = await getChannelMessages(
      activeChannel.id,
      50,
      oldestMessage.created_at
    );

    if (olderMessages.length > 0) {
      setMessages((prev) => [...olderMessages, ...prev]);
    }

    return olderMessages.length;
  }, [activeChannel, messages]);

  // --- Create new chat ---
  const createNewDirectChat = useCallback(
    async (otherUserId: string) => {
      if (!userId) return null;
      const channel = await createDirectChannel(userId, otherUserId);
      if (channel) {
        await loadChannels();
        selectChannel(channel);
      }
      return channel;
    },
    [userId, loadChannels, selectChannel]
  );

  const createNewGroupChat = useCallback(
    async (name: string, memberIds: string[]) => {
      if (!userId) return null;
      const channel = await createGroupChannel(name, userId, memberIds);
      if (channel) {
        await loadChannels();
        selectChannel(channel);
      }
      return channel;
    },
    [userId, loadChannels, selectChannel]
  );

  // --- Search contacts ---
  const searchContacts = useCallback(
    async (query: string): Promise<UserProfile[]> => {
      if (!userId || !query.trim()) return [];
      return searchUsersService(query, userId);
    },
    [userId]
  );

  // --- Initial load ---
  useEffect(() => {
    if (userId) {
      loadChannels();
      updatePresence(userId, "online");

      // Subscribe to channel updates
      channelSubscriptionRef.current = subscribeToChannelUpdates(userId, () => {
        loadChannels();
      });
    }

    return () => {
      // Cleanup
      if (msgSubscriptionRef.current) msgSubscriptionRef.current.unsubscribe();
      if (typingSubscriptionRef.current) typingSubscriptionRef.current.unsubscribe();
      if (channelSubscriptionRef.current) channelSubscriptionRef.current.unsubscribe();
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (userId) updatePresence(userId, "offline");
    };
  }, [userId, loadChannels]);

  // --- Filtered channels ---
  const filteredChannels = searchQuery
    ? channels.filter(
        (ch) =>
          ch.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ch.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : channels;

  return {
    // State
    user,
    userId,
    channels: filteredChannels,
    activeChannel,
    messages,
    typingUsers,
    participants,
    isLoadingChannels,
    isLoadingMessages,
    isSending,
    replyTo,
    editMsg,
    searchQuery,

    // Actions
    selectChannel,
    sendMessage,
    handleEditMessage,
    handleDeleteMessage,
    handleToggleReaction,
    handleTyping,
    loadMoreMessages,
    createNewDirectChat,
    createNewGroupChat,
    searchContacts,
    setReplyTo,
    setEditMsg,
    setSearchQuery,
    loadChannels,
  };
}
