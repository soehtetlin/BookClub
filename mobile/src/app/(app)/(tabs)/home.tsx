import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';
import type { ReadingSession } from '../../../types';
import { SessionCard } from '../../../components/SessionCard';
import { Button } from '../../../components/Button';
import { Colors, Fonts } from '../../../constants/theme';

type SessionWithHostInfo = ReadingSession & {
  is_host: boolean;
  is_joined: boolean;
};

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'my' | 'explore'>('my');
  const [searchQuery, setSearchQuery] = useState('');
  const [mySessions, setMySessions] = useState<SessionWithHostInfo[]>([]);
  const [exploreSessions, setExploreSessions] = useState<SessionWithHostInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      // 1. Fetch user memberships
      const { data: memberships, error: memberError } = await supabase
        .from('session_members')
        .select('session_id, is_host')
        .eq('user_id', user.id);

      if (memberError) throw memberError;

      const sessionIds = memberships?.map((m) => m.session_id) ?? [];
      const hostMap = Object.fromEntries(memberships?.map((m) => [m.session_id, m.is_host]) ?? []);

      // 2. Fetch My Sessions
      let mySessionData: any[] = [];
      if (sessionIds.length > 0) {
        const { data, error } = await supabase
          .from('reading_sessions')
          .select('*')
          .in('id', sessionIds)
          .order('created_at', { ascending: false });

        if (error) throw error;
        mySessionData = data ?? [];
      }

      setMySessions(
        mySessionData.map((s) => ({
          ...s,
          visibility: s.visibility as 'public' | 'private',
          is_host: hostMap[s.id] ?? false,
          is_joined: true,
        }))
      );

      // 3. Fetch Explore (Public Sessions)
      const { data: publicData, error: publicError } = await supabase
        .from('reading_sessions')
        .select('*')
        .eq('visibility', 'public')
        .order('created_at', { ascending: false })
        .limit(30);

      if (publicError) throw publicError;

      setExploreSessions(
        (publicData ?? []).map((s) => ({
          ...s,
          visibility: s.visibility as 'public' | 'private',
          is_host: hostMap[s.id] ?? false,
          is_joined: sessionIds.includes(s.id),
        }))
      );
    } catch (err) {
      console.error('Error loading home sessions:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const getFilteredSessions = () => {
    const list = activeTab === 'my' ? mySessions : exploreSessions;
    if (!searchQuery.trim()) return list;

    const query = searchQuery.toLowerCase().trim();
    return list.filter(
      (s) =>
        s.title.toLowerCase().includes(query) ||
        s.author.toLowerCase().includes(query)
    );
  };

  const filtered = getFilteredSessions();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View>
          <Text style={styles.appTitle}>Books & Friends</Text>
          <Text style={styles.appSubtitle}>Read and discuss with groups</Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push('/(app)/session/new')}
          style={styles.newBtn}
        >
          <Text style={styles.newBtnText}>+ New</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabsContainer}>
        <TouchableOpacity
          onPress={() => setActiveTab('my')}
          style={[styles.tab, activeTab === 'my' && styles.tabActive]}
        >
          <Text style={[styles.tabText, activeTab === 'my' && styles.tabTextActive]}>
            My Sessions ({mySessions.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('explore')}
          style={[styles.tab, activeTab === 'explore' && styles.tabActive]}
        >
          <Text style={[styles.tabText, activeTab === 'explore' && styles.tabTextActive]}>
            Explore
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Search title or author…"
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
          placeholderTextColor={Colors.inkMuted}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearBtn}>
            <Text style={styles.clearBtnText}>×</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.accent} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <SessionCard session={item} isHost={item.is_host} />
          )}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[Colors.accent]}
              tintColor={Colors.accent}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>📖</Text>
              <Text style={styles.emptyTitle}>
                {searchQuery ? 'No results found' : 'No sessions yet'}
              </Text>
              <Text style={styles.emptyDesc}>
                {searchQuery
                  ? `We couldn't find matches for "${searchQuery}".`
                  : activeTab === 'my'
                  ? 'Join a public session from the Explore tab or start your own!'
                  : 'No public reading sessions available right now.'}
              </Text>
              {!searchQuery && activeTab === 'my' && (
                <Button
                  onPress={() => router.push('/(app)/session/new')}
                  style={styles.emptyBtn}
                >
                  Create a session
                </Button>
              )}
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.paper,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  appTitle: {
    fontFamily: Fonts.serifBold,
    fontSize: 24,
    color: Colors.ink,
  },
  appSubtitle: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: Colors.inkMuted,
    marginTop: 2,
  },
  newBtn: {
    backgroundColor: Colors.accent,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 18,
  },
  newBtnText: {
    fontFamily: Fonts.sansBold,
    fontSize: 13,
    color: Colors.card,
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: Colors.accent,
  },
  tabText: {
    fontFamily: Fonts.sansMedium,
    fontSize: 14,
    color: Colors.inkMuted,
  },
  tabTextActive: {
    color: Colors.accent,
    fontFamily: Fonts.sansBold,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: Colors.ink,
  },
  clearBtn: {
    padding: 6,
  },
  clearBtnText: {
    fontSize: 18,
    color: Colors.inkMuted,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyEmoji: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyTitle: {
    fontFamily: Fonts.serifBold,
    fontSize: 18,
    color: Colors.ink,
    marginBottom: 6,
  },
  emptyDesc: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: Colors.inkMuted,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  emptyBtn: {
    width: '100%',
  },
});
