import { Link } from 'react-router-dom';

export default function Unauthorized() {
  return (
    <div className="min-h-screen bg-deep-black flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
          <span className="text-4xl">⛔</span>
        </div>

        <h1 className="text-3xl font-bold text-deep-black mb-3">
          Access Denied
        </h1>

        <p className="text-gray-600 mb-8 leading-relaxed">
          You do not have permission to access this page.
          This area is restricted to authorized administrators only.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="bg-champagne-gold text-deep-black font-semibold px-6 py-3 rounded-lg hover:opacity-90 transition"
          >
            Back To Home
          </Link>

          <Link
            to="/login"
            className="border border-gray-300 text-gray-700 font-semibold px-6 py-3 rounded-lg hover:bg-gray-50 transition"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}