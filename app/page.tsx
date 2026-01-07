'use client';

import { useInvoices } from './context/InvoiceContext';
import Link from 'next/link';
import { Plus, TrendingUp, TrendingDown, Clock, CheckCircle, FileText, ChevronRight } from 'lucide-react';
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

  const recentInvoices = [...invoices].reverse().slice(0, 5);

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
    <div className="min-h-screen bg-background p-3 md:p-8 transition-colors pb-32 md:pb-8 overflow-x-hidden">
      <div className="max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 md:mb-12">
          <div>
            <h1 className="text-xl md:text-5xl font-black text-foreground mb-1 md:mb-2 tracking-tighter">Dashboard</h1>
            <p className="text-muted-foreground font-medium text-xs md:text-base">Welcome back! Here&apos;s your invoice overview.</p>
          </div>
          <Link
            href="/create"
            className="mt-4 md:mt-0 inline-flex items-center justify-center gap-1.5 md:gap-2 bg-primary text-primary-foreground px-4 py-2 md:px-8 md:py-4 rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest hover:bg-primary/90 transition-all shadow-xl shadow-primary/25 hover:shadow-primary/40 transform hover:-translate-y-1 active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 md:w-5 md:h-5" />
            <span className="hidden sm:inline">Create Invoice</span>
            <span className="sm:hidden">Create</span>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6 mb-6 md:mb-12">
          <div className="bg-card rounded-2xl md:rounded-4xl p-4 md:p-8 shadow-2xl border border-border group hover:border-primary/50 transition-all duration-300">
            <div className="flex items-center justify-between mb-3 md:mb-6">
              <h3 className="text-[9px] md:text-[10px] font-black text-muted-foreground uppercase tracking-widest">Total Paid</h3>
              <div className="p-1.5 md:p-2 bg-green-500/10 rounded-lg md:rounded-xl">
                <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-green-500" />
              </div>
            </div>
            <p className="text-2xl md:text-4xl font-black text-foreground tracking-tighter mb-1 md:mb-2">₦{totalPaid.toLocaleString()}</p>
            <p className="text-[10px] md:text-xs font-bold text-green-500 flex items-center gap-1 uppercase tracking-wider">
              {invoices.filter(inv => inv.status === 'paid').length} payments
            </p>
          </div>

          <div className="bg-card rounded-2xl md:rounded-4xl p-4 md:p-8 shadow-2xl border border-border group hover:border-primary/50 transition-all duration-300">
            <div className="flex items-center justify-between mb-3 md:mb-6">
              <h3 className="text-[9px] md:text-[10px] font-black text-muted-foreground uppercase tracking-widest">Unpaid</h3>
              <div className="p-1.5 md:p-2 bg-yellow-500/10 rounded-lg md:rounded-xl">
                <Clock className="w-4 h-4 md:w-5 md:h-5 text-yellow-500" />
              </div>
            </div>
            <p className="text-2xl md:text-4xl font-black text-foreground tracking-tighter mb-1 md:mb-2">₦{totalUnpaid.toLocaleString()}</p>
            <p className="text-[10px] md:text-xs font-bold text-yellow-500 flex items-center gap-1 uppercase tracking-wider">
              {invoices.filter(inv => inv.status === 'unpaid').length} pending
            </p>
          </div>

          <div className="bg-card rounded-2xl md:rounded-4xl p-4 md:p-8 shadow-2xl border border-border group hover:border-primary/50 transition-all duration-300">
            <div className="flex items-center justify-between mb-3 md:mb-6">
              <h3 className="text-[9px] md:text-[10px] font-black text-muted-foreground uppercase tracking-widest">Overdue</h3>
              <div className="p-1.5 md:p-2 bg-red-500/10 rounded-lg md:rounded-xl">
                <TrendingDown className="w-4 h-4 md:w-5 md:h-5 text-red-500" />
              </div>
            </div>
            <p className="text-2xl md:text-4xl font-black text-foreground tracking-tighter mb-1 md:mb-2">₦{totalOverdue.toLocaleString()}</p>
            <p className="text-[10px] md:text-xs font-bold text-red-500 flex items-center gap-1 uppercase tracking-wider">
              {invoices.filter(inv => inv.status === 'overdue').length} alerts
            </p>
          </div>
        </div>

        {/* Cash Flow Summary */}
        <div className="bg-card rounded-2xl md:rounded-4xl p-4 md:p-10 shadow-2xl border border-border mb-6 md:mb-12 overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32 group-hover:bg-primary/10 transition-colors" />
          <h2 className="text-base md:text-xl font-black text-foreground mb-4 md:mb-8 relative z-10 flex items-center gap-2 md:gap-3">
             <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
             Collection Efficiency
          </h2>
          <div className="space-y-4 md:space-y-8 relative z-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 md:gap-4">
              <div className="min-w-0 flex-1">
                <span className="text-[9px] md:text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-1">Projected Revenue</span>
                <span className="text-2xl md:text-5xl font-black text-primary tracking-tighter break-words">
                  ₦{(totalPaid + totalUnpaid + totalOverdue).toLocaleString()}
                </span>
              </div>
              <div className="md:text-right border-l-4 border-primary pl-3 md:border-l-0 md:pl-0 flex-shrink-0">
                <span className="text-[9px] md:text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-1">Payment Ratio</span>
                <span className="text-xl md:text-2xl font-black text-foreground tracking-tighter">
                  {((totalPaid + totalUnpaid + totalOverdue) > 0 ? (totalPaid / (totalPaid + totalUnpaid + totalOverdue)) * 100 : 0).toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="h-5 bg-background rounded-full overflow-hidden border border-border p-1">
              <div
                className="h-full bg-linear-to-r from-primary to-purple-400 transition-all duration-1000 shadow-[0_0_20px_#8b5cf6] rounded-full"
                style={{
                  width: `${((totalPaid + totalUnpaid + totalOverdue) > 0 ? totalPaid / (totalPaid + totalUnpaid + totalOverdue) : 0) * 100}%`,
                }}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <div className="p-4 md:p-5 bg-background/40 rounded-2xl md:rounded-3xl border border-border flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <span className="text-[9px] md:text-[10px] font-black text-muted-foreground uppercase block mb-1 tracking-widest">Settled</span>
                  <span className="text-lg md:text-xl font-black text-green-500 tracking-tighter break-words">₦{totalPaid.toLocaleString()}</span>
                </div>
                <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-green-500/30 flex-shrink-0 ml-2" />
              </div>
              <div className="p-4 md:p-5 bg-background/40 rounded-2xl md:rounded-3xl border border-border flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <span className="text-[9px] md:text-[10px] font-black text-muted-foreground uppercase block mb-1 tracking-widest">Outreach Required</span>
                  <span className="text-lg md:text-xl font-black text-primary tracking-tighter break-words">₦{(totalUnpaid + totalOverdue).toLocaleString()}</span>
                </div>
                <Clock className="w-5 h-5 md:w-6 md:h-6 text-primary/30 flex-shrink-0 ml-2" />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Invoices */}
          <div className="bg-card rounded-2xl md:rounded-4xl shadow-2xl border border-border mb-6 md:mb-10 overflow-hidden">
          <div className="p-3 md:p-8 border-b border-border flex items-center justify-between bg-background/20 gap-2">
            <h2 className="text-sm md:text-xl font-black text-foreground tracking-tight">Recent Activity</h2>
            <Link
              href="/invoices"
              className="px-3 py-1.5 md:px-4 md:py-2 bg-primary/10 text-primary rounded-lg md:rounded-xl font-black text-[9px] md:text-[10px] uppercase tracking-[0.2em] hover:bg-primary hover:text-white transition-all transform hover:scale-105 flex-shrink-0"
            >
              <span className="hidden sm:inline">Analyze All</span>
              <span className="sm:hidden">All</span>
            </Link>
          </div>
          <div className="divide-y divide-border">
            {recentInvoices.length === 0 ? (
              <div className="p-12 md:p-16 text-center text-muted-foreground">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-muted/10 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
                  <FileText className="w-8 h-8 md:w-10 md:h-10 opacity-20" />
                </div>
                <p className="font-black text-foreground text-base md:text-lg mb-1">Clean Slate</p>
                <p className="text-[10px] md:text-xs uppercase font-bold tracking-widest opacity-60">No transaction records found</p>
              </div>
            ) : (
              recentInvoices.map((invoice) => (
                <Link
                  key={invoice.id}
                  href={`/invoice/${invoice.id}`}
                  className="block p-4 md:p-8 hover:bg-primary/5 transition-all duration-300 group"
                >
                  <div className="flex items-center justify-between gap-2 md:gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col md:flex-row md:items-center gap-1.5 md:gap-4 mb-2 md:mb-3">
                        <h3 className="font-black text-sm md:text-lg text-foreground group-hover:text-primary transition-colors truncate">
                          {invoice.invoiceNumber}
                        </h3>
                        <span
                          className={`inline-flex items-center w-fit px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-widest border flex-shrink-0 ${getStatusColor(
                            invoice.status
                          )}`}
                        >
                          {invoice.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 md:gap-x-4 gap-y-1 text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        <span className="flex items-center gap-1 shrink-0">
                          <CheckCircle className="w-3 h-3 md:w-3.5 md:h-3.5" />
                          <span className="truncate max-w-[100px] md:max-w-none">{invoice.clientName}</span>
                        </span>
                        <span className="flex items-center gap-1 shrink-0">
                          <Clock className="w-3 h-3 md:w-3.5 md:h-3.5" />
                          {format(new Date(invoice.dueDate), 'MMM dd')}
                        </span>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-2 md:gap-4 flex-shrink-0">
                      <div className="hidden md:block">
                        <p className="text-2xl font-black text-foreground tracking-tighter group-hover:scale-105 transition-transform">
                          ₦{invoice.total.toLocaleString()}
                        </p>
                      </div>
                      <div className="md:hidden">
                        <p className="text-base font-black text-foreground tracking-tighter">
                          ₦{invoice.total.toLocaleString()}
                        </p>
                      </div>
                      <div className="w-8 h-8 md:w-10 md:h-10 bg-primary/10 rounded-lg md:rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all transform group-hover:translate-x-1">
                        <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
                      </div>
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
