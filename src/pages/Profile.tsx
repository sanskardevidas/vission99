import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await signOut();
    navigate('/');
  }

  return (
    <div className="min-h-screen bg-deep-black px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="max-w-4xl mx-auto"
      >
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-deep-black">
                My Profile
              </h1>

              <p className="text-gray-500 mt-2">
                Manage your Vission99 account
              </p>
            </div>

            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="bg-red-600 text-white px-5 py-3 rounded-lg hover:bg-red-700 transition"
            >
              Logout
            </motion.button>
          </div>

          <div className="mt-8 grid gap-6">
            <div className="border rounded-xl p-5">
              <h2 className="font-semibold text-lg mb-3">
                Account Information
              </h2>

              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">
                    Email Address
                  </p>

                  <p className="font-medium">
                    {user?.email || 'Not Available'}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Account Type
                  </p>

                  <p className="font-medium">
                    {isAdmin ? 'Administrator' : 'Customer'}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    User ID
                  </p>

                  <p className="font-medium break-all">
                    {user?.id}
                  </p>
                </div>
              </div>
            </div>

            {!isAdmin && (
              <div className="border rounded-xl p-5">
                <h2 className="font-semibold text-lg mb-3">
                  Customer Dashboard
                </h2>

                <div className="grid md:grid-cols-2 gap-4">
                  <motion.button
                    whileHover={{ y: -3 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => navigate('/dashboard')}
                    className="border rounded-lg p-4 text-left hover:bg-gray-50 transition"
                  >
                    <h3 className="font-semibold">
                      Dashboard
                    </h3>
                    <p className="text-sm text-gray-500">
                      View your activity
                    </p>
                  </motion.button>

                  <motion.button
                    whileHover={{ y: -3 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => navigate('/dashboard/favorites')}
                    className="border rounded-lg p-4 text-left hover:bg-gray-50 transition"
                  >
                    <h3 className="font-semibold">
                      Favorites
                    </h3>
                    <p className="text-sm text-gray-500">
                      Saved properties
                    </p>
                  </motion.button>

                  <motion.button
                    whileHover={{ y: -3 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => navigate('/dashboard/bookings')}
                    className="border rounded-lg p-4 text-left hover:bg-gray-50 transition"
                  >
                    <h3 className="font-semibold">
                      Site Visits
                    </h3>
                    <p className="text-sm text-gray-500">
                      View your bookings
                    </p>
                  </motion.button>

                  <motion.button
                    whileHover={{ y: -3 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => navigate('/dashboard/enquiries')}
                    className="border rounded-lg p-4 text-left hover:bg-gray-50 transition"
                  >
                    <h3 className="font-semibold">
                      Enquiries
                    </h3>
                    <p className="text-sm text-gray-500">
                      View submitted enquiries
                    </p>
                  </motion.button>
                </div>
              </div>
            )}

            {isAdmin && (
              <div className="border rounded-xl p-5">
                <h2 className="font-semibold text-lg mb-3">
                  Admin Controls
                </h2>

                <motion.button
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => navigate('/admin')}
                  className="bg-champagne-gold text-deep-black px-5 py-3 rounded-lg font-semibold"
                >
                  Open Admin Dashboard
                </motion.button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}