import { Star, Quote, Users, Building2, Clock, Shield, Award } from 'lucide-react';
import SectionHeader from '../components/SectionHeader';
import { testimonials } from '../data/testimonials';

const bottomStats = [
  { icon: <Users className="w-4 h-4" />, value: '500+', label: 'Families Assisted' },
  { icon: <Building2 className="w-4 h-4" />, value: '20+', label: 'Builder Partnerships' },
  { icon: <Clock className="w-4 h-4" />, value: '10+', label: 'Years of Experience' },
  { icon: <Shield className="w-4 h-4" />, value: '100%', label: 'Transparent Guidance' },
  { icon: <Award className="w-4 h-4" />, value: '4.9/5', label: 'Client Satisfaction' },
];

const scrollingTestimonials = [...testimonials, ...testimonials];

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

      <div className="relative mt-4 md:mt-8 overflow-hidden">
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-20 md:w-40 bg-gradient-to-r from-warm-ivory to-transparent z-10" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-20 md:w-40 bg-gradient-to-l from-warm-ivory to-transparent z-10" />

       <div className="animate-testimonial-scroll gap-6 hover:[animation-play-state:paused]">
          {scrollingTestimonials.map((t, i) => (
            <div
              key={`${t.id}-${i}`}
              className="w-[330px] md:w-[520px] lg:w-[640px] bg-white rounded-2xl border border-stone-gray/30 overflow-hidden shrink-0"
            >
              <div className="relative h-40 md:h-48 overflow-hidden">
                <img
                  src={t.image}
                  alt={t.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white via-white/5 to-transparent" />
                <span className="absolute top-2 left-3 px-2 py-1 rounded-full bg-champagne-gold/15 text-champagne-gold text-[10px] font-sans font-medium border border-champagne-gold/30">
                  {t.location}
                </span>
              </div>

              <div className="p-5 md:p-7">
                <Quote className="w-5 h-5 text-champagne-gold/30 mb-3" />

                <p className="font-sans text-sm md:text-base text-charcoal leading-relaxed mb-5">
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
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <div className="mt-16 md:mt-20 bg-charcoal rounded-3xl p-6 md:p-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {bottomStats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="w-8 h-8 rounded-full bg-champagne-gold/10 flex items-center justify-center text-champagne-gold mx-auto mb-2">
                  {s.icon}
                </div>
                <p className="font-serif text-xl md:text-1xl font-bold text-white">
                  {s.value}
                </p>
                <p className="font-sans text-xs text-stone-gray">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}