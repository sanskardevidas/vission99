import { motion } from 'framer-motion';
import { Star, Quote, Shield, Award } from 'lucide-react';
import SectionHeader from '../components/SectionHeader';
import { testimonials } from '../data/testimonials';
import { COMPANY_STATS as S } from '../data/stats';

// Only figures not already shown in the Hero / Founder sections, so numbers aren't repeated down the page.
const bottomStats = [
  { icon: <Award className="w-4 h-4" />, value: S.rating, label: S.ratingLabel },
  { icon: <Shield className="w-4 h-4" />, value: '100%', label: 'Transparent Guidance' },
];

export default function SuccessStoriesSection() {
  return (
    <section className="bg-warm-ivory section-padding overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeader
          label="Success Stories"
          heading="Real Stories. Real People. Real Trust."
          goldText="Real Trust"
          subtext="Hear from buyers and investors who found the right property with trusted guidance, verified projects and complete support."
          light
        />
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-4 md:mt-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((t) => (
            <motion.div
              key={t.id}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl border border-stone-gray/30 overflow-hidden flex flex-col"
            >
              <div className="relative h-36 overflow-hidden">
                <img
                  src={t.image}
                  alt={t.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white via-white/5 to-transparent" />
                <span className="absolute top-2 left-3 px-2 py-1 rounded-full bg-champagne-gold/15 text-champagne-gold text-[10px] font-sans font-medium border border-champagne-gold/30">
                  {t.location}
                </span>
              </div>

              <div className="p-5 flex flex-col flex-1">
                <Quote className="w-5 h-5 text-champagne-gold/30 mb-3" />

                <p className="font-sans text-sm text-charcoal leading-relaxed mb-5 flex-1">
                  &ldquo;{t.quote}&rdquo;
                </p>

                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: 5 }).map((_, si) => (
                    <Star
                      key={si}
                      className="w-4 h-4 fill-champagne-gold text-champagne-gold"
                    />
                  ))}
                </div>

                <div className="flex items-center gap-3">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />

                  <div>
                    <p className="font-sans text-sm font-semibold text-charcoal">
                      {t.name}
                    </p>
                    <p className="font-sans text-xs text-muted-gray">
                      {t.property}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.6 }}
          className="mt-16 md:mt-20 bg-charcoal rounded-3xl p-6 md:p-6"
        >
          <div className="grid grid-cols-2 gap-6 max-w-md mx-auto">
            {bottomStats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="text-center"
              >
                <div className="w-8 h-8 rounded-full bg-champagne-gold/10 flex items-center justify-center text-champagne-gold mx-auto mb-2">
                  {s.icon}
                </div>
                <p className="font-serif text-xl md:text-1xl font-bold text-white">
                  {s.value}
                </p>
                <p className="font-sans text-xs text-stone-gray">
                  {s.label}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}