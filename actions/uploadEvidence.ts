'use server';

import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function uploadEvidence(formData: FormData) {
  // 1. Verify User on the Server
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const file = formData.get('file') as File;
  const path = formData.get('path') as string;

  if (!file || !path) throw new Error("Missing file or path");

  // 2. Use Admin Client (Bypasses the UUID check)
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  // 3. Upload File
  const arrayBuffer = await file.arrayBuffer();
  const buffer = new Uint8Array(arrayBuffer);

  const { data, error } = await supabase.storage
    .from('evidence-vault')
    .upload(path, buffer, {
      contentType: file.type,
      upsert: true
    });

  if (error) throw error;

  // 4. Return the Public URL
  const { data: publicUrlData } = supabase.storage
    .from('evidence-vault')
    .getPublicUrl(path);

  return publicUrlData.publicUrl;
}