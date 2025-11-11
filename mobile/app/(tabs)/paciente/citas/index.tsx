import React from 'react';
import { View, Text, FlatList } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@mobile/providers/AuthProvider';
import { getCitasPaciente, Cita } from '@mobile/services/paciente/citas';

export default function CitasPaciente() {
  const { user } = useAuth();
  const { data, isLoading, error } = useQuery<Cita[]>({
    queryKey: ['citas', user?.id],
    queryFn: () => getCitasPaciente(user!.id),
    enabled: !!user?.id,
  });

  if (isLoading) return <Text>Cargando...</Text>;
  if (error) return <Text>Error al cargar citas</Text>;

  return (
    <FlatList<Cita>
      className="flex-1 bg-white"
      contentContainerClassName="p-4"
      data={data}
      keyExtractor={(item: Cita) => item.id}
      renderItem={({ item }: { item: Cita }) => (
        <View className="mb-3 border border-gray-200 rounded p-3">
          <Text className="font-semibold">{item.tipo}</Text>
          <Text className="text-gray-600 text-sm">{new Date(item.fecha).toLocaleString()}</Text>
        </View>
      )}
      ListEmptyComponent={<Text>No hay citas</Text>}
    />
  );
}
