import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Upload file to Supabase Storage (Server-side)
 */
export async function uploadFileToSupabase(
  file: Express.Multer.File,
  bucket: 'photos' | 'audio',
  phaseId: string
): Promise<string> {
  const fileExt = file.originalname.split('.').pop();
  const fileName = `${phaseId}-${Date.now()}.${fileExt}`;
  const filePath = `${bucket}/${fileName}`;

  const { data, error } = await supabase.storage
    .from('drywall-uploads')
    .upload(filePath, file.buffer, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.mimetype
    });

  if (error) {
    console.error('Supabase upload error:', error);
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
export async function deleteFileFromSupabase(path: string) {
  const { error } = await supabase.storage
    .from('drywall-uploads')
    .remove([path]);

  if (error) {
    console.error('Supabase delete error:', error);
    throw error;
  }
}

/**
 * Check if bucket exists and create if not
 */
export async function ensureBucketExists() {
  try {
    const { data: buckets } = await supabase.storage.listBuckets();

    const bucketExists = buckets?.some(b => b.name === 'drywall-uploads');

    if (!bucketExists) {
      const { error } = await supabase.storage.createBucket('drywall-uploads', {
        public: true,
        fileSizeLimit: 10485760 // 10MB
      });

      if (error) {
        console.error('Error creating bucket:', error);
      } else {
        console.log('✅ Bucket "drywall-uploads" created successfully');
      }
    }
  } catch (error) {
    console.error('Error checking bucket:', error);
  }
}
