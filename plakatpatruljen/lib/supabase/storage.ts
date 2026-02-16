import { supabase } from './client';
import { AppError, ok, err, type Result } from '@/lib/errors';
import { createLogger } from '@/lib/logger';

const log = createLogger('storage');

type Bucket = 'poster-photos' | 'org-logos' | 'campaign-posters' | 'avatars';

/** Buckets that are private and require signed URLs for access */
const PRIVATE_BUCKETS: Bucket[] = ['poster-photos'];

export async function uploadFile(
  bucket: Bucket,
  path: string,
  file: { uri: string; type?: string },
): Promise<Result<string>> {
  try {
    const response = await fetch(file.uri);
    const blob = await response.blob();
    const contentType = file.type ?? 'image/jpeg';

    const { error } = await supabase.storage
      .from(bucket)
      .upload(path, blob, { contentType, upsert: true });

    if (error) return err(AppError.fromSupabaseError(error));

    // Private buckets return the storage path; public buckets return the public URL
    if (PRIVATE_BUCKETS.includes(bucket)) {
      return ok(path);
    }

    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    return ok(urlData.publicUrl);
  } catch (e) {
    log.error('Failed to upload file', e);
    return err(AppError.unknown(e));
  }
}

export async function deleteFile(
  bucket: Bucket,
  path: string,
): Promise<Result<void>> {
  try {
    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) return err(AppError.fromSupabaseError(error));
    return ok(undefined);
  } catch (e) {
    log.error('Failed to delete file', e);
    return err(AppError.unknown(e));
  }
}

export function getPublicUrl(bucket: Bucket, path: string): string {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export async function getSignedUrl(
  bucket: Bucket,
  path: string,
  expiresIn: number = 3600,
): Promise<Result<string>> {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);

    if (error) return err(AppError.fromSupabaseError(error));

    return ok(data.signedUrl);
  } catch (e) {
    log.error('Failed to create signed URL', e);
    return err(AppError.unknown(e));
  }
}
