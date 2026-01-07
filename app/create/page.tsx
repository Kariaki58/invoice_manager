'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useInvoices, InvoiceItem, AccountDetails } from '../context/InvoiceContext';
import { Plus, Trash2, Save } from 'lucide-react';

export default function CreateInvoice() {
  const router = useRouter();
  const { addInvoice, settings, addAccount, updateSettings } = useInvoices();
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: '1', description: '', quantity: 1, price: 0, total: 0 },
  ]);
  const [vat, setVat] = useState(settings.defaultVAT);
  const [withholdingTax, setWithholdingTax] = useState(settings.defaultWithholdingTax);
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [selectedAccountId, setSelectedAccountId] = useState(settings.defaultAccountId || '');
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [newAccount, setNewAccount] = useState<Partial<AccountDetails>>({
    accountName: '',
    bankName: '',
    accountNumber: '',
    accountType: 'Current',
    isDefault: false,
  });

  const addItem = () => {
    setItems([
      ...items,
      { id: Date.now().toString(), description: '', quantity: 1, price: 0, total: 0 },
    ]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setItems(
      items.map(item => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          if (field === 'quantity' || field === 'price') {
            updated.total = updated.quantity * updated.price;
          }
          return updated;
        }
        return item;
      })
    );
  };

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const vatAmount = (subtotal * vat) / 100;
  const withholdingTaxAmount = (subtotal * withholdingTax) / 100;
  const total = subtotal + vatAmount - withholdingTaxAmount;

  const handleAddNewAccount = () => {
    if (!newAccount.accountName || !newAccount.bankName || !newAccount.accountNumber) {
      alert('Please fill in all account details');
      return;
    }
    // Generate ID before adding
    const newAccountId = Date.now().toString();
    const accountToAdd = {
      id: newAccountId,
      accountName: newAccount.accountName!,
      bankName: newAccount.bankName!,
      accountNumber: newAccount.accountNumber!,
      accountType: newAccount.accountType || 'Current',
      isDefault: newAccount.isDefault || false,
    };
    
    // Add to settings directly
    const updatedAccounts = [...(settings.accounts || []), accountToAdd];
    if (accountToAdd.isDefault) {
      // Unset other defaults
      const accountsWithDefaults = updatedAccounts.map(acc => ({
        ...acc,
        isDefault: acc.id === newAccountId,
      }));
      updateSettings({
        accounts: accountsWithDefaults,
        defaultAccountId: newAccountId,
      });
    } else {
      updateSettings({ accounts: updatedAccounts });
    }
    
    // Select the newly added account
    setSelectedAccountId(newAccountId);
    setNewAccount({
      accountName: '',
      bankName: '',
      accountNumber: '',
      accountType: 'Current',
      isDefault: false,
    });
    setShowAddAccount(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!clientName || !clientEmail || !clientPhone) {
      alert('Please fill in all client details');
      return;
    }

    if (items.some(item => !item.description || item.price <= 0)) {
      alert('Please fill in all item details with valid prices');
      return;
    }

    if (!selectedAccountId && settings.accounts.length > 0) {
      alert('Please select an account for payment');
      return;
    }

    addInvoice({
      clientName,
      clientEmail,
      clientPhone,
      items,
      subtotal,
      vat: vatAmount,
      withholdingTax: withholdingTaxAmount,
      total,
      dueDate: new Date(dueDate).toISOString(),
      accountId: selectedAccountId || undefined,
    });

    router.push('/invoices');
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 transition-colors">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10">
          <h1 className="text-4xl font-black text-foreground mb-2 tracking-tight">Create Invoice</h1>
          <p className="text-muted-foreground font-medium">Generate a professional invoice in seconds</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Client Information */}
          <div className="bg-card rounded-3xl p-8 shadow-2xl border border-border">
            <h2 className="text-xl font-black text-foreground mb-6 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-primary rounded-full" />
              Client Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">
                  Client Name
                </label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full px-5 py-4 bg-background border border-border rounded-2xl focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all text-foreground font-medium"
                  placeholder="e.g., Adebayo Ogunleye"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className="w-full px-5 py-4 bg-background border border-border rounded-2xl focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all text-foreground font-medium"
                  placeholder="client@example.com"
                  required
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">
                  WhatsApp / Phone Number
                </label>
                <input
                  type="tel"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="w-full px-5 py-4 bg-background border border-border rounded-2xl focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all text-foreground font-medium"
                  placeholder="+234 801 234 5678"
                  required
                />
              </div>
            </div>
          </div>

          {/* Invoice Items */}
          <div className="bg-card rounded-3xl p-8 shadow-2xl border border-border">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h2 className="text-xl font-black text-foreground flex items-center gap-2">
                <span className="w-1.5 h-6 bg-primary rounded-full" />
                Invoice Items
              </h2>
              <button
                type="button"
                onClick={addItem}
                className="flex items-center justify-center gap-2 px-5 py-3 bg-primary/10 text-primary rounded-xl hover:bg-primary hover:text-white transition-all font-bold text-sm transform hover:scale-105 active:scale-95"
              >
                <Plus className="w-4 h-4" />
                Add Line Item
              </button>
            </div>
            <div className="space-y-4">
              {items.map((item, index) => (
                <div
                  key={item.id}
                  className="grid grid-cols-12 gap-4 p-5 bg-background border border-border rounded-2xl relative group transition-all hover:border-primary/30"
                >
                  <div className="col-span-12 md:col-span-5 space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-1 md:hidden">Description</label>
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                      className="w-full px-4 py-3 bg-card border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground font-medium"
                      placeholder="Item description"
                      required
                    />
                  </div>
                  <div className="col-span-6 md:col-span-2 space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-1 md:hidden">Quantity</label>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                      className="w-full px-4 py-3 bg-card border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground font-medium"
                      placeholder="Qty"
                      min="1"
                      required
                    />
                  </div>
                  <div className="col-span-6 md:col-span-2 space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-1 md:hidden">Price</label>
                    <input
                      type="number"
                      value={item.price}
                      onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                      className="w-full px-4 py-3 bg-card border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground font-medium"
                      placeholder="Price"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  <div className="col-span-12 md:col-span-3 flex items-center justify-between gap-4 pt-2 md:pt-0">
                    <div className="flex-1 text-right">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Total</span>
                      <span className="font-black text-foreground text-lg">
                        ₦{item.total.toLocaleString()}
                      </span>
                    </div>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="p-3 text-red-500 bg-red-500/10 rounded-xl hover:bg-red-500 hover:text-white transition-all transform hover:rotate-12"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tax & Due Date */}
          <div className="bg-card rounded-3xl p-8 shadow-2xl border border-border">
            <h2 className="text-xl font-black text-foreground mb-6 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-primary rounded-full" />
              Tax & Timeline
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">
                  VAT (%)
                </label>
                <input
                  type="number"
                  value={vat}
                  onChange={(e) => setVat(parseFloat(e.target.value) || 0)}
                  className="w-full px-5 py-4 bg-background border border-border rounded-2xl focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all text-foreground font-medium"
                  min="0"
                  step="0.1"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">
                  WH Tax (%)
                </label>
                <input
                  type="number"
                  value={withholdingTax}
                  onChange={(e) => setWithholdingTax(parseFloat(e.target.value) || 0)}
                  className="w-full px-5 py-4 bg-background border border-border rounded-2xl focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all text-foreground font-medium"
                  min="0"
                  step="0.1"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-5 py-4 bg-background border border-border rounded-2xl focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all text-foreground font-medium appearance-none"
                  required
                />
              </div>
            </div>
          </div>

          {/* Account Selection */}
          <div className="bg-card rounded-3xl p-8 shadow-2xl border border-border">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h2 className="text-xl font-black text-foreground flex items-center gap-2">
                <span className="w-1.5 h-6 bg-primary rounded-full" />
                Payment Account
              </h2>
              <button
                type="button"
                onClick={() => setShowAddAccount(!showAddAccount)}
                className="flex items-center justify-center gap-2 px-5 py-3 bg-primary/10 text-primary rounded-xl hover:bg-primary hover:text-white transition-all font-bold text-sm"
              >
                <Plus className="w-4 h-4" />
                New Account
              </button>
            </div>

            {showAddAccount && (
              <div className="mb-6 p-6 bg-background rounded-2xl border border-primary/30 shadow-inner">
                <h3 className="font-black text-foreground mb-4">Add Bank Account</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    value={newAccount.accountName || ''}
                    onChange={(e) => setNewAccount({ ...newAccount, accountName: e.target.value })}
                    className="w-full px-4 py-3 bg-card border border-border rounded-xl focus:border-primary transition-all text-foreground text-sm"
                    placeholder="Account Name"
                  />
                  <input
                    type="text"
                    value={newAccount.bankName || ''}
                    onChange={(e) => setNewAccount({ ...newAccount, bankName: e.target.value })}
                    className="w-full px-4 py-3 bg-card border border-border rounded-xl focus:border-primary transition-all text-foreground text-sm"
                    placeholder="Bank Name"
                  />
                  <input
                    type="text"
                    value={newAccount.accountNumber || ''}
                    onChange={(e) => setNewAccount({ ...newAccount, accountNumber: e.target.value })}
                    className="w-full px-4 py-3 bg-card border border-border rounded-xl focus:border-primary transition-all text-foreground text-sm font-mono"
                    placeholder="Account Number"
                  />
                  <select
                    value={newAccount.accountType || 'Current'}
                    onChange={(e) => setNewAccount({ ...newAccount, accountType: e.target.value })}
                    className="w-full px-4 py-3 bg-card border border-border rounded-xl focus:border-primary transition-all text-foreground text-sm"
                  >
                    <option value="Current">Current</option>
                    <option value="Savings">Savings</option>
                  </select>
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <div className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      id="newAccountDefault"
                      checked={newAccount.isDefault || false}
                      onChange={(e) => setNewAccount({ ...newAccount, isDefault: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-muted/30 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    <label htmlFor="newAccountDefault" className="ml-3 text-sm font-bold text-muted-foreground cursor-pointer">
                      Set as default
                    </label>
                  </div>
                </div>
                <div className="mt-6 flex gap-3">
                  <button
                    type="button"
                    onClick={handleAddNewAccount}
                    className="flex-1 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all font-bold text-sm shadow-lg shadow-primary/20"
                  >
                    Add Account
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddAccount(false)}
                    className="px-6 py-3 bg-muted/20 text-foreground rounded-xl hover:bg-muted/30 transition-all font-bold text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {settings.accounts && settings.accounts.length > 0 ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">
                    Select Payment Destination
                  </label>
                  <select
                    value={selectedAccountId}
                    onChange={(e) => setSelectedAccountId(e.target.value)}
                    className="w-full px-5 py-4 bg-background border border-border rounded-2xl focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all text-foreground font-bold"
                    required
                  >
                    <option value="">Choose an account...</option>
                    {settings.accounts.map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.accountName} - {account.bankName}
                      </option>
                    ))}
                  </select>
                </div>
                {selectedAccountId && (
                  <div className="p-6 bg-primary/5 rounded-2xl border border-primary/20 animate-in fade-in slide-in-from-top-2">
                    {(() => {
                      const selected = settings.accounts.find(acc => acc.id === selectedAccountId);
                      return selected ? (
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-black text-foreground text-lg">{selected.accountName}</p>
                            <p className="text-sm font-bold text-primary">{selected.bankName} • {selected.accountType || 'Current'}</p>
                          </div>
                          <p className="text-xl font-black text-foreground font-mono tracking-tighter">{selected.accountNumber}</p>
                        </div>
                      ) : null;
                    })()}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 bg-yellow-500/5 rounded-2xl border border-yellow-500/20 text-center">
                <p className="text-sm font-bold text-yellow-500">
                  No bank accounts configured. Add one to receive payments.
                </p>
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="bg-card rounded-3xl p-8 shadow-2xl border border-border relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -mr-16 -mt-16" />
            <h2 className="text-xl font-black text-foreground mb-6 flex items-center gap-2 relative z-10">
              <span className="w-1.5 h-6 bg-primary rounded-full relative z-10" />
              Final Summary
            </h2>
            <div className="space-y-4 relative z-10">
              <div className="flex justify-between items-center px-2">
                <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Subtotal</span>
                <span className="text-lg font-black text-foreground">₦{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center px-2">
                <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">VAT ({vat}%)</span>
                <span className="text-lg font-black text-foreground">₦{vatAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center px-2">
                <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Tax Withheld ({withholdingTax}%)</span>
                <span className="text-lg font-black text-red-500">-₦{withholdingTaxAmount.toLocaleString()}</span>
              </div>
              <div className="pt-6 mt-4 border-t border-border">
                <div className="flex justify-between items-end px-2">
                  <div>
                    <span className="text-xs font-black text-primary uppercase tracking-[0.2em] block mb-1">Total Payable</span>
                    <span className="text-5xl font-black text-foreground tracking-tighter">₦{total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-8 py-5 bg-card border border-border rounded-2xl font-black text-muted-foreground hover:bg-muted/10 transition-all transform hover:-translate-y-1 active:scale-95"
            >
              Back to Overview
            </button>
            <button
              type="submit"
              className="flex-2 px-8 py-5 bg-primary text-white rounded-2xl font-black text-lg hover:bg-primary/90 transition-all shadow-xl shadow-primary/25 transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3"
            >
              <Save className="w-6 h-6" />
              Generate Professional Invoice
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

