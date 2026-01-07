'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useInvoices, InvoiceItem } from '../context/InvoiceContext';
import { Plus, Trash2, Save, ChevronLeft, Building2, CreditCard, ReceiptText, Calendar } from 'lucide-react';

export default function CreateInvoice() {
  const router = useRouter();
  const { addInvoice, settings } = useInvoices();
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: '1', description: '', quantity: 1, price: 0, total: 0 },
  ]);
  const [vat, setVat] = useState(settings.defaultVAT);
  const [withholdingTax, setWithholdingTax] = useState(settings.defaultWithholdingTax);
  const [dueDate, setDueDate] = useState('');

  useState(() => {
    setDueDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  });
  
  const [selectedAccountId, setSelectedAccountId] = useState(settings.defaultAccountId || '');

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
    <div className="min-h-screen bg-background p-4 md:p-8 transition-colors pb-32">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 md:mb-12">
          <button 
             onClick={() => router.back()}
             className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-4 md:mb-6 group"
          >
             <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
             <span className="font-black text-xs uppercase tracking-widest">Back</span>
          </button>
          <h1 className="text-3xl md:text-4xl font-black text-foreground mb-2 tracking-tight">Create Invoice</h1>
          <p className="text-muted-foreground font-medium text-sm md:text-base">Generate a professional invoice in seconds</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 md:space-y-10">
          {/* Client Information */}
          <div className="bg-card rounded-4xl md:rounded-3xl p-6 md:p-10 shadow-2xl border border-border">
            <h2 className="text-xl font-black text-foreground mb-6 md:mb-8 flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
              Client Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Client Name</label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full px-5 py-4 bg-background border border-border rounded-2xl focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all text-foreground font-bold"
                  placeholder="e.g., Adebayo Ogunleye"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Email Address</label>
                <input
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className="w-full px-5 py-4 bg-background border border-border rounded-2xl focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all text-foreground font-bold"
                  placeholder="client@example.com"
                  required
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Phone Number</label>
                <input
                  type="tel"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="w-full px-5 py-4 bg-background border border-border rounded-2xl focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all text-foreground font-bold"
                  placeholder="+234 801 234 5678"
                  required
                />
              </div>
            </div>
          </div>

          {/* Invoice Items */}
          <div className="bg-card rounded-4xl md:rounded-3xl p-6 md:p-10 shadow-2xl border border-border">
            <div className="flex items-center justify-between mb-8">
               <h2 className="text-xl font-black text-foreground flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-xl">
                  <ReceiptText className="w-5 h-5 text-primary" />
                </div>
                Line Items
              </h2>
              <button
                type="button"
                onClick={addItem}
                className="p-3 bg-primary text-white rounded-2xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                title="Add Item"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4 md:space-y-6">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="p-5 md:p-6 bg-background border border-border rounded-3xl md:rounded-2xl transition-all hover:border-primary/30"
                >
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 space-y-1">
                      <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-1">Description</label>
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                        className="w-full px-4 py-3 bg-card border border-border rounded-xl focus:border-primary transition-all text-foreground font-bold text-sm"
                        placeholder="Project fee, Service, etc."
                        required
                      />
                    </div>
                    
                    <div className="flex gap-4 md:w-80">
                      <div className="flex-1 space-y-1">
                        <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-1">Qty</label>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                          className="w-full px-4 py-3 bg-card border border-border rounded-xl focus:border-primary transition-all text-foreground font-bold text-sm"
                          min="1"
                          required
                        />
                      </div>
                      <div className="flex-2 space-y-1">
                        <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-1">Price</label>
                        <input
                          type="number"
                          value={item.price}
                          onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                          className="w-full px-4 py-3 bg-card border border-border rounded-xl focus:border-primary transition-all text-foreground font-black text-sm"
                          placeholder="0.00"
                          min="0"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-border/50 md:border-0 pt-4 md:pt-0">
                      <div className="md:text-right md:w-32">
                        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest block mb-1 md:hidden">Line Total</span>
                        <span className="font-black text-foreground text-lg">₦{item.total.toLocaleString()}</span>
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
                </div>
              ))}
            </div>
          </div>

          {/* Tax & Due Date */}
          <div className="bg-card rounded-4xl md:rounded-3xl p-6 md:p-10 shadow-2xl border border-border">
             <h2 className="text-xl font-black text-foreground mb-8 flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-xl">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                Schedule & Extras
              </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">VAT (%)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={vat}
                    onChange={(e) => setVat(parseFloat(e.target.value) || 0)}
                    className="w-full px-5 py-4 bg-background border border-border rounded-2xl focus:ring-4 focus:ring-primary/20 font-black"
                    min="0"
                  />
                  <span className="absolute right-5 top-1/2 -translate-y-1/2 font-black text-muted-foreground">%</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">WH Tax (%)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={withholdingTax}
                    onChange={(e) => setWithholdingTax(parseFloat(e.target.value) || 0)}
                    className="w-full px-5 py-4 bg-background border border-border rounded-2xl focus:ring-4 focus:ring-primary/20 font-black"
                    min="0"
                  />
                  <span className="absolute right-5 top-1/2 -translate-y-1/2 font-black text-muted-foreground">%</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-5 py-4 bg-background border border-border rounded-2xl focus:ring-4 focus:ring-primary/20 font-black"
                  required
                />
              </div>
            </div>
          </div>

          {/* Account Selection */}
          <div className="bg-card rounded-4xl md:rounded-3xl p-6 md:p-10 shadow-2xl border border-border">
            <div className="flex items-center justify-between mb-8">
               <h2 className="text-xl font-black text-foreground flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-xl">
                    <CreditCard className="w-5 h-5 text-primary" />
                  </div>
                  Payment Details
                </h2>
            </div>

            {settings.accounts && settings.accounts.length > 0 ? (
              <div className="space-y-4">
                 <select
                    value={selectedAccountId}
                    onChange={(e) => setSelectedAccountId(e.target.value)}
                    className="w-full px-5 py-4 bg-background border border-border rounded-2xl focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all text-foreground font-black text-sm md:text-base outline-none"
                    required
                  >
                    <option value="">Select bank account...</option>
                    {settings.accounts.map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.accountName} - {account.bankName}
                      </option>
                    ))}
                  </select>
                
                {selectedAccountId && (
                  <div className="p-6 bg-primary/5 rounded-2xl border border-primary/20 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
                    {(() => {
                      const selected = settings.accounts.find(acc => acc.id === selectedAccountId);
                      return selected ? (
                        <>
                          <div className="space-y-0.5">
                            <p className="font-black text-foreground">{selected.accountName}</p>
                            <p className="text-xs font-bold text-primary uppercase tracking-widest">{selected.bankName}</p>
                          </div>
                          <p className="font-black text-lg tracking-tighter font-mono">{selected.accountNumber}</p>
                        </>
                      ) : null;
                    })()}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 bg-yellow-500/5 rounded-2xl border border-dashed border-yellow-500/30 text-center">
                <p className="text-xs font-bold text-yellow-500 uppercase tracking-widest">No Bank Accounts Found</p>
                <p className="text-xs text-muted-foreground mt-1">Configure an account to receive payment.</p>
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="bg-card rounded-4xl md:rounded-3xl p-8 md:p-10 shadow-2xl border border-border relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16" />
            <div className="space-y-4 relative z-10">
              <div className="flex justify-between items-center px-1">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Subtotal</span>
                <span className="font-black text-foreground">₦{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center px-1">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">VAT ({vat}%)</span>
                <span className="font-black text-foreground">₦{vatAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center px-1">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Tax Withheld ({withholdingTax}%)</span>
                <span className="font-black text-red-500">-₦{withholdingTaxAmount.toLocaleString()}</span>
              </div>
              <div className="pt-6 mt-4 border-t border-border">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                  <div>
                    <span className="text-xs font-black text-primary uppercase tracking-widest block mb-1">Total Payable</span>
                    <span className="text-4xl md:text-5xl font-black text-foreground tracking-tighter">₦{total.toLocaleString()}</span>
                  </div>
                  <button
                    type="submit"
                    className="w-full md:w-auto px-10 py-5 bg-primary text-white rounded-2xl font-black text-base md:text-lg hover:bg-primary/90 transition-all shadow-2xl shadow-primary/40 active:scale-95 flex items-center justify-center gap-3"
                  >
                    <Save className="w-6 h-6" />
                    Generate Invoice
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
