'use server';

import { createSupabaseClient } from '@/utils/supabase'; 
import { auth, currentUser } from '@clerk/nextjs/server'; 
import { Resend } from 'resend';

// Initialize Resend with your API Key
const resend = new Resend(process.env.RESEND_API_KEY);

// ---------------------------------------------------------
// Helper: Validate email format (RFC 5322 simplified)
// ---------------------------------------------------------
function isValidEmail(email: string): boolean {
  const re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return re.test(email) && email.length <= 254;
}

// ---------------------------------------------------------
// Helper: Sanitize string to prevent XSS when displayed
// ---------------------------------------------------------
function sanitize(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim()
    .substring(0, 200); // Limit length
}

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

  // Validate file size (max 1MB for CSV)
  if (file.size > 1024 * 1024) return { error: 'CSV file too large (max 1MB)' };

  // Determine Buyer Name
  const buyerName = user?.firstName 
    ? sanitize(`${user.firstName} ${user.lastName || ''}`.trim())
    : 'VSME Enterprise';

  const text = await file.text();
  const rows = text.split('\n').slice(1); 

  // Track seen emails for deduplication within this upload
  const seenEmails = new Set<string>();

  const suppliers = rows
    .map((row) => {
      const [name, email] = row.split(',');
      if (!email) return null;

      const cleanEmail = email.trim().toLowerCase();
      
      // Validate email format properly
      if (!isValidEmail(cleanEmail)) return null;
      
      // Deduplicate within this CSV
      if (seenEmails.has(cleanEmail)) return null;
      seenEmails.add(cleanEmail);

      return {
        buyer_id: userId,
        buyer_name: buyerName, 
        supplier_name: sanitize(name?.trim() || 'Unknown Supplier'),
        supplier_email: cleanEmail,
        status: 'draft',
      };
    })
    .filter((s) => s !== null);

  if (suppliers.length === 0) return { error: 'No valid emails found in CSV' };

  // Rate limit: max 500 suppliers per upload
  if (suppliers.length > 500) return { error: 'Too many suppliers (max 500 per upload)' };

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

  if (!email || !isValidEmail(email.trim().toLowerCase())) return { error: 'Invalid email address' };

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
    supplier_name: sanitize(name) || 'Unknown',
    supplier_email: email.trim().toLowerCase(),
    status: 'draft',
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
// 7. Get Supplier Emissions (Phase 3.1)
//    Fetches emissions_totals from submitted assessments where
//    buyer_id = current buyer. Uses buyers_read_supplier_assessments RLS policy.
// ---------------------------------------------------------
export async function getSupplierEmissions() {
  const { userId, getToken } = await auth();
  if (!userId) return [];

  const token = await getToken({ template: 'supabase' });
  if (!token) return [];

  const supabase = createSupabaseClient(token);

  // Step 1: Fetch submitted assessments for this buyer.
  // No FK join — assessments and supplier_invites are not related by FK in Supabase.
  const { data: assessments, error } = await supabase
    .from('assessments')
    .select('user_id, year, status, emissions_totals, updated_at')
    .eq('buyer_id', userId)
    .eq('status', 'submitted')
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('getSupplierEmissions error:', error);
    return [];
  }
  if (!assessments || assessments.length === 0) return [];

  // Step 2: Fetch submitted supplier invites for this buyer to get names/revenue.
  // We match by position — each submitted assessment maps to a submitted invite.
  // This works correctly as long as one supplier = one invite per buyer (current model).
  const { data: submittedInvites } = await supabase
    .from('supplier_invites')
    .select('supplier_email, supplier_name, country, industry, revenue, currency')
    .eq('buyer_id', userId)
    .eq('status', 'submitted')
    .order('updated_at', { ascending: false });

  const inviteList = submittedInvites || [];

  // Step 3: Attach invite metadata to each assessment by position.
  return assessments.map((assessment, index) => ({
    ...assessment,
    supplier_invites: inviteList[index] ? [inviteList[index]] : [{
      supplier_name: 'Supplier ' + (index + 1),
      supplier_email: '',
      country: '',
      industry: '',
      revenue: 0,
      currency: '',
    }],
  }));
}

