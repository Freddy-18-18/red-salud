class ChatChannel {
  final String id;
  final String? name;
  final String? avatarUrl;
  final DateTime? lastMessageAt;
  final String? lastMessage;

  const ChatChannel({
    required this.id,
    this.name,
    this.avatarUrl,
    this.lastMessageAt,
    this.lastMessage,
  });

  factory ChatChannel.fromJson(Map<String, dynamic> json) {
    return ChatChannel(
      id: json['id']?.toString() ?? '',
      name: json['name'] as String?,
      avatarUrl: json['avatar_url'] as String?,
      lastMessageAt: json['last_message_at'] != null
          ? DateTime.tryParse(json['last_message_at'] as String)
          : null,
    );
  }
}

class ChatMessage {
  final String id;
  final String channelId;
  final String senderId;
  final String? content;
  final DateTime createdAt;
  final bool isMine;

  const ChatMessage({
    required this.id,
    required this.channelId,
    required this.senderId,
    required this.createdAt,
    this.content,
    this.isMine = false,
  });

  factory ChatMessage.fromJson(Map<String, dynamic> json, String currentUserId) {
    final sender = json['sender_id']?.toString() ?? '';
    return ChatMessage(
      id: json['id']?.toString() ?? '',
      channelId: json['channel_id']?.toString() ?? '',
      senderId: sender,
      content: json['content'] as String?,
      createdAt: DateTime.parse(json['created_at'] as String),
      isMine: sender == currentUserId,
    );
  }
}
