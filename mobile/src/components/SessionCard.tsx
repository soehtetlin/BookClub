import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import type { ReadingSession } from '../types';
import { Colors, Fonts } from '../constants/theme';
import { formatDate } from '../lib/utils';

type SessionCardProps = {
  session: ReadingSession;
  isHost?: boolean;
};

export function SessionCard({ session, isHost }: SessionCardProps) {
  const router = useRouter();

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => router.push(`/(app)/session/${session.id}`)}
      style={styles.card}
    >
      <View style={styles.row}>
        {session.cover_url ? (
          <Image
            source={{ uri: session.cover_url }}
            style={styles.cover}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <View style={styles.coverFallback}>
            <Text style={styles.coverFallbackText}>📖</Text>
          </View>
        )}

        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title} numberOfLines={1}>
              {session.title}
            </Text>
            {isHost && (
              <View style={styles.hostBadge}>
                <Text style={styles.hostBadgeText}>Host</Text>
              </View>
            )}
          </View>

          <Text style={styles.author} numberOfLines={1}>
            {session.author}
          </Text>

          <Text style={styles.info}>
            {session.total_chapters} chapters · Created {formatDate(session.created_at)}
          </Text>

          {(session.start_date || session.end_date) && (
            <Text style={styles.dates}>
              {session.start_date ? formatDate(session.start_date) : 'No start'} -{' '}
              {session.end_date ? formatDate(session.end_date) : 'No end'}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  cover: {
    width: 64,
    height: 96,
    borderRadius: 10,
    backgroundColor: Colors.paperDark,
  },
  coverFallback: {
    width: 64,
    height: 96,
    borderRadius: 10,
    backgroundColor: Colors.paperDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverFallbackText: {
    fontSize: 24,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  title: {
    fontFamily: Fonts.serifBold,
    fontSize: 16,
    color: Colors.ink,
    flex: 1,
  },
  hostBadge: {
    backgroundColor: Colors.sageLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  hostBadgeText: {
    fontFamily: Fonts.sansMedium,
    fontSize: 10,
    color: Colors.sageDark,
  },
  author: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: Colors.inkMuted,
    marginTop: 2,
  },
  info: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: Colors.inkMuted,
    marginTop: 10,
  },
  dates: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    color: Colors.inkMuted,
    marginTop: 2,
  },
});
