import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, type ViewStyle, type TextStyle } from 'react-native';
import { Colors, Fonts } from '../constants/theme';

type ButtonProps = {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
};

export function Button({
  children,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
}: ButtonProps) {
  const isSecondary = variant === 'secondary';
  const isGhost = variant === 'ghost';
  const isDanger = variant === 'danger';

  const containerStyles = [
    styles.container,
    isSecondary && styles.secondaryContainer,
    isGhost && styles.ghostContainer,
    isDanger && styles.dangerContainer,
    (disabled || loading) && styles.disabledContainer,
    size === 'sm' && styles.smContainer,
    size === 'lg' && styles.lgContainer,
    style,
  ];

  const textStyles = [
    styles.text,
    isSecondary && styles.secondaryText,
    isGhost && styles.ghostText,
    isDanger && styles.dangerText,
    size === 'sm' && styles.smText,
    size === 'lg' && styles.lgText,
  ];

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={containerStyles as ViewStyle[]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={isSecondary || isGhost ? Colors.accent : Colors.card}
        />
      ) : (
        <Text style={textStyles as TextStyle[]}>{children}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.accent,
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  secondaryContainer: {
    backgroundColor: Colors.accentLight,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  ghostContainer: {
    backgroundColor: 'transparent',
  },
  dangerContainer: {
    backgroundColor: Colors.rose,
  },
  disabledContainer: {
    opacity: 0.6,
  },
  smContainer: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 18,
  },
  lgContainer: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 28,
  },
  text: {
    color: Colors.card,
    fontFamily: Fonts.sansMedium,
    fontSize: 15,
    textAlign: 'center',
  },
  secondaryText: {
    color: Colors.accent,
  },
  ghostText: {
    color: Colors.inkMuted,
  },
  dangerText: {
    color: Colors.card,
  },
  smText: {
    fontSize: 13,
  },
  lgText: {
    fontSize: 17,
  },
});
