class Env {
  static const supabaseUrl = String.fromEnvironment('SUPABASE_URL');
  static const supabaseAnonKey = String.fromEnvironment('SUPABASE_ANON_KEY');
  static const apiGatewayUrl = String.fromEnvironment(
    'API_GATEWAY_URL',
    defaultValue: 'http://localhost:8080',
  );
}
