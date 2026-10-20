import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { api } from '../lib/api';

export interface AdminMe { id: string; email: string; name: string; role: 'super_admin' | 'admin' | 'finance'; mustChangePassword: boolean }
interface Ctx { me: AdminMe | null; loading: boolean; reload: () => Promise<void>; logout: () => Promise<void> }
const AdminCtx = createContext<Ctx | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [me, setMe] = useState<AdminMe | null>(null);
  const [loading, setLoading] = useState(true);
  const reload = useCallback(async () => {
    const r = await api<AdminMe>('GET', '/api/admin/me');
    setMe(r.ok ? { id: r.id, email: r.email, name: r.name, role: r.role, mustChangePassword: r.mustChangePassword } : null);
    setLoading(false);
  }, []);
  useEffect(() => { void reload(); }, [reload]);
  const logout = useCallback(async () => { await api('POST', '/api/admin/logout', {}); setMe(null); }, []);
  return <AdminCtx.Provider value={{ me, loading, reload, logout }}>{children}</AdminCtx.Provider>;
}

export function useAdmin() {
  const c = useContext(AdminCtx);
  if (!c) throw new Error('useAdmin must be used within AdminAuthProvider');
  return c;
}

// The server enforces every permission; this guard only decides what the browser renders.
export function RequireAdmin({ children }: { children: ReactNode }) {
  const { me, loading } = useAdmin();
  if (loading) return <div className="flex min-h-screen items-center justify-center bg-[#F6F1E9] text-[#292929]">Loading…</div>;
  if (!me) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
}
