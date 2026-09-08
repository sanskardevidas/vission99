import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
      <motion.button
        whileTap={{ scale: 0.96 }}
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 text-white hover:border-champagne-gold transition"
      >
        <User className="w-4 h-4" />

        <span className="max-w-[140px] truncate">
          {user.email}
        </span>

        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25 }}>
          <ChevronDown className="w-4 h-4" />
        </motion.span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="absolute right-0 mt-3 w-64 bg-white rounded-xl shadow-xl overflow-hidden z-50 origin-top-right"
          >
            <div className="p-4 border-b">
              <p className="text-xs text-gray-500">
                Logged In As
              </p>

              <p className="font-medium break-all">
                {user.email}
              </p>
            </div>

            <div className="py-2">
              <motion.div whileTap={{ scale: 0.97 }}>
                <Link
                  to="/profile"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition"
                >
                  <User className="w-4 h-4" />
                  My Profile
                </Link>
              </motion.div>

              <motion.div whileTap={{ scale: 0.97 }}>
                <Link
                  to="/dashboard"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
              </motion.div>

              {isAdmin && (
                <motion.div whileTap={{ scale: 0.97 }}>
                  <Link
                    to="/admin"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Admin Dashboard
                  </Link>
                </motion.div>
              )}

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-red-50 text-red-600 transition"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}