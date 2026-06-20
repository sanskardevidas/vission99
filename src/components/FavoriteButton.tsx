import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  addFavorite,
  removeFavorite,
  isFavorite,
} from '../services/favoriteService';

interface FavoriteButtonProps {
  projectId: string;
}

export default function FavoriteButton({
  projectId,
}: FavoriteButtonProps) {
  const { user } = useAuth();

  const [favorite, setFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function checkFavoriteStatus() {
      if (!user) return;

      const result = await isFavorite(
        user.id,
        projectId
      );

      setFavorite(result.isFavorite);
    }

    checkFavoriteStatus();
  }, [user, projectId]);

  async function handleFavorite() {
    if (!user) {
      alert('Please login first');
      return;
    }

    setLoading(true);

    if (favorite) {
      await removeFavorite(user.id, projectId);
      setFavorite(false);
    } else {
      await addFavorite(user.id, projectId);
      setFavorite(true);
    }

    setLoading(false);
  }

  return (
    <button
      onClick={handleFavorite}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
        favorite
          ? 'bg-red-500 text-white'
          : 'bg-white border border-gray-300 text-gray-700'
      }`}
    >
      <Heart
        className={`w-4 h-4 ${
          favorite ? 'fill-current' : ''
        }`}
      />

      {favorite
        ? 'Saved'
        : 'Save Property'}
    </button>
  );
}