// ---------------------------------------------------------
// 8. Get CSV Export Data (Phase 3.2)
//    Returns all supplier data + emissions for CSV download.
// ---------------------------------------------------------
export async function getCSVExportData() {
  const { userId, getToken } = await auth();
  if (!userId) return [];

  const token = await getToken({ template: 'supabase' });
  if (!token) return [];

  const supabase = createSupabaseClient(token);

  // Get all supplier invites (all statuses) for this buyer
  const { data: invites } = await supabase
    .from('supplier_invites')
    .select('supplier_name, supplier_email, status, country, updated_at')
    .eq('buyer_id', userId)
    .order('created_at', { ascending: false });

  if (!invites) return [];

  // Get submitted emissions data
  const { data: emissions } = await supabase
    .from('assessments')
    .select('user_id, emissions_totals, updated_at')
    .eq('buyer_id', userId)
    .eq('status', 'submitted');

  // Build a map of emissions by user_id for fast lookup
  const emissionsMap = new Map(
    (emissions || []).map(e => [e.user_id, e])
  );

  // Fetch submitted assessments separately (no FK join available).
  // Match emissions to invites using submitted status — both sets belong to this buyer.
  const submittedEmissions = (emissions || []);

  // Build emissions map by position — for CSV we just need totals per invite row.
  // Since we can't join user_id → email, we map submitted emissions to submitted invites.
  const submittedInvites = invites.filter(i => i.status === 'submitted');
  const emissionsForSubmitted = new Map<string, any>();
  submittedInvites.forEach((inv, index) => {
    if (submittedEmissions[index]) {
      emissionsForSubmitted.set(inv.supplier_email, submittedEmissions[index]);
    }
  });

  return invites.map(invite => {
    const emRow = emissionsForSubmitted.get(invite.supplier_email);
    const totals = emRow?.emissions_totals || null;
    return {
      supplier_name:  invite.supplier_name,
      supplier_email: invite.supplier_email,
      status:         invite.status,
      country:        invite.country || '',
      scope1_tco2e:   totals?.scope1Total ?? totals?.scope1 ?? '',
      scope2_tco2e:   totals?.scope2Total ?? totals?.scope2 ?? '',
      scope3_tco2e:   totals?.scope3Total ?? totals?.scope3 ?? '',
      total_tco2e:    totals?.grandTotal  ?? totals?.total  ?? '',
      report_date:    emRow?.updated_at
        ? new Date(emRow.updated_at).toLocaleDateString('en-GB')
        : '',
    };
  });
}

// ---------------------------------------------------------
// 9. Get/Save Buyer Settings (Phase 3.3)
// ---------------------------------------------------------
export async function getBuyerSettings() {
  const { userId, getToken } = await auth();
  if (!userId) return null;

  const token = await getToken({ template: 'supabase' });
  if (!token) return null;

  const supabase = createSupabaseClient(token);
  const { data } = await supabase
    .from('buyer_settings')
    .select('invite_email_subject, invite_email_body')
    .eq('buyer_id', userId)
    .maybeSingle();

  return data;
}

