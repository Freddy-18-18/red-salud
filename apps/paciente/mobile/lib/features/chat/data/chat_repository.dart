import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../../../core/providers/supabase_provider.dart';
import '../domain/chat_models.dart';

class ChatRepository {
  final SupabaseClient _client;
  ChatRepository(this._client);

  /// All channels where the current user participates.
  Future<List<ChatChannel>> myChannels() async {
    final uid = _client.auth.currentUser?.id;
    if (uid == null) return const [];
    final res = await _client
        .from('chat_participants')
        .select('channel:chat_channels(id,name,avatar_url,last_message_at)')
        .eq('user_id', uid)
        .order('last_active_at', ascending: false);
    return (res as List)
        .map((row) => row['channel'] as Map<String, dynamic>?)
        .whereType<Map<String, dynamic>>()
        .map(ChatChannel.fromJson)
        .toList();
  }

  /// Last 100 messages of a channel, oldest first for natural rendering.
  Future<List<ChatMessage>> messages(String channelId) async {
    final uid = _client.auth.currentUser?.id ?? '';
    final res = await _client
        .from('chat_messages')
        .select('id,channel_id,sender_id,content,created_at')
        .eq('channel_id', channelId)
        .filter('deleted_at', 'is', null)
        .order('created_at', ascending: false)
        .limit(100);
    final list = (res as List)
        .map((e) => ChatMessage.fromJson(e as Map<String, dynamic>, uid))
        .toList()
        .reversed
        .toList();
    return list;
  }

  /// Send a plain-text message into a channel.
  Future<void> send({required String channelId, required String content}) async {
    final uid = _client.auth.currentUser?.id;
    if (uid == null) throw Exception('No autenticado');
    await _client.from('chat_messages').insert({
      'channel_id': channelId,
      'sender_id': uid,
      'content': content,
      'message_type': 'text',
    });
  }

  /// Realtime stream of new messages on a channel.
  Stream<List<Map<String, dynamic>>> stream(String channelId) {
    return _client
        .from('chat_messages')
        .stream(primaryKey: ['id'])
        .eq('channel_id', channelId)
        .order('created_at')
        .limit(100);
  }
}

final chatRepositoryProvider = Provider<ChatRepository>((ref) {
  return ChatRepository(ref.watch(supabaseClientProvider));
});

final myChannelsProvider = FutureProvider.autoDispose<List<ChatChannel>>((ref) async {
  return ref.watch(chatRepositoryProvider).myChannels();
});
