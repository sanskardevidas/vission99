import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Play, ArrowRight, Wifi, Building2, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import SectionHeader from '../components/SectionHeader';
import { getPublishedProjects } from '../utils/storage';
import type { Project } from '../types';

const whyItems = [
  {
    icon: <Wifi className="w-5 h-5" />,
    title: 'Excellent Connectivity',
    text: 'Well connected to major IT hubs, business districts & highways.',
  },
  {
    icon: <Building2 className="w-5 h-5" />,
    title: 'Verified Projects',
    text: 'Only real projects added by you from admin panel will appear here.',
  },
  {
    icon: <TrendingUp className="w-5 h-5" />,
    title: 'High Investment Potential',
    text: 'Compare pricing, location and long-term growth opportunities.',
  },
];

export default function CitySelectionSection() {
  const [projects, setProjects] = useState<Project[]>([]);
const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const loadProjects = async () => {
    try {
      const data = await getPublishedProjects();

      if (Array.isArray(data)) {
        setProjects(data);

        if (data.length > 0) {
          setActiveProjectId(data[0].id);
        }
      } else {
        setProjects([]);
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  loadProjects();
}, []);

const activeProject = useMemo(() => {
  if (!projects.length) return null;

  return (
    projects.find((p) => p.id === activeProjectId) ||
    projects[0]
  );
}, [projects, activeProjectId]);

  return (
    <section className="bg-warm-ivory section-padding">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeader
          label="Explore Properties"
          heading="Discover Verified Projects Added By You"
          goldText="Verified Projects"
          subtext="Only real published projects added from your admin panel will appear here with their actual image, location, building name and pricing."
          light
        />

        {loading ? (
          <div className="bg-white rounded-2xl border border-stone-gray/30 p-10 text-center">
            <p className="font-sans text-muted-gray">
              Loading projects...
              </p>
              </div>
              ) : projects.length === 0 ? (
              <div className="bg-white rounded-2xl border border-stone-gray/30 p-10 text-center">
                <Building2 className="w-12 h-12 text-champagne-gold mx-auto mb-4" />
                <h3 className="font-serif text-2xl font-bold text-charcoal mb-2">
                  No Projects Added Yet
                </h3>
                <p className="font-sans text-sm text-muted-gray mb-6">
                  Add and publish real projects from the admin panel. After that, they will show here automatically.
                </p>
                <Link to="/admin/projects/add">
                <button className="bg-champagne-gold text-deep-black font-sans font-semibold px-7 py-3 rounded-xl inline-flex items-center gap-2 hover:bg-soft-gold transition">
                  Add Project
                  <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
              </div>
              ) : (
          <>
            <div className="flex gap-5 overflow-x-auto pb-4 -mx-6 px-6 scrollbar-hide">
              {projects.map((project, i) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-30px' }}
                  transition={{ duration: 0.5, delay: i * 0.08, ease: 'easeOut' }}
                  whileHover={{ y: -6 }}
                  onClick={() => setActiveProjectId(project.id)}
                  className={`group relative min-w-[300px] md:min-w-[380px] h-72 rounded-2xl overflow-hidden cursor-pointer shrink-0 transition-all duration-500 ${
                    activeProjectId === project.id ? 'ring-2 ring-champagne-gold' : ''
                  }`}
                >
                  <img
                    src={project.images?.[0] || '/placeholder.jpg'}
                    alt={project.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-deep-black via-deep-black/50 to-transparent" />

                  <div className="absolute inset-0 border border-white/0 group-hover:border-champagne-gold/40 rounded-2xl transition-all duration-500" />

                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <div className="flex items-center gap-2 text-champagne-gold text-xs font-sans mb-2">
                      <MapPin className="w-3.5 h-3.5" />
                      {project.location}
                    </div>

                    <h3 className="font-serif text-xl md:text-2xl font-bold text-white mb-1">
                      {project.name}
                    </h3>

                    <p className="text-stone-gray text-sm font-sans">
                      {project.builder}
                    </p>

                    <p className="text-muted-gray text-xs font-sans">
                      {project.price} • {project.configuration}
                    </p>
                  </div>

                  <div className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white/60 group-hover:bg-champagne-gold/20 group-hover:text-champagne-gold transition-all duration-300">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-16 grid lg:grid-cols-2 gap-10">
              <div>
                <h3 className="font-serif text-2xl md:text-3xl font-bold text-charcoal mb-8">
                  Why These Projects?
                </h3>

                <div className="space-y-6">
                  {whyItems.map((item, i) => (
                    <motion.div
                      key={item.title}
                      initial={{ opacity: 0, x: -30 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: i * 0.1 }}
                      className="flex gap-4"
                    >
                      <div className="w-12 h-12 rounded-xl bg-champagne-gold/10 flex items-center justify-center text-champagne-gold shrink-0">
                        {item.icon}
                      </div>

                      <div>
                        <h4 className="font-sans font-semibold text-charcoal text-base mb-1">
                          {item.title}
                        </h4>
                        <p className="font-sans text-sm text-muted-gray leading-relaxed">
                          {item.text}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <Link to="/projects">
                  <motion.button
                    whileHover={{ y: -2 }}
                    className="mt-8 bg-champagne-gold text-deep-black font-sans font-semibold px-8 py-3.5 rounded-xl flex items-center gap-2 hover:bg-soft-gold hover:shadow-[0_0_25px_rgba(214,179,106,0.3)] transition-all duration-300"
                  >
                    View All Projects
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </Link>
              </div>

              <div className="space-y-6">
                <div className="relative rounded-2xl overflow-hidden h-64 md:h-80">
                  <img
                    src={activeProject?.images?.[0] || '/placeholder.jpg'}
                    alt={activeProject?.name}
                    className="w-full h-full object-cover"
                  />

                  <div className="absolute inset-0 bg-charcoal/55" />

                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center px-6">
                      <p className="text-champagne-gold font-sans text-xs tracking-[0.2em] uppercase mb-2">
                        {activeProject?.location}
                      </p>

                      <p className="font-serif text-3xl font-bold text-white">
                        {activeProject?.name}
                      </p>

                      <p className="font-sans text-sm text-stone-gray mt-2">
                        {activeProject?.priceRange}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-stone-gray/30 p-6 flex items-center gap-5">
                  <div className="w-16 h-16 rounded-xl bg-champagne-gold/10 flex items-center justify-center text-champagne-gold shrink-0">
                    <Play className="w-6 h-6" />
                  </div>

                  <div>
                    <h4 className="font-serif text-lg font-bold text-charcoal">
                      {activeProject?.name}
                    </h4>

                    <p className="font-sans text-sm text-muted-gray">
                      {activeProject?.builder} • {activeProject?.configuration}
                    </p>

                    <Link
                      to={`/projects/${activeProject?.slug}`}
                      className="text-champagne-gold font-sans text-sm font-medium flex items-center gap-1 mt-1 hover:gap-2 transition-all"
                    >
                      View Project <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}