import React from 'react';
import { Pressable, Text, PressableProps } from 'react-native';
import { cn } from './cn';

type Props = PressableProps & { title: string; variant?: 'primary' | 'ghost' };

export function Button({ title, variant = 'primary', className, ...rest }: Props) {
  const base = 'px-4 py-3 rounded items-center';
  const styles = variant === 'primary' ? 'bg-primary-600' : 'bg-transparent';
  const text = variant === 'primary' ? 'text-white' : 'text-primary-600';
  return (
    <Pressable {...rest} className={cn(base, styles, className)}>
      <Text className={cn('font-medium', text)}>{title}</Text>
    </Pressable>
  );
}
