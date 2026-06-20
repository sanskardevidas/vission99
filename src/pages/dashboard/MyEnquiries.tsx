import { useNavigate } from 'react-router-dom';

export default function MyEnquiries() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-deep-black px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl p-8 shadow-xl">
          <h1 className="text-3xl font-bold text-deep-black mb-2">
            My Enquiries
          </h1>

          <p className="text-gray-500 mb-8">
            Track all property enquiries submitted through Vission99.
          </p>

          <div className="border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center">
            <h2 className="text-xl font-semibold mb-3">
              No Enquiries Found
            </h2>

            <p className="text-gray-500 mb-6">
              When you enquire about a property, the details and status
              will appear here.
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
                Total Enquiries
              </h3>

              <p className="text-3xl font-bold text-deep-black">
                0
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-5 border">
              <h3 className="font-semibold mb-2">
                Active Enquiries
              </h3>

              <p className="text-3xl font-bold text-deep-black">
                0
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-5 border">
              <h3 className="font-semibold mb-2">
                Closed Enquiries
              </h3>

              <p className="text-3xl font-bold text-deep-black">
                0
              </p>
            </div>
          </div>

          <div className="mt-8 bg-blue-50 border border-blue-100 rounded-xl p-5">
            <h3 className="font-semibold text-blue-900 mb-2">
              Future Feature
            </h3>

            <p className="text-blue-700 text-sm">
              Here customers will be able to track enquiry status,
              assigned relationship manager, follow-ups, property updates,
              and consultation progress.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}