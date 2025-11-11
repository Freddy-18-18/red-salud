import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@mobile/providers/AuthProvider';
import { getPerfilBasico } from '@mobile/services/paciente/perfil';
import { Button } from '@mobile/components/ui/Button';
import { useRouter } from 'expo-router';

export default function HomePaciente() {
  const { user } = useAuth();
  const router = useRouter();
  const { data: perfil } = useQuery({
    queryKey: ['perfil', user?.id],
    queryFn: () => getPerfilBasico(user!.id),
    enabled: !!user?.id,
  });

  const nombre = perfil?.nombre?.split(' ')?.[0] || 'Paciente';

  return (
    <ScrollView className="flex-1 bg-white" contentContainerClassName="p-4 gap-4">
      <View>
        <Text className="text-xl font-semibold">Hola, {nombre} 👋</Text>
        <Text className="text-gray-600 mt-1">¿Qué deseas hacer hoy?</Text>
      </View>

      <Button title="Agendar cita" onPress={() => router.push('/(tabs)/paciente/citas/nueva')} />
      <Button title="Ir a Telemedicina" onPress={() => router.push('/(tabs)/paciente/telemedicina')} />
      <Button title="Ver mis citas" onPress={() => router.push('/(tabs)/paciente/citas')} />
      <Button title="Medicamentos" onPress={() => router.push('/(tabs)/paciente/medicamentos')} />
      <Button title="Laboratorio" onPress={() => router.push('/(tabs)/paciente/laboratorio')} />
    </ScrollView>
  );
}
