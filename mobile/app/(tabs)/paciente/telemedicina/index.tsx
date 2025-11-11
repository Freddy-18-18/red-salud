import React from 'react';
import { View, Text, FlatList } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@mobile/providers/AuthProvider';
import { getSesionesTelemedicina, SesionTelemedicina } from '@mobile/services/paciente/telemedicina';

export default function TelemedicinaPaciente() {
  const { user } = useAuth();
  const { data, isLoading, error } = useQuery<SesionTelemedicina[]>({
    queryKey: ['telemedicina', user?.id],
    queryFn: () => getSesionesTelemedicina(user!.id),
    enabled: !!user?.id,
  });

  if (isLoading) return <Text>Cargando...</Text>;
  if (error) return <Text>Error al cargar sesiones</Text>;

  return (
    <FlatList<SesionTelemedicina>
      className="flex-1 bg-white"
      contentContainerClassName="p-4"
      data={data}
      keyExtractor={(item: SesionTelemedicina) => item.id}
      renderItem={({ item }: { item: SesionTelemedicina }) => (
        <View className="mb-3 border border-gray-200 rounded p-3">
          <Text className="font-semibold">Sesión {item.id}</Text>
          <Text className="text-gray-600 text-sm">Estado: {item.estado}</Text>
        </View>
      )}
      ListEmptyComponent={<Text>No hay sesiones</Text>}
    />
  );
}
