import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

/// Bottom-nav shell for the authenticated tabs of the patient app.
class MainShell extends StatelessWidget {
  const MainShell({super.key, required this.child});

  final Widget child;

  static const _tabs = <_Tab>[
    _Tab('/', Icons.home_outlined, Icons.home_rounded, 'Inicio'),
    _Tab('/buscar', Icons.search_outlined, Icons.search_rounded, 'Buscar'),
    _Tab('/citas', Icons.event_outlined, Icons.event_rounded, 'Citas'),
    _Tab('/mensajes', Icons.chat_bubble_outline_rounded, Icons.chat_bubble_rounded, 'Chat'),
    _Tab('/perfil', Icons.person_outline_rounded, Icons.person_rounded, 'Perfil'),
  ];

  int _indexFromLocation(String location) {
    final i = _tabs.indexWhere((t) => t.path == location || (t.path != '/' && location.startsWith(t.path)));
    return i < 0 ? 0 : i;
  }

  @override
  Widget build(BuildContext context) {
    final location = GoRouterState.of(context).matchedLocation;
    final selected = _indexFromLocation(location);

    return Scaffold(
      body: child,
      bottomNavigationBar: NavigationBar(
        selectedIndex: selected,
        onDestinationSelected: (i) => context.go(_tabs[i].path),
        destinations: [
          for (final t in _tabs)
            NavigationDestination(
              icon: Icon(t.icon),
              selectedIcon: Icon(t.iconSelected),
              label: t.label,
            ),
        ],
      ),
    );
  }
}

class _Tab {
  final String path;
  final IconData icon;
  final IconData iconSelected;
  final String label;
  const _Tab(this.path, this.icon, this.iconSelected, this.label);
}
