import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../data/chat_repository.dart';

class ChatsListPage extends ConsumerWidget {
  const ChatsListPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final channels = ref.watch(myChannelsProvider);
    return Scaffold(
      appBar: AppBar(title: const Text('Mensajes')),
      body: channels.when(
        data: (list) {
          if (list.isEmpty) return const _Empty();
          return RefreshIndicator(
            onRefresh: () async => ref.refresh(myChannelsProvider.future),
            child: ListView.separated(
              padding: const EdgeInsets.symmetric(vertical: 8),
              itemCount: list.length,
              separatorBuilder: (_, __) => const Divider(indent: 76, height: 1),
              itemBuilder: (_, i) {
                final c = list[i];
                final last = c.lastMessageAt;
                return ListTile(
                  leading: CircleAvatar(
                    radius: 24,
                    backgroundImage: c.avatarUrl != null ? NetworkImage(c.avatarUrl!) : null,
                    child: c.avatarUrl == null ? const Icon(Icons.chat_rounded) : null,
                  ),
                  title: Text(c.name ?? 'Conversacion', style: const TextStyle(fontWeight: FontWeight.w600)),
                  subtitle: Text(
                    last != null ? DateFormat('d MMM, HH:mm', 'es').format(last.toLocal()) : 'Sin mensajes',
                    style: TextStyle(color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.6), fontSize: 12),
                  ),
                  trailing: const Icon(Icons.chevron_right_rounded),
                  onTap: () => context.push('/chat/${c.id}?name=${Uri.encodeComponent(c.name ?? "Conversacion")}'),
                );
              },
            ),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Padding(padding: const EdgeInsets.all(24), child: Text(e.toString()))),
      ),
    );
  }
}

class _Empty extends StatelessWidget {
  const _Empty();
  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.chat_bubble_outline_rounded, size: 64, color: scheme.onSurface.withValues(alpha: 0.4)),
            const SizedBox(height: 12),
            const Text('Aun no tienes conversaciones.'),
            const SizedBox(height: 6),
            Text('Tu medico podra escribirte cuando confirme una cita.',
                style: TextStyle(color: scheme.onSurface.withValues(alpha: 0.6)), textAlign: TextAlign.center),
          ],
        ),
      ),
    );
  }
}
