import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MapPin, Calendar, Ruler, FileText, Rotate3d, Phone,
  Download, ArrowRight, ChevronLeft, ChevronRight, Heart,
  Share2, Eye, Shield, CheckCircle, ArrowLeft,
} from 'lucide-react';
import { getProjectBySlug, getPublishedProjects } from '../utils/storage';
import ProjectCard from '../components/ProjectCard';
import LeadForm from '../components/LeadForm';
import FavoriteButton from '../components/FavoriteButton';
import CompareButton from '../components/CompareButton';

export default function ProjectDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const project = slug ? getProjectBySlug(slug) : undefined;
  const [activeImage, setActiveImage] = useState(0);

  if (!project) {
    return (
      <div className="min-h-screen bg-premium-ivory flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-serif text-4xl font-bold text-charcoal mb-4">Project Not Found</h1>
          <button onClick={() => navigate('/projects')} className="text-champagne-gold font-sans flex items-center gap-2 mx-auto">
            <ArrowLeft className="w-4 h-4" /> Back to Projects
          </button>
        </div>
      </div>
    );
  }

  const similarProjects = getPublishedProjects()
    .filter((p) => p.location === project.location && p.id !== project.id)
    .slice(0, 3);

  const badgeColors: Record<string, string> = {
    Premium: 'bg-champagne-gold/20 text-champagne-gold border-champagne-gold/30',
    'New Launch': 'bg-green-500/20 text-green-400 border-green-500/30',
    Luxury: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    'Best Seller': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'Ultra Luxury': 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  return (
    <div className="min-h-screen bg-premium-ivory">
      <div className="relative h-[50vh] md:h-[60vh] bg-deep-black overflow-hidden">
        <img
          src={project.images[activeImage] || project.images[0]}
          alt={project.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-deep-black/80 via-deep-black/20 to-transparent" />

        <div className="absolute top-24 left-6 right-6 flex items-start justify-between z-10">
          <button
            onClick={() => navigate('/projects')}
            className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white/80 hover:bg-white/20 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex gap-2">
            <FavoriteButton projectId={project.slug} />
            <button className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white/80 hover:bg-white/20 transition">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="absolute bottom-6 left-6 right-6 z-10">
          <div className="flex gap-2 mb-3">
            <span className={`px-3 py-1 rounded-full text-xs font-sans font-medium border ${badgeColors[project.badge] || 'bg-white/10 text-white border-white/20'}`}>
              {project.badge}
            </span>
            {project.vrAvailable && (
              <span className="px-3 py-1 rounded-full text-xs font-sans font-medium bg-champagne-gold/20 text-champagne-gold border border-champagne-gold/30">
                360° VR
              </span>
            )}
          </div>
          <div className="flex gap-3 overflow-x-auto">
            {project.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(i)}
                className={`w-16 h-12 rounded-lg overflow-hidden shrink-0 border-2 transition ${
                  i === activeImage ? 'border-champagne-gold' : 'border-white/20'
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-1.5 text-champagne-gold text-xs font-sans mb-2">
                <MapPin className="w-3.5 h-3.5" /> {project.location}, Pune
              </div>
              <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-charcoal mb-2">
                {project.name}
              </h1>
              <p className="font-sans text-sm text-muted-gray mb-6">{project.configuration}</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white rounded-xl border border-stone-gray/30 p-4">
                  <p className="text-champagne-gold font-sans text-xs uppercase tracking-wider mb-1">Starting Price</p>
                  <p className="font-serif text-xl font-bold text-charcoal">{project.price}</p>
                </div>
                <div className="bg-white rounded-xl border border-stone-gray/30 p-4">
                  <p className="text-champagne-gold font-sans text-xs uppercase tracking-wider mb-1">Possession</p>
                  <p className="font-serif text-xl font-bold text-charcoal">{project.possession}</p>
                </div>
                <div className="bg-white rounded-xl border border-stone-gray/30 p-4">
                  <p className="text-champagne-gold font-sans text-xs uppercase tracking-wider mb-1">Carpet Area</p>
                  <p className="font-serif text-xl font-bold text-charcoal">{project.carpetArea}</p>
                </div>
                <div className="bg-white rounded-xl border border-stone-gray/30 p-4">
                  <p className="text-champagne-gold font-sans text-xs uppercase tracking-wider mb-1">RERA</p>
                  <p className="font-sans text-sm font-bold text-charcoal">{project.reraNumber}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 mb-8">
                {project.vrAvailable && (
                  <motion.button
                    whileHover={{ y: -2 }}
                    className="bg-champagne-gold text-deep-black font-sans font-semibold px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-soft-gold transition"
                  >
                    <Rotate3d className="w-4 h-4" /> Start VR Tour
                  </motion.button>
                )}
                <CompareButton projectId={project.slug} />
                <motion.button
                  whileHover={{ y: -2 }}
                  className="bg-transparent border border-charcoal/20 text-charcoal font-sans font-semibold px-6 py-3 rounded-xl flex items-center gap-2 hover:border-champagne-gold hover:text-champagne-gold transition"
                >
                  <Download className="w-4 h-4" /> Download Brochure
                </motion.button>
                <motion.button
                  whileHover={{ y: -2 }}
                  onClick={() => {
                    alert(
                      'Site Visit Booking feature will be connected to Supabase in Phase 2.'
                    );
                  }}
                  className="bg-transparent border border-charcoal/20 text-charcoal font-sans font-semibold px-6 py-3 rounded-xl flex items-center gap-2 hover:border-champagne-gold hover:text-champagne-gold transition"
                >
                  <Phone className="w-4 h-4" />
                  Book Site Visit
                </motion.button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-serif text-2xl font-bold text-charcoal mb-4">Overview</h2>
              <p className="font-sans text-sm text-muted-gray leading-relaxed">{project.description}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-serif text-2xl font-bold text-charcoal mb-4">Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {project.amenities.map((a) => (
                  <div key={a} className="flex items-center gap-2 bg-white rounded-xl border border-stone-gray/30 p-3">
                    <CheckCircle className="w-4 h-4 text-champagne-gold shrink-0" />
                    <span className="font-sans text-sm text-charcoal">{a}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-serif text-2xl font-bold text-charcoal mb-4">Floor Plans</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {project.floorPlans.map((fp, i) => (
                  <div key={i} className="bg-white rounded-xl border border-stone-gray/30 p-4 overflow-hidden">
                    <img src={fp} alt={`Floor plan ${i + 1}`} className="w-full h-48 object-cover rounded-lg" />
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-charcoal rounded-2xl p-8 text-center"
            >
              <Rotate3d className="w-10 h-10 text-champagne-gold mx-auto mb-3" />
              <h3 className="font-serif text-2xl font-bold text-white mb-2">VR Walkthrough</h3>
              <p className="text-stone-gray font-sans text-sm mb-4">
                Experience this property in immersive 3D &amp; VR from anywhere.
              </p>
              <motion.button
                whileHover={{ y: -2 }}
                className="bg-champagne-gold text-deep-black font-sans font-semibold px-6 py-3 rounded-xl inline-flex items-center gap-2 hover:bg-soft-gold transition"
              >
                Start VR Tour <ArrowRight className="w-4 h-4" />
              </motion.button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-serif text-2xl font-bold text-charcoal mb-4">Location</h2>
              <div className="bg-white rounded-xl border border-stone-gray/30 overflow-hidden h-64">
                <div className="w-full h-full bg-premium-ivory flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-8 h-8 text-champagne-gold mx-auto mb-2" />
                    <p className="font-sans text-sm text-muted-gray">{project.address}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-serif text-2xl font-bold text-charcoal mb-4">Builder Details</h2>
              <div className="bg-white rounded-xl border border-stone-gray/30 p-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-champagne-gold/10 flex items-center justify-center text-champagne-gold">
                    <Shield className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-serif text-lg font-bold text-charcoal">{project.builder}</h4>
                    <p className="font-sans text-sm text-muted-gray">RERA Registered Builder</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-charcoal rounded-2xl border border-white/10 p-6 sticky top-28"
            >
              <h3 className="font-serif text-xl font-bold text-white mb-1">Get Expert Callback</h3>
              <p className="text-stone-gray font-sans text-sm mb-6">
                Interested in {project.name}? Our experts will guide you.
              </p>
              <LeadForm source={`project-${project.slug}`} variant="callback" />
            </motion.div>
          </div>
        </div>

        {similarProjects.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16"
          >
            <h2 className="font-serif text-2xl font-bold text-charcoal mb-6">Similar Projects</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {similarProjects.map((p, i) => (
                <ProjectCard key={p.id} project={p} index={i} />
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
