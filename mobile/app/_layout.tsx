import React from 'react';
import { Stack, SplashScreen } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryProvider } from '@mobile/providers/QueryProvider';
import { AuthProvider, useAuth } from '@mobile/providers/AuthProvider';
import { ActivityIndicator, View } from 'react-native';

SplashScreen.preventAutoHideAsync().catch(() => {});

function AuthGate({ children }: { children: React.ReactNode }) {
  const { loading } = useAuth();
  React.useEffect(() => {
    if (!loading) SplashScreen.hideAsync().catch(() => {});
  }, [loading]);
  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }
  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryProvider>
        <AuthProvider>
          <AuthGate>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            </Stack>
          </AuthGate>
        </AuthProvider>
      </QueryProvider>
    </GestureHandlerRootView>
  );
}
