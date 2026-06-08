import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../contexts/AuthContext';
import { Colors, Fonts } from '../../../constants/theme';
import { Button } from '../../../components/Button';

export default function SettingsScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Settings</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.label}>Email</Text>
              <Text style={styles.value} numberOfLines={1}>{user?.email}</Text>
            </View>

            <TouchableOpacity
              onPress={() => router.push('/(app)/reset-password')}
              style={[styles.row, styles.touchableRow]}
            >
              <Text style={styles.touchableLabel}>Change Password</Text>
              <Text style={styles.arrow}>→</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About Books & Friends</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.label}>Version</Text>
              <Text style={styles.value}>1.0.0 (Expo SDK 56)</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Est. Aesthetic</Text>
              <Text style={styles.value}>Warm Paper / Literary</Text>
            </View>
            <View style={[styles.row, styles.lastRow]}>
              <Text style={styles.label}>Developer</Text>
              <Text style={styles.value}>Google Deepmind Team</Text>
            </View>
          </View>
        </View>

        <Button variant="danger" onPress={handleSignOut} style={styles.signOutBtn}>
          Sign out
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.paper,
  },
  scroll: {
    padding: 20,
  },
  title: {
    fontFamily: Fonts.serifBold,
    fontSize: 28,
    color: Colors.ink,
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: Fonts.sansBold,
    fontSize: 12,
    color: Colors.inkMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
    marginLeft: 4,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.paperDark,
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  touchableRow: {
    backgroundColor: Colors.card,
  },
  label: {
    fontFamily: Fonts.sansMedium,
    fontSize: 14,
    color: Colors.ink,
  },
  value: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: Colors.inkMuted,
  },
  touchableLabel: {
    fontFamily: Fonts.sansMedium,
    fontSize: 14,
    color: Colors.accent,
  },
  arrow: {
    fontFamily: Fonts.sansMedium,
    fontSize: 16,
    color: Colors.accent,
  },
  signOutBtn: {
    marginTop: 16,
  },
});
