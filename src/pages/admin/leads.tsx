import { useState, useMemo } from 'react';
import { Search, Trash2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getLeads, updateLeadStatus, deleteLead } from '../../utils/storage';
import type { Lead } from '../../types';

const statusOptions: { value: Lead['status']; label: string; color: string }[] = [
  { value: 'new', label: 'New', color: 'bg-blue-500/20 text-blue-400' },
  { value: 'contacted', label: 'Contacted', color: 'bg-yellow-500/20 text-yellow-400' },
  { value: 'site-visit-booked', label: 'Site Visit Booked', color: 'bg-purple-500/20 text-purple-400' },
  { value: 'closed', label: 'Closed', color: 'bg-green-500/20 text-green-400' },
  { value: 'lost', label: 'Lost', color: 'bg-red-500/20 text-red-400' },
];

export default function Leads() {
  const navigate = useNavigate();
  const [leads, setLeads] = useState(getLeads());
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const filtered = useMemo(() => {
    return leads.filter((l) => {
      const matchesSearch =
        !search ||
        l.name.toLowerCase().includes(search.toLowerCase()) ||
        l.phone.includes(search) ||
        l.email.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = !statusFilter || l.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [leads, search, statusFilter]);

  const handleStatusUpdate = (id: string, status: Lead['status']) => {
    updateLeadStatus(id, status);
    setLeads(getLeads());
  };

  const handleDelete = (id: string) => {
    deleteLead(id);
    setLeads(getLeads());
  };

  const getStatusColor = (status: Lead['status']) => {
    return statusOptions.find((s) => s.value === status)?.color || 'bg-white/10 text-white';
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => navigate('/admin')} className="text-muted-gray hover:text-champagne-gold transition">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-serif text-2xl md:text-3xl font-bold text-white">Leads</h1>
        <span className="text-muted-gray font-sans text-sm">({filtered.length} total)</span>
      </div>

      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-gray" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone, email..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white font-sans text-sm placeholder-muted-gray focus:border-champagne-gold focus:outline-none transition"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-sans text-sm focus:border-champagne-gold focus:outline-none appearance-none"
        >
          <option value="" className="bg-charcoal">All Statuses</option>
          {statusOptions.map((s) => (
            <option key={s.value} value={s.value} className="bg-charcoal">{s.label}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="font-sans text-muted-gray">No leads found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left text-muted-gray font-sans text-xs uppercase tracking-wider pb-3 pr-4">Name</th>
                <th className="text-left text-muted-gray font-sans text-xs uppercase tracking-wider pb-3 pr-4">Phone</th>
                <th className="text-left text-muted-gray font-sans text-xs uppercase tracking-wider pb-3 pr-4 hidden md:table-cell">Email</th>
                <th className="text-left text-muted-gray font-sans text-xs uppercase tracking-wider pb-3 pr-4 hidden lg:table-cell">Location</th>
                <th className="text-left text-muted-gray font-sans text-xs uppercase tracking-wider pb-3 pr-4">Status</th>
                <th className="text-left text-muted-gray font-sans text-xs uppercase tracking-wider pb-3 pr-4 hidden md:table-cell">Date</th>
                <th className="text-right text-muted-gray font-sans text-xs uppercase tracking-wider pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((lead) => (
                <tr key={lead.id} className="border-b border-white/5 hover:bg-white/5 transition">
                  <td className="py-3 pr-4">
                    <p className="font-sans text-sm font-medium text-white">{lead.name}</p>
                    <p className="font-sans text-xs text-muted-gray">{lead.interestedProject || lead.source}</p>
                  </td>
                  <td className="py-3 pr-4 font-sans text-sm text-stone-gray">{lead.phone}</td>
                  <td className="py-3 pr-4 font-sans text-sm text-stone-gray hidden md:table-cell">{lead.email}</td>
                  <td className="py-3 pr-4 font-sans text-sm text-stone-gray hidden lg:table-cell">{lead.preferredLocation}</td>
                  <td className="py-3 pr-4">
                    <select
                      value={lead.status}
                      onChange={(e) => handleStatusUpdate(lead.id, e.target.value as Lead['status'])}
                      className={`px-2 py-1 rounded-full text-[10px] font-sans border-0 appearance-none cursor-pointer ${getStatusColor(lead.status)}`}
                    >
                      {statusOptions.map((s) => (
                        <option key={s.value} value={s.value} className="bg-charcoal">{s.label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="py-3 pr-4 font-sans text-xs text-muted-gray hidden md:table-cell">
                    {new Date(lead.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => handleDelete(lead.id)}
                      className="text-red-400/60 hover:text-red-400 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
