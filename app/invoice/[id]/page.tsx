'use client';

import { useRouter, useParams } from 'next/navigation';
import { useInvoices } from '../../context/InvoiceContext';
import { format } from 'date-fns';
import { Send, MessageSquare, Mail, Copy, Check, ArrowLeft, Printer, Download } from 'lucide-react';
import { useState } from 'react';

export default function InvoicePreview() {
  const router = useRouter();
  const params = useParams();
  const { getInvoice, settings, getAccount } = useInvoices();
  const invoice = getInvoice(params.id as string);
  const [copied, setCopied] = useState(false);
  
  const accountDetails = invoice?.accountId ? getAccount(invoice.accountId) : null;

  if (!invoice) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-muted-foreground mb-6 font-bold">Invoice not found</p>
          <button
            onClick={() => router.push('/invoices')}
            className="px-8 py-4 bg-primary text-white rounded-2xl font-black hover:bg-primary/90 transition-all shadow-xl shadow-primary/25"
          >
            Back to Invoices
          </button>
        </div>
      </div>
    );
  }

  const invoiceLink = typeof window !== 'undefined' 
    ? `${window.location.origin}/invoice/${invoice.id}`
    : '';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(invoiceLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      `Hello ${invoice.clientName},\n\nPlease find your invoice ${invoice.invoiceNumber} for ₦${(invoice.total || 0).toLocaleString('en-NG')}.\n\nView invoice: ${invoiceLink}`
    );
    window.open(`https://wa.me/${invoice.clientPhone?.replace(/\D/g, '')}?text=${message}`, '_blank');
  };

  const handleSMS = () => {
    const message = encodeURIComponent(
      `Invoice ${invoice.invoiceNumber}: ₦${(invoice.total || 0).toLocaleString('en-NG')}. Due: ${format(new Date(invoice.dueDate), 'MMM dd, yyyy')}. View: ${invoiceLink}`
    );
    window.open(`sms:${invoice.clientPhone}?body=${message}`, '_blank');
  };

  const handleEmail = () => {
    const subject = encodeURIComponent(`Invoice ${invoice.invoiceNumber} from ${settings.businessName || 'Your Business'}`);
    const body = encodeURIComponent(
      `Dear ${invoice.clientName},\n\nPlease find attached your invoice ${invoice.invoiceNumber}.\n\nTotal Amount: ₦${(invoice.total || 0).toLocaleString('en-NG')}\nDue Date: ${format(new Date(invoice.dueDate), 'MMMM dd, yyyy')}\n\nView invoice: ${invoiceLink}\n\nThank you for your business!`
    );
    window.open(`mailto:${invoice.clientEmail}?subject=${subject}&body=${body}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 transition-colors">
      <div className="max-w-4xl mx-auto">
        {/* Header Actions */}
        <div className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-bold group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Back
          </button>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-2 px-6 py-3 bg-card border border-border rounded-xl font-bold transition-all hover:bg-muted/10"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-green-500">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Link
                </>
              )}
            </button>
            <button
              onClick={handleWhatsApp}
              className="flex items-center gap-2 px-6 py-3 bg-green-500/10 text-green-500 border border-green-500/20 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-green-500 hover:text-white transition-all transform hover:scale-105 active:scale-95"
            >
              <MessageSquare className="w-4 h-4" />
              WhatsApp
            </button>
            <button
              onClick={handleSMS}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 transform hover:scale-105 active:scale-95"
            >
              <Send className="w-4 h-4" />
              Share SMS
            </button>
            <div className="flex gap-2">
              <button
                onClick={handleEmail}
                className="flex items-center justify-center p-3 bg-card border border-border rounded-xl hover:bg-muted/10 transition-all text-muted-foreground"
                title="Send Email"
              >
                <Mail className="w-5 h-5" />
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center justify-center p-3 bg-card border border-border rounded-xl hover:bg-muted/10 transition-all text-muted-foreground"
                title="Print"
              >
                <Printer className="w-5 h-5" />
              </button>
              <button
                className="flex items-center justify-center p-3 bg-card border border-border rounded-xl hover:bg-muted/10 transition-all text-muted-foreground"
                title="Download PDF"
              >
                <Download className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Invoice Preview */}
        <div className="bg-card rounded-[2.5rem] shadow-2xl border border-border overflow-hidden">
          {/* Invoice Header Gradient */}
          <div className="bg-linear-to-br from-primary via-purple-600 to-indigo-700 p-6 md:p-12 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-start md:justify-between gap-4 md:gap-8">
              <div>
                <h1 className="text-xl md:text-4xl font-black mb-1 md:mb-2 tracking-tighter">{settings.businessName || 'Your Business'}</h1>
                <p className="text-purple-100 font-bold opacity-80 uppercase tracking-[0.2em] text-[10px] md:text-xs">Professional Service Invoice</p>
              </div>
              <div className="text-right">
                <h2 className="text-2xl font-black tracking-widest mb-1 opacity-70"># {invoice.invoiceNumber}</h2>
                <div className="text-5xl font-black tracking-tighter mt-4">
                  ₦{(invoice.total || 0).toLocaleString()}
                </div>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest border border-white/30 mt-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  Status: {invoice.status}
                </div>
              </div>
            </div>
          </div>

          {/* Invoice Details Container */}
          <div className="p-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
              <div className="space-y-8">
                <div>
                  <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-3">Client Information</h3>
                  <div className="space-y-1">
                    <p className="text-xl font-black text-foreground">{invoice.clientName}</p>
                    <p className="text-muted-foreground font-medium text-sm">{invoice.clientEmail}</p>
                    <p className="text-muted-foreground font-medium text-sm">{invoice.clientPhone}</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-4">Payment Account</h3>
                  {accountDetails ? (
                    <div className="p-6 bg-primary/5 rounded-2xl border border-primary/20 space-y-4">
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Bank Name</p>
                        <p className="font-black text-primary">{accountDetails.bankName}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Account No.</p>
                          <p className="font-black text-foreground font-mono tracking-tighter text-lg">{accountDetails.accountNumber}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Type</p>
                          <p className="font-bold text-foreground text-sm">{accountDetails.accountType || 'Current'}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm font-bold text-yellow-500 italic">No bank account details configured</p>
                  )}
                </div>
              </div>
              <div className="md:text-right space-y-8">
                <div>
                  <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">Issue Date</h3>
                  <p className="font-bold text-foreground">{format(new Date(invoice.createdAt), 'MMMM dd, yyyy')}</p>
                </div>
                <div>
                  <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">Payment Deadline</h3>
                  <p className="font-black text-primary text-xl">
                    {format(new Date(invoice.dueDate), 'MMMM dd, yyyy')}
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-border inline-block md:ml-auto">
                   <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">Payment Method</p>
                   <p className="font-black text-foreground">Direct Bank Transfer</p>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="mb-12">
              <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-6">Service Summary</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="py-4 text-left text-[10px] font-black text-muted-foreground uppercase tracking-widest">Description</th>
                      <th className="py-4 text-center text-[10px] font-black text-muted-foreground uppercase tracking-widest w-24">Qty</th>
                      <th className="py-4 text-right text-[10px] font-black text-muted-foreground uppercase tracking-widest w-32">Price</th>
                      <th className="py-4 text-right text-[10px] font-black text-muted-foreground uppercase tracking-widest w-32">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {invoice.items.map((item) => (
                      <tr key={item.id} className="group">
                        <td className="py-6 pr-4">
                          <p className="font-bold text-foreground text-sm leading-relaxed">{item.description}</p>
                        </td>
                        <td className="py-6 text-center font-bold text-muted-foreground text-sm">{item.quantity}</td>
                        <td className="py-6 text-right font-bold text-muted-foreground text-sm">₦{item.price.toLocaleString()}</td>
                        <td className="py-6 text-right font-black text-foreground text-sm">₦{(item.total || item.quantity * item.price).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Summary */}
            <div className="flex justify-end pt-8 border-t border-border">
              <div className="w-full md:w-80 space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-bold text-muted-foreground uppercase tracking-[0.15em] text-[10px]">Subtotal</span>
                  <span className="font-black text-foreground">₦{(invoice.subtotal || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="font-bold text-muted-foreground uppercase tracking-[0.15em] text-[10px]">VAT ({invoice.vat}%)</span>
                  <span className="font-black text-foreground">₦{((invoice.subtotal * invoice.vat || 0) / 100).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="font-bold text-muted-foreground uppercase tracking-[0.15em] text-[10px]">Tax Withheld</span>
                  <span className="font-black text-red-500">-₦{((invoice.subtotal * invoice.withholdingTax || 0) / 100).toLocaleString()}</span>
                </div>
                <div className="pt-6 mt-4 border-t border-border">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">Grand Total Due</span>
                    <span className="text-4xl font-black text-foreground tracking-tighter">₦{(invoice.total || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center pb-20">
          <p className="text-muted-foreground font-medium text-sm">
            Generated with Spriie Invoice Manager
          </p>
        </div>
      </div>
    </div>
  );
}