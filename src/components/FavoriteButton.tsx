import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.94 }}
      onClick={handleFavorite}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-300 disabled:opacity-60 ${
        favorite
          ? 'bg-red-500 text-white'
          : 'bg-white border border-gray-300 text-gray-700'
      }`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={favorite ? 'on' : 'off'}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          className="inline-flex"
        >
          <Heart className={`w-4 h-4 ${favorite ? 'fill-current' : ''}`} />
        </motion.span>
      </AnimatePresence>

      {favorite
        ? 'Saved'
        : 'Save Property'}
    </motion.button>
  );
}