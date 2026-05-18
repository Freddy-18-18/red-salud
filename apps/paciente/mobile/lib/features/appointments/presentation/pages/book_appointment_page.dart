import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../data/appointments_repository.dart';
import '../../domain/appointment.dart';

class BookAppointmentPage extends ConsumerStatefulWidget {
  const BookAppointmentPage({super.key, required this.doctorId});
  final String doctorId;

  @override
  ConsumerState<BookAppointmentPage> createState() => _BookAppointmentPageState();
}

class _BookAppointmentPageState extends ConsumerState<BookAppointmentPage> {
  final _reasonCtl = TextEditingController();
  DateTime? _slot;
  bool _saving = false;

  @override
  void dispose() {
    _reasonCtl.dispose();
    super.dispose();
  }

  Future<void> _pickDateTime() async {
    final date = await showDatePicker(
      context: context,
      initialDate: DateTime.now().add(const Duration(days: 1)),
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 60)),
    );
    if (date == null || !mounted) return;
    final time = await showTimePicker(
      context: context,
      initialTime: const TimeOfDay(hour: 9, minute: 0),
    );
    if (time == null) return;
    setState(() => _slot = DateTime(date.year, date.month, date.day, time.hour, time.minute));
  }

  Future<void> _book() async {
    if (_slot == null) {
      _snack('Elegi fecha y hora.');
      return;
    }
    if (_reasonCtl.text.trim().isEmpty) {
      _snack('Indica el motivo de la consulta.');
      return;
    }
    setState(() => _saving = true);
    try {
      final repo = ref.read(appointmentsRepositoryProvider);
      await repo.create(CreateAppointmentInput(
        doctorId: widget.doctorId,
        scheduledAt: _slot!,
        reason: _reasonCtl.text.trim(),
        appointmentType: 'in_person',
      ));
      ref.invalidate(myAppointmentsProvider);
      if (!mounted) return;
      _snack('Cita agendada correctamente.');
      context.go('/citas');
    } on AppointmentConflict catch (e) {
      _snack(e.message);
    } catch (e) {
      _snack('No pudimos agendar la cita: $e');
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  void _snack(String msg) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(msg), behavior: SnackBarBehavior.floating),
    );
  }

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final fmt = _slot == null
        ? 'Selecciona fecha y hora'
        : DateFormat("EEEE d 'de' MMMM, HH:mm", 'es').format(_slot!.toLocal());

    return Scaffold(
      appBar: AppBar(title: const Text('Agendar cita')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Card(
            child: ListTile(
              leading: Icon(Icons.event_outlined, color: scheme.primary),
              title: const Text('Fecha y hora'),
              subtitle: Text(fmt),
              trailing: const Icon(Icons.chevron_right_rounded),
              onTap: _pickDateTime,
            ),
          ),
          const SizedBox(height: 16),
          TextField(
            controller: _reasonCtl,
            maxLines: 4,
            decoration: const InputDecoration(
              labelText: 'Motivo de la consulta',
              hintText: 'Ej: Dolor de cabeza recurrente, evaluacion preventiva...',
              alignLabelWithHint: true,
            ),
          ),
        ],
      ),
      bottomNavigationBar: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: FilledButton(
            onPressed: _saving ? null : _book,
            child: _saving
                ? const SizedBox(width: 22, height: 22, child: CircularProgressIndicator(strokeWidth: 2.4, color: Colors.white))
                : const Text('Confirmar cita'),
          ),
        ),
      ),
    );
  }
}
