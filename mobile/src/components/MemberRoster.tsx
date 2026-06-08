import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { RosterMember } from '../types';
import { Colors, Fonts } from '../constants/theme';
import { Avatar } from './Avatar';

type MemberRosterProps = {
  members: RosterMember[];
};

export function MemberRoster({ members }: MemberRosterProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Members ({members.length})</Text>

      <View style={styles.list}>
        {members.map((member) => (
          <View key={member.user_id} style={styles.row}>
            <Avatar src={member.avatar_url} name={member.display_name} size="sm" />
            <View style={styles.info}>
              <Text style={styles.name} numberOfLines={1}>
                {member.display_name}
              </Text>
              {member.is_host && (
                <Text style={styles.hostBadge}>Session host</Text>
              )}
            </View>
          </View>
        ))}
      </View>
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
    marginBottom: 16,
  },
  list: {
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontFamily: Fonts.sansMedium,
    fontSize: 14,
    color: Colors.ink,
  },
  hostBadge: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    color: Colors.sage,
    marginTop: 1,
  },
});
