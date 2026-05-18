import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/providers/supabase_provider.dart';
import '../../domain/doctor.dart';

final _doctorProvider = FutureProvider.autoDispose.family<Doctor?, String>((ref, profileId) async {
  // The gateway exposes a search endpoint but no single-doctor route yet.
  // Until that's added, query Supabase directly with the anon role through
  // the public-data RLS policy on doctor_profiles.
  final supabase = ref.watch(supabaseClientProvider);
  final res = await supabase
      .from('doctor_profiles')
      .select('id,slug,specialty_id,consultation_fee,consultation_price,'
          'average_rating,total_reviews,accepts_insurance,accepts_new_patients,'
          'accepts_telemedicine,verified,years_experience,biography,languages,'
          'profile:profiles!doctor_details_profile_id_fkey(id,full_name,avatar_url,city,state),'
          'specialty:specialties!fk_doctor_specialty(id,name,slug,icon)')
      .eq('profile_id', profileId)
      .eq('verified', true)
      .maybeSingle();
  if (res == null) return null;
  return Doctor.fromJson(res);
});

class DoctorDetailPage extends ConsumerWidget {
  const DoctorDetailPage({super.key, required this.doctorId});
  final String doctorId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final asyncDoctor = ref.watch(_doctorProvider(doctorId));
    return Scaffold(
      appBar: AppBar(title: const Text('Perfil del medico')),
      body: asyncDoctor.when(
        data: (doctor) {
          if (doctor == null) {
            return const Center(child: Text('Medico no encontrado.'));
          }
          return _DoctorBody(doctor: doctor);
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Text(e.toString(), textAlign: TextAlign.center),
          ),
        ),
      ),
      bottomNavigationBar: asyncDoctor.maybeWhen(
        data: (doctor) {
          if (doctor == null) return null;
          return SafeArea(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: FilledButton.icon(
                icon: const Icon(Icons.event_available_rounded),
                label: const Text('Agendar cita'),
                onPressed: () => context.push('/agendar/${doctor.id}'),
              ),
            ),
          );
        },
        orElse: () => null,
      ),
    );
  }
}

class _DoctorBody extends StatelessWidget {
  const _DoctorBody({required this.doctor});
  final Doctor doctor;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final fee = doctor.fee;
    final city = doctor.profile.city;
    final state = doctor.profile.state;
    final location = [city, state].where((s) => s != null && s.isNotEmpty).join(', ');

    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
      children: [
        Card(
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              children: [
                CircleAvatar(
                  radius: 44,
                  backgroundColor: scheme.primary.withValues(alpha: 0.14),
                  backgroundImage: doctor.profile.avatarUrl != null ? NetworkImage(doctor.profile.avatarUrl!) : null,
                  child: doctor.profile.avatarUrl == null
                      ? Icon(Icons.person_rounded, color: scheme.primary, size: 44)
                      : null,
                ),
                const SizedBox(height: 12),
                Text(
                  doctor.profile.fullName ?? 'Medico',
                  style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 4),
                Text(
                  doctor.specialty.name,
                  style: TextStyle(fontSize: 14, color: scheme.onSurface.withValues(alpha: 0.7)),
                ),
                if (doctor.verified) ...[
                  const SizedBox(height: 8),
                  Chip(
                    avatar: Icon(Icons.verified_rounded, size: 18, color: scheme.primary),
                    label: const Text('Verificado SACS'),
                  ),
                ],
              ],
            ),
          ),
        ),
        const SizedBox(height: 16),
        _StatsRow(doctor: doctor, fee: fee),
        const SizedBox(height: 16),
        if (doctor.biography != null && doctor.biography!.isNotEmpty) ...[
          const _SectionTitle('Acerca del medico'),
          const SizedBox(height: 8),
          Text(doctor.biography!, style: const TextStyle(height: 1.4)),
          const SizedBox(height: 20),
        ],
        const _SectionTitle('Informacion'),
        const SizedBox(height: 8),
        if (location.isNotEmpty) _InfoRow(icon: Icons.place_outlined, label: 'Ubicacion', value: location),
        if (doctor.languages.isNotEmpty)
          _InfoRow(icon: Icons.language_rounded, label: 'Idiomas', value: doctor.languages.join(', ')),
        if (doctor.acceptsTelemedicine)
          const _InfoRow(icon: Icons.videocam_outlined, label: 'Telemedicina', value: 'Disponible'),
        if (doctor.acceptsInsurance)
          const _InfoRow(icon: Icons.shield_outlined, label: 'Seguros', value: 'Aceptados'),
      ],
    );
  }
}

class _StatsRow extends StatelessWidget {
  const _StatsRow({required this.doctor, required this.fee});
  final Doctor doctor;
  final num? fee;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 12),
        child: Row(
          children: [
            _Stat(label: 'Experiencia', value: '${doctor.yearsExperience ?? 0} a'),
            _Divider(),
            _Stat(
              label: 'Calificacion',
              value: (doctor.averageRating ?? 0) > 0 ? doctor.averageRating!.toStringAsFixed(1) : '—',
            ),
            _Divider(),
            _Stat(label: 'Consulta', value: fee != null ? 'US\$${fee!.toStringAsFixed(0)}' : '—'),
          ],
        ),
      ),
    );
  }
}

class _Stat extends StatelessWidget {
  const _Stat({required this.label, required this.value});
  final String label, value;
  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Expanded(
      child: Column(
        children: [
          Text(value, style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: scheme.primary)),
          const SizedBox(height: 2),
          Text(label, style: TextStyle(fontSize: 11, color: scheme.onSurface.withValues(alpha: 0.7))),
        ],
      ),
    );
  }
}

class _Divider extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      width: 1, height: 32, color: Theme.of(context).colorScheme.outline.withValues(alpha: 0.4),
    );
  }
}

class _SectionTitle extends StatelessWidget {
  const _SectionTitle(this.label);
  final String label;
  @override
  Widget build(BuildContext context) =>
      Text(label, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700));
}

class _InfoRow extends StatelessWidget {
  const _InfoRow({required this.icon, required this.label, required this.value});
  final IconData icon;
  final String label, value;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 18, color: scheme.onSurface.withValues(alpha: 0.6)),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label, style: TextStyle(fontSize: 11, color: scheme.onSurface.withValues(alpha: 0.6), fontWeight: FontWeight.w600)),
                const SizedBox(height: 1),
                Text(value, style: const TextStyle(fontSize: 14)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
