import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';
import type {
  Comment,
  ProgressStats,
  Reaction,
  ReadingSession,
  RosterMember,
  SessionMember,
  ReadingStatus,
} from '../../../types';
import { Colors, Fonts } from '../../../constants/theme';
import { MyProgressPanel } from '../../../components/MyProgressPanel';
import { ProgressStatsPanel } from '../../../components/ProgressStatsPanel';
import { MemberRoster } from '../../../components/MemberRoster';
import { DiscussionPanel } from '../../../components/DiscussionPanel';
import { Button } from '../../../components/Button';
import { formatDate, shareSessionLink } from '../../../lib/utils';

const COMMENTS_PAGE_SIZE = 30;

export default function SessionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, emailVerified } = useAuth();
  const router = useRouter();

  const [session, setSession] = useState<ReadingSession | null>(null);
  const [membership, setMembership] = useState<SessionMember | null>(null);
  const [roster, setRoster] = useState<RosterMember[]>([]);
  const [stats, setStats] = useState<ProgressStats | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');
  const [hasMoreComments, setHasMoreComments] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Tab state: 'chat' | 'roster' | 'stats'
  const [activeSegment, setActiveSegment] = useState<'chat' | 'roster' | 'stats'>('chat');

  const isHost = membership?.is_host ?? false;
  const isMember = Boolean(membership);

  const loadMembership = useCallback(async () => {
    if (!id || !user) return null;
    const { data } = await supabase
      .from('session_members')
      .select('*')
      .eq('session_id', id)
      .eq('user_id', user.id)
      .maybeSingle();
    return data as SessionMember | null;
  }, [id, user]);

  const loadSession = useCallback(async () => {
    if (!id) return;
    const { data, error: err } = await supabase
      .from('reading_sessions')
      .select('*')
      .eq('id', id)
      .single();

    if (err) {
      setError('Session not found');
      setLoading(false);
      return;
    }
    setSession(data as ReadingSession);
  }, [id]);

  const loadComments = useCallback(
    async (offset = 0, append = false) => {
      if (!id) return;

      const { data: commentsData } = await supabase
        .from('comments')
        .select('*, profiles(display_name, avatar_url)')
        .eq('session_id', id)
        .is('deleted_at', null)
        .order('created_at', { ascending: true })
        .range(offset, offset + COMMENTS_PAGE_SIZE - 1);

      if (commentsData) {
        const mapped = commentsData.map((c: any) => {
          const profiles = c.profiles as { display_name: string; avatar_url: string | null } | null;
          return {
            ...c,
            profile: profiles ?? undefined,
          };
        }) as Comment[];

        if (append) {
          setComments((prev) => [...prev, ...mapped]);
        } else {
          setComments(mapped);
        }

        setHasMoreComments(mapped.length === COMMENTS_PAGE_SIZE);

        const commentIds = mapped.map((c) => c.id);
        if (commentIds.length > 0) {
          const { data: reactionData } = await supabase
            .from('reactions')
            .select('*')
            .in('comment_id', commentIds);

          if (append) {
            setReactions((prev) => [...prev, ...((reactionData ?? []) as Reaction[])]);
          } else {
            const allCommentIds = append
              ? [...comments.map((c) => c.id), ...commentIds]
              : commentIds;
            if (allCommentIds.length > 0) {
              const { data: allReactions } = await supabase
                .from('reactions')
                .select('*')
                .in('comment_id', allCommentIds);
              setReactions((allReactions ?? []) as Reaction[]);
            }
          }
        } else if (!append) {
          setReactions([]);
        }
      }
    },
    [id, comments]
  );

  const loadMemberData = useCallback(async () => {
    if (!id) return;

    const [rosterRes, statsRes] = await Promise.all([
      supabase.rpc('get_session_roster', { p_session_id: id }),
      supabase.rpc('get_session_progress_stats', { p_session_id: id }),
    ]);

    if (rosterRes.data) setRoster(rosterRes.data as RosterMember[]);
    if (statsRes.data) setStats(statsRes.data as ProgressStats);

    await loadComments(0, false);
  }, [id, loadComments]);

  const refreshData = useCallback(async () => {
    if (!id || !user) return;
    const member = await loadMembership();
    setMembership(member);
    if (member) {
      await loadMemberData();
    }
  }, [id, user, loadMembership, loadMemberData]);

  useEffect(() => {
    async function init() {
      setLoading(true);
      setError('');
      await loadSession();
      if (user) {
        const member = await loadMembership();
        setMembership(member);
        if (member) {
          await loadMemberData();
        }
      }
      setLoading(false);
    }
    init();
  }, [user, id]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadSession();
    await refreshData();
    setRefreshing(false);
  };

  const handleJoin = async () => {
    if (!id || !emailVerified) return;
    setJoining(true);
    try {
      const { data, error: joinError } = await supabase.rpc('join_session', {
        p_session_id: id,
      });

      if (joinError) throw joinError;

      setMembership(data as SessionMember);
      await loadMemberData();
      Alert.alert('Success', 'You joined the session!');
    } catch (err) {
      console.error(err);
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to join session');
    } finally {
      setJoining(false);
    }
  };

  const handleLeave = () => {
    if (!membership || isHost) return;
    Alert.alert(
      'Leave Session',
      'Leave this reading session? Your comments will remain.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            await supabase.from('session_members').delete().eq('id', membership.id);
            Alert.alert('Left', 'You left the reading session.');
            router.replace('/(app)/(tabs)/home');
          },
        },
      ]
    );
  };

  const handleCloseSession = () => {
    if (!isHost || !session) return;
    Alert.alert(
      'Close Session',
      'Delete this session entirely? This action is irreversible.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Session',
          style: 'destructive',
          onPress: async () => {
            const { error: deleteError } = await supabase
              .from('reading_sessions')
              .delete()
              .eq('id', session.id);
            if (deleteError) {
              Alert.alert('Error', deleteError.message);
              return;
            }
            Alert.alert('Deleted', 'Reading session has been deleted.');
            router.replace('/(app)/(tabs)/home');
          },
        },
      ]
    );
  };

  const handleUpdateProgress = async (chapter: number, status: ReadingStatus) => {
    if (!membership || !id) return;
    const { data, error: updateError } = await supabase
      .from('session_members')
      .update({ current_chapter: chapter, reading_status: status })
      .eq('id', membership.id)
      .select()
      .single();

    if (updateError) throw updateError;
    setMembership(data as SessionMember);

    const { data: statsData } = await supabase.rpc('get_session_progress_stats', {
      p_session_id: id,
    });
    if (statsData) setStats(statsData as ProgressStats);
  };

  const handlePostComment = async (body: string) => {
    if (!id || !user) return;
    const { error: postError } = await supabase.from('comments').insert({
      session_id: id,
      user_id: user.id,
      body,
    });
    if (postError) throw postError;
    await loadComments(0, false);
  };

  const handleEditComment = async (commentId: string, body: string) => {
    const { error: editError } = await supabase
      .from('comments')
      .update({ body, updated_at: new Date().toISOString() })
      .eq('id', commentId);

    if (editError) throw editError;
    await loadComments(0, false);
  };

  const handleReact = async (commentId: string, emoji: string) => {
    await supabase.rpc('upsert_reaction', { p_comment_id: commentId, p_emoji: emoji });
    const commentIds = comments.map((c) => c.id);
    if (commentIds.length > 0) {
      const { data: reactionData } = await supabase
        .from('reactions')
        .select('*')
        .in('comment_id', commentIds);
      setReactions((reactionData ?? []) as Reaction[]);
    }
  };

  const handleRemoveReaction = async (commentId: string) => {
    if (!user) return;
    await supabase
      .from('reactions')
      .delete()
      .eq('comment_id', commentId)
      .eq('user_id', user.id);

    const commentIds = comments.map((c) => c.id);
    if (commentIds.length > 0) {
      const { data: reactionData } = await supabase
        .from('reactions')
        .select('*')
        .in('comment_id', commentIds);
      setReactions((reactionData ?? []) as Reaction[]);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!user) return;
    const comment = comments.find((c) => c.id === commentId);
    if (!comment) return;

    if (isHost && comment.user_id !== user.id) {
      await supabase.rpc('host_delete_comment', { p_comment_id: commentId });
    } else {
      await supabase
        .from('comments')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', commentId);
    }
    await loadComments(0, false);
  };

  const handleLoadMoreComments = async () => {
    if (loadingMore || !hasMoreComments) return;
    setLoadingMore(true);
    await loadComments(comments.length, true);
    setLoadingMore(false);
  };

  const handleShareLink = () => {
    if (!session) return;
    shareSessionLink(session.id, session.title);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !session) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error || 'Session not found'}</Text>
          <Button onPress={() => router.back()} style={styles.backBtn}>
            Back
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtnAction}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {session.title}
        </Text>
        <TouchableOpacity onPress={handleShareLink} style={styles.shareBtn}>
          <Text style={styles.shareBtnText}>Share</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[Colors.accent]}
            tintColor={Colors.accent}
          />
        }
      >
        {/* Book detail card */}
        <View style={styles.detailCard}>
          <View style={styles.bookRow}>
            {session.cover_url ? (
              <Image source={{ uri: session.cover_url }} style={styles.cover} contentFit="cover" />
            ) : (
              <View style={styles.coverFallback}>
                <Text style={styles.coverFallbackText}>📖</Text>
              </View>
            )}

            <View style={styles.bookDetails}>
              <Text style={styles.title}>{session.title}</Text>
              <Text style={styles.author}>by {session.author}</Text>
              <Text style={styles.chaptersInfo}>{session.total_chapters} chapters</Text>
              {(session.start_date || session.end_date) && (
                <Text style={styles.dates}>
                  {session.start_date ? formatDate(session.start_date) : 'No start'} -{' '}
                  {session.end_date ? formatDate(session.end_date) : 'No end'}
                </Text>
              )}
            </View>
          </View>

          {session.description ? (
            <Text style={styles.description}>{session.description}</Text>
          ) : null}

          {/* Action Row for Memberships */}
          {!isMember ? (
            <Button onPress={handleJoin} loading={joining} style={styles.joinBtn}>
              Join reading session
            </Button>
          ) : (
            <View style={styles.membershipActions}>
              {isHost ? (
                <Button variant="danger" onPress={handleCloseSession} style={styles.memberActionBtn}>
                  Delete Session
                </Button>
              ) : (
                <Button variant="secondary" onPress={handleLeave} style={styles.memberActionBtn}>
                  Leave Session
                </Button>
              )}
            </View>
          )}
        </View>

        {isMember ? (
          <View style={styles.memberSection}>
            {membership && (
              <View style={styles.progressContainer}>
                <MyProgressPanel
                  membership={membership}
                  totalChapters={session.total_chapters}
                  onUpdate={handleUpdateProgress}
                />
              </View>
            )}

            {/* Segmented controls for feeds */}
            <View style={styles.segmentsRow}>
              <TouchableOpacity
                onPress={() => setActiveSegment('chat')}
                style={[styles.segmentBtn, activeSegment === 'chat' && styles.segmentBtnActive]}
              >
                <Text style={[styles.segmentBtnText, activeSegment === 'chat' && styles.segmentBtnTextActive]}>
                  Discussion
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setActiveSegment('roster')}
                style={[styles.segmentBtn, activeSegment === 'roster' && styles.segmentBtnActive]}
              >
                <Text style={[styles.segmentBtnText, activeSegment === 'roster' && styles.segmentBtnTextActive]}>
                  Roster
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setActiveSegment('stats')}
                style={[styles.segmentBtn, activeSegment === 'stats' && styles.segmentBtnActive]}
              >
                <Text style={[styles.segmentBtnText, activeSegment === 'stats' && styles.segmentBtnTextActive]}>
                  Group Progress
                </Text>
              </TouchableOpacity>
            </View>

            {/* Segment Views */}
            {activeSegment === 'chat' && (
              <DiscussionPanel
                comments={comments}
                reactions={reactions}
                currentUserId={user?.id ?? ''}
                isHost={isHost}
                onPost={handlePostComment}
                onEdit={handleEditComment}
                onReact={handleReact}
                onRemoveReaction={handleRemoveReaction}
                onDeleteComment={handleDeleteComment}
                onRefresh={refreshData}
                hasMore={hasMoreComments}
                loadingMore={loadingMore}
                onLoadMore={handleLoadMoreComments}
              />
            )}

            {activeSegment === 'roster' && <MemberRoster members={roster} />}

            {activeSegment === 'stats' && stats && <ProgressStatsPanel stats={stats} />}
          </View>
        ) : (
          <View style={styles.nonMemberBanner}>
            <Text style={styles.nonMemberText}>
              Join this session to track your reading progress and participate in discussion!
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.paper,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorText: {
    fontFamily: Fonts.sansMedium,
    fontSize: 16,
    color: Colors.rose,
    textAlign: 'center',
    marginBottom: 20,
  },
  backBtn: {
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.paper,
  },
  backBtnAction: {
    paddingVertical: 6,
    paddingRight: 10,
  },
  backBtnText: {
    fontFamily: Fonts.sansMedium,
    color: Colors.accent,
    fontSize: 14,
  },
  headerTitle: {
    fontFamily: Fonts.serifBold,
    fontSize: 16,
    color: Colors.ink,
    flex: 1,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  shareBtn: {
    paddingVertical: 6,
    paddingLeft: 10,
  },
  shareBtnText: {
    fontFamily: Fonts.sansBold,
    color: Colors.accent,
    fontSize: 14,
  },
  scroll: {
    padding: 20,
    paddingBottom: 40,
  },
  detailCard: {
    backgroundColor: Colors.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 20,
    marginBottom: 20,
  },
  bookRow: {
    flexDirection: 'row',
    gap: 16,
  },
  cover: {
    width: 80,
    height: 120,
    borderRadius: 12,
  },
  coverFallback: {
    width: 80,
    height: 120,
    borderRadius: 12,
    backgroundColor: Colors.paperDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverFallbackText: {
    fontSize: 32,
  },
  bookDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontFamily: Fonts.serifBold,
    fontSize: 20,
    color: Colors.ink,
  },
  author: {
    fontFamily: Fonts.sansMedium,
    fontSize: 14,
    color: Colors.inkMuted,
    marginTop: 2,
  },
  chaptersInfo: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: Colors.inkMuted,
    marginTop: 8,
  },
  dates: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: Colors.inkMuted,
    marginTop: 2,
  },
  description: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: Colors.inkMuted,
    lineHeight: 20,
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.paperDark,
    paddingTop: 14,
  },
  joinBtn: {
    marginTop: 20,
  },
  membershipActions: {
    marginTop: 20,
    flexDirection: 'row',
  },
  memberActionBtn: {
    flex: 1,
  },
  memberSection: {
    gap: 20,
  },
  progressContainer: {
    marginBottom: 4,
  },
  segmentsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.paperDark,
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
  },
  segmentBtnActive: {
    backgroundColor: Colors.card,
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  segmentBtnText: {
    fontFamily: Fonts.sansMedium,
    fontSize: 12,
    color: Colors.inkMuted,
  },
  segmentBtnTextActive: {
    color: Colors.accent,
    fontFamily: Fonts.sansBold,
  },
  nonMemberBanner: {
    backgroundColor: Colors.accentLight,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  nonMemberText: {
    fontFamily: Fonts.sansMedium,
    fontSize: 14,
    color: Colors.accent,
    textAlign: 'center',
    lineHeight: 20,
  },
});
