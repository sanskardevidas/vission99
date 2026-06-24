import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, Eye, FileEdit, Users, MapPin, RotateC3d, PlusCircle, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getProjects, getLeads } from '../../utils/storage';
import type { Project, Lead } from '../../types';

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const loadData = async () => {
      try {
        const [projectsData, leadsData] = await Promise.all([
          getProjects(),
          getLeads(),
        ]);
        setProjects(
          Array.isArray(projectsData)
          ? projectsData
          : []
        );

        setLeads(
          Array.isArray(leadsData)
          ? leadsData
          : []
        );
      } catch (error) {
        console.error(error);

        setProjects([]);
        setLeads([]);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);
  const published = projects.filter(
    (p) => p.status === 'published'
  );
  const drafts = projects.filter(
    (p) => p.status === 'draft'
  );
  const stats = [
    { icon: <Building2 className="w-5 h-5" />, value: projects.length, label: 'Total Projects', color: 'text-champagne-gold' },
    { icon: <Eye className="w-5 h-5" />, value: published.length, label: 'Published', color: 'text-green-400' },
    { icon: <FileEdit className="w-5 h-5" />, value: drafts.length, label: 'Drafts', color: 'text-yellow-400' },
    { icon: <Users className="w-5 h-5" />, value: leads.length, label: 'Total Leads', color: 'text-blue-400' },
  ];

  const quickActions = [
    { icon: <PlusCircle className="w-5 h-5" />, label: 'Add New Project', path: '/admin/projects/add' },
    { icon: <Upload className="w-5 h-5" />, label: 'Upload VR Tour', path: '/admin/projects/add' },
    { icon: <Users className="w-5 h-5" />, label: 'View Leads', path: '/admin/leads' },
  ];

  return (
    <div>
      <h1 className="font-serif text-2xl md:text-3xl font-bold text-white mb-8">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            className="bg-soft-charcoal rounded-xl border border-white/5 p-5"
          >
            <div className={`w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center mb-3 ${s.color}`}>
              {s.icon}
            </div>
            <p className="font-serif text-2xl font-bold text-white">{s.value}</p>
            <p className="font-sans text-xs text-muted-gray">{s.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 mb-8">
        {quickActions.map((a) => (
          <Link
            key={a.label}
            to={a.path}
            className="bg-champagne-gold/10 border border-champagne-gold/30 text-champagne-gold font-sans text-sm px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-champagne-gold/20 transition"
          >
            {a.icon} {a.label}
          </Link>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-soft-charcoal rounded-xl border border-white/5 p-5">
          <h2 className="font-sans font-semibold text-white text-base mb-4">Recent Projects</h2>
          <div className="space-y-3">
            {projects.slice(0, 5).map((p) => (
              <div key={p.id} className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                <div>
                  <p className="font-sans text-sm font-medium text-white">{p.name}</p>
                  <div className="flex items-center gap-2 text-xs font-sans text-muted-gray">
                    <MapPin className="w-3 h-3" /> {p.location}
                    <span className="mx-1">|</span> {p.price}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-sans ${p.status === 'published' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                    {p.status}
                  </span>
                  <Link
                    to={`/admin/projects/edit/${p.id}`}
                    className="text-muted-gray hover:text-champagne-gold transition"
                  >
                    <FileEdit className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
            {projects.length === 0 && <p className="text-muted-gray font-sans text-sm">No projects yet.</p>}
          </div>
        </div>

        <div className="bg-soft-charcoal rounded-xl border border-white/5 p-5">
          <h2 className="font-sans font-semibold text-white text-base mb-4">Recent Leads</h2>
          <div className="space-y-3">
            {leads.slice(0, 5).map((l) => (
              <div key={l.id} className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                <div>
                  <p className="font-sans text-sm font-medium text-white">{l.name}</p>
                  <p className="text-xs font-sans text-muted-gray">{l.phone} | {l.preferredLocation || 'No location'}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-sans ${
                  l.status === 'new' ? 'bg-blue-500/20 text-blue-400' :
                  l.status === 'contacted' ? 'bg-yellow-500/20 text-yellow-400' :
                  l.status === 'site-visit-booked' ? 'bg-purple-500/20 text-purple-400' :
                  l.status === 'closed' ? 'bg-green-500/20 text-green-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {l.status}
                </span>
              </div>
            ))}
            {leads.length === 0 && <p className="text-muted-gray font-sans text-sm">No leads yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
