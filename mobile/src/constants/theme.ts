import { Platform } from 'react-native';

export const Colors = {
  paper: '#faf7f2',
  paperDark: '#f0ebe3',
  ink: '#2c2417',
  inkMuted: '#6b5d4d',
  accent: '#b85c38',
  accentHover: '#9a4a2b',
  accentLight: '#f8ece6',
  sage: '#5a7a6a',
  sageLight: '#e8f0ec',
  sageDark: '#3d5a4c',
  border: '#e5ddd2',
  card: '#ffffff',
  gold: '#d4a853',
  goldLight: '#faf3e0',
  rose: '#c76a7b',
  roseLight: '#fce8ec',

  // Template backward compatibility fallback
  light: {
    text: '#2c2417',
    background: '#faf7f2',
    backgroundElement: '#f0ebe3',
    backgroundSelected: '#e5ddd2',
    textSecondary: '#6b5d4d',
    tint: '#b85c38',
  },
  dark: {
    text: '#2c2417',
    background: '#faf7f2',
    backgroundElement: '#f0ebe3',
    backgroundSelected: '#e5ddd2',
    textSecondary: '#6b5d4d',
    tint: '#b85c38',
  }
} as const;

export type ThemeColor = keyof typeof Colors.light;

export const Fonts = {
  sans: 'DMSans-Regular',
  sansBold: 'DMSans-Bold',
  sansMedium: 'DMSans-Medium',
  serif: 'Lora-Regular',
  serifBold: 'Lora-Bold',
  serifItalic: 'Lora-Italic',
  // Fallbacks for default template components
  mono: 'monospace',
  rounded: 'normal',
};

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
