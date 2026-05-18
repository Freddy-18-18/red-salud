/// Build-time configuration. Pass via `--dart-define` in `flutter run/build`,
/// e.g.:
///   flutter build apk --release \
///     --dart-define=SUPABASE_URL=https://hwckkfiirldgundbcjsp.supabase.co \
///     --dart-define=SUPABASE_ANON_KEY=eyJ... \
///     --dart-define=API_GATEWAY_URL=https://gateway.redsalud.app
class Env {
  static const supabaseUrl = String.fromEnvironment(
    'SUPABASE_URL',
    defaultValue: 'https://hwckkfiirldgundbcjsp.supabase.co',
  );
  static const supabaseAnonKey = String.fromEnvironment(
    'SUPABASE_ANON_KEY',
    defaultValue:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3Y2trZmlpcmxkZ3VuZGJjanNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyMDA4MjcsImV4cCI6MjA3Nzc3NjgyN30.6Gh2U3mx7NsePvQEYMGnh23DqhJV43QRlPvYRynO8fY',
  );
  static const apiGatewayUrl = String.fromEnvironment(
    'API_GATEWAY_URL',
    defaultValue: 'http://10.0.2.2:8080', // Android emulator -> host loopback
  );
}
