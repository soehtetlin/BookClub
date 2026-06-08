import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export function isEmailVerified(emailConfirmedAt: string | undefined): boolean {
  return Boolean(emailConfirmedAt);
}

export function getPublicUrl(bucket: string, path: string): string {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadAvatar(userId: string, uri: string): Promise<string> {
  const response = await fetch(uri);
  const blob = await response.blob();
  const ext = uri.split('.').pop() ?? 'jpg';
  const path = `${userId}/avatar.${ext}`;

  const { error } = await supabase.storage
    .from('avatars')
    .upload(path, blob, { upsert: true, contentType: `image/${ext === 'png' ? 'png' : 'jpeg'}` });

  if (error) throw error;
  return getPublicUrl('avatars', path);
}

export async function uploadCover(sessionId: string, uri: string): Promise<string> {
  const response = await fetch(uri);
  const blob = await response.blob();
  const ext = uri.split('.').pop() ?? 'jpg';
  const path = `${sessionId}/cover.${ext}`;

  const { error } = await supabase.storage
    .from('covers')
    .upload(path, blob, { upsert: true, contentType: `image/${ext === 'png' ? 'png' : 'jpeg'}` });

  if (error) throw error;
  return getPublicUrl('covers', path);
}
