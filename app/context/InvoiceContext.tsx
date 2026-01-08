'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from './AuthContext';

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
  total: number;
}

export interface AccountDetails {
  id: string;
  accountName: string;
  bankName: string;
  accountNumber: string;
  accountType?: string;
  isDefault: boolean;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  items: InvoiceItem[];
  subtotal: number;
  vat: number;
  withholdingTax: number;
  total: number;
  dueDate: string;
  status: 'paid' | 'unpaid' | 'overdue';
  createdAt: string;
  accountId?: string;
}

export interface Settings {
  businessName: string;
  businessLogo: string;
  defaultVAT: number;
  defaultWithholdingTax: number;
  currency: string;
  paymentIntegration: {
    paystack: boolean;
    flutterwave: boolean;
    bankTransfer: boolean;
  };
  accounts: AccountDetails[];
  defaultAccountId: string | null;
}

interface InvoiceContextType {
  invoices: Invoice[];
  settings: Settings | null;
  loading: boolean;
  error: string | null;
  addInvoice: (invoice: Omit<Invoice, 'id' | 'invoiceNumber' | 'createdAt' | 'status'>) => Promise<void>;
  updateInvoiceStatus: (id: string, status: Invoice['status']) => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;
  updateSettings: (settings: Partial<Settings>) => Promise<void>;
  getInvoice: (id: string) => Invoice | undefined;
  addAccount: (account: Omit<AccountDetails, 'id'>) => Promise<void>;
  updateAccount: (id: string, account: Partial<AccountDetails>) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
  setDefaultAccount: (id: string) => Promise<void>;
  getAccount: (id: string) => AccountDetails | undefined;
  refreshInvoices: () => Promise<void>;
  refreshSettings: () => Promise<void>;
}

const InvoiceContext = createContext<InvoiceContextType | undefined>(undefined);

const defaultSettings: Settings = {
  businessName: 'My Business',
  businessLogo: '',
  defaultVAT: 7.5,
  defaultWithholdingTax: 5.0,
  currency: 'NGN',
  paymentIntegration: {
    paystack: false,
    flutterwave: false,
    bankTransfer: true,
  },
  accounts: [],
  defaultAccountId: null,
};

