'use server';

import { createClient } from '@/lib/supabase/server';
import { Invoice } from '@/app/context/InvoiceContext';

export async function getPublicInvoice(id: string) {
  const supabase = await createClient(); 
  
  // Note: For true public access without login, we need to bypass RLS.
  // Standard RLS policies usually restrict 'select' to the owner.
  // If we want public access, we either need a public RLS policy for invoices
  // OR use the service role key here.
  
  // Since we don't have the service role key exposed in the client helper generally,
  // we might need to assume the user has set up RLS to allow public read of invoices
  // where the ID is known, OR we are relying on an admin client.
  
  // For now, let's try standard fetch. If this fails for public users, 
  // we'll need to advise the user to add a Service Role client or update RLS.
  
  // However, the prompt implies "should be public". 
  // Let's create an admin client if we can access the key from process.env, 
  // otherwise we'll try the standard client and see (likely need RLS update).
  
  let adminSupabase: any = supabase;
  
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const { createClient: createAdminClient } = await import('@supabase/supabase-js');
    adminSupabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
  }

  try {
    // 1. Fetch invoice data without the join first
    const { data: invoiceData, error: invoiceError } = await (adminSupabase
      .from('invoices') as any)
      .select('*')
      .eq('id', id)
      .single();

    if (invoiceError) {
      console.error('Error fetching public invoice:', invoiceError);
      return null;
    }

    if (!invoiceData) return null;

    // 2. Fetch business settings for the invoice owner
    const { data: settingsData, error: settingsError } = await (adminSupabase
      .from('settings') as any)
      .select('business_name, business_logo, currency, default_vat, default_withholding_tax')
      .eq('user_id', invoiceData.user_id)
      .single();

    if (settingsError) {
       console.warn('Error fetching settings for public invoice:', settingsError);
       // Continue without settings if they fail, or return minimal data
    }

    // Normalize data to match Invoice interface
    
    // Parse items if they are JSON
    const items = Array.isArray(invoiceData.items) 
      ? invoiceData.items 
      : typeof invoiceData.items === 'string'
        ? JSON.parse(invoiceData.items)
        : [];

    const normalizedInvoice: Invoice = {
      id: invoiceData.id,
      invoiceNumber: invoiceData.invoice_number,
      clientName: invoiceData.client_name,
      clientEmail: invoiceData.client_email,
      clientPhone: invoiceData.client_phone || '',
      items: items.map((item: any) => ({
        ...item,
        quantity: Number(item.quantity) || 0,
        price: Number(item.price) || 0,
        total: Number(item.total) || 0,
      })),
      subtotal: Number(invoiceData.subtotal) || 0,
      vat: Number(invoiceData.vat) || 0,
      withholdingTax: Number(invoiceData.withholding_tax) || 0,
      total: Number(invoiceData.total) || 0,
      dueDate: invoiceData.due_date,
      status: invoiceData.status,
      createdAt: invoiceData.created_at,
      accountId: invoiceData.account_id || undefined,
    };

    // 3. Fetch bank account details
    let accountData = null;
    if (invoiceData.account_id) {
        const { data: acc, error: accError } = await (adminSupabase
            .from('bank_accounts') as any)
            .select('*')
            .eq('id', invoiceData.account_id)
            .single();
            
        if (!accError) {
            accountData = acc;
        }
    } 
    
    // If no specific account found/set, try default
    if (!accountData) {
        const { data: acc, error: accError } = await (adminSupabase
            .from('bank_accounts') as any)
            .select('*')
            .eq('user_id', invoiceData.user_id)
            .eq('is_default', true)
            .single();
            
        if (!accError) {
            accountData = acc;
        }
    }

    // Normalize account details
    const normalizedAccount = accountData ? {
      id: accountData.id,
      accountName: accountData.account_name,
      bankName: accountData.bank_name,
      accountNumber: accountData.account_number,
      accountType: accountData.account_type,
      isDefault: accountData.is_default
    } : null;

    // Return invoice, business details, and account details
    return {
      invoice: normalizedInvoice,
      businessDetails: settingsData || null,
      accountDetails: normalizedAccount
    };

  } catch (err) {
    console.error('Unexpected error fetching invoice:', err);
    return null;
  }
}
