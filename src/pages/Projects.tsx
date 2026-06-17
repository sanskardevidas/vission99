import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, Rotate3d, ArrowRight, X } from 'lucide-react';
import ProjectCard from '../components/ProjectCard';
import { getPublishedProjects } from '../utils/storage';
import { locations } from '../data/locations';

export default function Projects() {
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [config, setConfig] = useState('');
  const [vrOnly, setVrOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const allProjects = getPublishedProjects();

  const filtered = useMemo(() => {
    return allProjects.filter((p) => {
      const matchesSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.location.toLowerCase().includes(search.toLowerCase()) ||
        p.builder.toLowerCase().includes(search.toLowerCase());
      const matchesLocation = !location || p.location === location;
      const matchesConfig = !config || p.configuration.includes(config);
      const matchesVr = !vrOnly || p.vrAvailable;
      return matchesSearch && matchesLocation && matchesConfig && matchesVr;
    });
  }, [allProjects, search, location, config, vrOnly]);

  const resetFilters = () => {
    setSearch('');
    setLocation('');
    setConfig('');
    setVrOnly(false);
  };

  return (
    <div className="min-h-screen bg-premium-ivory">
      <div className="bg-deep-black pt-32 pb-16 md:pt-40 md:pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-champagne-gold font-sans text-xs tracking-[0.2em] uppercase mb-4">
              Explore Projects
            </p>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
              Explore Premium <span className="text-champagne-gold">Projects</span>
            </h1>
            <p className="text-stone-gray font-sans text-base md:text-lg max-w-2xl">
              Find luxury homes, investment opportunities and VR-enabled property experiences across Pune.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl border border-stone-gray/30 p-4 md:p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-gray" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search projects by name, location, builder..."
                className="w-full pl-11 pr-4 py-3 bg-premium-ivory rounded-xl font-sans text-sm text-charcoal placeholder-muted-gray focus:outline-none focus:ring-2 focus:ring-champagne-gold/30 transition"
              />
            </div>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="px-4 py-3 bg-premium-ivory rounded-xl font-sans text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-champagne-gold/30 appearance-none"
            >
              <option value="">All Locations</option>
              {locations.map((l) => (
                <option key={l.id} value={l.name}>{l.name}</option>
              ))}
            </select>
            <select
              value={config}
              onChange={(e) => setConfig(e.target.value)}
              className="px-4 py-3 bg-premium-ivory rounded-xl font-sans text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-champagne-gold/30 appearance-none"
            >
              <option value="">All Configurations</option>
              <option value="2 BHK">2 BHK</option>
              <option value="3 BHK">3 BHK</option>
              <option value="4 BHK">4 BHK</option>
              <option value="5 BHK">5 BHK</option>
            </select>
            <label className="flex items-center gap-2 px-4 py-3 bg-premium-ivory rounded-xl cursor-pointer">
              <Rotate3d className="w-4 h-4 text-champagne-gold" />
              <span className="font-sans text-sm text-charcoal">VR Available</span>
              <input
                type="checkbox"
                checked={vrOnly}
                onChange={(e) => setVrOnly(e.target.checked)}
                className="accent-champagne-gold"
              />
            </label>
            <button
              onClick={resetFilters}
              className="px-4 py-3 text-muted-gray font-sans text-sm hover:text-charcoal transition flex items-center gap-1"
            >
              <X className="w-4 h-4" /> Reset
            </button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-serif text-2xl font-bold text-charcoal mb-2">No Projects Found</p>
            <p className="font-sans text-sm text-muted-gray">Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((project, i) => (
              <ProjectCard key={project.id} project={project} index={i} />
            ))}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 bg-charcoal rounded-2xl p-8 md:p-12 text-center"
        >
          <h3 className="font-serif text-2xl md:text-3xl font-bold text-white mb-3">
            Not Sure Which Project Is Right For You?
          </h3>
          <p className="text-stone-gray font-sans text-sm mb-6">
            Book a free expert consultation.
          </p>
          <motion.button
            whileHover={{ y: -2 }}
            className="bg-champagne-gold text-deep-black font-sans font-semibold px-8 py-3.5 rounded-xl inline-flex items-center gap-2 hover:bg-soft-gold hover:shadow-[0_0_25px_rgba(214,179,106,0.3)] transition-all duration-300"
          >
            Book Free Consultation
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
