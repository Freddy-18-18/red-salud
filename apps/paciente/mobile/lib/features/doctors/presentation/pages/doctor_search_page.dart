import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../data/doctors_repository.dart';
import '../../domain/doctor.dart';

final _filtersProvider = StateProvider<DoctorSearchFilters>((ref) => const DoctorSearchFilters());

final _searchProvider = FutureProvider.autoDispose<DoctorSearchResult>((ref) async {
  final repo = ref.watch(doctorsRepositoryProvider);
  final filters = ref.watch(_filtersProvider);
  return repo.search(filters);
});

class DoctorSearchPage extends ConsumerWidget {
  const DoctorSearchPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final result = ref.watch(_searchProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Buscar medico')),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 12),
            child: TextField(
              decoration: const InputDecoration(
                hintText: 'Especialidad, ciudad, nombre...',
                prefixIcon: Icon(Icons.search_rounded),
              ),
              onSubmitted: (_) => ref.invalidate(_searchProvider),
            ),
          ),
          Expanded(
            child: result.when(
              data: (data) {
                if (data.doctors.isEmpty) {
                  return const _EmptyState();
                }
                return RefreshIndicator(
                  onRefresh: () async => ref.refresh(_searchProvider.future),
                  child: ListView.separated(
                    padding: const EdgeInsets.fromLTRB(16, 0, 16, 24),
                    itemCount: data.doctors.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 12),
                    itemBuilder: (_, i) => _DoctorCard(doctor: data.doctors[i]),
                  ),
                );
              },
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (e, _) => Center(
                child: Padding(
                  padding: const EdgeInsets.all(24),
                  child: Text(
                    'No pudimos cargar los medicos.\n${e.toString()}',
                    textAlign: TextAlign.center,
                    style: TextStyle(color: Theme.of(context).colorScheme.error),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _DoctorCard extends StatelessWidget {
  const _DoctorCard({required this.doctor});
  final Doctor doctor;
  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final fee = doctor.fee;
    final city = doctor.profile.city;
    final state = doctor.profile.state;
    final location = [city, state].where((s) => s != null && s.isNotEmpty).join(', ');

    return Card(
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: () => context.push('/medicos/${doctor.routeId}'),
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              CircleAvatar(
                radius: 30,
                backgroundColor: scheme.primary.withValues(alpha: 0.12),
                backgroundImage: doctor.profile.avatarUrl != null ? NetworkImage(doctor.profile.avatarUrl!) : null,
                child: doctor.profile.avatarUrl == null
                    ? Text(
                        _initials(doctor.profile.fullName ?? '?'),
                        style: TextStyle(color: scheme.primary, fontWeight: FontWeight.w700),
                      )
                    : null,
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            doctor.profile.fullName ?? 'Medico',
                            style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700),
                            maxLines: 1, overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        if (doctor.verified)
                          Icon(Icons.verified_rounded, color: scheme.primary, size: 18),
                      ],
                    ),
                    const SizedBox(height: 2),
                    Text(
                      doctor.specialty.name.isEmpty ? 'Especialidad no especificada' : doctor.specialty.name,
                      style: TextStyle(color: scheme.onSurface.withValues(alpha: 0.75), fontSize: 13),
                    ),
                    const SizedBox(height: 6),
                    Wrap(
                      spacing: 8,
                      runSpacing: 4,
                      children: [
                        if (location.isNotEmpty)
                          _MetaChip(icon: Icons.place_outlined, label: location),
                        if (doctor.acceptsTelemedicine)
                          const _MetaChip(icon: Icons.videocam_outlined, label: 'Telemedicina'),
                        if (doctor.acceptsInsurance)
                          const _MetaChip(icon: Icons.shield_outlined, label: 'Seguro'),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        if ((doctor.averageRating ?? 0) > 0)
                          Row(children: [
                            const Icon(Icons.star_rounded, color: Colors.amber, size: 18),
                            const SizedBox(width: 2),
                            Text('${doctor.averageRating!.toStringAsFixed(1)} (${doctor.totalReviews})',
                                style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                          ])
                        else
                          Text('Sin calificaciones', style: TextStyle(fontSize: 12, color: scheme.onSurface.withValues(alpha: 0.55))),
                        if (fee != null)
                          Text('US\$ ${fee.toStringAsFixed(0)}',
                              style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: scheme.primary)),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  String _initials(String name) {
    final parts = name.trim().split(RegExp(r'\s+'));
    if (parts.isEmpty) return '?';
    if (parts.length == 1) return parts.first.substring(0, 1).toUpperCase();
    return (parts.first.substring(0, 1) + parts.last.substring(0, 1)).toUpperCase();
  }
}

class _MetaChip extends StatelessWidget {
  const _MetaChip({required this.icon, required this.label});
  final IconData icon;
  final String label;
  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: scheme.surface,
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: scheme.outline.withValues(alpha: 0.5)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 12, color: scheme.onSurface.withValues(alpha: 0.7)),
          const SizedBox(width: 4),
          Text(label, style: TextStyle(fontSize: 11, color: scheme.onSurface.withValues(alpha: 0.85))),
        ],
      ),
    );
  }
}

class _EmptyState extends StatelessWidget {
  const _EmptyState();
  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.search_off_rounded, size: 56, color: scheme.onSurface.withValues(alpha: 0.4)),
            const SizedBox(height: 12),
            Text('No encontramos medicos.', style: TextStyle(color: scheme.onSurface.withValues(alpha: 0.7))),
          ],
        ),
      ),
    );
  }
}
