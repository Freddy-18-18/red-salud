import React from 'react';
import { View, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function TelemedicinaSesion() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <View className="flex-1 items-center justify-center">
      <Text className="text-lg font-semibold">Sesión de Telemedicina</Text>
      <Text className="text-gray-600 mt-2">ID: {id}</Text>
      <Text className="mt-4">(Video/Audio se integrará en la siguiente fase)</Text>
    </View>
  );
}