export function InvoiceProvider({ children }: { children: React.ReactNode }) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const supabase = createClient();

  // Calculate invoice status based on due date
  const calculateStatus = (dueDate: string, currentStatus: 'paid' | 'unpaid' | 'overdue'): 'paid' | 'unpaid' | 'overdue' => {
    if (currentStatus === 'paid') return 'paid';
    const due = new Date(dueDate);
    const now = new Date();
    return due < now ? 'overdue' : 'unpaid';
  };

  // Fetch invoices from Supabase
  const fetchInvoices = async () => {
    if (!user) {
      setInvoices([]);
      return;
    }

    try {
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('invoices')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      // Normalize and calculate status
      const normalizedInvoices = (data || []).map((inv: any) => {
        const items = (inv.items as InvoiceItem[]) || [];
        const normalizedItems = items.map((item: InvoiceItem) => {
          const quantity = Number(item.quantity) || 0;
          const price = Number(item.price) || 0;
          const total = Number(item.total) || (quantity * price);
          return {
            ...item,
            quantity: Math.max(0, quantity),
            price: Math.max(0, price),
            total: Math.max(0, total),
          };
        });

        const status = calculateStatus(inv.due_date, inv.status);

        return {
          id: inv.id,
          invoiceNumber: inv.invoice_number,
          clientName: inv.client_name,
          clientEmail: inv.client_email,
          clientPhone: inv.client_phone || '',
          items: normalizedItems,
          subtotal: Number(inv.subtotal) || 0,
          vat: Number(inv.vat) || 0,
          withholdingTax: Number(inv.withholding_tax) || 0,
          total: Number(inv.total) || 0,
          dueDate: inv.due_date,
          status,
          createdAt: inv.created_at,
          accountId: inv.account_id || undefined,
        } as Invoice;
      });

      setInvoices(normalizedInvoices);

      // Update overdue statuses in database (non-blocking)
      const overdueUpdates = normalizedInvoices
        .filter(inv => {
          const dbInvoice = (data || []).find((d: any) => d.id === inv.id) as any;
          return inv.status === 'overdue' && dbInvoice?.status !== 'overdue';
        })
        .map(inv => ({
          id: inv.id,
          status: 'overdue' as const,
        }));

      // Update overdue statuses asynchronously without blocking
      if (overdueUpdates.length > 0) {
        Promise.all(
          overdueUpdates.map(update =>
            (supabase
              .from('invoices') as any)
              .update({ status: 'overdue' })
              .eq('id', update.id)
          )
        ).catch(err => {
          console.error('Error updating overdue statuses:', err);
        });
      }
    } catch (err: any) {
      console.error('Error fetching invoices:', err);
      setError(err.message || 'Failed to fetch invoices');
    }
  };

  // Fetch settings from Supabase
  const fetchSettings = async () => {
    if (!user) {
      setSettings(null);
      return;
    }

    try {
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('settings')
        .select('*')
        .eq('user_id', user.id)
        .single<any>();

      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw fetchError;
      }

      // Fetch bank accounts
      const { data: accountsData, error: accountsError } = await supabase
        .from('bank_accounts')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false }) as { data: any[] | null; error: any };

      if (accountsError) throw accountsError;

      const accounts: AccountDetails[] = (accountsData || []).map((acc: any) => ({
        id: acc.id,
        accountName: acc.account_name,
        bankName: acc.bank_name,
        accountNumber: acc.account_number,
        accountType: acc.account_type || 'Current',
        isDefault: acc.is_default || false,
      }));

      if (data) {
        setSettings({
          businessName: data.business_name || defaultSettings.businessName,
          businessLogo: data.business_logo || defaultSettings.businessLogo,
          defaultVAT: Number(data.default_vat) || defaultSettings.defaultVAT,
          defaultWithholdingTax: Number(data.default_withholding_tax) || defaultSettings.defaultWithholdingTax,
          currency: data.currency || defaultSettings.currency,
          paymentIntegration: (data.payment_integration as any) || defaultSettings.paymentIntegration,
          accounts,
          defaultAccountId: data.default_account_id || null,
        });
      } else {
        // Create default settings if none exist
        const { data: newSettings, error: createError } = await (supabase
          .from('settings') as any)
          .insert({
            user_id: user.id,
            business_name: defaultSettings.businessName,
            business_logo: defaultSettings.businessLogo,
            default_vat: defaultSettings.defaultVAT,
            default_withholding_tax: defaultSettings.defaultWithholdingTax,
            currency: defaultSettings.currency,
            payment_integration: defaultSettings.paymentIntegration,
            default_account_id: null,
          })
          .select()
          .single();

        if (createError) throw createError;

        setSettings({
          ...defaultSettings,
          accounts,
          defaultAccountId: null,
        });
      }
    } catch (err: any) {
      console.error('Error fetching settings:', err);
      setError(err.message || 'Failed to fetch settings');
    }
  };

  // Load data when user changes
  useEffect(() => {
    if (user) {
      setLoading(true);
      Promise.all([fetchInvoices(), fetchSettings()]).finally(() => {
        setLoading(false);
      });
    } else {
      setInvoices([]);
      setSettings(null);
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Refresh invoices
  const refreshInvoices = async () => {
    await fetchInvoices();
  };

  // Refresh settings
  const refreshSettings = async () => {
    await fetchSettings();
  };

  // Add invoice
  const addInvoice = async (invoiceData: Omit<Invoice, 'id' | 'invoiceNumber' | 'createdAt' | 'status'>) => {
    if (!user) throw new Error('User must be authenticated');

    try {
      setError(null);

      // Generate invoice number using database function
      let invoiceNumber: string;
      try {
        const { data: invoiceNumberData, error: numberError } = await ((supabase as any)
          .rpc('generate_invoice_number', { user_uuid: user.id }));

        if (numberError) {
          console.warn('Invoice number function error, using fallback:', numberError);
          // Fallback: generate invoice number manually
          const year = new Date().getFullYear();
          const { count } = await supabase
            .from('invoices')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .like('invoice_number', `INV-${year}-%`);
          
          const invoiceCount = (count || 0) + 1;
          invoiceNumber = `INV-${year}-${String(invoiceCount).padStart(3, '0')}`;
        } else {
          invoiceNumber = invoiceNumberData || `INV-${new Date().getFullYear()}-${Date.now()}`;
        }
      } catch (rpcError) {
        console.warn('RPC call failed, using fallback:', rpcError);
        // Fallback: generate invoice number manually
        const year = new Date().getFullYear();
        const { count } = await supabase
          .from('invoices')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .like('invoice_number', `INV-${year}-%`);
        
        const invoiceCount = (count || 0) + 1;
        invoiceNumber = `INV-${year}-${String(invoiceCount).padStart(3, '0')}`;
      }
      const status = calculateStatus(invoiceData.dueDate, 'unpaid');

      const { data, error: insertError } = await (supabase
        .from('invoices') as any)
        .insert({
          user_id: user.id,
          invoice_number: invoiceNumber,
          client_name: invoiceData.clientName,
          client_email: invoiceData.clientEmail,
          client_phone: invoiceData.clientPhone,
          items: invoiceData.items,
          subtotal: invoiceData.subtotal,
          vat: invoiceData.vat,
          withholding_tax: invoiceData.withholdingTax,
          total: invoiceData.total,
          due_date: invoiceData.dueDate,
          status,
          account_id: invoiceData.accountId || null,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      await fetchInvoices();
    } catch (err: any) {
      console.error('Error adding invoice:', err);
      setError(err.message || 'Failed to add invoice');
      throw err;
    }
  };

  // Update invoice status
  const updateInvoiceStatus = async (id: string, status: Invoice['status']) => {
    if (!user) throw new Error('User must be authenticated');

    try {
      setError(null);
      const { error: updateError } = await (supabase
        .from('invoices') as any)
        .update({ status })
        .eq('id', id)
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      await fetchInvoices();
    } catch (err: any) {
      console.error('Error updating invoice status:', err);
      setError(err.message || 'Failed to update invoice status');
      throw err;
    }
  };

  // Delete invoice
  const deleteInvoice = async (id: string) => {
    if (!user) throw new Error('User must be authenticated');

    try {
      setError(null);
      const { error: deleteError } = await supabase
        .from('invoices')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;

      await fetchInvoices();
    } catch (err: any) {
      console.error('Error deleting invoice:', err);
      setError(err.message || 'Failed to delete invoice');
      throw err;
    }
  };

  // Update settings
  const updateSettings = async (newSettings: Partial<Settings>) => {
    if (!user) throw new Error('User must be authenticated');

    try {
      setError(null);
      const currentSettings = settings || defaultSettings;
      const updated = { ...currentSettings, ...newSettings };

      const { error: updateError } = await (supabase
        .from('settings') as any)
        .update({
          business_name: updated.businessName,
          business_logo: updated.businessLogo,
          default_vat: updated.defaultVAT,
          default_withholding_tax: updated.defaultWithholdingTax,
          currency: updated.currency,
          payment_integration: updated.paymentIntegration,
          default_account_id: updated.defaultAccountId,
        })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      setSettings(updated);
      await fetchSettings();
    } catch (err: any) {
      console.error('Error updating settings:', err);
      setError(err.message || 'Failed to update settings');
      throw err;
    }
  };

  // Get invoice
  const getInvoice = (id: string) => {
    return invoices.find(inv => inv.id === id);
  };

  // Add bank account
  const addAccount = async (accountData: Omit<AccountDetails, 'id'>) => {
    if (!user) throw new Error('User must be authenticated');

    try {
      setError(null);

      // If setting as default, unset other defaults
      if (accountData.isDefault) {
        await (supabase
          .from('bank_accounts') as any)
          .update({ is_default: false })
          .eq('user_id', user.id)
          .eq('is_default', true);
      }

      const { data, error: insertError } = await (supabase
        .from('bank_accounts') as any)
        .insert({
          user_id: user.id,
          account_name: accountData.accountName,
          bank_name: accountData.bankName,
          account_number: accountData.accountNumber,
          account_type: accountData.accountType || 'Current',
          is_default: accountData.isDefault || false,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Update settings if this is the default account
      if (accountData.isDefault && data) {
        await (supabase
          .from('settings') as any)
          .update({ default_account_id: data.id })
          .eq('user_id', user.id);
      }

      await fetchSettings();
    } catch (err: any) {
      console.error('Error adding account:', err);
      setError(err.message || 'Failed to add account');
      throw err;
    }
  };

  // Update bank account
  const updateAccount = async (id: string, accountData: Partial<AccountDetails>) => {
    if (!user) throw new Error('User must be authenticated');

    try {
      setError(null);

      // If setting as default, unset other defaults
      if (accountData.isDefault) {
        await (supabase
          .from('bank_accounts') as any)
          .update({ is_default: false })
          .eq('user_id', user.id)
          .eq('is_default', true)
          .neq('id', id);
      }

      const updateData: any = {};
      if (accountData.accountName !== undefined) updateData.account_name = accountData.accountName;
      if (accountData.bankName !== undefined) updateData.bank_name = accountData.bankName;
      if (accountData.accountNumber !== undefined) updateData.account_number = accountData.accountNumber;
      if (accountData.accountType !== undefined) updateData.account_type = accountData.accountType;
      if (accountData.isDefault !== undefined) updateData.is_default = accountData.isDefault;

      const { error: updateError } = await (supabase
        .from('bank_accounts') as any)
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      // Update settings if this is the default account
      if (accountData.isDefault) {
        await (supabase
          .from('settings') as any)
          .update({ default_account_id: id })
          .eq('user_id', user.id);
      }

      await fetchSettings();
    } catch (err: any) {
      console.error('Error updating account:', err);
      setError(err.message || 'Failed to update account');
      throw err;
    }
  };

  // Delete bank account
  const deleteAccount = async (id: string) => {
    if (!user) throw new Error('User must be authenticated');

    try {
      setError(null);
      const accountToDelete = settings?.accounts.find(acc => acc.id === id);

      const { error: deleteError } = await supabase
        .from('bank_accounts')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;

      // If deleted account was default, set first remaining account as default or clear default
      if (accountToDelete?.isDefault) {
        const remainingAccounts = settings?.accounts.filter(acc => acc.id !== id) || [];
        if (remainingAccounts.length > 0) {
          await (supabase
            .from('bank_accounts') as any)
            .update({ is_default: true })
            .eq('id', remainingAccounts[0].id)
            .eq('user_id', user.id);

          await (supabase
            .from('settings') as any)
            .update({ default_account_id: remainingAccounts[0].id })
            .eq('user_id', user.id);
        } else {
          await (supabase
            .from('settings') as any)
            .update({ default_account_id: null })
            .eq('user_id', user.id);
        }
      }

      await fetchSettings();
    } catch (err: any) {
      console.error('Error deleting account:', err);
      setError(err.message || 'Failed to delete account');
      throw err;
    }
  };

  // Set default account
  const setDefaultAccount = async (id: string) => {
    if (!user) throw new Error('User must be authenticated');

    try {
      setError(null);

      // Unset all defaults
      await (supabase
        .from('bank_accounts') as any)
        .update({ is_default: false })
        .eq('user_id', user.id)
        .eq('is_default', true);

      // Set new default
      const { error: updateError } = await (supabase
        .from('bank_accounts') as any)
        .update({ is_default: true })
        .eq('id', id)
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      // Update settings
      await (supabase
        .from('settings') as any)
        .update({ default_account_id: id })
        .eq('user_id', user.id);

      await fetchSettings();
    } catch (err: any) {
      console.error('Error setting default account:', err);
      setError(err.message || 'Failed to set default account');
      throw err;
    }
  };

  // Get account
  const getAccount = (id: string) => {
    return settings?.accounts.find(acc => acc.id === id);
  };

  // Periodically check for overdue invoices
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      const now = new Date();
      const overdueInvoices = invoices.filter(inv => 
        inv.status === 'unpaid' && new Date(inv.dueDate) < now
      );

      if (overdueInvoices.length > 0) {
        overdueInvoices.forEach(async (inv) => {
          await updateInvoiceStatus(inv.id, 'overdue');
        });
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [invoices, user]);

  return (
    <InvoiceContext.Provider
      value={{
        invoices,
        settings,
        loading,
        error,
        addInvoice,
        updateInvoiceStatus,
        deleteInvoice,
        updateSettings,
        getInvoice,
        addAccount,
        updateAccount,
        deleteAccount,
        setDefaultAccount,
        getAccount,
        refreshInvoices,
        refreshSettings,
      }}
    >
      {children}
    </InvoiceContext.Provider>
  );
}

export function useInvoices() {
  const context = useContext(InvoiceContext);
  if (context === undefined) {
    throw new Error('useInvoices must be used within an InvoiceProvider');
  }
  return context;
}
