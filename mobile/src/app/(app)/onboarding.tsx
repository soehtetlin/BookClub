import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, uploadAvatar } from '../../lib/supabase';
import { Colors, Fonts } from '../../constants/theme';
import { Button } from '../../components/Button';
import { Avatar } from '../../components/Avatar';

export default function OnboardingScreen() {
  const { user, refreshProfile } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'We need access to your photos to upload an avatar.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        setAvatarUri(result.assets[0].uri);
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to pick image.');
    }
  };

  const handleSubmit = async () => {
    if (!displayName.trim()) {
      Alert.alert('Required', 'Please enter a display name.');
      return;
    }
    if (!user) return;

    setLoading(true);
    try {
      let finalAvatarUrl = null;

      // If they selected a photo, upload it
      if (avatarUri) {
        finalAvatarUrl = await uploadAvatar(user.id, avatarUri);
      }

      // Upsert profile record
      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        display_name: displayName.trim(),
        avatar_url: finalAvatarUrl,
        bio: bio.trim() || null,
      });

      if (error) throw error;

      await refreshProfile();
      // Onboarding complete, RouteController will redirect to home page
    } catch (err) {
      console.error(err);
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to complete profile onboarding.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.card}>
            <Text style={styles.title}>Create your profile</Text>
            <Text style={styles.subtitle}>
              Tell other book lovers a bit about yourself.
            </Text>

            <TouchableOpacity onPress={handlePickImage} style={styles.avatarPicker}>
              <Avatar src={avatarUri} name={displayName || 'User'} size={96} />
              <Text style={styles.avatarPickerText}>Select Profile Picture</Text>
            </TouchableOpacity>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Display name (Required)</Text>
                <TextInput
                  value={displayName}
                  onChangeText={setDisplayName}
                  placeholder="How you wish to be displayed"
                  maxLength={50}
                  style={styles.input}
                  placeholderTextColor={Colors.inkMuted}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Short bio (Optional)</Text>
                <TextInput
                  value={bio}
                  onChangeText={setBio}
                  placeholder="Favorite genres, current reads, or a hello…"
                  maxLength={160}
                  multiline
                  numberOfLines={3}
                  style={[styles.input, styles.textArea]}
                  placeholderTextColor={Colors.inkMuted}
                />
              </View>

              <Button onPress={handleSubmit} loading={loading} style={styles.submitBtn}>
                Get started
              </Button>
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
  avatarPicker: {
    alignItems: 'center',
    marginBottom: 24,
    gap: 8,
  },
  avatarPickerText: {
    fontFamily: Fonts.sansMedium,
    fontSize: 13,
    color: Colors.accent,
    marginTop: 4,
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
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  submitBtn: {
    marginTop: 8,
  },
});
