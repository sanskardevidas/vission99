import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  index?: number;
  dark?: boolean;
}

export default function FeatureCard({ icon, title, description, index = 0, dark = false }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-20px' }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: 'easeOut' }}
      className={`p-6 rounded-2xl border transition-all duration-300 ${
        dark
          ? 'bg-soft-charcoal border-white/5 hover:border-champagne-gold/30'
          : 'bg-white border-stone-gray/30 hover:border-champagne-gold/50'
      }`}
    >
      <div className="w-10 h-10 rounded-xl bg-champagne-gold/10 flex items-center justify-center text-champagne-gold mb-4">
        {icon}
      </div>
      <h4 className={`font-sans font-semibold text-base mb-2 ${dark ? 'text-white' : 'text-charcoal'}`}>
        {title}
      </h4>
      <p className={`font-sans text-sm leading-relaxed ${dark ? 'text-stone-gray' : 'text-muted-gray'}`}>
        {description}
      </p>
    </motion.div>
  );
}
