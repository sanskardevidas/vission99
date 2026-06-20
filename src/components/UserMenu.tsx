import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown, User, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function UserMenu() {
  const { user, isAdmin, signOut } = useAuth();

  const [open, setOpen] = useState(false);

  const navigate = useNavigate();

  async function handleLogout() {
    await signOut();
    navigate('/');
  }

  if (!user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 text-white hover:border-champagne-gold transition"
      >
        <User className="w-4 h-4" />

        <span className="max-w-[140px] truncate">
          {user.email}
        </span>

        <ChevronDown className="w-4 h-4" />
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-64 bg-white rounded-xl shadow-xl overflow-hidden z-50">
          <div className="p-4 border-b">
            <p className="text-xs text-gray-500">
              Logged In As
            </p>

            <p className="font-medium break-all">
              {user.email}
            </p>
          </div>

          <div className="py-2">
            <Link
              to="/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition"
            >
              <User className="w-4 h-4" />
              My Profile
            </Link>

            <Link
              to="/dashboard"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition"
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>

            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition"
              >
                <LayoutDashboard className="w-4 h-4" />
                Admin Dashboard
              </Link>
            )}

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-red-50 text-red-600 transition"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}