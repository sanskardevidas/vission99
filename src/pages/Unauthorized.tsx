import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Unauthorized() {
  return (
    <div className="min-h-screen bg-deep-black flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.15, type: 'spring', stiffness: 260, damping: 18 }}
          className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center"
        >
          <span className="text-4xl">⛔</span>
        </motion.div>

        <h1 className="text-3xl font-bold text-deep-black mb-3">
          Access Denied
        </h1>

        <p className="text-gray-600 mb-8 leading-relaxed">
          You do not have permission to access this page.
          This area is restricted to authorized administrators only.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.96 }}>
            <Link
              to="/"
              className="block bg-champagne-gold text-deep-black font-semibold px-6 py-3 rounded-lg hover:opacity-90 transition"
            >
              Back To Home
            </Link>
          </motion.div>

          <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.96 }}>
            <Link
              to="/login"
              className="block border border-gray-300 text-gray-700 font-semibold px-6 py-3 rounded-lg hover:bg-gray-50 transition"
            >
              Login
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}