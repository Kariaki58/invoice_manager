/**
 * Database Type Definitions
 * 
 * This file contains TypeScript types generated from your Supabase database schema.
 * You can regenerate these types using the Supabase CLI:
 * 
 * npx supabase gen types typescript --project-id your-project-ref > lib/supabase/database.types.ts
 * 
 * Or use the Supabase Studio to generate types.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      settings: {
        Row: {
          id: string
          user_id: string
          business_name: string
          business_logo: string
          default_vat: number
          default_withholding_tax: number
          currency: string
          payment_integration: Json
          default_account_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          business_name?: string
          business_logo?: string
          default_vat?: number
          default_withholding_tax?: number
          currency?: string
          payment_integration?: Json
          default_account_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          business_name?: string
          business_logo?: string
          default_vat?: number
          default_withholding_tax?: number
          currency?: string
          payment_integration?: Json
          default_account_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      bank_accounts: {
        Row: {
          id: string
          user_id: string
          account_name: string
          bank_name: string
          account_number: string
          account_type: 'Current' | 'Savings'
          is_default: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          account_name: string
          bank_name: string
          account_number: string
          account_type?: 'Current' | 'Savings'
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          account_name?: string
          bank_name?: string
          account_number?: string
          account_type?: 'Current' | 'Savings'
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      invoices: {
        Row: {
          id: string
          user_id: string
          invoice_number: string
          client_name: string
          client_email: string
          client_phone: string | null
          items: Json
          subtotal: number
          vat: number
          withholding_tax: number
          total: number
          due_date: string
          status: 'paid' | 'unpaid' | 'overdue'
          account_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          invoice_number: string
          client_name: string
          client_email: string
          client_phone?: string | null
          items?: Json
          subtotal?: number
          vat?: number
          withholding_tax?: number
          total?: number
          due_date: string
          status?: 'paid' | 'unpaid' | 'overdue'
          account_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          invoice_number?: string
          client_name?: string
          client_email?: string
          client_phone?: string | null
          items?: Json
          subtotal?: number
          vat?: number
          withholding_tax?: number
          total?: number
          due_date?: string
          status?: 'paid' | 'unpaid' | 'overdue'
          account_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      invoice_stats: {
        Row: {
          user_id: string
          total_invoices: number
          paid_count: number
          unpaid_count: number
          overdue_count: number
          total_paid: number | null
          total_unpaid: number | null
          total_overdue: number | null
        }
      }
    }
    Functions: {
      generate_invoice_number: {
        Args: {
          user_uuid: string
        }
        Returns: string
      }
    }
  }
}

