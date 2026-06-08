import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { Colors, Fonts } from '../../constants/theme';
import { Button } from '../../components/Button';

export default function SignupScreen() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSignup = async () => {
    if (!displayName.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    setError('');

    const { error: authError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { display_name: displayName.trim() },
      },
    });

    setLoading(false);
    if (authError) {
      setError(authError.message);
      return;
    }
    setSuccess(true);
  };

  if (success) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.successContainer}>
          <Text style={styles.successEmoji}>✉️</Text>
          <Text style={styles.successTitle}>Check your email</Text>
          <Text style={styles.successDesc}>
            We sent a verification link to <Text style={styles.emailHighlight}>{email}</Text>. Please verify before creating or joining sessions.
          </Text>
          <Button variant="secondary" onPress={() => router.replace('/login')} style={styles.backBtn}>
            Back to sign in
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backLink}>
              <Text style={styles.backLinkText}>← Back</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>Join Books & Friends</Text>
            <Text style={styles.subtitle}>Create your free account</Text>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Display name</Text>
                <TextInput
                  value={displayName}
                  onChangeText={setDisplayName}
                  placeholder="How others will see you"
                  style={styles.input}
                  placeholderTextColor={Colors.inkMuted}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="name@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={styles.input}
                  placeholderTextColor={Colors.inkMuted}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="At least 6 characters"
                  secureTextEntry
                  autoCapitalize="none"
                  style={styles.input}
                  placeholderTextColor={Colors.inkMuted}
                />
              </View>

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <Button onPress={handleSignup} loading={loading} style={styles.submitBtn}>
                Create account
              </Button>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/login')}>
                <Text style={styles.footerLink}>Sign in</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.paper,
  },
  keyboardView: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  backLink: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  backLinkText: {
    fontFamily: Fonts.sansMedium,
    color: Colors.accent,
    fontSize: 14,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  title: {
    fontFamily: Fonts.serifBold,
    fontSize: 24,
    color: Colors.ink,
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: Colors.inkMuted,
    textAlign: 'center',
    marginBottom: 24,
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontFamily: Fonts.sansMedium,
    fontSize: 14,
    color: Colors.ink,
  },
  input: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: Colors.ink,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.paper,
  },
  errorText: {
    color: Colors.rose,
    fontSize: 13,
    fontFamily: Fonts.sans,
    textAlign: 'center',
  },
  submitBtn: {
    marginTop: 8,
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  successEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  successTitle: {
    fontFamily: Fonts.serifBold,
    fontSize: 24,
    color: Colors.ink,
    marginBottom: 8,
  },
  successDesc: {
    fontFamily: Fonts.sans,
    fontSize: 15,
    color: Colors.inkMuted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  emailHighlight: {
    fontFamily: Fonts.sansBold,
    color: Colors.ink,
  },
  backBtn: {
    width: '100%',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 16,
  },
  footerText: {
    fontFamily: Fonts.sans,
    color: Colors.inkMuted,
    fontSize: 13,
  },
  footerLink: {
    fontFamily: Fonts.sansBold,
    color: Colors.accent,
    fontSize: 13,
  },
});
