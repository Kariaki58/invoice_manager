'use client';

import { useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Clock, Search, Eye, Filter, ChevronRight } from 'lucide-react';
import { useInvoices, Invoice } from '../context/InvoiceContext';

export default function InvoiceList() {
  const { invoices, updateInvoiceStatus } = useInvoices();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'unpaid' | 'overdue'>('all');
  const [clientFilter, setClientFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const handleStatusChange = (id: string, newStatus: Invoice['status']) => {
    updateInvoiceStatus(id, newStatus);
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    const matchesClient = !clientFilter || invoice.clientName.toLowerCase().includes(clientFilter.toLowerCase());
    return matchesSearch && matchesStatus && matchesClient;
  });

  const uniqueClients = Array.from(new Set(invoices.map(inv => inv.clientName)));

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'paid': return 'border-green-500/30 text-green-500 bg-green-500/10';
      case 'overdue': return 'border-red-500/30 text-red-500 bg-red-500/10';
      default: return 'border-yellow-500/30 text-yellow-500 bg-yellow-500/10';
    }
  };

  return (
    <div className="min-h-screen bg-background p-3 md:p-8 transition-colors pb-32 md:pb-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-4 md:mb-12">
          <div className="flex items-center justify-between gap-3 md:gap-4 mb-1 md:mb-2">
            <h1 className="text-xl md:text-4xl font-black text-foreground tracking-tight">Invoices</h1>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden p-2 bg-card border border-border rounded-xl text-muted-foreground hover:text-primary transition-colors"
            >
              <Filter className="w-4 h-4" />
            </button>
          </div>
          <p className="text-muted-foreground font-medium text-xs md:text-base">Manage and track your business revenue</p>
        </div>

        {/* Filters - Collapsible on Mobile */}
        <div className={`${showFilters ? 'block' : 'hidden md:block'} mb-4 md:mb-8 animate-in fade-in slide-in-from-top-4 duration-300`}>
          <div className="bg-card rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-2xl border border-border">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6">
              <div className="relative">
                <Search className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 md:w-5 md:h-5 pointer-events-none" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search invoices..."
                  className="w-full pl-9 md:pl-12 pr-3 md:pr-4 py-2 md:py-3 bg-background border border-border rounded-xl md:rounded-2xl focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all text-foreground font-medium text-sm md:text-base"
                />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-1 gap-2 md:gap-4">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as Invoice['status'] | 'all')}
                  className="w-full px-3 md:px-5 py-2 md:py-3 bg-background border border-border rounded-xl md:rounded-2xl focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all text-foreground font-bold text-sm md:text-base appearance-none cursor-pointer"
                >
                  <option value="all">Status</option>
                  <option value="paid">Paid</option>
                  <option value="unpaid">Unpaid</option>
                  <option value="overdue">Overdue</option>
                </select>
                <select
                  value={clientFilter}
                  onChange={(e) => setClientFilter(e.target.value)}
                  className="w-full px-3 md:px-5 py-2 md:py-3 bg-background border border-border rounded-xl md:rounded-2xl focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all text-foreground font-bold text-sm md:text-base appearance-none cursor-pointer"
                >
                  <option value="">Clients</option>
                  {uniqueClients.map(client => (
                    <option key={client} value={client}>{client}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile View: Card List */}
        <div className="md:hidden space-y-3">
          {filteredInvoices.length === 0 ? (
            <div className="py-12 md:py-20 text-center bg-card rounded-2xl md:rounded-3xl border border-border">
               <Search className="w-8 h-8 md:w-12 md:h-12 text-muted-foreground/20 mx-auto mb-3 md:mb-4" />
               <p className="text-foreground font-black text-sm md:text-base">No invoices found</p>
            </div>
          ) : (
            filteredInvoices.map((invoice) => (
              <Link
                key={invoice.id}
                href={`/invoice/${invoice.id}`}
                className="block bg-card rounded-2xl md:rounded-4xl p-4 md:p-6 border border-border shadow-xl active:scale-[0.98] transition-all"
              >
                <div className="flex justify-between items-start mb-3 md:mb-4">
                  <div className="flex-1 min-w-0">
                    <span className="text-[9px] md:text-[10px] font-black text-muted-foreground uppercase tracking-widest block">{invoice.invoiceNumber}</span>
                    <h3 className="text-sm md:text-lg font-black text-foreground tracking-tight mt-0.5 md:mt-1 truncate">{invoice.clientName}</h3>
                  </div>
                  <div className={`px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-widest flex-shrink-0 ml-2 ${getStatusStyles(invoice.status)}`}>
                    {invoice.status}
                  </div>
                </div>
                
                <div className="flex justify-between items-end border-t border-border/50 pt-3 md:pt-4">
                  <div className="flex-1 min-w-0">
                    <div className="text-[9px] md:text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5 md:mb-1 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5 md:w-3 md:h-3" /> Due {format(new Date(invoice.dueDate), 'MMM dd')}
                    </div>
                    <div className="text-lg md:text-xl font-black text-foreground tracking-tighter">₦{invoice.total.toLocaleString()}</div>
                  </div>
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-primary/10 rounded-lg md:rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors flex-shrink-0 ml-2">
                    <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>

        {/* Desktop View: Professional Table */}
        <div className="hidden md:block bg-card rounded-3xl shadow-2xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-background/50 border-b border-border">
                  <th className="px-8 py-5 text-left text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Invoice Info</th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Client</th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Amount</th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Due Date</th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Status</th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-primary/5 transition-colors group">
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="text-sm font-black text-foreground group-hover:text-primary transition-colors">{invoice.invoiceNumber}</div>
                      <div className="text-[10px] font-bold text-muted-foreground flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3" /> {format(new Date(invoice.createdAt), 'MMM dd, yyyy')}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="text-sm font-black text-foreground">{invoice.clientName}</div>
                      <div className="text-xs font-medium text-muted-foreground">{invoice.clientEmail}</div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap uppercase tracking-tighter">
                      <div className="text-lg font-black text-foreground">₦{invoice.total.toLocaleString()}</div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="text-sm font-bold text-foreground">{format(new Date(invoice.dueDate), 'MMM dd, yyyy')}</div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <select
                        value={invoice.status}
                        onChange={(e) => handleStatusChange(invoice.id, e.target.value as Invoice['status'])}
                        className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all cursor-pointer focus:ring-2 focus:ring-primary/20 bg-background ${getStatusStyles(invoice.status)}`}
                      >
                        <option value="paid">Paid</option>
                        <option value="unpaid">Unpaid</option>
                        <option value="overdue">Overdue</option>
                      </select>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <Link
                        href={`/invoice/${invoice.id}`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-primary hover:text-white transition-all transform hover:scale-105"
                      >
                        <Eye className="w-4 h-4" /> Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Global Stats - Adjusted for Mobile Spacing */}
        <div className="mt-6 md:mt-8 grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6">
          <div className="bg-card rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-xl border border-border">
            <div className="text-[9px] md:text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1.5 md:mb-2 opacity-60">Total Managed</div>
            <div className="text-2xl md:text-3xl font-black text-foreground tracking-tighter">{filteredInvoices.length}</div>
          </div>
          <div className="bg-card rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-xl border border-border">
            <div className="text-[9px] md:text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1.5 md:mb-2 opacity-60">Portfolio Value</div>
            <div className="text-2xl md:text-3xl font-black text-foreground tracking-tighter">
              ₦{filteredInvoices.reduce((sum, inv) => sum + inv.total, 0).toLocaleString()}
            </div>
          </div>
          <div className="bg-card rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-xl border border-border">
            <div className="text-[9px] md:text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1.5 md:mb-2 opacity-60">Pending Collection</div>
            <div className="text-2xl md:text-3xl font-black text-yellow-500 tracking-tighter">
              ₦{filteredInvoices
                .filter(inv => inv.status === 'unpaid' || inv.status === 'overdue')
                .reduce((sum, inv) => sum + inv.total, 0)
                .toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
