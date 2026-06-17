import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Building2, PlusCircle, Users, ArrowLeft } from 'lucide-react';

const sidebarLinks = [
  { label: 'Dashboard', path: '/admin', icon: <LayoutDashboard className="w-4 h-4" /> },
  { label: 'Projects', path: '/admin', icon: <Building2 className="w-4 h-4" /> },
  { label: 'Add Project', path: '/admin/projects/add', icon: <PlusCircle className="w-4 h-4" /> },
  { label: 'Leads', path: '/admin/leads', icon: <Users className="w-4 h-4" /> },
];

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-rich-black flex">
      <aside className="hidden md:flex flex-col w-64 bg-deep-black border-r border-white/5 p-6">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-9 h-9 rounded-lg bg-champagne-gold/10 border border-champagne-gold/30 flex items-center justify-center">
            <Building2 className="w-4 h-4 text-champagne-gold" />
          </div>
          <div>
            <p className="font-serif text-sm font-bold text-white">HOME VISION</p>
            <p className="text-[9px] text-muted-gray font-sans tracking-[0.12em] uppercase">Admin Panel</p>
          </div>
        </div>
        <nav className="flex flex-col gap-1 flex-1">
          {sidebarLinks.map((link) => (
            <NavLink
              key={link.path + link.label}
              to={link.path}
              end={link.path === '/admin'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl font-sans text-sm transition-all ${
                  isActive
                    ? 'bg-champagne-gold/10 text-champagne-gold'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`
              }
            >
              {link.icon}
              {link.label}
            </NavLink>
          ))}
        </nav>
        <NavLink
          to="/"
          className="flex items-center gap-2 text-muted-gray font-sans text-sm hover:text-champagne-gold transition-colors mt-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Website
        </NavLink>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="md:hidden bg-deep-black border-b border-white/5 px-4 py-3 flex items-center justify-between">
          <span className="font-serif text-sm font-bold text-white">Admin Panel</span>
          <NavLink to="/" className="text-muted-gray font-sans text-xs flex items-center gap-1">
            <ArrowLeft className="w-3 h-3" /> Website
          </NavLink>
        </header>
        <main className="flex-1 p-4 md:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
