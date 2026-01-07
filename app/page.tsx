'use client';

import { useInvoices } from './context/InvoiceContext';
import Link from 'next/link';
import { Plus, TrendingUp, TrendingDown, Clock, CheckCircle, FileText } from 'lucide-react';
import { format } from 'date-fns';

export default function Dashboard() {
  const { invoices } = useInvoices();

  const totalPaid = invoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.total, 0);

  const totalUnpaid = invoices
    .filter(inv => inv.status === 'unpaid')
    .reduce((sum, inv) => sum + inv.total, 0);

  const totalOverdue = invoices
    .filter(inv => inv.status === 'overdue')
    .reduce((sum, inv) => sum + inv.total, 0);

  const recentInvoices = invoices.slice(0, 5);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'overdue':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      default:
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 transition-colors">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10">
          <div>
            <h1 className="text-4xl font-black text-foreground mb-2 tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground font-medium">Welcome back! Here&apos;s your invoice overview.</p>
          </div>
          <Link
            href="/create"
            className="mt-6 md:mt-0 inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-2xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 hover:shadow-primary/40 transform hover:-translate-y-1 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            Create Invoice
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-card rounded-3xl p-8 shadow-2xl border border-border group hover:border-primary/50 transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Total Paid</h3>
              <div className="p-2 bg-green-500/10 rounded-xl">
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
            </div>
            <p className="text-4xl font-black text-foreground tracking-tighter mb-2">₦{totalPaid.toLocaleString()}</p>
            <p className="text-sm font-bold text-green-500 flex items-center gap-1">
              {invoices.filter(inv => inv.status === 'paid').length} payments received
            </p>
          </div>

          <div className="bg-card rounded-3xl p-8 shadow-2xl border border-border group hover:border-primary/50 transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Unpaid</h3>
              <div className="p-2 bg-yellow-500/10 rounded-xl">
                <Clock className="w-5 h-5 text-yellow-500" />
              </div>
            </div>
            <p className="text-4xl font-black text-foreground tracking-tighter mb-2">₦{totalUnpaid.toLocaleString()}</p>
            <p className="text-sm font-bold text-yellow-500 flex items-center gap-1">
              {invoices.filter(inv => inv.status === 'unpaid').length} pending invoices
            </p>
          </div>

          <div className="bg-card rounded-3xl p-8 shadow-2xl border border-border group hover:border-primary/50 transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Overdue</h3>
              <div className="p-2 bg-red-500/10 rounded-xl">
                <TrendingDown className="w-5 h-5 text-red-500" />
              </div>
            </div>
            <p className="text-4xl font-black text-foreground tracking-tighter mb-2">₦{totalOverdue.toLocaleString()}</p>
            <p className="text-sm font-bold text-red-500 flex items-center gap-1">
              {invoices.filter(inv => inv.status === 'overdue').length} overdue alerts
            </p>
          </div>
        </div>

        {/* Cash Flow Summary */}
        <div className="bg-card rounded-3xl p-8 shadow-2xl border border-border mb-10 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32" />
          <h2 className="text-xl font-black text-foreground mb-6 relative z-10">Cash Flow Summary</h2>
          <div className="space-y-6 relative z-10">
            <div className="flex items-end justify-between">
              <div>
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-1">Total Revenue</span>
                <span className="text-4xl font-black text-primary">
                  ₦{(totalPaid + totalUnpaid + totalOverdue).toLocaleString()}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-1">Efficiency</span>
                <span className="text-xl font-bold text-foreground">
                  {((totalPaid + totalUnpaid + totalOverdue) > 0 ? (totalPaid / (totalPaid + totalUnpaid + totalOverdue)) * 100 : 0).toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="h-4 bg-background rounded-full overflow-hidden border border-border">
              <div
                className="h-full bg-linear-to-r from-primary to-purple-400 transition-all duration-1000 shadow-[0_0_15px_#8b5cf6]"
                style={{
                  width: `${((totalPaid + totalUnpaid + totalOverdue) > 0 ? totalPaid / (totalPaid + totalUnpaid + totalOverdue) : 0) * 100}%`,
                }}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-background/50 rounded-2xl border border-border">
                <span className="text-[10px] font-bold text-muted-foreground uppercase block mb-1">Collected</span>
                <span className="text-lg font-bold text-green-500">₦{totalPaid.toLocaleString()}</span>
              </div>
              <div className="p-4 bg-background/50 rounded-2xl border border-border">
                <span className="text-[10px] font-bold text-muted-foreground uppercase block mb-1">Receivable</span>
                <span className="text-lg font-bold text-primary">₦{(totalUnpaid + totalOverdue).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Invoices */}
        <div className="bg-card rounded-3xl shadow-2xl border border-border mb-10 overflow-hidden">
          <div className="p-8 border-b border-border flex items-center justify-between bg-background/30">
            <h2 className="text-xl font-black text-foreground">Recent Activity</h2>
            <Link
              href="/invoices"
              className="text-primary hover:text-primary/80 font-bold text-sm flex items-center gap-1 transition-colors"
            >
              View Analytics
              <Plus className="w-4 h-4 rotate-45" />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {recentInvoices.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 opacity-20" />
                </div>
                <p className="font-bold">No active invoices</p>
                <p className="text-sm">Generate your first professional invoice today.</p>
              </div>
            ) : (
              recentInvoices.map((invoice) => (
                <Link
                  key={invoice.id}
                  href={`/invoice/${invoice.id}`}
                  className="block p-8 hover:bg-primary/5 transition-all duration-300 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <h3 className="font-black text-lg text-foreground group-hover:text-primary transition-colors">
                          {invoice.invoiceNumber}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${getStatusColor(
                            invoice.status
                          )}`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {invoice.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground font-medium">
                        <span className="flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" />
                          {invoice.clientName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          Due {format(new Date(invoice.dueDate), 'MMM dd')}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-foreground group-hover:scale-105 transition-transform">
                        ₦{invoice.total.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
