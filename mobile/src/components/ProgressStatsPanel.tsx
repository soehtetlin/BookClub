import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { ProgressStats } from '../types';
import { Colors, Fonts } from '../constants/theme';

type ProgressStatsPanelProps = {
  stats: ProgressStats;
};

export function ProgressStatsPanel({ stats }: ProgressStatsPanelProps) {
  const maxCount = Math.max(...stats.chapter_buckets.map((b) => b.count), 1);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Group progress</Text>
      <Text style={styles.subtitle}>
        Individual progress is private. These are aggregate stats only.
      </Text>

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{stats.member_count}</Text>
          <Text style={styles.statLabel}>Members</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{stats.finished_count}</Text>
          <Text style={styles.statLabel}>Finished</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{stats.avg_chapter}</Text>
          <Text style={styles.statLabel}>Avg chapter</Text>
        </View>
      </View>

      {stats.chapter_buckets.length > 0 && (
        <View style={styles.distributionSection}>
          <Text style={styles.sectionLabel}>Chapter Distribution</Text>
          <View style={styles.distributionList}>
            {stats.chapter_buckets.map((bucket) => {
              const percentage = (bucket.count / maxCount) * 100;
              return (
                <View key={bucket.chapter} style={styles.bucketRow}>
                  <Text style={styles.bucketName}>
                    {bucket.chapter === 0 ? '—' : `Ch ${bucket.chapter}`}
                  </Text>
                  <View style={styles.barContainer}>
                    <View
                      style={[
                        styles.barFill,
                        { width: `${percentage}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.bucketCount}>{bucket.count}</Text>
                </View>
              );
            })}
          </View>
        </View>
      )}
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
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 10,
  },
  statBox: {
    flex: 1,
    backgroundColor: Colors.paperDark,
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statValue: {
    fontFamily: Fonts.sansBold,
    fontSize: 20,
    color: Colors.ink,
  },
  statLabel: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    color: Colors.inkMuted,
    marginTop: 2,
  },
  distributionSection: {
    marginTop: 4,
  },
  sectionLabel: {
    fontFamily: Fonts.sansBold,
    fontSize: 11,
    color: Colors.inkMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  distributionList: {
    gap: 10,
  },
  bucketRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bucketName: {
    fontFamily: Fonts.sansMedium,
    fontSize: 13,
    color: Colors.inkMuted,
    width: 44,
  },
  barContainer: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.paperDark,
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: Colors.sage,
    borderRadius: 4,
  },
  bucketCount: {
    fontFamily: Fonts.sansMedium,
    fontSize: 13,
    color: Colors.inkMuted,
    width: 20,
    textAlign: 'right',
  },
});
