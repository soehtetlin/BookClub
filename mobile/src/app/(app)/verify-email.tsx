import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Colors, Fonts } from '../../constants/theme';
import { Button } from '../../components/Button';

export default function VerifyEmailScreen() {
  const { user, signOut, refreshProfile } = useAuth();
  const [checking, setChecking] = useState(false);
  const [resending, setResending] = useState(false);

  const handleCheckVerification = async () => {
    setChecking(true);
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) throw error;

      if (data.user?.email_confirmed_at) {
        await refreshProfile();
        Alert.alert('Success', 'Your email has been verified!');
      } else {
        Alert.alert('Not Verified', 'Your email is not verified yet. Please check your inbox for the verification link.');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to refresh verification status.');
    } finally {
      setChecking(false);
    }
  };

  const handleResendEmail = async () => {
    if (!user?.email) return;
    setResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
      });
      if (error) throw error;
      Alert.alert('Sent', 'Verification link has been resent to your email.');
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to resend verification link.');
    } finally {
      setResending(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.emoji}>✉️</Text>
        <Text style={styles.title}>Verify your email</Text>
        <Text style={styles.desc}>
          We sent a verification link to <Text style={styles.email}>{user?.email}</Text>. Please click the link to confirm your account.
        </Text>

        <View style={styles.actions}>
          <Button onPress={handleCheckVerification} loading={checking} style={styles.btn}>
            I verified my email
          </Button>

          <Button variant="secondary" onPress={handleResendEmail} loading={resending} style={styles.btn}>
            Resend verification link
          </Button>
        </View>

        <TouchableOpacity onPress={signOut} style={styles.logoutBtn}>
          <Text style={styles.logoutBtnText}>Sign out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.paper,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emoji: {
    fontSize: 54,
    marginBottom: 20,
  },
  title: {
    fontFamily: Fonts.serifBold,
    fontSize: 24,
    color: Colors.ink,
    marginBottom: 10,
  },
  desc: {
    fontFamily: Fonts.sans,
    fontSize: 15,
    color: Colors.inkMuted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    paddingHorizontal: 12,
  },
  email: {
    fontFamily: Fonts.sansBold,
    color: Colors.ink,
  },
  actions: {
    width: '100%',
    gap: 12,
    marginBottom: 40,
  },
  btn: {
    width: '100%',
  },
  logoutBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  logoutBtnText: {
    fontFamily: Fonts.sansMedium,
    color: Colors.rose,
    fontSize: 14,
  },
});
