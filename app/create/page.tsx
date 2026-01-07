'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useInvoices, InvoiceItem, AccountDetails } from '../context/InvoiceContext';
import { Plus, Trash2, Save, Wallet } from 'lucide-react';

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
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Invoice</h1>
          <p className="text-gray-600">Fill in the details to generate a new invoice</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Client Information */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Client Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Client Name *
                </label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Adebayo Ogunleye"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="client@example.com"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  WhatsApp / Phone Number *
                </label>
                <input
                  type="tel"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+234 801 234 5678"
                  required
                />
              </div>
            </div>
          </div>

          {/* Invoice Items */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Invoice Items</h2>
              <button
                type="button"
                onClick={addItem}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Plus className="w-4 h-4" />
                Add Item
              </button>
            </div>
            <div className="space-y-4">
              {items.map((item, index) => (
                <div
                  key={item.id}
                  className="grid grid-cols-12 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="col-span-12 md:col-span-5">
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Item description"
                      required
                    />
                  </div>
                  <div className="col-span-4 md:col-span-2">
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Qty"
                      min="1"
                      required
                    />
                  </div>
                  <div className="col-span-4 md:col-span-2">
                    <input
                      type="number"
                      value={item.price}
                      onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Price"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  <div className="col-span-3 md:col-span-2 flex items-center justify-between">
                    <span className="font-semibold text-gray-900">
                      ₦{item.total.toLocaleString()}
                    </span>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tax Settings */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Tax & Due Date</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  VAT (%)
                </label>
                <input
                  type="number"
                  value={vat}
                  onChange={(e) => setVat(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                  step="0.1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Withholding Tax (%)
                </label>
                <input
                  type="number"
                  value={withholdingTax}
                  onChange={(e) => setWithholdingTax(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                  step="0.1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Due Date *
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>

          {/* Account Selection */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">Payment Account</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowAddAccount(!showAddAccount)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
              >
                <Plus className="w-4 h-4" />
                Add New Account
              </button>
            </div>

            {showAddAccount && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">Add New Account</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Account Name *
                    </label>
                    <input
                      type="text"
                      value={newAccount.accountName || ''}
                      onChange={(e) => setNewAccount({ ...newAccount, accountName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bank Name *
                    </label>
                    <input
                      type="text"
                      value={newAccount.bankName || ''}
                      onChange={(e) => setNewAccount({ ...newAccount, bankName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Access Bank"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Account Number *
                    </label>
                    <input
                      type="text"
                      value={newAccount.accountNumber || ''}
                      onChange={(e) => setNewAccount({ ...newAccount, accountNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0123456789"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Account Type
                    </label>
                    <select
                      value={newAccount.accountType || 'Current'}
                      onChange={(e) => setNewAccount({ ...newAccount, accountType: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Current">Current</option>
                      <option value="Savings">Savings</option>
                    </select>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="newAccountDefault"
                    checked={newAccount.isDefault || false}
                    onChange={(e) => setNewAccount({ ...newAccount, isDefault: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="newAccountDefault" className="text-sm text-gray-700">
                    Set as default account
                  </label>
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={handleAddNewAccount}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm"
                  >
                    Add Account
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddAccount(false);
                      setNewAccount({
                        accountName: '',
                        bankName: '',
                        accountNumber: '',
                        accountType: 'Current',
                        isDefault: false,
                      });
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {settings.accounts && settings.accounts.length > 0 ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Payment Account *
                </label>
                <select
                  value={selectedAccountId}
                  onChange={(e) => setSelectedAccountId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select an account...</option>
                  {settings.accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.accountName} - {account.bankName} ({account.accountNumber})
                      {account.isDefault ? ' [Default]' : ''}
                    </option>
                  ))}
                </select>
                {selectedAccountId && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    {(() => {
                      const selected = settings.accounts.find(acc => acc.id === selectedAccountId);
                      return selected ? (
                        <div>
                          <p className="font-semibold text-gray-900">{selected.accountName}</p>
                          <p className="text-sm text-gray-600">{selected.bankName}</p>
                          <p className="text-sm font-mono text-gray-700">{selected.accountNumber}</p>
                          {selected.accountType && (
                            <p className="text-xs text-gray-500 mt-1">{selected.accountType} Account</p>
                          )}
                        </div>
                      ) : null;
                    })()}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-sm text-yellow-800">
                  No accounts added yet. Please add an account in Settings or add one above.
                </p>
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Summary</h2>
            <div className="space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>₦{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>VAT ({vat}%)</span>
                <span>₦{vatAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Withholding Tax ({withholdingTax}%)</span>
                <span className="text-red-600">-₦{withholdingTaxAmount.toLocaleString()}</span>
              </div>
              <div className="border-t border-gray-200 pt-2 mt-2">
                <div className="flex justify-between text-xl font-bold text-gray-900">
                  <span>Total</span>
                  <span>₦{total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              Generate Invoice
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

