import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../features/appointments/presentation/pages/book_appointment_page.dart';
import '../../features/appointments/presentation/pages/my_appointments_page.dart';
import '../../features/auth/presentation/pages/login_page.dart';
import '../../features/auth/presentation/pages/signup_page.dart';
import '../../features/chat/presentation/pages/chat_page.dart';
import '../../features/chat/presentation/pages/chats_list_page.dart';
import '../../features/doctors/presentation/pages/doctor_detail_page.dart';
import '../../features/doctors/presentation/pages/doctor_search_page.dart';
import '../../features/emergency/presentation/pages/emergency_page.dart';
import '../../features/health_score/presentation/pages/health_score_page.dart';
import '../../features/history/presentation/pages/history_page.dart';
import '../../features/home/presentation/pages/home_page.dart';
import '../../features/lab/presentation/pages/lab_page.dart';
import '../../features/prescriptions/presentation/pages/prescriptions_page.dart';
import '../../features/profile/presentation/pages/profile_page.dart';
import '../providers/supabase_provider.dart';
import '../widgets/main_shell.dart';

final routerProvider = Provider<GoRouter>((ref) {
  final auth = ref.watch(authStateProvider);

  return GoRouter(
    initialLocation: '/',
    refreshListenable: _AuthRefresh(ref),
    redirect: (context, state) {
      final loggedIn = ref.read(currentSessionProvider) != null;
      final loggingIn = state.matchedLocation == '/login' || state.matchedLocation == '/signup';

      // While the auth stream is still resolving the very first event, let
      // the route render — the stream will trigger another refresh in ms.
      if (auth.isLoading && !loggedIn) return null;

      if (!loggedIn && !loggingIn) return '/login';
      if (loggedIn && loggingIn) return '/';
      return null;
    },
    routes: [
      GoRoute(path: '/login', builder: (_, __) => const LoginPage()),
      GoRoute(path: '/signup', builder: (_, __) => const SignupPage()),

      ShellRoute(
        builder: (context, state, child) => MainShell(child: child),
        routes: [
          GoRoute(path: '/', builder: (_, __) => const HomePage()),
          GoRoute(path: '/buscar', builder: (_, __) => const DoctorSearchPage()),
          GoRoute(path: '/citas', builder: (_, __) => const MyAppointmentsPage()),
          GoRoute(path: '/mensajes', builder: (_, __) => const ChatsListPage()),
          GoRoute(path: '/perfil', builder: (_, __) => const ProfilePage()),
        ],
      ),

      GoRoute(
        path: '/medicos/:id',
        builder: (context, state) => DoctorDetailPage(doctorId: state.pathParameters['id']!),
      ),
      GoRoute(
        path: '/agendar/:doctorId',
        builder: (context, state) => BookAppointmentPage(doctorId: state.pathParameters['doctorId']!),
      ),
      GoRoute(
        path: '/chat/:channelId',
        builder: (context, state) {
          return ChatPage(
            channelId: state.pathParameters['channelId']!,
            displayName: state.uri.queryParameters['name'] ?? 'Conversacion',
          );
        },
      ),

      // Phase 2 modules — accessed from Home quick actions
      GoRoute(path: '/recetas', builder: (_, __) => const PrescriptionsPage()),
      GoRoute(path: '/lab', builder: (_, __) => const LabPage()),
      GoRoute(path: '/historial', builder: (_, __) => const HistoryPage()),
      GoRoute(path: '/emergencia', builder: (_, __) => const EmergencyPage()),
      GoRoute(path: '/health-score', builder: (_, __) => const HealthScorePage()),
    ],
  );
});

/// Bridges Riverpod's auth stream into go_router's `refreshListenable`.
class _AuthRefresh extends ChangeNotifier {
  _AuthRefresh(Ref ref) {
    _sub = ref.listen(authStateProvider, (_, __) => notifyListeners());
  }
  late final ProviderSubscription<dynamic> _sub;

  @override
  void dispose() {
    _sub.close();
    super.dispose();
  }
}
