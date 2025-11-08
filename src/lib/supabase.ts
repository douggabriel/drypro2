import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Upload photo to Supabase Storage
 */
export async function uploadPhoto(file: File, phaseId: string): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${phaseId}-${Date.now()}.${fileExt}`;
  const filePath = `photos/${fileName}`;

  const { data, error } = await supabase.storage
    .from('drywall-uploads')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    console.error('Upload error:', error);
    throw error;
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('drywall-uploads')
    .getPublicUrl(filePath);

  return publicUrl;
}

/**
 * Upload audio to Supabase Storage
 */
export async function uploadAudio(file: File | Blob, phaseId: string): Promise<string> {
  const fileName = `${phaseId}-${Date.now()}.webm`;
  const filePath = `audio/${fileName}`;

  const { data, error } = await supabase.storage
    .from('drywall-uploads')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: 'audio/webm'
    });

  if (error) {
    console.error('Upload error:', error);
    throw error;
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('drywall-uploads')
    .getPublicUrl(filePath);

  return publicUrl;
}

/**
 * Delete file from Supabase Storage
 */
export async function deleteFile(path: string) {
  const { error } = await supabase.storage
    .from('drywall-uploads')
    .remove([path]);

  if (error) {
    console.error('Delete error:', error);
    throw error;
  }
}

/**
 * Get public URL for a file
 */
export function getPublicUrl(path: string): string {
  const { data } = supabase.storage
    .from('drywall-uploads')
    .getPublicUrl(path);

  return data.publicUrl;
}