export async function saveBuyerSettings(subject: string, body: string) {
  const { userId, getToken } = await auth();
  if (!userId) return { error: 'Unauthorized' };

  const token = await getToken({ template: 'supabase' });
  if (!token) return { error: 'No auth token' };

  const supabase = createSupabaseClient(token);
  const { error } = await supabase
    .from('buyer_settings')
    .upsert(
      { buyer_id: userId, invite_email_subject: subject, invite_email_body: body, updated_at: new Date().toISOString() },
      { onConflict: 'buyer_id' }
    );

  if (error) {
    console.error('saveBuyerSettings error:', error);
    return { error: 'Failed to save settings' };
  }
  return { success: true };
}
// ---------------------------------------------------------
// 6. Send Invite Email
//    Uses custom buyer template from buyer_settings if available,
//    falls back to default branded template.
// ---------------------------------------------------------
export async function sendInviteEmail(id: string, email: string, supplierName: string) {
  const { userId, getToken } = await auth();
  const user = await currentUser();

  if (!userId || !user) return { error: 'Unauthorized' };

  const buyerName = user.firstName
    ? `${user.firstName} ${user.lastName || ''}`.trim()
    : 'VSME Enterprise';

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const inviteLink = `${baseUrl}/supplier/hub?email=${encodeURIComponent(email)}`;

  const token = await getToken({ template: 'supabase' });

  // Check for custom email template in buyer_settings
  let customSubject: string | null = null;
  let customBody: string | null = null;
  if (token) {
    const supabase = createSupabaseClient(token);
    const { data: settings } = await supabase
      .from('buyer_settings')
      .select('invite_email_subject, invite_email_body')
      .eq('buyer_id', userId)
      .maybeSingle();
    if (settings?.invite_email_subject) customSubject = settings.invite_email_subject;
    if (settings?.invite_email_body)    customBody    = settings.invite_email_body;
  }

  // Resolve subject: custom or default
  const subject = customSubject
    || `Carbon Emissions Declaration Request from ${buyerName} — VSME OS`;

  // Resolve body: custom (with variable substitution) or default HTML
  let htmlBody: string;
  if (customBody) {
    // Replace {{supplier_name}} and {{invite_link}} placeholders
    const resolvedText = customBody
      .replace(/\{\{supplier_name\}\}/g, supplierName)
      .replace(/\{\{invite_link\}\}/g, inviteLink);
    // Wrap plain text in minimal HTML so it renders correctly in email clients
    htmlBody = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        ${resolvedText
          .split('\n')
          .map(line => line.trim() ? `<p style="margin: 0 0 12px;">${line}</p>` : '')
          .join('')}
        <div style="margin: 28px 0;">
          <a href="${inviteLink}" style="background-color: #0C2918; color: #C9A84C; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            Open My Assessment
          </a>
        </div>
      </div>`;
  } else {
    htmlBody = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f7; padding: 32px 16px;">

        <!-- HEADER -->
        <div style="background: #0C2918; padding: 20px 32px; border-radius: 12px 12px 0 0; text-align: left;">
          <table cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="vertical-align: middle; padding-right: 10px;">
                <div style="width: 34px; height: 34px; background-color: #122F1E; border-radius: 7px; text-align: center; line-height: 34px; border: 1px solid #1A5C3A;">
                  <span style="color: #C9A84C; font-size: 20px; line-height: 34px; display: inline-block; vertical-align: middle; margin-top: -2px;">&#10003;</span>
                </div>
              </td>
              <td style="vertical-align: middle;">
                <span style="color: #C9A84C; font-size: 18px; font-weight: 700; letter-spacing: -0.3px;">VSME</span>
                <span style="color: rgba(201,168,76,0.5); font-size: 18px; font-weight: 400; letter-spacing: -0.3px;"> OS</span>
              </td>
            </tr>
          </table>
        </div>

        <!-- BODY -->
        <div style="background: #ffffff; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px; padding: 36px 32px;">

          <p style="font-size: 16px; color: #111827; margin: 0 0 20px; font-weight: 600;">Hello ${supplierName},</p>

          <p style="font-size: 15px; color: #374151; margin: 0 0 16px; line-height: 1.7;">
            <strong>${buyerName}</strong> has invited you to complete a carbon emissions declaration
            through VSME OS to support their supply chain Scope 3 data collection.
          </p>

          <p style="font-size: 15px; color: #374151; margin: 0 0 16px; line-height: 1.7;">
            The process typically takes <strong>15–30 minutes</strong>. You will need:
          </p>

          <table cellpadding="0" cellspacing="0" border="0" style="margin: 0 0 20px; width: 100%;">
            <tr><td style="padding: 4px 0; font-size: 14px; color: #6b7280;">&#x2022;&nbsp; Recent utility bills (electricity, gas)</td></tr>
            <tr><td style="padding: 4px 0; font-size: 14px; color: #6b7280;">&#x2022;&nbsp; Fuel usage records (diesel, petrol) if applicable</td></tr>
            <tr><td style="padding: 4px 0; font-size: 14px; color: #6b7280;">&#x2022;&nbsp; Business travel records (flights, hotels, commuting)</td></tr>
          </table>

          <p style="font-size: 15px; color: #374151; margin: 0 0 28px; line-height: 1.7;">
            At the end, you will receive a 4-page PDF report based on the
            <strong>GHG Protocol Corporate Standard</strong> and
            <strong>ISO 14064-1:2018</strong> — self-attested, limited assurance —
            ready to share with ${buyerName}.
          </p>

          <!-- CTA BUTTON -->
          <div style="margin: 0 0 28px;">
            <a href="${inviteLink}"
               style="background-color: #0C2918; color: #C9A84C; padding: 14px 28px;
                      text-decoration: none; border-radius: 8px; font-weight: 700;
                      display: inline-block; font-size: 15px; font-family: sans-serif;">
              Start My Carbon Declaration &rarr;
            </a>
          </div>

          <!-- HOW IT WORKS -->
          <div style="background: #f9fafb; border-radius: 8px; padding: 20px 24px; margin: 0 0 28px;">
            <p style="font-size: 11px; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.08em; margin: 0 0 12px;">How it works</p>
            <table cellpadding="0" cellspacing="0" border="0" style="width: 100%;">
              <tr>
                <td style="padding: 4px 0; font-size: 13px; color: #374151;">
                  <strong style="color: #0C2918;">1.</strong>&nbsp; Enter your energy and travel data across Scope 1, 2 and 3
                </td>
              </tr>
              <tr>
                <td style="padding: 4px 0; font-size: 13px; color: #374151;">
                  <strong style="color: #0C2918;">2.</strong>&nbsp; We apply the correct national emission factors for your country
                </td>
              </tr>
              <tr>
                <td style="padding: 4px 0; font-size: 13px; color: #374151;">
                  <strong style="color: #0C2918;">3.</strong>&nbsp; Download your signed PDF and upload your supporting evidence
                </td>
              </tr>
            </table>
          </div>

          <!-- FALLBACK LINK -->
          <p style="font-size: 12px; color: #9ca3af; margin: 0; line-height: 1.6;">
            Button not working? Copy this link into your browser:<br/>
            <a href="${inviteLink}" style="color: #0C2918; word-break: break-all;">${inviteLink}</a>
          </p>
        </div>

        <!-- FOOTER -->
        <div style="padding: 20px 32px 0; text-align: center;">
          <p style="font-size: 11px; color: #9ca3af; margin: 0 0 4px; line-height: 1.6;">
            This email was sent by VSME OS on behalf of ${buyerName}.<br/>
            VSME OS is a carbon data collection tool. Reports are self-attested (limited assurance).<br/>
            Questions? Reply to this email or contact
            <a href="mailto:hello@vsmeos.fr" style="color: #6b7280;">hello@vsmeos.fr</a>
          </p>
          <p style="font-size: 11px; color: #d1d5db; margin: 8px 0 0;">
            &copy; 2026 VSME OS &nbsp;|&nbsp;
            <a href="https://vsmeos.fr/privacy" style="color: #d1d5db; text-decoration: none;">Privacy</a>
            &nbsp;|&nbsp;
            <a href="https://vsmeos.fr/terms" style="color: #d1d5db; text-decoration: none;">Terms</a>
          </p>
        </div>

      </div>`;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'VSME OS <hello@vsmeos.fr>',
      to: email,
      subject,
      html: htmlBody,
    });

    if (error) {
      console.error('Resend API Error:', error);
      return { error: 'Failed to send email' };
    }

    // Update status to 'sent'
    if (token) {
      const supabase = createSupabaseClient(token);
      await supabase
        .from('supplier_invites')
        .update({ status: 'sent' })
        .eq('id', id);
    }

    console.log('Email sent, ID:', data?.id);
    return { success: true };
  } catch (err) {
    console.error('Resend Error:', err);
    return { error: 'Failed to send email' };
  }
}