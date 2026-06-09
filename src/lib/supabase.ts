import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

console.log('Supabase URL loaded:', JSON.stringify(supabaseUrl))

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey)

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const AVATAR_MAX_BYTES = 2 * 1024 * 1024
const COVER_MAX_BYTES = 5 * 1024 * 1024

export function isEmailVerified(emailConfirmedAt: string | undefined): boolean {
  return Boolean(emailConfirmedAt)
}

export function getPublicUrl(bucket: string, path: string): string {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

function validateImage(file: File, maxBytes: number) {
  if (!IMAGE_TYPES.includes(file.type)) {
    throw new Error('Please upload a JPG, PNG, or WebP image.')
  }

  if (file.size > maxBytes) {
    const maxMb = maxBytes / 1024 / 1024
    throw new Error(`Image must be ${maxMb} MB or smaller.`)
  }
}

export async function uploadAvatar(userId: string, file: File): Promise<string> {
  validateImage(file, AVATAR_MAX_BYTES)
  const ext = file.name.split('.').pop() ?? 'jpg'
  const path = `${userId}/avatar.${ext}`

  const { error } = await supabase.storage
    .from('avatars')
    .upload(path, file, { upsert: true, contentType: file.type })

  if (error) throw error
  return getPublicUrl('avatars', path)
}

export async function uploadCover(sessionId: string, file: File): Promise<string> {
  validateImage(file, COVER_MAX_BYTES)
  const ext = file.name.split('.').pop() ?? 'jpg'
  const path = `${sessionId}/cover.${ext}`

  const { error } = await supabase.storage
    .from('covers')
    .upload(path, file, { upsert: true, contentType: file.type })

  if (error) throw error
  return getPublicUrl('covers', path)
}
