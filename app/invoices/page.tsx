'use client';

import { useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Clock, Search, Eye } from 'lucide-react';
import { useInvoices, Invoice } from '../context/InvoiceContext';

export default function InvoiceList() {
  const { invoices, updateInvoiceStatus } = useInvoices();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'unpaid' | 'overdue'>('all');
  const [clientFilter, setClientFilter] = useState('');

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

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 transition-colors">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <h1 className="text-4xl font-black text-foreground mb-2 tracking-tight">Invoices</h1>
          <p className="text-muted-foreground font-medium">Manage and track your business revenue</p>
        </div>

        {/* Filters */}
        <div className="bg-card rounded-3xl p-6 shadow-2xl border border-border mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search invoices..."
                className="w-full pl-12 pr-4 py-3 bg-background border border-border rounded-2xl focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all text-foreground font-medium"
              />
            </div>
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as Invoice['status'] | 'all')}
                className="w-full px-5 py-3 bg-background border border-border rounded-2xl focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all text-foreground font-bold appearance-none cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="paid">Paid</option>
                <option value="unpaid">Unpaid</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
            <div>
              <select
                value={clientFilter}
                onChange={(e) => setClientFilter(e.target.value)}
                className="w-full px-5 py-3 bg-background border border-border rounded-2xl focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all text-foreground font-bold appearance-none cursor-pointer"
              >
                <option value="">All Clients</option>
                {uniqueClients.map(client => (
                  <option key={client} value={client}>{client}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Invoice Table */}
        <div className="bg-card rounded-3xl shadow-2xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-background/50 border-b border-border">
                  <th className="px-8 py-5 text-left text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                    Invoice Info
                  </th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                    Client
                  </th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                    Amount
                  </th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                    Due Date
                  </th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                    Status
                  </th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-8 py-20 text-center text-muted-foreground">
                      <div className="w-20 h-20 bg-muted/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Search className="w-10 h-10 opacity-20" />
                      </div>
                      <p className="text-xl font-black text-foreground mb-2">No invoices found</p>
                      <p className="font-medium">Try adjusting your filters or create a new invoice</p>
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-primary/5 transition-colors group">
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="text-sm font-black text-foreground group-hover:text-primary transition-colors">
                          {invoice.invoiceNumber}
                        </div>
                        <div className="text-[10px] font-bold text-muted-foreground flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3" />
                          {format(new Date(invoice.createdAt), 'MMM dd, yyyy')}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="text-sm font-black text-foreground">
                          {invoice.clientName}
                        </div>
                        <div className="text-xs font-medium text-muted-foreground">{invoice.clientEmail}</div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap uppercase tracking-tighter">
                        <div className="text-lg font-black text-foreground">
                          ₦{invoice.total.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="text-sm font-bold text-foreground">
                          {format(new Date(invoice.dueDate), 'MMM dd, yyyy')}
                        </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <select
                          value={invoice.status}
                          onChange={(e) => handleStatusChange(invoice.id, e.target.value as Invoice['status'])}
                          className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all cursor-pointer focus:ring-2 focus:ring-primary/20 bg-background ${
                            invoice.status === 'paid' ? 'border-green-500/30 text-green-500 bg-green-500/10' :
                            invoice.status === 'overdue' ? 'border-red-500/30 text-red-500 bg-red-500/10' :
                            'border-yellow-500/30 text-yellow-500 bg-yellow-500/10'
                          }`}
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
                          <Eye className="w-4 h-4" />
                          Details
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card rounded-3xl p-6 shadow-xl border border-border">
            <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Total Managed</div>
            <div className="text-3xl font-black text-foreground tracking-tighter">{filteredInvoices.length}</div>
          </div>
          <div className="bg-card rounded-3xl p-6 shadow-xl border border-border">
            <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Portfolio Value</div>
            <div className="text-3xl font-black text-foreground tracking-tighter">
              ₦{filteredInvoices.reduce((sum, inv) => sum + inv.total, 0).toLocaleString()}
            </div>
          </div>
          <div className="bg-card rounded-3xl p-6 shadow-xl border border-border flex flex-col justify-between">
            <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Pending Collection</div>
            <div className="text-3xl font-black text-yellow-500 tracking-tighter">
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

