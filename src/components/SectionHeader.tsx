import { motion } from 'framer-motion';

interface SectionHeaderProps {
  label: string;
  heading: string;
  goldText?: string;
  subtext?: string;
  center?: boolean;
  light?: boolean;
}

export default function SectionHeader({
  label,
  heading,
  goldText,
  subtext,
  center = true,
  light = false,
}: SectionHeaderProps) {
  const renderHeading = () => {
    if (!goldText) return heading;
    const parts = heading.split(goldText);
    return (
      <>
        {parts[0]}<span className="text-champagne-gold">{goldText}</span>{parts[1]}
      </>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      className={`mb-12 md:mb-16 ${center ? 'text-center max-w-3xl mx-auto' : 'max-w-2xl'}`}
    >
      <p className="text-champagne-gold font-sans text-xs md:text-sm tracking-[0.2em] uppercase mb-4">
        {label}
      </p>
      <h2
        className={`font-serif text-4xl md:text-5xl lg:text-6xl font-bold leading-tight ${
          light ? 'text-charcoal' : 'text-white'
        }`}
      >
        {renderHeading()}
      </h2>
      {subtext && (
        <p className={`mt-5 font-sans text-base md:text-lg leading-relaxed ${light ? 'text-muted-gray' : 'text-stone-gray'}`}>
          {subtext}
        </p>
      )}
    </motion.div>
  );
}
