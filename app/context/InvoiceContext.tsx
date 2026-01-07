'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

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

interface Settings {
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
  settings: Settings;
  addInvoice: (invoice: Omit<Invoice, 'id' | 'invoiceNumber' | 'createdAt' | 'status'>) => void;
  updateInvoiceStatus: (id: string, status: Invoice['status']) => void;
  deleteInvoice: (id: string) => void;
  updateSettings: (settings: Partial<Settings>) => void;
  getInvoice: (id: string) => Invoice | undefined;
  addAccount: (account: Omit<AccountDetails, 'id'>) => void;
  updateAccount: (id: string, account: Partial<AccountDetails>) => void;
  deleteAccount: (id: string) => void;
  setDefaultAccount: (id: string) => void;
  getAccount: (id: string) => AccountDetails | undefined;
}

const InvoiceContext = createContext<InvoiceContextType | undefined>(undefined);

const defaultAccount: AccountDetails = {
  id: 'default-1',
  accountName: 'John Doe',
  bankName: 'Access Bank',
  accountNumber: '0123456789',
  accountType: 'Current',
  isDefault: true,
};

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
  accounts: [defaultAccount],
  defaultAccountId: 'default-1',
};

// Sample Nigerian names for demo
const sampleInvoices: Invoice[] = [
  {
    id: '1',
    invoiceNumber: 'INV-2024-001',
    clientName: 'Adebayo Ogunleye',
    clientEmail: 'adebayo@example.com',
    clientPhone: '+234 801 234 5678',
    items: [
      { id: '1', description: 'Web Development Services', quantity: 10, price: 50000, total: 500000 },
      { id: '2', description: 'UI/UX Design', quantity: 5, price: 30000, total: 150000 },
    ],
    subtotal: 650000,
    vat: 48750,
    withholdingTax: 32500,
    total: 666250,
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'unpaid',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    accountId: 'default-1',
  },
  {
    id: '2',
    invoiceNumber: 'INV-2024-002',
    clientName: 'Chiamaka Nwosu',
    clientEmail: 'chiamaka@example.com',
    clientPhone: '+234 802 345 6789',
    items: [
      { id: '1', description: 'Consulting Services', quantity: 20, price: 25000, total: 500000 },
    ],
    subtotal: 500000,
    vat: 37500,
    withholdingTax: 25000,
    total: 512500,
    dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'overdue',
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    accountId: 'default-1',
  },
  {
    id: '3',
    invoiceNumber: 'INV-2024-003',
    clientName: 'Emeka Okoro',
    clientEmail: 'emeka@example.com',
    clientPhone: '+234 803 456 7890',
    items: [
      { id: '1', description: 'Mobile App Development', quantity: 1, price: 1200000, total: 1200000 },
    ],
    subtotal: 1200000,
    vat: 90000,
    withholdingTax: 60000,
    total: 1230000,
    dueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'paid',
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    accountId: 'default-1',
  },
];

