'use client';

import React, { useState, useRef } from 'react';
import { useInvoices, AccountDetails, Settings as SettingsType } from '../context/InvoiceContext';
import { useAuth } from '../context/AuthContext';
import { Upload, Save, CreditCard, Building2, Plus, Trash2, Edit2, Check, X, Wallet, Monitor, User, Loader2, LogOut } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';
import { uploadImage } from '@/lib/cloudinary';

export default function Settings() {
  const { settings, updateSettings, addAccount, updateAccount, deleteAccount, setDefaultAccount, loading } = useInvoices();
  const { profile, updateProfile, refreshProfile, signOut } = useAuth();
  const [formData, setFormData] = useState<SettingsType | null>(settings);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [saved, setSaved] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [editingAccount, setEditingAccount] = useState<string | null>(null);
  const [accountForm, setAccountForm] = useState<Partial<AccountDetails>>({
    accountName: '',
    bankName: '',
    accountNumber: '',
    accountType: 'Current',
    isDefault: false,
  });

  // Update formData when settings load
  React.useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  if (loading || !settings || !formData) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8 transition-colors pb-32 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground font-medium">Loading settings...</p>
        </div>
      </div>
    );
  }

  const handleInputChange = <K extends keyof SettingsType>(field: K, value: SettingsType[K]) => {
    setFormData(prev => {
      if (!prev) return null;
      return {
        ...prev,
        [field]: value,
      };
    });
  };

  const handleNestedChange = <K extends keyof SettingsType['paymentIntegration']>(
    parent: 'paymentIntegration',
    field: K,
    value: SettingsType['paymentIntegration'][K]
  ) => {
    setFormData(prev => {
      if (!prev) return null;
      return {
        ...prev,
        [parent]: {
          ...prev[parent],
          [field]: value,
        },
      };
    });
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      alert('Invalid file type. Please upload an image (JPEG, PNG, WebP, or GIF)');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert('File size too large. Maximum size is 5MB');
      return;
    }

    try {
      setUploadingLogo(true);
      const result = await uploadImage(file, 'logo');
      handleInputChange('businessLogo', result.url);
    } catch (error: any) {
      console.error('Error uploading logo:', error);
      alert(error.message || 'Failed to upload logo');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      alert('Invalid file type. Please upload an image (JPEG, PNG, WebP, or GIF)');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert('File size too large. Maximum size is 5MB');
      return;
    }

    try {
      setUploadingAvatar(true);
      const result = await uploadImage(file, 'avatar');
      await updateProfile({ avatar_url: result.url });
      await refreshProfile();
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      alert(error.message || 'Failed to upload profile picture');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSave = () => {
    updateSettings(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleAddAccount = async () => {
    if (!accountForm.accountName || !accountForm.bankName || !accountForm.accountNumber) {
      alert('Please fill in all required fields');
      return;
    }
    try {
      await addAccount({
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
      // formData will be updated automatically when settings refresh
    } catch (error) {
      console.error('Error adding account:', error);
    }
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
      const updatedAccounts = (settings?.accounts || []).map(acc =>
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
    <div className="min-h-screen bg-background p-4 md:p-8 transition-colors pb-24">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 md:mb-12">
          <h1 className="text-xl md:text-4xl font-black text-foreground mb-1 md:mb-3 tracking-tighter">Settings</h1>
          <p className="text-muted-foreground font-medium text-sm md:text-base">Manage your business profile and global preferences</p>
        </div>

        <div className="space-y-4 md:space-y-12">
          {/* Profile Picture Section */}
          <div className="bg-card rounded-2xl md:rounded-[2.5rem] p-4 md:p-12 shadow-2xl border border-border relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors" />
            <div className="flex items-center gap-2 md:gap-4 mb-4 md:mb-8">
              <div className="p-2 md:p-3 bg-primary/10 rounded-xl md:rounded-2xl">
                <User className="w-4 h-4 md:w-6 md:h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-lg md:text-2xl font-black text-foreground tracking-tight">Profile Picture</h2>
                <p className="text-muted-foreground text-[10px] md:text-sm font-medium">Update your profile photo</p>
              </div>
            </div>

            <div className="flex items-center gap-4 md:gap-8">
              <div className="relative">
                {profile?.avatar_url ? (
                  <div className="w-20 h-20 md:w-32 md:h-32 rounded-full border-4 border-primary/20 overflow-hidden bg-muted/5">
                    <img
                      src={profile.avatar_url}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-20 h-20 md:w-32 md:h-32 rounded-full border-4 border-border flex items-center justify-center bg-muted/10">
                    <User className="w-10 h-10 md:w-16 md:h-16 text-muted-foreground/30" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                  id="avatar-upload"
                />
                <label
                  htmlFor="avatar-upload"
                  className="inline-flex items-center gap-1.5 md:gap-2 px-4 py-2 md:px-6 md:py-3 bg-primary text-white rounded-lg md:rounded-xl hover:bg-primary/90 transition-all font-black text-[10px] md:text-xs uppercase tracking-widest shadow-lg shadow-primary/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploadingAvatar ? (
                    <>
                      <Loader2 className="w-3 h-3 md:w-4 md:h-4 animate-spin" />
                      <span className="hidden sm:inline">Uploading...</span>
                      <span className="sm:hidden">Upload...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-3 h-3 md:w-4 md:h-4" />
                      <span className="hidden sm:inline">{profile?.avatar_url ? 'Change Photo' : 'Upload Photo'}</span>
                      <span className="sm:hidden">{profile?.avatar_url ? 'Change' : 'Upload'}</span>
                    </>
                  )}
                </label>
                <p className="text-[9px] md:text-[10px] text-muted-foreground mt-2 md:mt-3 font-medium uppercase tracking-wider opacity-60">
                  Recommended: Square image, max 5MB (JPEG, PNG, WebP)
                </p>
              </div>
            </div>
          </div>

          {/* Appearance Section */}
          <div className="bg-card rounded-2xl md:rounded-[2.5rem] p-4 md:p-12 shadow-2xl border border-border relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors" />
            <div className="flex items-center justify-between gap-3 md:gap-4">
              <div className="flex items-center gap-2 md:gap-4">
                <div className="p-2 md:p-3 bg-primary/10 rounded-xl md:rounded-2xl">
                  <Monitor className="w-4 h-4 md:w-6 md:h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-base md:text-2xl font-black text-foreground tracking-tight">Appearance</h2>
                  <p className="text-muted-foreground text-[10px] md:text-sm font-medium">Customize how the app looks for you</p>
                </div>
              </div>
              <ThemeToggle />
            </div>
          </div>
          {/* Business Profile */}
          <div className="bg-card rounded-2xl md:rounded-[2.5rem] p-4 md:p-12 shadow-2xl border border-border relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors" />
            <div className="flex items-center gap-2 md:gap-4 mb-4 md:mb-8">
              <div className="p-2 md:p-3 bg-primary/10 rounded-xl md:rounded-2xl">
                <Building2 className="w-4 h-4 md:w-6 md:h-6 text-primary" />
              </div>
              <h2 className="text-lg md:text-2xl font-black text-foreground tracking-tight">Business Profile</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-10">
              <div className="space-y-4 md:space-y-6">
                <div>
                  <label className="text-[9px] md:text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2 md:mb-3 block">
                    Business Entity Name
                  </label>
                  <input
                    type="text"
                    value={formData.businessName}
                    onChange={(e) => handleInputChange('businessName', e.target.value)}
                    className="w-full px-3 py-2.5 md:px-5 md:py-4 bg-muted/5 border border-border rounded-xl md:rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-bold text-sm md:text-base text-foreground placeholder:opacity-50"
                    placeholder="Enter business name"
                  />
                </div>
              </div>

              <div className="space-y-4 md:space-y-6">
                <label className="text-[9px] md:text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2 md:mb-3 block">
                  Brand Identity (Logo)
                </label>
                <div className="flex items-center gap-3 md:gap-6">
                  <div className="relative group/logo">
                    {formData.businessLogo ? (
                      <div className="w-16 h-16 md:w-24 md:h-24 rounded-xl md:rounded-2xl border border-border overflow-hidden bg-white/5 p-1.5 md:p-2">
                        <img
                          src={formData.businessLogo}
                          alt="Business Logo"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 md:w-24 md:h-24 rounded-xl md:rounded-2xl border-2 border-dashed border-border flex items-center justify-center bg-muted/5 group-hover/logo:border-primary/50 transition-colors">
                        <Building2 className="w-5 h-5 md:w-8 md:h-8 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                      id="logo-upload"
                    />
                    <label
                      htmlFor="logo-upload"
                      className="inline-flex items-center gap-1.5 md:gap-2 px-3 py-2 md:px-6 md:py-3 bg-primary text-white rounded-lg md:rounded-xl hover:bg-primary/90 transition-all font-black text-[10px] md:text-xs uppercase tracking-widest shadow-lg shadow-primary/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {uploadingLogo ? (
                        <>
                          <Loader2 className="w-3 h-3 md:w-4 md:h-4 animate-spin" />
                          <span className="hidden sm:inline">Uploading...</span>
                          <span className="sm:hidden">Upload...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-3 h-3 md:w-4 md:h-4" />
                          <span className="hidden sm:inline">{formData.businessLogo ? 'Change Brand Logo' : 'Set Brand Logo'}</span>
                          <span className="sm:hidden">{formData.businessLogo ? 'Change' : 'Set Logo'}</span>
                        </>
                      )}
                    </label>
                    <p className="text-[9px] md:text-[10px] text-muted-foreground mt-2 md:mt-3 font-medium uppercase tracking-wider opacity-60">
                      Recommended: High-res square logo, max 5MB (JPEG, PNG, WebP)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-12">
            {/* Tax Settings */}
            <div className="bg-card rounded-2xl md:rounded-[2.5rem] p-4 md:p-10 shadow-2xl border border-border">
              <h2 className="text-base md:text-xl font-black text-foreground mb-4 md:mb-8 tracking-tight flex items-center gap-2 md:gap-3">
                <Check className="w-4 h-4 md:w-5 md:h-5 text-primary" /> Tax Engine
              </h2>
              <div className="space-y-4 md:space-y-6">
                <div>
                  <label className="text-[9px] md:text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1.5 md:mb-2 block">
                    Default VAT (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={formData.defaultVAT}
                      onChange={(e) => handleInputChange('defaultVAT', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2.5 md:px-5 md:py-4 bg-muted/5 border border-border rounded-lg md:rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-black text-sm md:text-lg text-foreground"
                      min="0"
                      step="0.1"
                    />
                    <span className="absolute right-3 md:right-5 top-1/2 -translate-y-1/2 text-muted-foreground font-black opacity-50 text-sm md:text-base">%</span>
                  </div>
                  <p className="text-[9px] md:text-[10px] text-muted-foreground mt-1.5 md:mt-2 font-bold uppercase tracking-wider opacity-60">National Standard: 7.5%</p>
                </div>
                <div>
                  <label className="text-[9px] md:text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1.5 md:mb-2 block">
                    Default Withholding Tax (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={formData.defaultWithholdingTax}
                      onChange={(e) => handleInputChange('defaultWithholdingTax', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2.5 md:px-5 md:py-4 bg-muted/5 border border-border rounded-lg md:rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-black text-sm md:text-lg text-foreground"
                      min="0"
                      step="0.1"
                    />
                    <span className="absolute right-3 md:right-5 top-1/2 -translate-y-1/2 text-muted-foreground font-black opacity-50 text-sm md:text-base">%</span>
                  </div>
                  <p className="text-[9px] md:text-[10px] text-muted-foreground mt-1.5 md:mt-2 font-bold uppercase tracking-wider opacity-60">Standard Rate: 5%</p>
                </div>
              </div>
            </div>

            {/* Currency */}
            <div className="bg-card rounded-2xl md:rounded-[2.5rem] p-4 md:p-10 shadow-2xl border border-border">
              <h2 className="text-base md:text-xl font-black text-foreground mb-4 md:mb-8 tracking-tight flex items-center gap-2 md:gap-3">
                <Wallet className="w-4 h-4 md:w-5 md:h-5 text-primary" /> Global Currency
              </h2>
              <div>
                <label className="text-[9px] md:text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2 md:mb-3 block">
                  Reporting & Invoice Currency
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) => handleInputChange('currency', e.target.value)}
                  className="w-full px-3 py-2.5 md:px-5 md:py-4 bg-muted/5 border border-border rounded-lg md:rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-black text-sm md:text-base text-foreground appearance-none ring-offset-background"
                >
                  <option value="NGN">₦ Naira (NGN)</option>
                  <option value="USD">$ US Dollar (USD)</option>
                  <option value="GBP">£ British Pound (GBP)</option>
                  <option value="EUR">€ Euro (EUR)</option>
                </select>
                <p className="text-[9px] md:text-[10px] text-muted-foreground mt-3 md:mt-4 font-bold uppercase tracking-wider leading-relaxed opacity-60">
                  This will be the base currency for all calculations and summaries.
                </p>
              </div>
            </div>
          </div>

          {/* Account Details */}
          <div className="bg-card rounded-2xl md:rounded-[2.5rem] p-4 md:p-12 shadow-2xl border border-border">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-6 mb-6 md:mb-10">
              <div className="flex items-center gap-2 md:gap-4">
                <div className="p-2 md:p-3 bg-primary/10 rounded-xl md:rounded-2xl">
                  <Wallet className="w-4 h-4 md:w-6 md:h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg md:text-2xl font-black text-foreground tracking-tight">Bank Accounts</h2>
                  <p className="text-muted-foreground text-[10px] md:text-sm font-medium">Add payment destinations for bank transfers</p>
                </div>
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
                className="flex items-center justify-center gap-1.5 md:gap-2 px-4 py-2 md:px-8 md:py-4 bg-primary text-white rounded-xl md:rounded-2xl font-black hover:bg-primary/90 transition-all shadow-xl shadow-primary/25 transform hover:scale-105 active:scale-95 text-[10px] md:text-sm uppercase tracking-widest"
              >
                <Plus className="w-3.5 h-3.5 md:w-5 md:h-5" />
                <span className="hidden sm:inline">New Account</span>
                <span className="sm:hidden">Add</span>
              </button>
            </div>

            {showAddAccount && (
              <div className="mb-6 md:mb-10 p-4 md:p-8 bg-muted/5 rounded-2xl md:rounded-3xl border border-dashed border-primary/30 animate-in fade-in slide-in-from-top-4 duration-500">
                <h3 className="text-sm md:text-lg font-black text-foreground mb-4 md:mb-6 flex items-center gap-2 uppercase tracking-tighter">
                  Add Source Account
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div>
                    <label className="text-[9px] md:text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1.5 md:mb-2 block">Account Name *</label>
                    <input
                      type="text"
                      value={accountForm.accountName || ''}
                      onChange={(e) => setAccountForm({ ...accountForm, accountName: e.target.value })}
                      className="w-full px-3 py-2.5 md:px-5 md:py-3.5 bg-background border border-border rounded-lg md:rounded-xl focus:ring-2 focus:ring-primary font-bold text-sm md:text-base"
                      placeholder="e.g. John Doe Enterprises"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] md:text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1.5 md:mb-2 block">Bank Provider *</label>
                    <input
                      type="text"
                      value={accountForm.bankName || ''}
                      onChange={(e) => setAccountForm({ ...accountForm, bankName: e.target.value })}
                      className="w-full px-3 py-2.5 md:px-5 md:py-3.5 bg-background border border-border rounded-lg md:rounded-xl focus:ring-2 focus:ring-primary font-bold text-sm md:text-base"
                      placeholder="e.g. GTBank"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] md:text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1.5 md:mb-2 block">Account Number *</label>
                    <input
                      type="text"
                      value={accountForm.accountNumber || ''}
                      onChange={(e) => setAccountForm({ ...accountForm, accountNumber: e.target.value })}
                      className="w-full px-3 py-2.5 md:px-5 md:py-3.5 bg-background border border-border rounded-lg md:rounded-xl focus:ring-2 focus:ring-primary font-black font-mono tracking-tighter text-sm md:text-lg"
                      placeholder="0123456789"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] md:text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1.5 md:mb-2 block">Account Type</label>
                    <select
                      value={accountForm.accountType || 'Current'}
                      onChange={(e) => setAccountForm({ ...accountForm, accountType: e.target.value })}
                      className="w-full px-3 py-2.5 md:px-5 md:py-3.5 bg-background border border-border rounded-lg md:rounded-xl focus:ring-2 focus:ring-primary font-bold text-sm md:text-base"
                    >
                      <option value="Current">Current</option>
                      <option value="Savings">Savings</option>
                    </select>
                  </div>
                </div>
                <div className="mt-4 md:mt-6 flex items-center gap-2 md:gap-3">
                  <div 
                    className={`group flex items-center gap-2 md:gap-3 cursor-pointer select-none px-3 py-1.5 md:px-4 md:py-2 border rounded-full transition-all ${
                      accountForm.isDefault ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-muted/5 border-border text-muted-foreground hover:bg-muted/10'
                    }`}
                    onClick={() => setAccountForm({ ...accountForm, isDefault: !accountForm.isDefault })}
                  >
                    <div className={`w-4 h-4 md:w-5 md:h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      accountForm.isDefault ? 'bg-primary border-primary scale-110' : 'border-muted-foreground/30'
                    }`}>
                      {accountForm.isDefault && <Check className="w-2.5 h-2.5 md:w-3 md:h-3 text-white" />}
                    </div>
                    <span className="text-[10px] md:text-xs font-black uppercase tracking-widest">Set as Primary Settlement Account</span>
                  </div>
                </div>
                <div className="mt-6 md:mt-8 flex gap-2 md:gap-3">
                  <button
                    onClick={handleAddAccount}
                    className="flex items-center gap-1.5 md:gap-2 px-4 py-2 md:px-8 md:py-3 bg-primary text-white rounded-lg md:rounded-xl font-black text-[10px] md:text-xs uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                  >
                    <Save className="w-3 h-3 md:w-4 md:h-4" /> <span className="hidden sm:inline">Save Account</span><span className="sm:hidden">Save</span>
                  </button>
                  <button
                    onClick={() => setShowAddAccount(false)}
                    className="flex items-center gap-1.5 md:gap-2 px-4 py-2 md:px-8 md:py-3 bg-muted/10 text-muted-foreground rounded-lg md:rounded-xl font-black text-[10px] md:text-xs uppercase tracking-widest hover:bg-muted/20 transition-all"
                  >
                    <X className="w-3 h-3 md:w-4 md:h-4" /> Discard
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4">
              {formData.accounts && formData.accounts.length === 0 ? (
                <div className="text-center py-8 md:py-16 px-4 bg-muted/5 rounded-2xl md:rounded-4xl border border-dashed border-border group hover:border-primary/30 transition-colors">
                  <Wallet className="w-8 h-8 md:w-12 md:h-12 text-muted-foreground/20 mx-auto mb-3 md:mb-4 group-hover:scale-110 transition-transform" />
                  <p className="text-muted-foreground font-bold text-sm md:text-lg mb-1">No payment channels active</p>
                  <p className="text-muted-foreground/60 text-xs md:text-sm">Add bank accounts to receive payments via bank transfer.</p>
                </div>
              ) : (
                formData.accounts?.map((account) => (
                  <div
                    key={account.id}
                    className={`relative p-4 md:p-8 rounded-2xl md:rounded-4xl border transition-all duration-300 group/card ${
                      account.isDefault
                        ? 'bg-primary/3 border-primary/30 shadow-[0_0_30px_rgba(139,92,246,0.05)]'
                        : 'bg-muted/5 border-border hover:border-primary/20 hover:bg-muted/10'
                    }`}
                  >
                    {editingAccount === account.id ? (
                      <div className="space-y-4 md:space-y-6 animate-in fade-in duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                           <div>
                            <label className="text-[9px] md:text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1.5 md:mb-2 block">Account Name</label>
                            <input
                              type="text"
                              value={accountForm.accountName || ''}
                              onChange={(e) => setAccountForm({ ...accountForm, accountName: e.target.value })}
                              className="w-full px-3 py-2 md:px-5 md:py-3 bg-background border border-border rounded-lg md:rounded-xl font-bold text-sm md:text-base"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] md:text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1.5 md:mb-2 block">Bank Name</label>
                            <input
                              type="text"
                              value={accountForm.bankName || ''}
                              onChange={(e) => setAccountForm({ ...accountForm, bankName: e.target.value })}
                              className="w-full px-3 py-2 md:px-5 md:py-3 bg-background border border-border rounded-lg md:rounded-xl font-bold text-sm md:text-base"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] md:text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1.5 md:mb-2 block">Account No.</label>
                            <input
                              type="text"
                              value={accountForm.accountNumber || ''}
                              onChange={(e) => setAccountForm({ ...accountForm, accountNumber: e.target.value })}
                              className="w-full px-3 py-2 md:px-5 md:py-3 bg-background border border-border rounded-lg md:rounded-xl font-black font-mono tracking-tighter text-sm md:text-lg"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] md:text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1.5 md:mb-2 block">Type</label>
                            <select
                              value={accountForm.accountType || 'Current'}
                              onChange={(e) => setAccountForm({ ...accountForm, accountType: e.target.value })}
                              className="w-full px-3 py-2 md:px-5 md:py-3 bg-background border border-border rounded-lg md:rounded-xl font-bold text-sm md:text-base"
                            >
                              <option value="Current">Current</option>
                              <option value="Savings">Savings</option>
                            </select>
                          </div>
                        </div>
                        <div className="flex gap-2 pt-3 md:pt-4">
                          <button
                            onClick={() => handleSaveAccount(account.id)}
                            className="flex items-center gap-1.5 md:gap-2 px-4 py-2 md:px-6 md:py-2.5 bg-green-500 text-white rounded-lg md:rounded-xl font-black text-[9px] md:text-[10px] uppercase tracking-widest hover:bg-green-600 transition-all shadow-lg shadow-green-500/20"
                          >
                            <Check className="w-3 h-3 md:w-3.5 md:h-3.5" /> <span className="hidden sm:inline">Save Changes</span><span className="sm:hidden">Save</span>
                          </button>
                          <button
                            onClick={() => setEditingAccount(null)}
                            className="flex items-center gap-1.5 md:gap-2 px-4 py-2 md:px-6 md:py-2.5 bg-muted/10 text-muted-foreground rounded-lg md:rounded-xl font-black text-[9px] md:text-[10px] uppercase tracking-widest hover:bg-muted/20 transition-all"
                          >
                            <X className="w-3 h-3 md:w-3.5 md:h-3.5" /> Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
                        <div className="flex items-start gap-2 md:gap-4">
                          <div className={`p-2.5 md:p-4 rounded-xl md:rounded-2xl transition-all ${account.isDefault ? 'bg-primary text-white' : 'bg-muted/10 text-muted-foreground'}`}>
                            <CreditCard className="w-4 h-4 md:w-6 md:h-6" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 md:gap-3 mb-0.5 md:mb-1">
                              <h3 className="text-sm md:text-xl font-black text-foreground tracking-tight">{account.accountName}</h3>
                              {account.isDefault && (
                                <span className="px-2 py-0.5 md:px-3 md:py-1 bg-primary text-white text-[8px] md:text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-primary/20">
                                  Default Account
                                </span>
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-x-2 md:gap-x-4 gap-y-1 text-xs md:text-sm font-bold opacity-70">
                              <p className="text-primary">{account.bankName}</p>
                              <span className="w-1 h-1 rounded-full bg-border" />
                              <p className="text-foreground border-b border-dashed border-foreground/30 font-mono tracking-tighter text-[10px] md:text-sm">{account.accountNumber}</p>
                              <span className="w-1 h-1 rounded-full bg-border" />
                              <p className="text-muted-foreground uppercase text-[9px] md:text-[10px] tracking-widest">{account.accountType}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 md:gap-2 opacity-100 md:opacity-0 md:group-hover/card:opacity-100 transition-all transform md:translate-x-4 md:group-hover/card:translate-x-0">
                          {!account.isDefault && (
                            <button
                              onClick={() => setDefaultAccount(account.id)}
                              className="px-3 py-1.5 md:px-4 md:py-2 text-[9px] md:text-[10px] bg-primary/10 text-primary rounded-lg md:rounded-xl hover:bg-primary/20 transition-all font-black uppercase tracking-widest"
                            >
                              <span className="hidden sm:inline">Make Primary</span>
                              <span className="sm:hidden">Primary</span>
                            </button>
                          )}
                          <button
                            onClick={() => handleEditAccount(account)}
                            className="p-2 md:p-3 text-muted-foreground hover:bg-primary/10 hover:text-primary rounded-lg md:rounded-xl transition-all"
                            title="Edit Account"
                          >
                            <Edit2 className="w-4 h-4 md:w-4.5 md:h-4.5" />
                          </button>
                          {formData.accounts && (formData.accounts.length > 1 || !account.isDefault) ? (
                            <button
                              onClick={() => handleDeleteAccount(account.id)}
                              className="p-2 md:p-3 text-muted-foreground hover:bg-red-500/10 hover:text-red-500 rounded-lg md:rounded-xl transition-all"
                              title="Delete Account"
                            >
                              <Trash2 className="w-4 h-4 md:w-4.5 md:h-4.5" />
                            </button>
                          ) : null}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Payment Integration */}
          <div className="bg-card rounded-2xl md:rounded-[2.5rem] p-4 md:p-12 shadow-2xl border border-border">
            <div className="flex items-center gap-2 md:gap-4 mb-4 md:mb-8">
              <div className="p-2 md:p-3 bg-primary/10 rounded-xl md:rounded-2xl">
                <CreditCard className="w-4 h-4 md:w-6 md:h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-lg md:text-2xl font-black text-foreground tracking-tight">Payment Integration</h2>
                <p className="text-muted-foreground text-[10px] md:text-sm font-medium">Connect external payment gateways</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-3 md:gap-4">
              {[
                { id: 'paystack', name: 'Paystack', desc: 'Secure local & international payments', disabled: true },
                { id: 'flutterwave', name: 'Flutterwave', desc: 'Global payment infrastructure', disabled: true },
                { id: 'bankTransfer', name: 'Bank Transfer', desc: 'Direct manual bank settlement', disabled: false }
              ].map((gateway) => (
                <div key={gateway.id} className="flex items-center justify-between p-4 md:p-6 bg-muted/5 rounded-2xl md:rounded-3xl border border-border hover:border-primary/30 transition-all group/integration">
                  <div className="flex items-center gap-2 md:gap-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-background border border-border flex items-center justify-center font-black text-base md:text-xl text-primary/30 group-hover/integration:text-primary transition-colors">
                      {gateway.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-black text-sm md:text-base text-foreground tracking-tight">{gateway.name}</h3>
                      <p className="text-[10px] md:text-xs text-muted-foreground font-medium">{gateway.desc}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 md:gap-4">
                    {gateway.disabled && (
                      <span className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] px-1.5 py-0.5 md:px-2 md:py-1 bg-muted/20 text-muted-foreground/60 rounded-lg">Soon</span>
                    )}
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.paymentIntegration[gateway.id as keyof typeof formData.paymentIntegration]}
                        onChange={(e) => handleNestedChange('paymentIntegration', gateway.id as keyof SettingsType['paymentIntegration'], e.target.checked)}
                        className="sr-only peer"
                        disabled={gateway.disabled}
                      />
                      <div className="w-10 h-5.5 md:w-12 md:h-6.5 bg-muted/30 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] md:after:top-[3px] after:left-[2px] md:after:left-[3px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 md:after:h-5 md:after:w-5 after:transition-all peer-checked:bg-primary shadow-inner"></div>
                    </label>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 md:mt-8 p-4 md:p-6 bg-primary/5 rounded-2xl md:rounded-4xl border border-primary/20 flex gap-2 md:gap-4 items-start">
              <div className="p-1.5 md:p-2 bg-primary/20 rounded-lg shrink-0">
                <Plus className="w-3 h-3 md:w-4 md:h-4 text-primary" />
              </div>
              <p className="text-[10px] md:text-xs font-bold text-primary/80 leading-relaxed uppercase tracking-wider">
                <strong>Deployment Note:</strong> Enterprise payment gateway integrations require active API keys and secure backend synchronization. This interface demonstrates the available settlement workflows.
              </p>
            </div>
          </div>

          {/* Final Global Save Action & Logout */}
          <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 md:gap-6 pt-6 md:pt-12">
            <button
              onClick={signOut}
              className="group relative flex items-center justify-center gap-2 md:gap-3 px-6 py-3 md:px-8 md:py-4 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl md:rounded-2xl font-black text-xs md:text-sm uppercase tracking-[0.2em] hover:bg-red-500 hover:text-white transition-all shadow-lg hover:shadow-red-500/20 transform hover:-translate-y-1 active:scale-95 overflow-hidden w-full md:w-auto"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              <div className="relative flex items-center gap-2 md:gap-3">
                <LogOut className="w-4 h-4 md:w-5 md:h-5 group-hover:rotate-12 transition-transform" />
                <span className="hidden sm:inline">Sign Out</span>
                <span className="sm:hidden">Logout</span>
              </div>
            </button>
            <button
              onClick={handleSave}
              className="group relative flex items-center justify-center gap-2 md:gap-3 px-6 py-3 md:px-12 md:py-5 bg-green-500 text-white rounded-xl md:rounded-2xl font-black text-xs md:text-sm uppercase tracking-[0.2em] hover:bg-green-600 transition-all shadow-[0_20px_40px_rgba(34,197,94,0.3)] hover:shadow-[0_25px_50px_rgba(34,197,94,0.4)] transform hover:-translate-y-1 active:scale-95 overflow-hidden w-full md:w-auto"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              <div className="relative flex items-center gap-2 md:gap-3">
                {saved ? <Check className="w-4 h-4 md:w-5 md:h-5 animate-bounce" /> : <Save className="w-4 h-4 md:w-5 md:h-5 group-hover:rotate-12 transition-transform" />}
                <span className="hidden sm:inline">{saved ? 'Settings Synced!' : 'Sync All Settings'}</span>
                <span className="sm:hidden">{saved ? 'Synced!' : 'Sync Settings'}</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

