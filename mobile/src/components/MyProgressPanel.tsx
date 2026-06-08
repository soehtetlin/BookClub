import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import type { ReadingStatus, SessionMember } from '../types';
import { Colors, Fonts } from '../constants/theme';
import { Button } from './Button';

type MyProgressPanelProps = {
  membership: SessionMember;
  totalChapters: number;
  onUpdate: (chapter: number, status: ReadingStatus) => Promise<void>;
};

export function MyProgressPanel({ membership, totalChapters, onUpdate }: MyProgressPanelProps) {
  const [chapter, setChapter] = useState(membership.current_chapter);
  const [status, setStatus] = useState<ReadingStatus>(membership.reading_status);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await onUpdate(chapter, status);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDecrement = () => {
    if (chapter > 0) {
      const nextVal = chapter - 1;
      setChapter(nextVal);
      updateStatusForChapter(nextVal);
    }
  };

  const handleIncrement = () => {
    if (chapter < totalChapters) {
      const nextVal = chapter + 1;
      setChapter(nextVal);
      updateStatusForChapter(nextVal);
    }
  };

  const updateStatusForChapter = (val: number) => {
    if (val === 0) setStatus('not_started');
    else if (val >= totalChapters) setStatus('finished');
    else setStatus('reading');
  };

  const statusOptions: { value: ReadingStatus; label: string }[] = [
    { value: 'not_started', label: 'Not Started' },
    { value: 'reading', label: 'Reading' },
    { value: 'finished', label: 'Finished' },
  ];

  return (
    <View style={styles.card}>
      <Text style={styles.title}>My progress</Text>
      <Text style={styles.subtitle}>Only you can see this.</Text>

      <View style={styles.section}>
        <Text style={styles.label}>Current chapter</Text>
        <View style={styles.stepperContainer}>
          <TouchableOpacity
            style={[styles.stepperButton, chapter === 0 && styles.stepperButtonDisabled]}
            onPress={handleDecrement}
            disabled={chapter === 0}
          >
            <Text style={styles.stepperText}>-</Text>
          </TouchableOpacity>

          <View style={styles.chapterDisplay}>
            <Text style={styles.chapterNumber}>
              {chapter}
            </Text>
            <Text style={styles.chapterTotal}>
              of {totalChapters}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.stepperButton, chapter === totalChapters && styles.stepperButtonDisabled]}
            onPress={handleIncrement}
            disabled={chapter === totalChapters}
          >
            <Text style={styles.stepperText}>+</Text>
          </TouchableOpacity>
        </View>

        {/* Progress bar visual indicator */}
        <View style={styles.progressBarBg}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${Math.min(100, Math.max(0, (chapter / totalChapters) * 100))}%` },
            ]}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Status</Text>
        <View style={styles.segmentedContainer}>
          {statusOptions.map((opt) => {
            const isSelected = status === opt.value;
            return (
              <TouchableOpacity
                key={opt.value}
                style={[styles.segment, isSelected && styles.segmentActive]}
                onPress={() => setStatus(opt.value)}
              >
                <Text style={[styles.segmentText, isSelected && styles.segmentTextActive]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <Button onPress={handleSave} loading={saving} style={styles.saveBtn}>
        {saved ? 'Saved ✓' : 'Save progress'}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 24,
    padding: 20,
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
    fontSize: 18,
    color: Colors.ink,
    marginBottom: 2,
  },
  subtitle: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: Colors.inkMuted,
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontFamily: Fonts.sansMedium,
    fontSize: 14,
    color: Colors.ink,
    marginBottom: 8,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.paperDark,
    borderRadius: 16,
    padding: 6,
  },
  stepperButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  stepperButtonDisabled: {
    opacity: 0.5,
  },
  stepperText: {
    fontSize: 20,
    fontFamily: Fonts.sansBold,
    color: Colors.accent,
  },
  chapterDisplay: {
    alignItems: 'center',
  },
  chapterNumber: {
    fontFamily: Fonts.sansBold,
    fontSize: 18,
    color: Colors.ink,
  },
  chapterTotal: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: Colors.inkMuted,
    marginTop: -2,
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.paperDark,
    marginTop: 12,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.accent,
    borderRadius: 3,
  },
  segmentedContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.paperDark,
    borderRadius: 16,
    padding: 4,
  },
  segment: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
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
    fontSize: 12,
    color: Colors.inkMuted,
  },
  segmentTextActive: {
    color: Colors.accent,
    fontFamily: Fonts.sansBold,
  },
  saveBtn: {
    marginTop: 4,
  },
});
