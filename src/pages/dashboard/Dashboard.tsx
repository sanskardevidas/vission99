import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-deep-black px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Card */}
        <div className="bg-white rounded-2xl p-8 shadow-xl mb-8">
          <h1 className="text-3xl font-bold text-deep-black">
            Welcome Back
          </h1>

          <p className="text-gray-500 mt-2">
            {user?.email}
          </p>

          <p className="mt-4 text-gray-700">
            Manage your property journey, saved projects,
            bookings and enquiries from one place.
          </p>
        </div>

        {/* Dashboard Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <button
            onClick={() => navigate('/dashboard/favorites')}
            className="bg-white rounded-2xl p-6 text-left shadow-lg hover:scale-105 transition"
          >
            <h3 className="font-bold text-xl mb-2">
              Favorites
            </h3>

            <p className="text-gray-600 text-sm">
              View your saved properties
            </p>
          </button>

          <button
            onClick={() => navigate('/dashboard/bookings')}
            className="bg-white rounded-2xl p-6 text-left shadow-lg hover:scale-105 transition"
          >
            <h3 className="font-bold text-xl mb-2">
              Site Visits
            </h3>

            <p className="text-gray-600 text-sm">
              Manage your bookings
            </p>
          </button>

          <button
            onClick={() => navigate('/dashboard/enquiries')}
            className="bg-white rounded-2xl p-6 text-left shadow-lg hover:scale-105 transition"
          >
            <h3 className="font-bold text-xl mb-2">
              Enquiries
            </h3>

            <p className="text-gray-600 text-sm">
              Track submitted enquiries
            </p>
          </button>

          <button
            onClick={() => navigate('/profile')}
            className="bg-white rounded-2xl p-6 text-left shadow-lg hover:scale-105 transition"
          >
            <h3 className="font-bold text-xl mb-2">
              Profile
            </h3>

            <p className="text-gray-600 text-sm">
              Manage your account
            </p>
          </button>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl p-8 shadow-xl mt-8">
          <h2 className="text-2xl font-bold mb-4">
            Quick Actions
          </h2>

          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => navigate('/projects')}
              className="bg-champagne-gold text-deep-black px-5 py-3 rounded-lg font-semibold"
            >
              Browse Properties
            </button>

            <button
              onClick={() => navigate('/#book')}
              className="border border-gray-300 px-5 py-3 rounded-lg font-semibold"
            >
              Book Consultation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}