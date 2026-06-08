import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import type { Comment, Reaction } from '../types';
import { REACTION_EMOJIS } from '../types';
import { Colors, Fonts } from '../constants/theme';
import { Avatar } from './Avatar';
import { Button } from './Button';
import { formatRelative } from '../lib/utils';

type DiscussionPanelProps = {
  comments: Comment[];
  reactions: Reaction[];
  currentUserId: string;
  isHost: boolean;
  onPost: (body: string) => Promise<void>;
  onEdit: (commentId: string, body: string) => Promise<void>;
  onReact: (commentId: string, emoji: string) => Promise<void>;
  onRemoveReaction: (commentId: string) => Promise<void>;
  onDeleteComment: (commentId: string) => Promise<void>;
  onRefresh: () => void;
  hasMore?: boolean;
  loadingMore?: boolean;
  onLoadMore?: () => void;
};

export function DiscussionPanel({
  comments,
  reactions,
  currentUserId,
  isHost,
  onPost,
  onEdit,
  onReact,
  onRemoveReaction,
  onDeleteComment,
  onRefresh,
  hasMore,
  loadingMore,
  onLoadMore,
}: DiscussionPanelProps) {
  const [body, setBody] = useState('');
  const [posting, setPosting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingBody, setEditingBody] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!body.trim()) return;
    setPosting(true);
    setError('');
    try {
      await onPost(body.trim());
      setBody('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to post comment');
    } finally {
      setPosting(false);
    }
  };

  const handleEditSubmit = async (commentId: string) => {
    if (!editingBody.trim()) return;
    setError('');
    try {
      await onEdit(commentId, editingBody.trim());
      setEditingId(null);
      setEditingBody('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to edit comment');
    }
  };

  const reactionsByComment = reactions.reduce<Record<string, Reaction[]>>((acc, r) => {
    if (!acc[r.comment_id]) acc[r.comment_id] = [];
    acc[r.comment_id].push(r);
    return acc;
  }, {});

  const confirmDelete = (commentId: string) => {
    Alert.alert(
      'Delete Comment',
      'Are you sure you want to delete this comment?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDeleteComment(commentId),
        },
      ]
    );
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.title}>💬 Discussion</Text>
          {comments.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{comments.length}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity onPress={onRefresh} style={styles.refreshBtn}>
          <Text style={styles.refreshBtnText}>Refresh</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.postForm}>
        <TextInput
          placeholder="Share your thoughts about the book…"
          value={body}
          onChangeText={setBody}
          maxLength={2000}
          multiline
          numberOfLines={3}
          style={styles.input}
          placeholderTextColor={Colors.inkMuted}
        />
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <View style={styles.formFooter}>
          <Text style={styles.charCount}>{body.length}/2,000</Text>
          <Button onPress={handleSubmit} loading={posting} disabled={!body.trim()} size="sm">
            Post
          </Button>
        </View>
      </View>

      {comments.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>💭</Text>
          <Text style={styles.emptyText}>No comments yet. Start the conversation!</Text>
        </View>
      ) : (
        <View style={styles.commentsList}>
          {comments.map((comment) => {
            const commentReactions = reactionsByComment[comment.id] ?? [];
            const myReaction = commentReactions.find((r) => r.user_id === currentUserId);
            const counts = REACTION_EMOJIS.reduce<Record<string, number>>((acc, emoji) => {
              acc[emoji] = commentReactions.filter((r) => r.emoji === emoji).length;
              return acc;
            }, {});

            const isEditing = editingId === comment.id;

            return (
              <View key={comment.id} style={styles.commentItem}>
                <View style={styles.commentRow}>
                  <Avatar
                    src={comment.profile?.avatar_url}
                    name={comment.profile?.display_name ?? 'Reader'}
                    size="sm"
                  />
                  <View style={styles.commentContent}>
                    <View style={styles.commentMeta}>
                      <Text style={styles.authorName} numberOfLines={1}>
                        {comment.profile?.display_name ?? 'Reader'}
                      </Text>
                      <Text style={styles.timestamp}>
                        {formatRelative(comment.created_at)}
                        {comment.updated_at ? ' · edited' : ''}
                      </Text>
                    </View>

                    {isEditing ? (
                      <View style={styles.editContainer}>
                        <TextInput
                          value={editingBody}
                          onChangeText={setEditingBody}
                          maxLength={2000}
                          multiline
                          style={styles.input}
                        />
                        <View style={styles.editActions}>
                          <TouchableOpacity
                            onPress={() => {
                              setEditingId(null);
                              setEditingBody('');
                            }}
                            style={styles.cancelEditBtn}
                          >
                            <Text style={styles.cancelEditBtnText}>Cancel</Text>
                          </TouchableOpacity>
                          <Button
                            size="sm"
                            disabled={!editingBody.trim()}
                            onPress={() => handleEditSubmit(comment.id)}
                          >
                            Save
                          </Button>
                        </View>
                      </View>
                    ) : (
                      <Text style={styles.commentBody}>{comment.body}</Text>
                    )}

                    <View style={styles.actionsRow}>
                      <View style={styles.reactionsContainer}>
                        {REACTION_EMOJIS.map((emoji) => {
                          const hasReacted = myReaction?.emoji === emoji;
                          const count = counts[emoji] ?? 0;
                          return (
                            <TouchableOpacity
                              key={emoji}
                              onPress={async () => {
                                if (hasReacted) {
                                  await onRemoveReaction(comment.id);
                                } else {
                                  await onReact(comment.id, emoji);
                                }
                              }}
                              style={[
                                styles.reactionBadge,
                                hasReacted && styles.reactionBadgeActive,
                              ]}
                            >
                              <Text style={styles.reactionEmoji}>{emoji}</Text>
                              {count > 0 ? (
                                <Text
                                  style={[
                                    styles.reactionCount,
                                    hasReacted && styles.reactionCountActive,
                                  ]}
                                >
                                  {count}
                                </Text>
                              ) : null}
                            </TouchableOpacity>
                          );
                        })}
                      </View>

                      {(comment.user_id === currentUserId || isHost) && !isEditing ? (
                        <View style={styles.authorActions}>
                          {comment.user_id === currentUserId ? (
                            <TouchableOpacity
                              onPress={() => {
                                setEditingId(comment.id);
                                setEditingBody(comment.body);
                              }}
                              style={styles.actionLink}
                            >
                              <Text style={styles.actionLinkText}>Edit</Text>
                            </TouchableOpacity>
                          ) : null}
                          <TouchableOpacity
                            onPress={() => confirmDelete(comment.id)}
                            style={styles.actionLink}
                          >
                            <Text style={[styles.actionLinkText, styles.deleteText]}>Delete</Text>
                          </TouchableOpacity>
                        </View>
                      ) : null}
                    </View>
                  </View>
                </View>
              </View>
            );
          })}

          {hasMore && onLoadMore ? (
            <TouchableOpacity
              onPress={onLoadMore}
              disabled={loadingMore}
              style={styles.loadMoreBtn}
            >
              {loadingMore ? (
                <ActivityIndicator size="small" color={Colors.accent} />
              ) : (
                <Text style={styles.loadMoreText}>Load older comments</Text>
              )}
            </TouchableOpacity>
          ) : null}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontFamily: Fonts.serifBold,
    fontSize: 18,
    color: Colors.ink,
  },
  badge: {
    backgroundColor: Colors.paperDark,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: Colors.inkMuted,
  },
  refreshBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: Colors.paperDark,
  },
  refreshBtnText: {
    fontFamily: Fonts.sansMedium,
    fontSize: 12,
    color: Colors.inkMuted,
  },
  postForm: {
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    padding: 12,
    backgroundColor: Colors.paper,
  },
  input: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: Colors.ink,
    minHeight: 60,
    textAlignVertical: 'top',
    padding: 0,
  },
  errorText: {
    color: Colors.rose,
    fontSize: 12,
    fontFamily: Fonts.sans,
    marginTop: 6,
  },
  formFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 8,
  },
  charCount: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: Colors.inkMuted,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  emptyText: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: Colors.inkMuted,
    textAlign: 'center',
  },
  commentsList: {
    gap: 16,
  },
  commentItem: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.paperDark,
    paddingBottom: 16,
  },
  commentRow: {
    flexDirection: 'row',
    gap: 12,
  },
  commentContent: {
    flex: 1,
  },
  commentMeta: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 4,
  },
  authorName: {
    fontFamily: Fonts.sansBold,
    fontSize: 14,
    color: Colors.ink,
    flex: 1,
  },
  timestamp: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    color: Colors.inkMuted,
  },
  commentBody: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: Colors.ink,
    lineHeight: 20,
  },
  editContainer: {
    marginTop: 8,
    gap: 8,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 12,
  },
  cancelEditBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  cancelEditBtnText: {
    fontFamily: Fonts.sansMedium,
    fontSize: 14,
    color: Colors.inkMuted,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    flexWrap: 'wrap',
    gap: 8,
  },
  reactionsContainer: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  reactionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.paperDark,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 14,
    gap: 4,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  reactionBadgeActive: {
    backgroundColor: Colors.accentLight,
    borderColor: Colors.accent,
  },
  reactionEmoji: {
    fontSize: 13,
  },
  reactionCount: {
    fontFamily: Fonts.sansMedium,
    fontSize: 11,
    color: Colors.inkMuted,
  },
  reactionCountActive: {
    color: Colors.accent,
    fontFamily: Fonts.sansBold,
  },
  authorActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionLink: {
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  actionLinkText: {
    fontFamily: Fonts.sansMedium,
    fontSize: 12,
    color: Colors.inkMuted,
  },
  deleteText: {
    color: Colors.rose,
  },
  loadMoreBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: Colors.paperDark,
    borderRadius: 16,
    marginTop: 8,
  },
  loadMoreText: {
    fontFamily: Fonts.sansMedium,
    fontSize: 13,
    color: Colors.accent,
  },
});
