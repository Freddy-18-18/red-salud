// ============================================================================
// Red Salud Messenger - Types & Interfaces
// Inspired by: WhatsApp, Telegram, Signal, Discord, Teams, Slack
// ============================================================================

// --- Enums (match DB enums) ---

export type ChannelType =
  | "direct"
  | "group"
  | "patient_care"
  | "multidisciplinary"
  | "broadcast"
  | "announcement";

export type MessageType =
  | "text"
  | "image"
  | "video"
  | "audio"
  | "file"
  | "location"
  | "prescription"
  | "lab_result"
  | "appointment"
  | "voice_note"
  | "system"
  | "encrypted"
  | "poll"
  | "video_call";

export type DeliveryStatus =
  | "sending"
  | "sent"
  | "delivered"
  | "read"
  | "failed";

export type ParticipantRole =
  | "owner"
  | "admin"
  | "moderator"
  | "member"
  | "guest"
  | "observer";

export type PresenceStatus =
  | "online"
  | "offline"
  | "away"
  | "busy"
  | "do_not_disturb"
  | "invisible";

export type WorkspaceType =
  | "clinic"
  | "medical_team"
  | "patient_care"
  | "professional"
  | "emergency";

// --- Core Interfaces ---

export interface UserProfile {
  id: string;
  full_name: string;
  avatar_url?: string;
  role?: string;
  specialty?: string;
  email?: string;
}

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  workspace_type: WorkspaceType;
  owner_id: string;
  avatar_url?: string;
  banner_url?: string;
  is_public: boolean;
  max_members: number;
  max_channels: number;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  workspace_id: string;
  name: string;
  icon?: string;
  color?: string;
  position: number;
  is_collapsed: boolean;
  created_at: string;
}

export interface Channel {
  id: string;
  channel_type: ChannelType;
  name?: string;
  description?: string;
  avatar_url?: string;
  primary_entity_type?: string;
  primary_entity_id?: string;
  is_encrypted: boolean;
  is_archived: boolean;
  is_read_only: boolean;
  workspace_id?: string;
  category_id?: string;
  created_at: string;
  updated_at: string;
  last_message_at?: string;
  // Computed fields (joined from other tables)
  unread_count?: number;
  last_message?: Message;
  participants?: Participant[];
  other_participant?: UserProfile; // For DMs
  online_count?: number;
}

export interface Participant {
  id: string;
  channel_id: string;
  user_id: string;
  role: ParticipantRole;
  presence_status: PresenceStatus;
  notification_settings: NotificationSettings;
  permissions: ParticipantPermissions;
  joined_at: string;
  last_read_at?: string;
  last_active_at?: string;
  is_muted: boolean;
  is_banned: boolean;
  // Joined
  profile?: UserProfile;
}

export interface NotificationSettings {
  mentions_only: boolean;
  mute: boolean;
  mute_until?: string;
}

export interface ParticipantPermissions {
  can_send_messages: boolean;
  can_send_attachments: boolean;
  can_send_voice: boolean;
  can_video_call: boolean;
  can_invite: boolean;
  can_pin: boolean;
  can_manage: boolean;
}

export interface Message {
  id: string;
  channel_id: string;
  sender_id?: string;
  message_type: MessageType;
  content?: string;
  content_encrypted?: string;
  rich_content?: Record<string, unknown>;
  reply_to_id?: string;
  thread_root_id?: string;
  reactions: Reaction[];
  attachments: Attachment[];
  edit_count: number;
  edited_at?: string;
  deleted_at?: string;
  deleted_by?: string;
  delivery_status: DeliveryStatus;
  priority?: "low" | "normal" | "high" | "urgent";
  labels: string[];
  medical_context?: Record<string, unknown>;
  is_phi: boolean;
  created_at: string;
  updated_at: string;
  // Computed
  sender?: UserProfile;
  reply_to?: Message;
  thread_count?: number;
  read_by?: string[];
  is_own?: boolean;
}

export interface Reaction {
  emoji: string;
  user_ids: string[];
  count: number;
}

export interface Attachment {
  id: string;
  original_filename: string;
  file_url: string;
  file_size_bytes: number;
  mime_type: string;
  file_category?: string;
  thumbnail_url?: string;
  is_medical_document: boolean;
}

export interface TypingUser {
  user_id: string;
  profile?: UserProfile;
  last_typing_at: string;
}

export interface UserPresence {
  user_id: string;
  status_text?: string;
  status_emoji?: string;
  presence_status: PresenceStatus;
  last_seen_at?: string;
  is_last_seen_visible: boolean;
}

export interface Poll {
  id: string;
  channel_id: string;
  message_id?: string;
  created_by: string;
  question: string;
  options: PollOption[];
  is_anonymous: boolean;
  is_multi_select: boolean;
  allow_add_options: boolean;
  expires_at?: string;
  is_closed: boolean;
  total_votes: number;
  created_at: string;
}

export interface PollOption {
  id: string;
  text: string;
  icon?: string;
  color?: string;
  votes?: number;
  voters?: string[];
}

export interface VoiceCall {
  id: string;
  channel_id?: string;
  initiated_by: string;
  call_type: "audio" | "video";
  status: "ringing" | "ongoing" | "ended" | "rejected" | "failed";
  room_id?: string;
  started_at: string;
  ended_at?: string;
  duration_seconds?: number;
}

// --- UI State Types ---

export interface MessagingState {
  activeWorkspaceId?: string;
  activeChannelId?: string;
  channels: Channel[];
  messages: Message[];
  typingUsers: TypingUser[];
  searchQuery: string;
  searchResults: Message[];
  isSearching: boolean;
  isLoadingChannels: boolean;
  isLoadingMessages: boolean;
  isSending: boolean;
  error?: string;
  replyTo?: Message;
  editMessage?: Message;
  sidebarView: "channels" | "contacts" | "search" | "settings";
  showChannelInfo: boolean;
  showNewChat: boolean;
}

export interface ChatInputState {
  text: string;
  attachments: File[];
  replyTo?: Message;
  editMessage?: Message;
  isRecording: boolean;
  showEmojiPicker: boolean;
  showAttachMenu: boolean;
  mentions: string[];
}

// --- Event Types ---

export interface MessageEvent {
  type: "INSERT" | "UPDATE" | "DELETE";
  message: Message;
}

export interface PresenceEvent {
  type: "sync" | "join" | "leave";
  user_id: string;
  presence_status: PresenceStatus;
}

export interface TypingEvent {
  channel_id: string;
  user_id: string;
  is_typing: boolean;
}
