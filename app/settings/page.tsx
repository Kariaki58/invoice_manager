'use client';

import { useState, useRef } from 'react';
import { useInvoices, AccountDetails } from '../context/InvoiceContext';
import { Upload, Save, CreditCard, Building2, Plus, Trash2, Edit2, Check, X, Wallet } from 'lucide-react';

export default function Settings() {
  const { settings, updateSettings, addAccount, updateAccount, deleteAccount, setDefaultAccount } = useInvoices();
  const [formData, setFormData] = useState(settings);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [editingAccount, setEditingAccount] = useState<string | null>(null);
  const [accountForm, setAccountForm] = useState<Partial<AccountDetails>>({
    accountName: '',
    bankName: '',
    accountNumber: '',
    accountType: 'Current',
    isDefault: false,
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNestedChange = (parent: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...(prev[parent as keyof typeof prev] as any),
        [field]: value,
      },
    }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleInputChange('businessLogo', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    updateSettings(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleAddAccount = () => {
    if (!accountForm.accountName || !accountForm.bankName || !accountForm.accountNumber) {
      alert('Please fill in all required fields');
      return;
    }
    addAccount({
      accountName: accountForm.accountName!,
      bankName: accountForm.bankName!,
      accountNumber: accountForm.accountNumber!,
      accountType: accountForm.accountType || 'Current',
      isDefault: accountForm.isDefault || false,
    });
    setAccountForm({
      accountName: '',
      bankName: '',
      accountNumber: '',
      accountType: 'Current',
      isDefault: false,
    });
    setShowAddAccount(false);
    // Refresh formData to reflect new account
    const updatedSettings = { ...settings, accounts: [...settings.accounts, {
      id: Date.now().toString(),
      accountName: accountForm.accountName!,
      bankName: accountForm.bankName!,
      accountNumber: accountForm.accountNumber!,
      accountType: accountForm.accountType || 'Current',
      isDefault: accountForm.isDefault || false,
    }] };
    setFormData(updatedSettings);
  };

  const handleEditAccount = (account: AccountDetails) => {
    setEditingAccount(account.id);
    setAccountForm({
      accountName: account.accountName,
      bankName: account.bankName,
      accountNumber: account.accountNumber,
      accountType: account.accountType,
      isDefault: account.isDefault,
    });
  };

  const handleSaveAccount = (id: string) => {
    if (!accountForm.accountName || !accountForm.bankName || !accountForm.accountNumber) {
      alert('Please fill in all required fields');
      return;
    }
    updateAccount(id, accountForm);
    setEditingAccount(null);
    setAccountForm({
      accountName: '',
      bankName: '',
      accountNumber: '',
      accountType: 'Current',
      isDefault: false,
    });
    // Refresh formData
    const updatedAccounts = settings.accounts.map(acc =>
      acc.id === id ? { ...acc, ...accountForm } : acc
    );
    setFormData({ ...formData, accounts: updatedAccounts });
  };

  const handleDeleteAccount = (id: string) => {
    if (confirm('Are you sure you want to delete this account?')) {
      deleteAccount(id);
      const updatedAccounts = settings.accounts.filter(acc => acc.id !== id);
      setFormData({ ...formData, accounts: updatedAccounts });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">Manage your business profile and preferences</p>
        </div>

        <div className="space-y-6">
          {/* Business Profile */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <Building2 className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Business Profile</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Name
                </label>
                <input
                  type="text"
                  value={formData.businessName}
                  onChange={(e) => handleInputChange('businessName', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Your Business Name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Logo
                </label>
                <div className="flex items-center gap-4">
                  {formData.businessLogo && (
                    <img
                      src={formData.businessLogo}
                      alt="Business Logo"
                      className="w-20 h-20 object-contain rounded-lg border border-gray-200"
                    />
                  )}
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                    >
                      <Upload className="w-4 h-4" />
                      {formData.businessLogo ? 'Change Logo' : 'Upload Logo'}
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Recommended: Square logo, PNG or JPG, max 2MB
                </p>
              </div>
            </div>
          </div>

          {/* Tax Settings */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Tax Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default VAT (%)
                </label>
                <input
                  type="number"
                  value={formData.defaultVAT}
                  onChange={(e) => handleInputChange('defaultVAT', parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                  step="0.1"
                />
                <p className="text-sm text-gray-500 mt-1">Standard VAT rate in Nigeria: 7.5%</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Withholding Tax (%)
                </label>
                <input
                  type="number"
                  value={formData.defaultWithholdingTax}
                  onChange={(e) => handleInputChange('defaultWithholdingTax', parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                  step="0.1"
                />
                <p className="text-sm text-gray-500 mt-1">Common rate: 5%</p>
              </div>
            </div>
          </div>

          {/* Currency */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Currency</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Currency
              </label>
              <select
                value={formData.currency}
                onChange={(e) => handleInputChange('currency', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="NGN">₦ Nigerian Naira (NGN)</option>
                <option value="USD">$ US Dollar (USD)</option>
                <option value="GBP">£ British Pound (GBP)</option>
                <option value="EUR">€ Euro (EUR)</option>
              </select>
            </div>
          </div>

          {/* Account Details */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Wallet className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">Bank Account Details</h2>
              </div>
              <button
                onClick={() => {
                  setShowAddAccount(true);
                  setEditingAccount(null);
                  setAccountForm({
                    accountName: '',
                    bankName: '',
                    accountNumber: '',
                    accountType: 'Current',
                    isDefault: false,
                  });
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Plus className="w-4 h-4" />
                Add Account
              </button>
            </div>

            {showAddAccount && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4">Add New Account</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Account Name *
                    </label>
                    <input
                      type="text"
                      value={accountForm.accountName || ''}
                      onChange={(e) => setAccountForm({ ...accountForm, accountName: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bank Name *
                    </label>
                    <input
                      type="text"
                      value={accountForm.bankName || ''}
                      onChange={(e) => setAccountForm({ ...accountForm, bankName: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Access Bank"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Account Number *
                    </label>
                    <input
                      type="text"
                      value={accountForm.accountNumber || ''}
                      onChange={(e) => setAccountForm({ ...accountForm, accountNumber: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0123456789"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Account Type
                    </label>
                    <select
                      value={accountForm.accountType || 'Current'}
                      onChange={(e) => setAccountForm({ ...accountForm, accountType: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Current">Current</option>
                      <option value="Savings">Savings</option>
                    </select>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="setDefault"
                    checked={accountForm.isDefault || false}
                    onChange={(e) => setAccountForm({ ...accountForm, isDefault: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="setDefault" className="text-sm text-gray-700">
                    Set as default account
                  </label>
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={handleAddAccount}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    <Check className="w-4 h-4" />
                    Save Account
                  </button>
                  <button
                    onClick={() => {
                      setShowAddAccount(false);
                      setAccountForm({
                        accountName: '',
                        bankName: '',
                        accountNumber: '',
                        accountType: 'Current',
                        isDefault: false,
                      });
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {formData.accounts && formData.accounts.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No accounts added yet. Add your first account above.</p>
              ) : (
                formData.accounts?.map((account) => (
                  <div
                    key={account.id}
                    className={`p-4 rounded-lg border ${
                      account.isDefault
                        ? 'bg-blue-50 border-blue-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    {editingAccount === account.id ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Account Name *
                            </label>
                            <input
                              type="text"
                              value={accountForm.accountName || ''}
                              onChange={(e) => setAccountForm({ ...accountForm, accountName: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Bank Name *
                            </label>
                            <input
                              type="text"
                              value={accountForm.bankName || ''}
                              onChange={(e) => setAccountForm({ ...accountForm, bankName: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Account Number *
                            </label>
                            <input
                              type="text"
                              value={accountForm.accountNumber || ''}
                              onChange={(e) => setAccountForm({ ...accountForm, accountNumber: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Account Type
                            </label>
                            <select
                              value={accountForm.accountType || 'Current'}
                              onChange={(e) => setAccountForm({ ...accountForm, accountType: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              <option value="Current">Current</option>
                              <option value="Savings">Savings</option>
                            </select>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id={`default-${account.id}`}
                            checked={accountForm.isDefault || false}
                            onChange={(e) => setAccountForm({ ...accountForm, isDefault: e.target.checked })}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <label htmlFor={`default-${account.id}`} className="text-sm text-gray-700">
                            Set as default account
                          </label>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSaveAccount(account.id)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                          >
                            <Check className="w-4 h-4" />
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setEditingAccount(null);
                              setAccountForm({
                                accountName: '',
                                bankName: '',
                                accountNumber: '',
                                accountType: 'Current',
                                isDefault: false,
                              });
                            }}
                            className="flex items-center gap-2 px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
                          >
                            <X className="w-4 h-4" />
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900">{account.accountName}</h3>
                            {account.isDefault && (
                              <span className="px-2 py-0.5 bg-blue-600 text-white text-xs font-medium rounded-full">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{account.bankName}</p>
                          <p className="text-sm font-mono text-gray-700">{account.accountNumber}</p>
                          {account.accountType && (
                            <p className="text-xs text-gray-500 mt-1">{account.accountType} Account</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {!account.isDefault && (
                            <button
                              onClick={() => setDefaultAccount(account.id)}
                              className="px-3 py-1.5 text-xs bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                            >
                              Set Default
                            </button>
                          )}
                          <button
                            onClick={() => handleEditAccount(account)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          {formData.accounts && formData.accounts.length > 1 && (
                            <button
                              onClick={() => handleDeleteAccount(account.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Payment Integration */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <CreditCard className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Payment Integration</h2>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Enable payment methods to allow clients to pay invoices directly. Integration setup will be available in the full version.
            </p>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div>
                  <h3 className="font-semibold text-gray-900">Paystack</h3>
                  <p className="text-sm text-gray-600">Accept payments via Paystack</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.paymentIntegration.paystack}
                    onChange={(e) => handleNestedChange('paymentIntegration', 'paystack', e.target.checked)}
                    className="sr-only peer"
                    disabled
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div>
                  <h3 className="font-semibold text-gray-900">Flutterwave</h3>
                  <p className="text-sm text-gray-600">Accept payments via Flutterwave</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.paymentIntegration.flutterwave}
                    onChange={(e) => handleNestedChange('paymentIntegration', 'flutterwave', e.target.checked)}
                    className="sr-only peer"
                    disabled
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div>
                  <h3 className="font-semibold text-gray-900">Bank Transfer</h3>
                  <p className="text-sm text-gray-600">Manual bank transfer instructions</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.paymentIntegration.bankTransfer}
                    onChange={(e) => handleNestedChange('paymentIntegration', 'bankTransfer', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                💡 <strong>Note:</strong> Payment gateway integrations require API keys and backend setup. This is a UI prototype showing the integration options.
              </p>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Save className="w-5 h-5" />
              {saved ? 'Saved!' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

