-- ============================================
-- SUPABASE DATABASE SCHEMA FOR INVOICEME
-- ============================================
-- This file contains the complete database schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES TABLE (extends auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- RLS Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- RLS Policy: Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================
-- SETTINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name TEXT DEFAULT 'My Business',
  business_logo TEXT DEFAULT '',
  default_vat DECIMAL(5,2) DEFAULT 7.5,
  default_withholding_tax DECIMAL(5,2) DEFAULT 5.0,
  currency TEXT DEFAULT 'NGN',
  payment_integration JSONB DEFAULT '{"paystack": false, "flutterwave": false, "bankTransfer": true}'::jsonb,
  default_account_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS on settings
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only access their own settings
CREATE POLICY "Users can manage own settings"
  ON settings FOR ALL
  USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS settings_user_id_idx ON settings(user_id);

-- ============================================
-- BANK_ACCOUNTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS bank_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_name TEXT NOT NULL,
  bank_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  account_type TEXT DEFAULT 'Current' CHECK (account_type IN ('Current', 'Savings')),
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on bank_accounts
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only access their own bank accounts
CREATE POLICY "Users can manage own bank accounts"
  ON bank_accounts FOR ALL
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS bank_accounts_user_id_idx ON bank_accounts(user_id);
CREATE INDEX IF NOT EXISTS bank_accounts_default_idx ON bank_accounts(user_id, is_default) WHERE is_default = TRUE;

-- ============================================
-- INVOICES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invoice_number TEXT NOT NULL,
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_phone TEXT,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
  vat DECIMAL(12,2) NOT NULL DEFAULT 0,
  withholding_tax DECIMAL(12,2) NOT NULL DEFAULT 0,
  total DECIMAL(12,2) NOT NULL DEFAULT 0,
  due_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'unpaid' CHECK (status IN ('paid', 'unpaid', 'overdue')),
  account_id UUID REFERENCES bank_accounts(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on invoices
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only access their own invoices
CREATE POLICY "Users can manage own invoices"
  ON invoices FOR ALL
  USING (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS invoices_user_id_idx ON invoices(user_id);
CREATE INDEX IF NOT EXISTS invoices_status_idx ON invoices(user_id, status);
CREATE INDEX IF NOT EXISTS invoices_due_date_idx ON invoices(user_id, due_date);
CREATE INDEX IF NOT EXISTS invoices_invoice_number_idx ON invoices(user_id, invoice_number);
CREATE INDEX IF NOT EXISTS invoices_created_at_idx ON invoices(user_id, created_at DESC);

-- ============================================
-- FUNCTIONS AND TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for settings
CREATE TRIGGER update_settings_updated_at
  BEFORE UPDATE ON settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for bank_accounts
CREATE TRIGGER update_bank_accounts_updated_at
  BEFORE UPDATE ON bank_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for invoices
CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create settings when user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  
  INSERT INTO public.settings (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile and settings on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Function to ensure only one default account per user
CREATE OR REPLACE FUNCTION ensure_single_default_account()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_default = TRUE THEN
    UPDATE bank_accounts
    SET is_default = FALSE
    WHERE user_id = NEW.user_id
      AND id != NEW.id
      AND is_default = TRUE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to ensure single default account
CREATE TRIGGER ensure_single_default_account_trigger
  BEFORE INSERT OR UPDATE ON bank_accounts
  FOR EACH ROW
  EXECUTE FUNCTION ensure_single_default_account();

-- Function to generate invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number(user_uuid UUID)
RETURNS TEXT AS $$
DECLARE
  year_part TEXT;
  count_part INTEGER;
  invoice_num TEXT;
BEGIN
  year_part := TO_CHAR(NOW(), 'YYYY');
  
  SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM '(\d+)$') AS INTEGER)), 0) + 1
  INTO count_part
  FROM invoices
  WHERE user_id = user_uuid
    AND invoice_number LIKE 'INV-' || year_part || '-%';
  
  invoice_num := 'INV-' || year_part || '-' || LPAD(count_part::TEXT, 3, '0');
  
  RETURN invoice_num;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- HELPER VIEWS (Optional - for analytics)
-- ============================================

-- View for invoice statistics per user
CREATE OR REPLACE VIEW invoice_stats AS
SELECT
  user_id,
  COUNT(*) as total_invoices,
  COUNT(*) FILTER (WHERE status = 'paid') as paid_count,
  COUNT(*) FILTER (WHERE status = 'unpaid') as unpaid_count,
  COUNT(*) FILTER (WHERE status = 'overdue') as overdue_count,
  SUM(total) FILTER (WHERE status = 'paid') as total_paid,
  SUM(total) FILTER (WHERE status = 'unpaid') as total_unpaid,
  SUM(total) FILTER (WHERE status = 'overdue') as total_overdue
FROM invoices
GROUP BY user_id;

-- Enable RLS on view
ALTER VIEW invoice_stats SET (security_invoker = true);