export function InvoiceProvider({ children }: { children: React.ReactNode }) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [settings, setSettings] = useState<Settings>(defaultSettings);

  useEffect(() => {
    // Load from localStorage
    const storedInvoices = localStorage.getItem('invoices');
    const storedSettings = localStorage.getItem('settings');

    if (storedInvoices) {
      const parsedInvoices = JSON.parse(storedInvoices);
      // Ensure all items have totals calculated and valid numbers
      const normalizedInvoices = parsedInvoices.map((inv: Invoice) => ({
        ...inv,
        items: (inv.items || []).map((item: InvoiceItem) => {
          // Safely convert to numbers with validation
          const quantity = (item.quantity != null && !isNaN(Number(item.quantity))) 
            ? Number(item.quantity) 
            : 0;
          const price = (item.price != null && !isNaN(Number(item.price))) 
            ? Number(item.price) 
            : 0;
          const calculatedTotal = quantity * price;
          const existingTotal = (item.total != null && !isNaN(Number(item.total))) 
            ? Number(item.total) 
            : null;
          const total = existingTotal ?? calculatedTotal;
          
          return {
            ...item,
            quantity: Math.max(0, quantity),
            price: Math.max(0, price),
            total: Math.max(0, total),
          };
        }),
      }));
      setInvoices(normalizedInvoices);
      // Update localStorage with normalized data
      localStorage.setItem('invoices', JSON.stringify(normalizedInvoices));
    } else {
      // Initialize with sample data
      setInvoices(sampleInvoices);
      localStorage.setItem('invoices', JSON.stringify(sampleInvoices));
    }

    if (storedSettings) {
      setSettings(JSON.parse(storedSettings));
    } else {
      localStorage.setItem('settings', JSON.stringify(defaultSettings));
    }
  }, []);

  const addInvoice = (invoiceData: Omit<Invoice, 'id' | 'invoiceNumber' | 'createdAt' | 'status'>) => {
    const newInvoice: Invoice = {
      ...invoiceData,
      id: Date.now().toString(),
      invoiceNumber: `INV-2024-${String(invoices.length + 1).padStart(3, '0')}`,
      createdAt: new Date().toISOString(),
      status: new Date(invoiceData.dueDate) < new Date() ? 'overdue' : 'unpaid',
    };

    const updatedInvoices = [...invoices, newInvoice];
    setInvoices(updatedInvoices);
    localStorage.setItem('invoices', JSON.stringify(updatedInvoices));
  };

  const updateInvoiceStatus = (id: string, status: Invoice['status']) => {
    const updatedInvoices = invoices.map(inv =>
      inv.id === id ? { ...inv, status } : inv
    );
    setInvoices(updatedInvoices);
    localStorage.setItem('invoices', JSON.stringify(updatedInvoices));
  };

  const deleteInvoice = (id: string) => {
    const updatedInvoices = invoices.filter(inv => inv.id !== id);
    setInvoices(updatedInvoices);
    localStorage.setItem('invoices', JSON.stringify(updatedInvoices));
  };

  const updateSettings = (newSettings: Partial<Settings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    localStorage.setItem('settings', JSON.stringify(updated));
  };

  const getInvoice = (id: string) => {
    return invoices.find(inv => inv.id === id);
  };

  const addAccount = (accountData: Omit<AccountDetails, 'id'>) => {
    const newAccount: AccountDetails = {
      ...accountData,
      id: Date.now().toString(),
    };

    // If this is set as default, unset other defaults
    let updatedAccounts = [...settings.accounts];
    if (newAccount.isDefault) {
      updatedAccounts = updatedAccounts.map(acc => ({ ...acc, isDefault: false }));
      updatedAccounts.push(newAccount);
      const updated = { ...settings, accounts: updatedAccounts, defaultAccountId: newAccount.id };
      setSettings(updated);
      localStorage.setItem('settings', JSON.stringify(updated));
    } else {
      updatedAccounts.push(newAccount);
      const updated = { ...settings, accounts: updatedAccounts };
      setSettings(updated);
      localStorage.setItem('settings', JSON.stringify(updated));
    }
  };

  const updateAccount = (id: string, accountData: Partial<AccountDetails>) => {
    let updatedAccounts = settings.accounts.map(acc => {
      if (acc.id === id) {
        const updated = { ...acc, ...accountData };
        // If setting as default, unset others
        if (accountData.isDefault) {
          return updated;
        }
        return updated;
      }
      // If another account is being set as default, unset this one
      if (accountData.isDefault) {
        return { ...acc, isDefault: false };
      }
      return acc;
    });

    const updated = {
      ...settings,
      accounts: updatedAccounts,
      defaultAccountId: accountData.isDefault ? id : settings.defaultAccountId,
    };
    setSettings(updated);
    localStorage.setItem('settings', JSON.stringify(updated));
  };

  const deleteAccount = (id: string) => {
    const updatedAccounts = settings.accounts.filter(acc => acc.id !== id);
    const deletedAccount = settings.accounts.find(acc => acc.id === id);
    const updated = {
      ...settings,
      accounts: updatedAccounts,
      defaultAccountId: deletedAccount?.isDefault && updatedAccounts.length > 0
        ? updatedAccounts[0].id
        : settings.defaultAccountId === id ? null : settings.defaultAccountId,
    };
    setSettings(updated);
    localStorage.setItem('settings', JSON.stringify(updated));
  };

  const setDefaultAccount = (id: string) => {
    const updatedAccounts = settings.accounts.map(acc => ({
      ...acc,
      isDefault: acc.id === id,
    }));
    const updated = {
      ...settings,
      accounts: updatedAccounts,
      defaultAccountId: id,
    };
    setSettings(updated);
    localStorage.setItem('settings', JSON.stringify(updated));
  };

  const getAccount = (id: string) => {
    return settings.accounts.find(acc => acc.id === id);
  };

  // Update overdue status periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const updatedInvoices = invoices.map(inv => {
        if (inv.status === 'unpaid' && new Date(inv.dueDate) < now) {
          return { ...inv, status: 'overdue' as const };
        }
        return inv;
      });
      setInvoices(updatedInvoices);
      localStorage.setItem('invoices', JSON.stringify(updatedInvoices));
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [invoices]);

  return (
    <InvoiceContext.Provider
      value={{
        invoices,
        settings,
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

