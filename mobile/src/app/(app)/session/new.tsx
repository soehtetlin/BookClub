import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase, uploadCover } from '../../../lib/supabase';
import { Colors, Fonts } from '../../../constants/theme';
import { Button } from '../../../components/Button';
import { Image } from 'expo-image';

export default function CreateSessionScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [totalChapters, setTotalChapters] = useState('12');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [coverUri, setCoverUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePickCover = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'We need access to your photo library to pick a cover.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [2, 3], // standard book cover ratio
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        setCoverUri(result.assets[0].uri);
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to pick cover image.');
    }
  };

  const handleSubmit = async () => {
    if (!user) return;
    if (!title.trim() || !author.trim()) {
      setError('Title and Author are required.');
      return;
    }

    const chapters = parseInt(totalChapters, 10);
    if (isNaN(chapters) || chapters < 1) {
      setError('Total chapters must be at least 1.');
      return;
    }

    if (startDate && endDate && endDate < startDate) {
      setError('End date must be after the start date.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data: session, error: insertError } = await supabase
        .from('reading_sessions')
        .insert({
          host_id: user.id,
          title: title.trim(),
          author: author.trim(),
          total_chapters: chapters,
          description: description.trim() || null,
          visibility,
          start_date: startDate.trim() || null,
          end_date: endDate.trim() || null,
        })
        .select()
        .single();

      if (insertError || !session) {
        throw insertError ?? new Error('Failed to create session');
      }

      if (coverUri) {
        const coverUrl = await uploadCover(session.id, coverUri);
        const { error: coverError } = await supabase
          .from('reading_sessions')
          .update({ cover_url: coverUrl })
          .eq('id', session.id);
        if (coverError) throw coverError;
      }

      // Successful creation
      router.replace(`/(app)/session/${session.id}`);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An error occurred');
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
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>New Session</Text>
            <View style={styles.headerSpacer} />
          </View>

          <View style={styles.card}>
            <TouchableOpacity onPress={handlePickCover} style={styles.coverPicker}>
              {coverUri ? (
                <View style={styles.coverImageContainer}>
                  <Image source={{ uri: coverUri }} style={styles.coverImage} contentFit="cover" />
                  <Text style={styles.coverPickerLabel}>Change cover</Text>
                </View>
              ) : (
                <View style={styles.coverPlaceholder}>
                  <Text style={styles.coverPlaceholderIcon}>📖</Text>
                  <Text style={styles.coverPlaceholderText}>Add cover photo</Text>
                </View>
              )}
            </TouchableOpacity>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Book Title (Required)</Text>
                <TextInput
                  value={title}
                  onChangeText={setTitle}
                  placeholder="e.g. The Great Gatsby"
                  style={styles.input}
                  placeholderTextColor={Colors.inkMuted}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Author (Required)</Text>
                <TextInput
                  value={author}
                  onChangeText={setAuthor}
                  placeholder="e.g. F. Scott Fitzgerald"
                  style={styles.input}
                  placeholderTextColor={Colors.inkMuted}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Total Chapters</Text>
                <TextInput
                  value={totalChapters}
                  onChangeText={setTotalChapters}
                  keyboardType="numeric"
                  style={styles.input}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Description (Optional)</Text>
                <TextInput
                  value={description}
                  onChangeText={setDescription}
                  placeholder="What's this read about? Any schedule notes?"
                  multiline
                  numberOfLines={3}
                  style={[styles.input, styles.textArea]}
                  placeholderTextColor={Colors.inkMuted}
                />
              </View>

              <View style={styles.datesRow}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.label}>Start Date</Text>
                  <TextInput
                    value={startDate}
                    onChangeText={setStartDate}
                    placeholder="YYYY-MM-DD"
                    style={styles.input}
                    placeholderTextColor={Colors.inkMuted}
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.label}>End Date</Text>
                  <TextInput
                    value={endDate}
                    onChangeText={setEndDate}
                    placeholder="YYYY-MM-DD"
                    style={styles.input}
                    placeholderTextColor={Colors.inkMuted}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Visibility</Text>
                <View style={styles.segmentedContainer}>
                  <TouchableOpacity
                    onPress={() => setVisibility('public')}
                    style={[styles.segment, visibility === 'public' && styles.segmentActive]}
                  >
                    <Text style={[styles.segmentText, visibility === 'public' && styles.segmentTextActive]}>
                      Public
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setVisibility('private')}
                    style={[styles.segment, visibility === 'private' && styles.segmentActive]}
                  >
                    <Text style={[styles.segmentText, visibility === 'private' && styles.segmentTextActive]}>
                      Private
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <Button onPress={handleSubmit} loading={loading} style={styles.submitBtn}>
                Create session
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
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backBtn: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  backText: {
    fontFamily: Fonts.sansMedium,
    color: Colors.accent,
    fontSize: 14,
  },
  headerTitle: {
    fontFamily: Fonts.serifBold,
    fontSize: 18,
    color: Colors.ink,
  },
  headerSpacer: {
    width: 50,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 24,
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  coverPicker: {
    alignSelf: 'center',
    marginBottom: 24,
  },
  coverImageContainer: {
    alignItems: 'center',
  },
  coverImage: {
    width: 100,
    height: 150,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  coverPickerLabel: {
    fontFamily: Fonts.sansMedium,
    fontSize: 12,
    color: Colors.accent,
    marginTop: 8,
  },
  coverPlaceholder: {
    width: 100,
    height: 150,
    borderRadius: 12,
    backgroundColor: Colors.paper,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverPlaceholderIcon: {
    fontSize: 28,
  },
  coverPlaceholderText: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    color: Colors.inkMuted,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 8,
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
  datesRow: {
    flexDirection: 'row',
    gap: 12,
  },
  segmentedContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.paper,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 3,
  },
  segment: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  segmentActive: {
    backgroundColor: Colors.card,
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  segmentText: {
    fontFamily: Fonts.sansMedium,
    fontSize: 13,
    color: Colors.inkMuted,
  },
  segmentTextActive: {
    color: Colors.accent,
    fontFamily: Fonts.sansBold,
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
});
