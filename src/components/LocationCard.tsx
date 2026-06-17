import { motion } from 'framer-motion';
import { MapPin, ArrowUpRight } from 'lucide-react';
import type { Location } from '../types';

interface LocationCardProps {
  location: Location;
  index?: number;
  active?: boolean;
  onClick?: () => void;
}

export default function LocationCard({ location, index = 0, active, onClick }: LocationCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: 'easeOut' }}
      whileHover={{ y: -6 }}
      onClick={onClick}
      className={`group relative min-w-[260px] md:min-w-[240px] h-72 rounded-2xl overflow-hidden cursor-pointer shrink-0 transition-all duration-500 ${
        active ? 'ring-2 ring-champagne-gold' : ''
      }`}
    >
      <img
        src={location.image}
        alt={location.name}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-deep-black via-deep-black/50 to-transparent" />
      <div className="absolute inset-0 border border-white/0 group-hover:border-champagne-gold/40 rounded-2xl transition-all duration-500" />

      <div className="absolute bottom-0 left-0 right-0 p-5">
        <div className="flex items-center gap-2 text-champagne-gold text-xs font-sans mb-2">
          <MapPin className="w-3.5 h-3.5" />
          {location.name}
        </div>
        <h3 className="font-serif text-xl font-bold text-white mb-1">{location.name}</h3>
        <p className="text-stone-gray text-sm font-sans">{location.projectCount} Projects</p>
        <p className="text-muted-gray text-xs font-sans">{location.tagline}</p>
      </div>

      <div className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white/60 group-hover:bg-champagne-gold/20 group-hover:text-champagne-gold transition-all duration-300">
        <ArrowUpRight className="w-4 h-4" />
      </div>
    </motion.div>
  );
}
