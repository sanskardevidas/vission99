import { motion } from 'framer-motion';
import { Heart, MapPin, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Project } from '../types';

interface ProjectCardProps {
  project: Project;
  index?: number;
}

export default function ProjectCard({ project, index = 0 }: ProjectCardProps) {
  const navigate = useNavigate();

  const badgeColors: Record<string, string> = {
    Premium: 'bg-champagne-gold/20 text-champagne-gold border-champagne-gold/30',
    'New Launch': 'bg-green-500/20 text-green-400 border-green-500/30',
    Luxury: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    'Best Seller': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'Ultra Luxury': 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: 'easeOut' }}
      whileHover={{ y: -8 }}
      className="group relative min-w-[320px] md:min-w-[380px] rounded-2xl overflow-hidden bg-charcoal border border-white/5 cursor-pointer shrink-0"
      onClick={() => navigate(`/projects/${project.slug}`)}
    >
      <div className="relative h-64 md:h-72 overflow-hidden">
        <img
          src={project.images[0]}
          alt={project.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/40 to-transparent" />
        <div className="absolute top-4 left-4 flex gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-sans font-medium border ${badgeColors[project.badge] || 'bg-white/10 text-white border-white/20'}`}>
            {project.badge}
          </span>
          {project.vrAvailable && (
            <span className="px-3 py-1 rounded-full text-xs font-sans font-medium bg-champagne-gold/20 text-champagne-gold border border-champagne-gold/30">
              360° VR
            </span>
          )}
        </div>
        <button
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white/60 hover:text-champagne-gold transition"
          onClick={(e) => e.stopPropagation()}
        >
          <Heart className="w-4 h-4" />
        </button>
      </div>

      <div className="p-5 md:p-6">
        <div className="flex items-center gap-1.5 text-champagne-gold text-xs font-sans mb-2">
          <MapPin className="w-3 h-3" />
          {project.location}, Pune
        </div>
        <h3 className="font-serif text-xl md:text-2xl font-bold text-white mb-1">{project.name}</h3>
        <p className="text-stone-gray text-sm font-sans mb-3">{project.configuration}</p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-champagne-gold font-sans font-semibold text-lg">{project.price}</p>
            <p className="text-muted-gray text-xs font-sans">Onwards | Possession: {project.possession}</p>
          </div>
          <motion.button
            whileHover={{ x: 4 }}
            className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/60 group-hover:border-champagne-gold group-hover:text-champagne-gold group-hover:bg-champagne-gold/10 transition-all duration-300"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/projects/${project.slug}`);
            }}
          >
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      <div className="absolute inset-0 rounded-2xl border border-champagne-gold/0 group-hover:border-champagne-gold/40 transition-all duration-500 pointer-events-none" />
    </motion.div>
  );
}
