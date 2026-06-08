import { useEffect } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useFonts } from 'expo-font';
import { DMSans_400Regular, DMSans_500Medium, DMSans_700Bold } from '@expo-google-fonts/dm-sans';
import { Lora_400Regular, Lora_700Bold, Lora_400Regular_Italic } from '@expo-google-fonts/lora';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { Colors } from '../constants/theme';
import * as SplashScreen from 'expo-splash-screen';

// Prevent splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync().catch(() => {});

function RouteController() {
  const { user, loading, emailVerified, profile } = useAuth();
  const segments = useSegments() as string[];
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAppGroup = segments[0] === '(app)';
    const inAuthGroup = segments[0] === '(auth)';

    if (!user) {
      // Redirect to landing if not in auth group
      if (!inAuthGroup) {
        router.replace('/(auth)');
      }
    } else {
      // User is logged in
      if (!emailVerified) {
        // Must verify email (except reset password flow)
        if (segments[1] !== 'verify-email' && segments[1] !== 'reset-password') {
          router.replace('/(app)/verify-email');
        }
      } else if (!profile || !profile.display_name) {
        // Must onboard
        if (segments[1] !== 'onboarding') {
          router.replace('/(app)/onboarding');
        }
      } else {
        // fully authenticated and onboarded
        // If in auth group or in root, redirect to home
        if (inAuthGroup || segments.length === 0 || segments[0] === undefined) {
          router.replace('/(app)/(tabs)/home');
        }
      }
    }
  }, [user, loading, emailVerified, profile, segments, router]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.accent} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(app)" />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    'DMSans-Regular': DMSans_400Regular,
    'DMSans-Medium': DMSans_500Medium,
    'DMSans-Bold': DMSans_700Bold,
    'Lora-Regular': Lora_400Regular,
    'Lora-Bold': Lora_700Bold,
    'Lora-Italic': Lora_400Regular_Italic,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <AuthProvider>
      <RouteController />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.paper,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
