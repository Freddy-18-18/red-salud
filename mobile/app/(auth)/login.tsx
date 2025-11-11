import React, { useState } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { supabase } from '@mobile/services/supabaseClient';
import { useRouter } from 'expo-router';
import { useAuth } from '@mobile/providers/AuthProvider';

export default function LoginScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (session) router.replace('(tabs)');
  }, [session, router]);

  async function signIn() {
    setLoading(true);
    setError(null);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) setError(signInError.message);
    setLoading(false);
  }

  return (
    <View className="flex-1 items-center justify-center px-6 bg-white">
      <Text className="text-2xl font-semibold mb-6">Iniciar sesión</Text>
      <TextInput
        className="w-full border border-gray-300 rounded px-3 py-2 mb-3"
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      {error && <Text className="text-red-600 mb-4 text-sm">{error}</Text>}
      <Pressable
        onPress={signIn}
        disabled={loading}
        className="w-full bg-primary-600 rounded py-3 items-center"
      >
        <Text className="text-white font-medium">{loading ? '...' : 'Entrar'}</Text>
      </Pressable>
    </View>
  );
}
