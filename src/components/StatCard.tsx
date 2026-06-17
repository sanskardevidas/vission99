import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface StatCardProps {
  icon: ReactNode;
  value: string | number;
  label: string;
  dark?: boolean;
}

export default function StatCard({ icon, value, label, dark = true }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`flex flex-col items-center gap-2 p-4 rounded-xl ${
        dark ? 'text-center' : 'text-center'
      }`}
    >
      <div className="w-10 h-10 rounded-full bg-champagne-gold/10 flex items-center justify-center text-champagne-gold mb-1">
        {icon}
      </div>
      <p className={`font-serif text-2xl md:text-3xl font-bold ${dark ? 'text-white' : 'text-charcoal'}`}>
        {value}
      </p>
      <p className={`font-sans text-xs md:text-sm ${dark ? 'text-stone-gray' : 'text-muted-gray'}`}>
        {label}
      </p>
    </motion.div>
  );
}
