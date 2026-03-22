// =============================================================================
// FILE: actions/uploadEvidence.ts
// PURPOSE: Securely uploads evidence files to Supabase Storage.
//
// SECURITY FIXES (March 2026):
//   1. Path is constructed server-side using userId — clients cannot specify arbitrary paths
//   2. Returns signed URL (60-min expiry) instead of public URL
//   3. File type and size validation before upload
//   4. Service role key is required here because Supabase Storage RLS
//      doesn't support Clerk JWTs directly for bucket operations.
//      The auth check via Clerk ensures only authenticated users reach this code.
//
// ALLOWED FILE TYPES: PDF, images, spreadsheets (utility bills, invoices, logs)
// MAX FILE SIZE: 10MB
// =============================================================================

'use server';

import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const ALLOWED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'application/vnd.ms-excel', // .xls
  'text/csv',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function uploadEvidence(formData: FormData) {
  // 1. Verify user authentication
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const file = formData.get('file') as File;
  if (!file) throw new Error("Missing file");

  // 2. Validate file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error(`File type not allowed: ${file.type}. Accepted: PDF, images, spreadsheets.`);
  }

  // 3. Validate file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum: 10MB.`);
  }

  // 4. Construct path server-side — user CANNOT control path
  //    Format: evidence/{userId}/{timestamp}_{sanitized_filename}
  const sanitizedName = file.name
    .replace(/[^a-zA-Z0-9._-]/g, '_')  // Remove special chars
    .substring(0, 100);                   // Limit length
  const timestamp = Date.now();
  const path = `evidence/${userId}/${timestamp}_${sanitizedName}`;

  // 5. Use admin client for storage (Supabase Storage needs service role for private buckets)
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const arrayBuffer = await file.arrayBuffer();
  const buffer = new Uint8Array(arrayBuffer);

  const { data, error } = await supabase.storage
    .from('evidence-vault')
    .upload(path, buffer, {
      contentType: file.type,
      upsert: false,  // Don't allow overwrites
    });

  if (error) throw error;

  // 6. Return SIGNED URL (expires in 60 minutes) — NOT public URL
  //    This ensures evidence files are only accessible with a valid token
  const { data: signedUrlData, error: signedError } = await supabase.storage
    .from('evidence-vault')
    .createSignedUrl(path, 3600); // 60 minutes

  if (signedError) throw signedError;

  return signedUrlData.signedUrl;
}