import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Eye, GitCompare, Shield, BadgePercent, ArrowRight } from 'lucide-react';
import SectionHeader from '../components/SectionHeader';
import ProjectCard from '../components/ProjectCard';
import { getFeaturedProjects } from '../utils/storage';
import type { Project } from '../types';

const benefits = [
  { icon: <Eye className="w-5 h-5" />, title: 'Immersive VR Tours', desc: 'Walk through every detail before you visit.' },
  { icon: <GitCompare className="w-5 h-5" />, title: 'Compare Projects', desc: 'Side by side comparison made simple.' },
  { icon: <Shield className="w-5 h-5" />, title: 'Expert Guidance', desc: 'Get advice from Pune\'s top real estate experts.' },
  { icon: <BadgePercent className="w-5 h-5" />, title: 'Best Price Deals', desc: 'Exclusive offers &amp; benefits only for you.' },
];

export default function FeaturedExperiencesSection() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const loadProjects = async () => {
      try {
      const data = await getFeaturedProjects();
      if (Array.isArray(data)) {
        setProjects(data);
      } else {
        setProjects([]);
      }
    } catch (error) {
      console.error('Failed to load featured projects:', error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  loadProjects();
}, []);

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = 400;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  return (
    <section className="bg-premium-ivory section-padding">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeader
          label="Featured Experiences"
          heading="Handpicked Luxury Projects For You"
          goldText="For You"
          subtext="Explore our curated collection of premium projects across Pune. Each project is selected to deliver exceptional lifestyle, value and long-term growth."
          light
        />

        <div className="relative">
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto pb-4 -mx-6 px-6 scrollbar-hide scroll-smooth"
          >
            {loading ? (
              <div className="w-full text-center py-10">
                Loading projects...
              </div>
            ) : (
              projects.map((project, i) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  index={i}
                />
              ))
            )}
          </div>

          <div className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 z-10">
            <button
              onClick={() => scroll('left')}
              className="w-12 h-12 rounded-full bg-white border border-stone-gray/30 flex items-center justify-center text-charcoal hover:border-champagne-gold hover:text-champagne-gold transition shadow-lg"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>
          <div className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10">
            <button
              onClick={() => scroll('right')}
              className="w-12 h-12 rounded-full bg-white border border-stone-gray/30 flex items-center justify-center text-charcoal hover:border-champagne-gold hover:text-champagne-gold transition shadow-lg"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>
          <div className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10">
            <button
              onClick={() => scroll('right')}
              className="w-12 h-12 rounded-full bg-white border border-stone-gray/30 flex items-center justify-center text-charcoal hover:border-champagne-gold hover:text-champagne-gold transition shadow-lg"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 md:mt-20 grid grid-cols-2 md:grid-cols-4 gap-5"
        >
          {benefits.map((b, i) => (
            <motion.div
              key={b.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-white rounded-2xl border border-stone-gray/30 p-5 hover:border-champagne-gold/50 transition-all"
            >
              <div className="w-10 h-10 rounded-lg bg-champagne-gold/10 flex items-center justify-center text-champagne-gold mb-3">
                {b.icon}
              </div>
              <h4 className="font-sans font-semibold text-sm text-charcoal mb-1">{b.title}</h4>
              <p className="font-sans text-xs text-muted-gray">{b.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        <div className="mt-10 text-center">
          <motion.button
            whileHover={{ y: -2 }}
            className="bg-transparent border border-charcoal/20 text-charcoal font-sans font-semibold px-8 py-3.5 rounded-xl flex items-center gap-2 mx-auto hover:border-champagne-gold hover:text-champagne-gold transition-all duration-300"
          >
            View All Projects
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </section>
  );
}
