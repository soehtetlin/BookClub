import { Share, Platform } from 'react-native';

export function formatDate(date: string): string {
  try {
    return new Intl.DateTimeFormat('en', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(date));
  } catch (e) {
    return new Date(date).toLocaleDateString();
  }
}

export function formatRelative(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(date);
}

export async function shareSessionLink(sessionId: string, title: string) {
  const url = `https://books-and-friends.vercel.app/sessions/${sessionId}`; // Fallback production URL representation
  try {
    await Share.share({
      title: `Join our reading session: ${title}`,
      message: Platform.OS === 'android' ? `Join my reading session for "${title}" on Books & Friends! ${url}` : `Join my reading session for "${title}" on Books & Friends!`,
      url,
    });
  } catch (error) {
    console.error('Error sharing session link:', error);
  }
}

export function readingStatusLabel(status: string): string {
  switch (status) {
    case 'finished':
      return 'Finished';
    case 'reading':
      return 'Reading';
    default:
      return 'Not started';
  }
}
