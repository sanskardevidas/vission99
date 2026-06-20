import { useNavigate } from 'react-router-dom';

export default function Favorites() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-deep-black px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl p-8 shadow-xl">
          <h1 className="text-3xl font-bold text-deep-black mb-2">
            Favorite Properties
          </h1>

          <p className="text-gray-500 mb-8">
            Properties you save will appear here.
          </p>

          <div className="border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center">
            <h2 className="text-xl font-semibold mb-3">
              No Favorite Properties Yet
            </h2>

            <p className="text-gray-500 mb-6">
              Start exploring projects and save the properties you like.
            </p>

            <button
              onClick={() => navigate('/projects')}
              className="bg-champagne-gold text-deep-black px-6 py-3 rounded-lg font-semibold"
            >
              Browse Properties
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}