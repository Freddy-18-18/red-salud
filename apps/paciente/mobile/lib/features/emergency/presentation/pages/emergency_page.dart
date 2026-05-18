import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../data/emergency_repository.dart';
import '../../domain/emergency_contact.dart';

class EmergencyPage extends ConsumerWidget {
  const EmergencyPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final list = ref.watch(myEmergencyContactsProvider);
    return Scaffold(
      appBar: AppBar(title: const Text('Contactos de emergencia')),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _showAddSheet(context, ref),
        icon: const Icon(Icons.add_rounded),
        label: const Text('Agregar'),
      ),
      body: list.when(
        data: (contacts) {
          if (contacts.isEmpty) return const _Empty();
          return RefreshIndicator(
            onRefresh: () async => ref.refresh(myEmergencyContactsProvider.future),
            child: ListView.separated(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 96),
              itemCount: contacts.length,
              separatorBuilder: (_, __) => const SizedBox(height: 10),
              itemBuilder: (_, i) => _ContactCard(contact: contacts[i]),
            ),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Padding(padding: const EdgeInsets.all(24), child: Text(e.toString()))),
      ),
    );
  }

  Future<void> _showAddSheet(BuildContext context, WidgetRef ref) async {
    final formKey = GlobalKey<FormState>();
    final nameCtl = TextEditingController();
    final phoneCtl = TextEditingController();
    final relationCtl = TextEditingController();
    bool isPrimary = false;

    await showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      builder: (sheetCtx) => Padding(
        padding: EdgeInsets.only(bottom: MediaQuery.of(sheetCtx).viewInsets.bottom),
        child: StatefulBuilder(builder: (ctx, setSheetState) {
          return Padding(
            padding: const EdgeInsets.all(20),
            child: Form(
              key: formKey,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Text('Nuevo contacto', style: Theme.of(ctx).textTheme.titleLarge),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: nameCtl,
                    decoration: const InputDecoration(labelText: 'Nombre completo'),
                    validator: (v) => (v == null || v.trim().isEmpty) ? 'Requerido' : null,
                  ),
                  const SizedBox(height: 12),
                  TextFormField(
                    controller: phoneCtl,
                    keyboardType: TextInputType.phone,
                    decoration: const InputDecoration(labelText: 'Teléfono', hintText: '+58 414 1234567'),
                  ),
                  const SizedBox(height: 12),
                  TextFormField(
                    controller: relationCtl,
                    decoration: const InputDecoration(labelText: 'Parentesco', hintText: 'Esposo/a, hijo/a, hermano/a...'),
                  ),
                  SwitchListTile(
                    contentPadding: EdgeInsets.zero,
                    title: const Text('Contacto principal'),
                    value: isPrimary,
                    onChanged: (v) => setSheetState(() => isPrimary = v),
                  ),
                  const SizedBox(height: 8),
                  FilledButton(
                    onPressed: () async {
                      if (!formKey.currentState!.validate()) return;
                      try {
                        await ref.read(emergencyRepositoryProvider).add(
                              name: nameCtl.text.trim(),
                              phone: phoneCtl.text.trim().isEmpty ? null : phoneCtl.text.trim(),
                              relationship: relationCtl.text.trim().isEmpty ? null : relationCtl.text.trim(),
                              isPrimary: isPrimary,
                            );
                        ref.invalidate(myEmergencyContactsProvider);
                        if (sheetCtx.mounted) Navigator.of(sheetCtx).pop();
                      } catch (e) {
                        ScaffoldMessenger.of(sheetCtx).showSnackBar(
                          SnackBar(content: Text('Error: $e')),
                        );
                      }
                    },
                    child: const Text('Guardar'),
                  ),
                ],
              ),
            ),
          );
        }),
      ),
    );
  }
}

class _ContactCard extends ConsumerWidget {
  const _ContactCard({required this.contact});
  final EmergencyContact contact;
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final scheme = Theme.of(context).colorScheme;
    return Card(
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: contact.isPrimary ? scheme.primary : scheme.primary.withValues(alpha: 0.2),
          child: Icon(Icons.person_rounded, color: contact.isPrimary ? Colors.white : scheme.primary),
        ),
        title: Row(
          children: [
            Expanded(child: Text(contact.name, style: const TextStyle(fontWeight: FontWeight.w600))),
            if (contact.isPrimary)
              Chip(label: const Text('Principal'), padding: EdgeInsets.zero, labelStyle: TextStyle(fontSize: 10, color: scheme.primary)),
          ],
        ),
        subtitle: Text(
          [contact.relationship, contact.phone].where((s) => s != null && s.isNotEmpty).join(' · '),
        ),
        trailing: IconButton(
          icon: const Icon(Icons.delete_outline_rounded),
          onPressed: () async {
            final confirm = await showDialog<bool>(
              context: context,
              builder: (ctx) => AlertDialog(
                title: const Text('Eliminar contacto'),
                content: Text('¿Eliminar a ${contact.name}?'),
                actions: [
                  TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancelar')),
                  FilledButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Eliminar')),
                ],
              ),
            );
            if (confirm == true) {
              await ref.read(emergencyRepositoryProvider).remove(contact.id);
              ref.invalidate(myEmergencyContactsProvider);
            }
          },
        ),
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
            Icon(Icons.contact_emergency_rounded, size: 64, color: scheme.onSurface.withValues(alpha: 0.4)),
            const SizedBox(height: 12),
            const Text('Sin contactos de emergencia.'),
            const SizedBox(height: 6),
            Text(
              'Agrega al menos un contacto para que podamos avisar en caso de emergencia.',
              textAlign: TextAlign.center,
              style: TextStyle(color: scheme.onSurface.withValues(alpha: 0.65)),
            ),
          ],
        ),
      ),
    );
  }
}
