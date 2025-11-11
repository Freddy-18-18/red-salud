import React from 'react';
import { Tabs, useRouter } from 'expo-router';
import { useAuth } from '@mobile/providers/AuthProvider';

export default function TabsLayout() {
  const { session } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!session) router.replace('(auth)/login');
  }, [session, router]);

  return (
    <Tabs screenOptions={{ headerShown: true }}>
      <Tabs.Screen name="paciente/index" options={{ title: 'Inicio' }} />
      <Tabs.Screen name="paciente/citas/index" options={{ title: 'Citas' }} />
      <Tabs.Screen name="paciente/telemedicina/index" options={{ title: 'Telemedicina' }} />
      <Tabs.Screen name="paciente/medicamentos/index" options={{ title: 'Medicamentos' }} />
      <Tabs.Screen name="paciente/laboratorio/index" options={{ title: 'Laboratorio' }} />
    </Tabs>
  );
}
