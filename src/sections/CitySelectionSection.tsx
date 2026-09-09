import { motion } from 'framer-motion';
import { ArrowRight, Eye, GitCompare, Shield, BadgePercent } from 'lucide-react';
import { Link } from 'react-router-dom';
import SectionHeader from '../components/SectionHeader';

const benefits = [
  { icon: <Eye className="w-5 h-5" />, title: 'Immersive VR Tours', desc: 'Walk through every detail before you visit.' },
  { icon: <GitCompare className="w-5 h-5" />, title: 'Compare Projects', desc: 'Side by side comparison made simple.' },
  { icon: <Shield className="w-5 h-5" />, title: 'Expert Guidance', desc: 'Get advice from Pune\'s top real estate experts.' },
  { icon: <BadgePercent className="w-5 h-5" />, title: 'Best Price Deals', desc: 'Exclusive offers &amp; benefits only for you.' },
];

export default function CitySelectionSection() {
  return (
    <section className="bg-warm-ivory section-padding">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeader
          label="Explore Properties"
          heading="Discover Our Verified Projects"
          goldText="Verified Projects"
          subtext="Every listed project is personally verified — real images, real location, real pricing, no surprises."
          light
        />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-5"
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
          <Link to="/projects">
            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.96 }}
              className="bg-transparent border border-charcoal/20 text-charcoal font-sans font-semibold px-8 py-3.5 rounded-xl flex items-center gap-2 mx-auto hover:border-champagne-gold hover:text-champagne-gold transition-all duration-300"
            >
              View All Projects
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </Link>
        </div>
      </div>
    </section>
  );
}
