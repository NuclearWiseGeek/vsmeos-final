'use server';

import { createSupabaseClient } from '@/utils/supabase'; 
import { auth, currentUser } from '@clerk/nextjs/server'; 
import { Resend } from 'resend';

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// ---------------------------------------------------------
// 1. Upload CSV
// ---------------------------------------------------------
export async function uploadSupplierCSV(formData: FormData) {
  const { userId, getToken } = await auth();
  const user = await currentUser(); 
  
  if (!userId) return { error: 'Unauthorized' };

  const token = await getToken({ template: 'supabase' });
  if (!token) return { error: 'No authentication token found' };

  const file = formData.get('file') as File;
  if (!file) return { error: 'No file uploaded' };

  // Determine Buyer Name
  const buyerName = user?.firstName 
    ? `${user.firstName} ${user.lastName || ''}`.trim() 
    : 'VSME Enterprise';

  const text = await file.text();
  const rows = text.split('\n').slice(1); 

  const suppliers = rows
    .map((row) => {
      const [name, email] = row.split(',');
      if (!email || !email.includes('@')) return null;
      return {
        buyer_id: userId,
        buyer_name: buyerName, 
        supplier_name: name?.trim() || 'Unknown Supplier',
        supplier_email: email?.trim().toLowerCase(),
        status: 'draft', // <--- 🟢 CHANGED TO DRAFT
      };
    })
    .filter((s) => s !== null);

  if (suppliers.length === 0) return { error: 'No valid emails found' };

  const supabase = createSupabaseClient(token);
  const { error } = await supabase.from('supplier_invites').insert(suppliers);

  if (error) {
    console.error('Supabase Error:', error);
    return { error: 'Database upload failed' };
  }

  return { success: true, count: suppliers.length };
}

// ---------------------------------------------------------
// 2. Get List
// ---------------------------------------------------------
export async function getSuppliers() {
  const { userId, getToken } = await auth();
  
  if (!userId) return [];

  const token = await getToken({ template: 'supabase' });
  if (!token) return [];

  const supabase = createSupabaseClient(token);

  const { data } = await supabase
    .from('supplier_invites')
    .select('*')
    .eq('buyer_id', userId)
    .order('created_at', { ascending: false }); 

  return data || [];
}

// ---------------------------------------------------------
// 3. Manual Add
// ---------------------------------------------------------
export async function addManualSupplier(name: string, email: string) {
  const { userId, getToken } = await auth();
  const user = await currentUser();

  if (!userId) return { error: 'Unauthorized' };

  if (!email || !email.includes('@')) return { error: 'Invalid email' };

  const token = await getToken({ template: 'supabase' });
  if (!token) return { error: 'No auth token' };

  // Determine Buyer Name
  const buyerName = user?.firstName 
    ? `${user.firstName} ${user.lastName || ''}`.trim() 
    : 'VSME Enterprise';

  const supabase = createSupabaseClient(token);

  const { error } = await supabase.from('supplier_invites').insert({
    buyer_id: userId,
    buyer_name: buyerName, 
    supplier_name: name || 'Unknown',
    supplier_email: email.toLowerCase(),
    status: 'draft', // <--- 🟢 CHANGED TO DRAFT
  });

  if (error) {
    console.error('Manual Add Error:', error);
    return { error: 'Failed to add supplier' };
  }

  return { success: true };
}

// ---------------------------------------------------------
// 4. Delete Supplier
// ---------------------------------------------------------
export async function deleteSupplier(id: string) {
  const { userId, getToken } = await auth();
  if (!userId) return { error: 'Unauthorized' };

  const token = await getToken({ template: 'supabase' });
  if (!token) return { error: 'No auth token' };

  const supabase = createSupabaseClient(token);

  const { error } = await supabase
    .from('supplier_invites')
    .delete()
    .eq('id', id)
    .eq('buyer_id', userId); 

  if (error) {
    console.error('Delete Error:', error);
    return { error: 'Failed to delete' };
  }

  return { success: true };
}

// ---------------------------------------------------------
// 5. Update Supplier
// ---------------------------------------------------------
export async function updateSupplier(id: string, name: string, email: string) {
  const { userId, getToken } = await auth();
  if (!userId) return { error: 'Unauthorized' };

  const token = await getToken({ template: 'supabase' });
  if (!token) return { error: 'No auth token' }; 

  const supabase = createSupabaseClient(token);

  const { error } = await supabase
    .from('supplier_invites')
    .update({ supplier_name: name, supplier_email: email })
    .eq('id', id)
    .eq('buyer_id', userId); 

  if (error) {
    console.error('Update Error:', error);
    return { error: 'Failed to update' };
  }

  return { success: true };
}

// ---------------------------------------------------------
// 6. Send Invite Email (Real)
// ---------------------------------------------------------
export async function sendInviteEmail(id: string, email: string, supplierName: string) {
  // 1. Auth Check
  const { userId, getToken } = await auth(); // <--- 🟢 Extract getToken here
  const user = await currentUser(); 

  if (!userId || !user) return { error: 'Unauthorized' };

  // 2. Determine Buyer Name
  const buyerName = user.firstName 
    ? `${user.firstName} ${user.lastName || ''}`.trim() 
    : 'VSME Enterprise';

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const inviteLink = `${baseUrl}/sign-up?email=${encodeURIComponent(email)}`;

  try {
    const { data, error } = await resend.emails.send({
      from: 'VSME <onboarding@resend.dev>',
      to: email, 
      subject: `Action Required: ${buyerName} invited you to VSME`, 
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #111;">VSME Enterprise</h1>
          
          <p style="font-size: 16px; color: #555;">Hello <strong>${supplierName}</strong>,</p>
          
          <p style="font-size: 16px; color: #555;">
            <strong>${buyerName}</strong> has invited you to join the VSME Supplier Network. 
            They require your carbon emission data to ensure supply chain compliance.
          </p>
          
          <div style="margin: 30px 0;">
            <a href="${inviteLink}" style="background-color: #0071E3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Accept Invitation & Start Report
            </a>
          </div>

          <p style="font-size: 14px; color: #999;">
            Or copy this link: <br/>
            <a href="${inviteLink}" style="color: #0071E3;">${inviteLink}</a>
          </p>
        </div>
      `
    });

    if (error) {
      console.error('Resend API Error:', error);
      return { error: 'Failed to send email' };
    }

    // 🟢 3. UPDATE STATUS TO 'SENT' AFTER SUCCESSFUL EMAIL
    const token = await getToken({ template: 'supabase' });
    if (token) {
        const supabase = createSupabaseClient(token);
        await supabase
          .from('supplier_invites')
          .update({ status: 'sent' })
          .eq('id', id);
    }

    console.log('Email ID:', data?.id);
    return { success: true };

  } catch (error) {
    console.error('Resend Error:', error);
    return { error: 'Failed to send email' };
  }
}