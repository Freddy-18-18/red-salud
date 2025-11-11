import React, { PropsWithChildren } from 'react';
import { View, Text } from 'react-native';
import { cn } from './cn';

export function Card({ children, className }: PropsWithChildren & { className?: string }) {
  return <View className={cn('bg-white rounded-lg border border-gray-200', className)}>{children}</View>;
}

export function CardTitle({ children }: PropsWithChildren) {
  return <Text className="text-base font-semibold mb-2">{children}</Text>;
}

export function CardContent({ children }: PropsWithChildren) {
  return <View className="p-4">{children}</View>;
}
