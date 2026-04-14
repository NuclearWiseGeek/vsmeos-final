'use server';

// =============================================================================
// FILE: actions/resignEvidence.ts
// PURPOSE: Re-generates fresh 60-min signed URLs for evidence files stored in
//          Supabase Storage. Called from the Supplier Vault page when a supplier
//          clicks "View" on a document — the original URL from submission has expired.
//
// SECURITY:
//   - Uses SUPABASE_SERVICE_ROLE_KEY (same as uploadEvidence.ts)
//   - Verifies the requesting user owns the files by checking the path includes
//     their userId (paths are: evidence/{userId}/{timestamp}_{filename})
//   - Never returns URLs for files outside the authenticated user's folder
//
// PHASE 4 — Task 4.1 (Supplier Vault)
// =============================================================================

import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * Extracts the storage path from a Supabase signed or public URL.
 * Supabase signed URL format:
 *   https://{project}.supabase.co/storage/v1/object/sign/evidence-vault/evidence/{userId}/...?token=...
 * Public URL format:
 *   https://{project}.supabase.co/storage/v1/object/public/evidence-vault/evidence/{userId}/...
 */
function extractStoragePath(url: string): string | null {
  try {
    // Match path after /evidence-vault/ and before any query string
    const match = url.match(/evidence-vault\/(.+?)(?:\?|$)/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

/**
 * Re-signs a batch of evidence file URLs for the current authenticated user.
 * Returns a map of original URL → fresh signed URL (or null if re-signing failed).
 */
export async function resignEvidenceUrls(
  urls: string[]
): Promise<Record<string, string | null>> {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const result: Record<string, string | null> = {};

  for (const url of urls) {
    try {
      const path = extractStoragePath(url);

      // Security: only re-sign files that belong to this user
      if (!path || !path.startsWith(`evidence/${userId}/`)) {
        result[url] = null;
        continue;
      }

      const { data, error } = await supabase.storage
        .from('evidence-vault')
        .createSignedUrl(path, 3600); // 60 minutes

      result[url] = error ? null : (data?.signedUrl ?? null);
    } catch {
      result[url] = null;
    }
  }

  return result;
}