import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase, uploadAvatar } from '../../../lib/supabase';
import { Colors, Fonts } from '../../../constants/theme';
import { Avatar } from '../../../components/Avatar';
import { Button } from '../../../components/Button';
import { formatDate } from '../../../lib/utils';

export default function ProfileScreen() {
  const { user, profile, refreshProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(profile?.display_name ?? '');
  const [bio, setBio] = useState(profile?.bio ?? '');
  const [avatarUri, setAvatarUri] = useState<string | null>(profile?.avatar_url ?? null);
  const [saving, setSaving] = useState(false);

  const handlePickImage = async () => {
    if (!isEditing) return;
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'We need photo library access to change your avatar.');
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

  const handleSave = async () => {
    if (!displayName.trim()) {
      Alert.alert('Required', 'Display name is required.');
      return;
    }
    if (!user) return;

    setSaving(true);
    try {
      let finalAvatarUrl = profile?.avatar_url ?? null;

      // Upload if the avatar URI is a local path (starts with file:// or ph://)
      if (avatarUri && (avatarUri.startsWith('file://') || avatarUri.startsWith('content://') || avatarUri.startsWith('ph://'))) {
        finalAvatarUrl = await uploadAvatar(user.id, avatarUri);
      } else if (!avatarUri) {
        finalAvatarUrl = null;
      }

      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        display_name: displayName.trim(),
        avatar_url: finalAvatarUrl,
        bio: bio.trim() || null,
      });

      if (error) throw error;

      await refreshProfile();
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully.');
    } catch (err) {
      console.error(err);
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setDisplayName(profile?.display_name ?? '');
    setBio(profile?.bio ?? '');
    setAvatarUri(profile?.avatar_url ?? null);
    setIsEditing(false);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <TouchableOpacity
            onPress={handlePickImage}
            disabled={!isEditing}
            style={[styles.avatarContainer, isEditing && styles.avatarEditing]}
          >
            <Avatar src={avatarUri} name={displayName || 'User'} size={96} />
            {isEditing && (
              <View style={styles.avatarEditOverlay}>
                <Text style={styles.avatarEditOverlayText}>Change</Text>
              </View>
            )}
          </TouchableOpacity>

          {isEditing ? (
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Display Name</Text>
                <TextInput
                  value={displayName}
                  onChangeText={setDisplayName}
                  placeholder="Your display name"
                  maxLength={50}
                  style={styles.input}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Bio</Text>
                <TextInput
                  value={bio}
                  onChangeText={setBio}
                  placeholder="Tell others about yourself…"
                  maxLength={160}
                  multiline
                  numberOfLines={3}
                  style={[styles.input, styles.textArea]}
                />
              </View>

              <View style={styles.editActions}>
                <TouchableOpacity onPress={handleCancel} style={styles.cancelBtn}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <Button onPress={handleSave} loading={saving} size="sm">
                  Save Changes
                </Button>
              </View>
            </View>
          ) : (
            <View style={styles.profileDetails}>
              <Text style={styles.name}>{profile?.display_name ?? 'Reader'}</Text>
              <Text style={styles.joined}>Joined {formatDate(profile?.created_at ?? new Date().toISOString())}</Text>
              <Text style={styles.bio}>
                {profile?.bio || "No biography provided yet. Edit your profile to add one!"}
              </Text>
              <Button
                variant="secondary"
                onPress={() => {
                  setDisplayName(profile?.display_name ?? '');
                  setBio(profile?.bio ?? '');
                  setAvatarUri(profile?.avatar_url ?? null);
                  setIsEditing(true);
                }}
                style={styles.editBtn}
              >
                Edit Profile
              </Button>
            </View>
          )}
        </View>
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
  card: {
    backgroundColor: Colors.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 24,
    alignItems: 'center',
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatarEditing: {
    opacity: 0.8,
  },
  avatarEditOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingVertical: 4,
    alignItems: 'center',
    borderBottomLeftRadius: 48,
    borderBottomRightRadius: 48,
  },
  avatarEditOverlayText: {
    fontFamily: Fonts.sansMedium,
    color: Colors.card,
    fontSize: 10,
  },
  profileDetails: {
    alignItems: 'center',
    width: '100%',
  },
  name: {
    fontFamily: Fonts.serifBold,
    fontSize: 22,
    color: Colors.ink,
    textAlign: 'center',
  },
  joined: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: Colors.inkMuted,
    marginTop: 4,
    textAlign: 'center',
  },
  bio: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: Colors.inkMuted,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
    paddingHorizontal: 12,
  },
  editBtn: {
    width: '100%',
  },
  form: {
    width: '100%',
    gap: 16,
    marginTop: 8,
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
  editActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 8,
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  cancelBtnText: {
    fontFamily: Fonts.sansMedium,
    color: Colors.inkMuted,
    fontSize: 14,
  },
});
