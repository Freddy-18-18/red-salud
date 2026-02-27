// ============================================================================
// Red Salud Messenger - Main Layout
// Orchestrates all messaging subcomponents into a unified 3-panel view
// Inspired by WhatsApp Web, Telegram Desktop, Discord, Teams, Slack
// ============================================================================

"use client";

import { useState, useEffect } from "react";
import { useMessaging } from "./use-messaging";
import { ConversationsList } from "./conversations-list";
import { ChatHeader } from "./chat-header";
import { ChatArea } from "./chat-area";
import { MessageInput } from "./message-input";
import { NewChatDialog } from "./new-chat-dialog";
import { ChannelInfoPanel } from "./channel-info-panel";
import { MessageSquare, Sparkles, Shield, Zap, Lock, Users } from "lucide-react";
import { cn } from "@/lib/utils";

export function MessagingLayout() {
  const {
    user,
    userId,
    channels,
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
  } = useMessaging();

  // UI State
  const [showNewChat, setShowNewChat] = useState(false);
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);

  // Responsive: detect mobile
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobileView(mobile);
      if (!mobile) setShowSidebar(true);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // On mobile, selecting a channel hides sidebar
  const handleSelectChannel = (channel: typeof activeChannel) => {
    if (!channel) return;
    selectChannel(channel);
    if (isMobileView) setShowSidebar(false);
  };

  // On mobile, going back shows sidebar
  const handleBack = () => {
    setShowSidebar(true);
  };

  // Handle send (supports edit)
  const handleSend = (content: string) => {
    if (editMsg) {
      handleEditMessage(editMsg.id, content);
    } else {
      sendMessage(content);
    }
  };

  return (
    <div className="flex h-full w-full bg-white dark:bg-gray-950 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 shadow-xl">
      {/* ================================================================ */}
      {/* LEFT PANEL - Conversations Sidebar                               */}
      {/* ================================================================ */}
      <div
        className={cn(
          "shrink-0 border-r border-gray-200 dark:border-gray-800 transition-all duration-300",
          isMobileView
            ? showSidebar
              ? "w-full absolute inset-0 z-20 bg-white dark:bg-gray-950"
              : "w-0 overflow-hidden"
            : "w-[380px]"
        )}
      >
        <ConversationsList
          channels={channels}
          activeChannelId={activeChannel?.id}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSelectChannel={handleSelectChannel}
          onNewChat={() => setShowNewChat(true)}
          isLoading={isLoadingChannels}
          currentUserId={userId}
        />
      </div>

      {/* ================================================================ */}
      {/* CENTER PANEL - Chat Area                                         */}
      {/* ================================================================ */}
      <div
        className={cn(
          "flex-1 flex flex-col min-w-0 relative",
          isMobileView && showSidebar && "hidden"
        )}
      >
        {activeChannel ? (
          <>
            {/* Chat Header */}
            <ChatHeader
              channel={activeChannel}
              participants={participants}
              currentUserId={userId}
              onBack={handleBack}
              onSearch={() => {}}
              onInfo={() => setShowInfoPanel(!showInfoPanel)}
            />

            {/* Messages Area */}
            <div className="flex-1 min-h-0">
              <ChatArea
                messages={messages}
                typingUsers={typingUsers}
                currentUserId={userId}
                isLoading={isLoadingMessages}
                onReply={(msg) => setReplyTo(msg)}
                onEdit={(msg) => setEditMsg(msg)}
                onDelete={handleDeleteMessage}
                onReaction={handleToggleReaction}
                onLoadMore={loadMoreMessages}
                channelName={activeChannel.name || undefined}
                participants={participants}
              />
            </div>

            {/* Message Input */}
            <MessageInput
              onSend={handleSend}
              onTyping={handleTyping}
              replyTo={replyTo}
              editMessage={editMsg}
              onCancelReply={() => setReplyTo(null)}
              onCancelEdit={() => setEditMsg(null)}
              onEditSubmit={handleEditMessage}
              isSending={isSending}
            />
          </>
        ) : (
          /* ============================================================ */
          /* Empty State - No chat selected                               */
          /* ============================================================ */
          <EmptyState />
        )}
      </div>

      {/* ================================================================ */}
      {/* RIGHT PANEL - Channel Info (Telegram/Discord style)             */}
      {/* ================================================================ */}
      {activeChannel && !isMobileView && (
        <ChannelInfoPanel
          channel={activeChannel}
          participants={participants}
          currentUserId={userId}
          isOpen={showInfoPanel}
          onClose={() => setShowInfoPanel(false)}
        />
      )}

      {/* ================================================================ */}
      {/* NEW CHAT DIALOG                                                  */}
      {/* ================================================================ */}
      <NewChatDialog
        isOpen={showNewChat}
        onClose={() => setShowNewChat(false)}
        onCreateDirect={(uid) => {
          createNewDirectChat(uid);
          setShowNewChat(false);
        }}
        onCreateGroup={(name, members) => {
          createNewGroupChat(name, members);
          setShowNewChat(false);
        }}
        onSearchUsers={searchContacts}
      />
    </div>
  );
}

// ============================================================================
// Empty State Component
// ============================================================================
function EmptyState() {
  return (
    <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-emerald-50/30 dark:from-black dark:via-black dark:to-black">
      {/* Background pattern */}
      <div
        className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23059669' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative text-center space-y-6 max-w-md px-8">
        {/* Logo/Icon */}
        <div className="relative mx-auto w-fit">
          <div className="absolute inset-0 bg-emerald-400/20 dark:bg-emerald-600/20 blur-3xl rounded-full scale-150" />
          <div className="relative">
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-5 rounded-3xl shadow-2xl shadow-emerald-500/20">
              <MessageSquare className="h-14 w-14 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 bg-gradient-to-br from-yellow-400 to-amber-500 p-1.5 rounded-lg shadow-lg animate-bounce">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Red Salud Messenger
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
            Selecciona una conversación o inicia un nuevo chat para comenzar a
            comunicarte con tu equipo médico de forma segura.
          </p>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap gap-2 justify-center">
          {[
            { icon: Lock, label: "Cifrado E2E" },
            { icon: Zap, label: "Tiempo real" },
            { icon: Shield, label: "HIPAA" },
            { icon: Users, label: "Equipos" },
          ].map((feat) => (
            <span
              key={feat.label}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 rounded-full text-xs font-medium"
            >
              <feat.icon className="h-3 w-3" />
              {feat.label}
            </span>
          ))}
        </div>

        {/* Keyboard shortcut hint */}
        <p className="text-xs text-gray-400 dark:text-gray-500">
          <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-[10px] font-mono">
            Ctrl
          </kbd>{" "}
          +{" "}
          <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-[10px] font-mono">
            N
          </kbd>{" "}
          para nuevo chat
        </p>
      </div>
    </div>
  );
}
