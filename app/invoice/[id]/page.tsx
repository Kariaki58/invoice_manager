'use client';

import { useRouter, useParams } from 'next/navigation';
import { useInvoices } from '../../context/InvoiceContext';
import { format } from 'date-fns';
import { Send, MessageSquare, Mail, Copy, Check, ArrowLeft, Printer, Download } from 'lucide-react';
import { useState } from 'react';

export default function InvoicePreview() {
  const router = useRouter();
  const params = useParams();
  const { getInvoice, settings, getAccount, loading } = useInvoices();
  const invoice = getInvoice(params.id as string);
  const [copied, setCopied] = useState(false);
  
  const accountDetails = invoice?.accountId ? getAccount(invoice.accountId) : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground font-medium">Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8 flex items-center justify-center">
        <div className="text-center px-4">
          <p className="text-base md:text-xl text-muted-foreground mb-4 md:mb-6 font-bold">Invoice not found</p>
          <button
            onClick={() => router.push('/invoices')}
            className="px-6 py-3 md:px-8 md:py-4 bg-primary text-white rounded-xl md:rounded-2xl font-black text-sm md:text-base hover:bg-primary/90 transition-all shadow-xl shadow-primary/25"
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
    const subject = encodeURIComponent(`Invoice ${invoice.invoiceNumber} from ${settings?.businessName || 'Your Business'}`);
    const body = encodeURIComponent(
      `Dear ${invoice.clientName},\n\nPlease find attached your invoice ${invoice.invoiceNumber}.\n\nTotal Amount: ₦${(invoice.total || 0).toLocaleString('en-NG')}\nDue Date: ${format(new Date(invoice.dueDate), 'MMMM dd, yyyy')}\n\nView invoice: ${invoiceLink}\n\nThank you for your business!`
    );
    window.open(`mailto:${invoice.clientEmail}?subject=${subject}&body=${body}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-background p-3 md:p-8 transition-colors overflow-x-hidden">
      <div className="max-w-4xl mx-auto w-full">
        {/* Header Actions */}
        <div className="mb-4 md:mb-10 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 md:gap-2 text-muted-foreground hover:text-primary transition-colors font-bold group text-sm md:text-base"
          >
            <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 group-hover:-translate-x-1 transition-transform" />
            Back
          </button>
          <div className="flex flex-wrap gap-2 md:gap-3">
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 md:gap-2 px-3 py-2 md:px-6 md:py-3 bg-card border border-border rounded-lg md:rounded-xl font-bold text-xs md:text-sm transition-all hover:bg-muted/10"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 md:w-4 md:h-4 text-green-500" />
                  <span className="text-green-500 text-xs md:text-sm">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  <span className="hidden sm:inline">Link</span>
                </>
              )}
            </button>
            <button
              onClick={handleWhatsApp}
              className="flex items-center gap-1.5 md:gap-2 px-3 py-2 md:px-6 md:py-3 bg-green-500/10 text-green-500 border border-green-500/20 rounded-lg md:rounded-xl font-black text-[10px] md:text-xs uppercase tracking-widest hover:bg-green-500 hover:text-white transition-all transform hover:scale-105 active:scale-95"
            >
              <MessageSquare className="w-3.5 h-3.5 md:w-4 md:h-4" />
              <span className="hidden sm:inline">WhatsApp</span>
              <span className="sm:hidden">WA</span>
            </button>
            <button
              onClick={handleSMS}
              className="flex items-center gap-1.5 md:gap-2 px-3 py-2 md:px-6 md:py-3 bg-primary text-white rounded-lg md:rounded-xl font-black text-[10px] md:text-xs uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 transform hover:scale-105 active:scale-95"
            >
              <Send className="w-3.5 h-3.5 md:w-4 md:h-4" />
              <span className="hidden sm:inline">Share SMS</span>
              <span className="sm:hidden">SMS</span>
            </button>
            <div className="flex gap-1.5 md:gap-2">
              <button
                onClick={handleEmail}
                className="flex items-center justify-center p-2 md:p-3 bg-card border border-border rounded-lg md:rounded-xl hover:bg-muted/10 transition-all text-muted-foreground"
                title="Send Email"
              >
                <Mail className="w-4 h-4 md:w-5 md:h-5" />
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center justify-center p-2 md:p-3 bg-card border border-border rounded-lg md:rounded-xl hover:bg-muted/10 transition-all text-muted-foreground"
                title="Print"
              >
                <Printer className="w-4 h-4 md:w-5 md:h-5" />
              </button>
              <button
                className="flex items-center justify-center p-2 md:p-3 bg-card border border-border rounded-lg md:rounded-xl hover:bg-muted/10 transition-all text-muted-foreground"
                title="Download PDF"
              >
                <Download className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Invoice Preview */}
        <div className="bg-card rounded-2xl md:rounded-[2.5rem] shadow-2xl border border-border overflow-hidden">
          {/* Invoice Header Gradient */}
          <div className="bg-linear-to-br from-primary via-purple-600 to-indigo-700 p-4 md:p-12 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
            <div className="relative z-10 flex flex-col gap-3 md:flex-row md:items-start md:justify-between md:gap-8">
              <div className="min-w-0 flex-1">
                <h1 className="text-lg md:text-4xl font-black mb-0.5 md:mb-2 tracking-tighter truncate">{settings?.businessName || 'Your Business'}</h1>
                <p className="text-purple-100 font-bold opacity-80 uppercase tracking-[0.2em] text-[9px] md:text-xs">Professional Service Invoice</p>
              </div>
              <div className="text-right md:text-right flex-shrink-0">
                <h2 className="text-base md:text-2xl font-black tracking-widest mb-0.5 md:mb-1 opacity-70"># {invoice.invoiceNumber}</h2>
                <div className="text-2xl md:text-5xl font-black tracking-tighter mt-2 md:mt-4">
                  ₦{(invoice.total || 0).toLocaleString()}
                </div>
                <div className="inline-flex items-center gap-1.5 md:gap-2 px-2.5 py-1 md:px-4 md:py-1.5 bg-white/20 backdrop-blur-md rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest border border-white/30 mt-2 md:mt-4">
                  <span className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-white animate-pulse" />
                  <span className="hidden sm:inline">Status: </span>{invoice.status}
                </div>
              </div>
            </div>
          </div>

          {/* Invoice Details Container */}
          <div className="p-4 md:p-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 mb-6 md:mb-12">
              <div className="space-y-4 md:space-y-8">
                <div>
                  <h3 className="text-[9px] md:text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2 md:mb-3">Client Information</h3>
                  <div className="space-y-0.5 md:space-y-1">
                    <p className="text-base md:text-xl font-black text-foreground truncate">{invoice.clientName}</p>
                    <p className="text-muted-foreground font-medium text-xs md:text-sm truncate">{invoice.clientEmail}</p>
                    <p className="text-muted-foreground font-medium text-xs md:text-sm">{invoice.clientPhone}</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-[9px] md:text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-3 md:mb-4">Payment Account</h3>
                  {accountDetails ? (
                    <div className="p-4 md:p-6 bg-primary/5 rounded-xl md:rounded-2xl border border-primary/20 space-y-3 md:space-y-4">
                      <div>
                        <p className="text-[9px] md:text-[10px] font-bold text-muted-foreground uppercase mb-0.5 md:mb-1">Bank Name</p>
                        <p className="font-black text-primary text-sm md:text-base truncate">{accountDetails.bankName}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3 md:gap-4">
                        <div>
                          <p className="text-[9px] md:text-[10px] font-bold text-muted-foreground uppercase mb-0.5 md:mb-1">Account No.</p>
                          <p className="font-black text-foreground font-mono tracking-tighter text-sm md:text-lg break-all">{accountDetails.accountNumber}</p>
                        </div>
                        <div>
                          <p className="text-[9px] md:text-[10px] font-bold text-muted-foreground uppercase mb-0.5 md:mb-1">Type</p>
                          <p className="font-bold text-foreground text-xs md:text-sm">{accountDetails.accountType || 'Current'}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs md:text-sm font-bold text-yellow-500 italic">No bank account details configured</p>
                  )}
                </div>
              </div>
              <div className="md:text-right space-y-4 md:space-y-8">
                <div>
                  <h3 className="text-[9px] md:text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-0.5 md:mb-1">Issue Date</h3>
                  <p className="font-bold text-foreground text-sm md:text-base">{format(new Date(invoice.createdAt), 'MMMM dd, yyyy')}</p>
                </div>
                <div>
                  <h3 className="text-[9px] md:text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-0.5 md:mb-1">Payment Deadline</h3>
                  <p className="font-black text-primary text-base md:text-xl">
                    {format(new Date(invoice.dueDate), 'MMMM dd, yyyy')}
                  </p>
                </div>
                <div className="pt-3 md:pt-4 mt-3 md:mt-4 border-t border-border inline-block md:ml-auto">
                   <p className="text-[9px] md:text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-0.5 md:mb-1">Payment Method</p>
                   <p className="font-black text-foreground text-sm md:text-base">Direct Bank Transfer</p>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="mb-6 md:mb-12">
              <h3 className="text-[9px] md:text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-3 md:mb-6">Service Summary</h3>
              <div className="overflow-x-auto -mx-4 md:mx-0">
                <div className="inline-block min-w-full align-middle px-4 md:px-0">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="py-2 md:py-4 text-left text-[9px] md:text-[10px] font-black text-muted-foreground uppercase tracking-widest">Description</th>
                        <th className="py-2 md:py-4 text-center text-[9px] md:text-[10px] font-black text-muted-foreground uppercase tracking-widest w-16 md:w-24">Qty</th>
                        <th className="py-2 md:py-4 text-right text-[9px] md:text-[10px] font-black text-muted-foreground uppercase tracking-widest w-24 md:w-32">Price</th>
                        <th className="py-2 md:py-4 text-right text-[9px] md:text-[10px] font-black text-muted-foreground uppercase tracking-widest w-24 md:w-32">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {invoice.items.map((item) => {
                        const quantity = (item.quantity != null && !isNaN(item.quantity)) ? Number(item.quantity) : 0;
                        const price = (item.price != null && !isNaN(item.price)) ? Number(item.price) : 0;
                        const itemTotal = (item.total != null && !isNaN(item.total))
                          ? Number(item.total)
                          : (quantity * price);
                        const safeTotal = (!isNaN(itemTotal) && itemTotal >= 0) ? itemTotal : 0;
                        const safePrice = (!isNaN(price) && price >= 0) ? price : 0;
                        const safeQuantity = (!isNaN(quantity) && quantity >= 0) ? quantity : 0;

                        return (
                          <tr key={item.id} className="group">
                            <td className="py-3 md:py-6 pr-2 md:pr-4">
                              <p className="font-bold text-foreground text-xs md:text-sm leading-relaxed break-words">{item.description || ''}</p>
                            </td>
                            <td className="py-3 md:py-6 text-center font-bold text-muted-foreground text-xs md:text-sm">{safeQuantity}</td>
                            <td className="py-3 md:py-6 text-right font-bold text-muted-foreground text-xs md:text-sm">₦{safePrice.toLocaleString('en-NG')}</td>
                            <td className="py-3 md:py-6 text-right font-black text-foreground text-xs md:text-sm">₦{safeTotal.toLocaleString('en-NG')}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="flex justify-end pt-4 md:pt-8 border-t border-border">
              <div className="w-full md:w-80 space-y-2.5 md:space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-muted-foreground uppercase tracking-[0.15em] text-[9px] md:text-[10px]">Subtotal</span>
                  <span className="font-black text-foreground text-sm md:text-base">₦{(invoice.subtotal || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-muted-foreground uppercase tracking-[0.15em] text-[9px] md:text-[10px]">VAT ({invoice.vat}%)</span>
                  <span className="font-black text-foreground text-sm md:text-base">₦{((invoice.subtotal * invoice.vat || 0) / 100).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-muted-foreground uppercase tracking-[0.15em] text-[9px] md:text-[10px]">Tax Withheld</span>
                  <span className="font-black text-red-500 text-sm md:text-base">-₦{((invoice.subtotal * invoice.withholdingTax || 0) / 100).toLocaleString()}</span>
                </div>
                <div className="pt-4 md:pt-6 mt-3 md:mt-4 border-t border-border">
                  <div className="flex justify-between items-end">
                    <span className="text-[9px] md:text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-0.5 md:mb-1">Grand Total Due</span>
                    <span className="text-2xl md:text-4xl font-black text-foreground tracking-tighter">₦{(invoice.total || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 md:mt-12 text-center pb-20 md:pb-8">
          <p className="text-muted-foreground font-medium text-xs md:text-sm">
            Generated with invoiceme
          </p>
        </div>
      </div>
    </div>
  );
}