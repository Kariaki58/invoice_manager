'use client';

import { useRouter, useParams } from 'next/navigation';
import { useInvoices } from '../../context/InvoiceContext';
import { format } from 'date-fns';
import { Send, MessageSquare, Mail, Copy, Check, ArrowLeft } from 'lucide-react';
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
      <div className="min-h-screen bg-gray-50 p-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">Invoice not found</p>
          <button
            onClick={() => router.push('/invoices')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Actions */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="text-green-600">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy Link
                </>
              )}
            </button>
            <button
              onClick={handleWhatsApp}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <MessageSquare className="w-4 h-4" />
              WhatsApp
            </button>
            <button
              onClick={handleSMS}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Send className="w-4 h-4" />
              SMS
            </button>
            <button
              onClick={handleEmail}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Mail className="w-4 h-4" />
              Email
            </button>
          </div>
        </div>

        {/* Invoice Preview */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Invoice Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 md:p-8 text-white">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">{settings.businessName || 'Your Business'}</h1>
                <p className="text-blue-100">Professional Invoice Generator</p>
              </div>
              <div className="mt-4 md:mt-0 text-right">
                <h2 className="text-2xl font-bold mb-1">INVOICE</h2>
                <p className="text-blue-100">#{invoice.invoiceNumber}</p>
              </div>
            </div>
          </div>

          {/* Invoice Details */}
          <div className="p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Bill To</h3>
                <p className="font-semibold text-gray-900">{invoice.clientName}</p>
                <p className="text-gray-600">{invoice.clientEmail}</p>
                <p className="text-gray-600">{invoice.clientPhone}</p>
              </div>
              <div className="text-right md:text-left md:ml-auto">
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Invoice Details</h3>
                <p className="text-gray-900">
                  <span className="font-semibold">Date:</span> {format(new Date(invoice.createdAt), 'MMM dd, yyyy')}
                </p>
                <p className="text-gray-900">
                  <span className="font-semibold">Due Date:</span> {format(new Date(invoice.dueDate), 'MMM dd, yyyy')}
                </p>
                <div className="mt-2">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                    invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                    invoice.status === 'overdue' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {invoice.status?.charAt(0).toUpperCase() + invoice.status?.slice(1) || 'Pending'}
                  </span>
                </div>
              </div>
            </div>

            {/* Invoice Totals */}
            <div className="flex justify-end">
              <div className="w-full md:w-80 space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>₦{(invoice.subtotal || 0).toLocaleString('en-NG')}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>VAT ({(settings.defaultVAT || 0)}%)</span>
                  <span>₦{(invoice.vat || 0).toLocaleString('en-NG')}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Withholding Tax ({(settings.defaultWithholdingTax || 0)}%)</span>
                  <span className="text-red-600">-₦{(invoice.withholdingTax || 0).toLocaleString('en-NG')}</span>
                </div>
                <div className="border-t-2 border-gray-300 pt-2 mt-2">
                  <div className="flex justify-between text-xl font-bold text-gray-900">
                    <span>Total</span>
                    <span>₦{(invoice.total || 0).toLocaleString('en-NG')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Instructions */}
            <div className="mt-8 space-y-4">
              {accountDetails && (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h3 className="font-semibold text-gray-900 mb-3">Payment Details</h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Account Name</p>
                      <p className="text-base font-semibold text-gray-900">{accountDetails.accountName || ''}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Bank Name</p>
                      <p className="text-base text-gray-900">{accountDetails.bankName || ''}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Account Number</p>
                      <p className="text-base font-mono font-semibold text-gray-900">{accountDetails.accountNumber || ''}</p>
                    </div>
                    {accountDetails.accountType && (
                      <div>
                        <p className="text-sm font-medium text-gray-700">Account Type</p>
                        <p className="text-base text-gray-900">{accountDetails.accountType} Account</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-gray-900 mb-2">Payment Instructions</h3>
                <p className="text-sm text-gray-600">
                  Please make payment by the due date. {accountDetails ? 'Use the account details above for bank transfer.' : 'For payment options, contact us at ' + invoice.clientEmail + ' or ' + invoice.clientPhone + '.'}
                </p>
                {!accountDetails && (
                  <p className="text-sm text-gray-600 mt-2">
                    Contact: {invoice.clientEmail} or {invoice.clientPhone}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}