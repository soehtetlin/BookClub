import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Colors, Fonts } from '../constants/theme';

type AvatarProps = {
  src?: string | null;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | number;
};

export function Avatar({ src, name = 'Reader', size = 'md' }: AvatarProps) {
  let dimension = 48;
  if (size === 'sm') dimension = 32;
  else if (size === 'lg') dimension = 96;
  else if (typeof size === 'number') dimension = size;

  const initials = name
    .trim()
    .split(' ')
    .map((part) => part[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || '?';

  const avatarStyle = [
    styles.container,
    {
      width: dimension,
      height: dimension,
      borderRadius: dimension / 2,
    },
  ];

  if (src) {
    return (
      <Image
        source={{ uri: src }}
        style={avatarStyle}
        contentFit="cover"
        transition={200}
      />
    );
  }

  // Fallback letters design
  return (
    <View style={[avatarStyle, styles.fallback]}>
      <Text style={[styles.text, { fontSize: dimension * 0.4 }]}>
        {initials}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.paperDark,
    overflow: 'hidden',
  },
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.accentLight,
  },
  text: {
    color: Colors.accent,
    fontFamily: Fonts.sansBold,
  },
});
