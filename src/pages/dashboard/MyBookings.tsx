import { useNavigate } from 'react-router-dom';

export default function MyBookings() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-deep-black px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl p-8 shadow-xl">
          <h1 className="text-3xl font-bold text-deep-black mb-2">
            My Site Visit Bookings
          </h1>

          <p className="text-gray-500 mb-8">
            Track all your scheduled site visits here.
          </p>

          <div className="border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center">
            <h2 className="text-xl font-semibold mb-3">
              No Site Visits Booked Yet
            </h2>

            <p className="text-gray-500 mb-6">
              When you book a site visit, it will appear here with date,
              time and booking status.
            </p>

            <button
              onClick={() => navigate('/projects')}
              className="bg-champagne-gold text-deep-black px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition"
            >
              Explore Properties
            </button>
          </div>

          <div className="mt-10 grid md:grid-cols-3 gap-5">
            <div className="bg-gray-50 rounded-xl p-5 border">
              <h3 className="font-semibold mb-2">
                Upcoming Visits
              </h3>

              <p className="text-3xl font-bold text-deep-black">
                0
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-5 border">
              <h3 className="font-semibold mb-2">
                Completed Visits
              </h3>

              <p className="text-3xl font-bold text-deep-black">
                0
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-5 border">
              <h3 className="font-semibold mb-2">
                Cancelled Visits
              </h3>

              <p className="text-3xl font-bold text-deep-black">
                0
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}