import { motion } from 'framer-motion';
import founderImage from '../assets/founder.jpg';
import {
  Users,
  Building2,
  Clock,
  Globe2,
  Quote,
  MapPin,
  Handshake,
  Megaphone,
  BadgeCheck,
} from 'lucide-react';

const stats = [
  { icon: <Users className="w-4 h-4 md:w-5 md:h-5" />, value: '500+', label: 'Families Assisted' },
  { icon: <Building2 className="w-4 h-4 md:w-5 md:h-5" />, value: '20+', label: 'Builder Partnerships' },
  { icon: <Globe2 className="w-4 h-4 md:w-5 md:h-5" />, value: '3', label: 'Global Offices' },
  { icon: <Clock className="w-4 h-4 md:w-5 md:h-5" />, value: '10+', label: 'Years of Experience' },
];

const presence = [
  {
    location: 'Pune, India',
    text: "Premium residential and investment opportunities in one of India's fastest-growing markets.",
  },
  {
    location: 'Dubai, UAE',
    text: 'Access to world-class developments and global investment opportunities through trusted partnerships.',
  },
  {
    location: 'Southampton, United Kingdom',
    text: 'Supporting international operations, marketing and strategic growth.',
  },
];

const promiseItems = [
  'Honest advice',
  'Verified projects',
  'Dedicated support',
  'Long-term relationships',
];

export default function FounderSection() {
  return (
    <section id="founder" className="bg-premium-ivory py-12 md:py-24 lg:py-28">
      <div className="max-w-7xl mx-auto px-5 md:px-6">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-champagne-gold font-sans text-[10px] md:text-sm tracking-[0.2em] uppercase mb-3 md:mb-5"
            >
              Building Trust Across Borders
            </motion.p>

            <motion.h2
              initial={{ opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.65, delay: 0.08 }}
              className="font-serif text-3xl md:text-5xl lg:text-6xl font-bold text-charcoal leading-[1.05] mb-4 md:mb-6"
            >
              Built On Trust.
              <br />
              Driven By Expertise.
              <br />
              <span className="text-champagne-gold">Focused On You.</span>
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: 0.15 }}
              className="space-y-3 text-muted-gray font-sans text-[13px] md:text-base leading-relaxed mb-5 md:mb-8"
            >
              <p>
                Real estate is more than buying a property—it&apos;s about building futures,
                creating opportunities and making some of life&apos;s most important decisions
                with confidence.
              </p>

              <p>
                At D. Devidas Global Real Estate Advisory, we help buyers and investors discover
                verified opportunities across Pune, Dubai and the United Kingdom through
                transparency, expertise and long-term relationships.
              </p>

              <p className="hidden md:block">
                With international operations spanning London, Dubai and Pune, we combine local
                market understanding with global reach to deliver a seamless real estate experience.
                Whether you are searching for your dream home, expanding your investment portfolio
                or exploring international opportunities, our commitment remains the same providing
                trusted guidance at every step of the journey.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-5 md:mb-8"
            >
              <p className="font-serif text-2xl md:text-3xl italic text-charcoal mb-1">
                D. Devidas
              </p>
              <p className="font-sans text-xs md:text-sm text-muted-gray">
                Founder &amp; Global Real Estate Advisor
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="bg-white rounded-2xl border border-stone-gray/30 p-4 md:p-6 mb-5 md:mb-8"
            >
              <div className="space-y-4 md:space-y-5">
                <div>
                  <p className="text-champagne-gold font-sans text-[10px] md:text-xs tracking-wider uppercase mb-1">
                    Our Mission
                  </p>
                  <p className="font-sans text-[13px] md:text-sm text-charcoal leading-relaxed">
                    To simplify property decisions through transparency, expert guidance and
                    verified opportunities across global markets.
                  </p>
                </div>

                <div className="border-t border-stone-gray/20 pt-4 md:pt-5">
                  <p className="text-champagne-gold font-sans text-[10px] md:text-xs tracking-wider uppercase mb-1">
                    Our Vision
                  </p>
                  <p className="font-sans text-[13px] md:text-sm text-charcoal leading-relaxed">
                    To become a trusted international real estate brand connecting people with
                    opportunities beyond borders.
                  </p>
                </div>

                <div className="border-t border-stone-gray/20 pt-4 md:pt-5">
                  <p className="text-champagne-gold font-sans text-[10px] md:text-xs tracking-wider uppercase mb-3">
                    Our Promise
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
                    {promiseItems.map((item) => (
                      <div key={item} className="flex items-center gap-2">
                        <BadgeCheck className="w-3.5 h-3.5 md:w-3 md:h-3 text-champagne-gold shrink-0" />
                        <span className="font-sans text-[13px] md:text-sm text-charcoal">
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            <div className="grid grid-cols-2 gap-3 md:gap-4">
              {stats.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: 0.3 + i * 0.06 }}
                  className="bg-white rounded-xl border border-stone-gray/30 p-3 md:p-5 text-center"
                >
                  <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-champagne-gold/10 flex items-center justify-center text-champagne-gold mx-auto mb-1.5 md:mb-2">
                    {s.icon}
                  </div>
                  <p className="font-serif text-xl md:text-2xl font-bold text-charcoal">
                    {s.value}
                  </p>
                  <p className="font-sans text-[10px] md:text-xs text-muted-gray leading-tight">
                    {s.label}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="space-y-4 md:space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 32 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.65, ease: 'easeOut' }}
              className="rounded-2xl overflow-hidden bg-charcoal"
            >
              <img
                src={founderImage}
                alt="D. Devidas"
                className="w-full h-[240px] sm:h-[300px] md:h-[420px] object-cover"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: 0.1 }}
              className="bg-charcoal rounded-2xl p-4 md:p-6 border border-white/5"
            >
              <Quote className="w-6 h-6 md:w-8 md:h-8 text-champagne-gold/30 mb-2 md:mb-3" />
              <p className="font-serif text-base md:text-xl text-white leading-relaxed italic">
                We don&apos;t just sell properties—we help people make better life decisions.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: 0.15 }}
              className="bg-white rounded-2xl border border-stone-gray/30 p-4 md:p-6"
            >
              <p className="text-champagne-gold font-sans text-[10px] md:text-xs tracking-[0.18em] uppercase mb-3 md:mb-4">
                Global Presence
              </p>

              <div className="space-y-3 md:space-y-5">
                {presence.map((item) => (
                  <div key={item.location} className="flex gap-3 md:gap-4">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-champagne-gold/10 flex items-center justify-center text-champagne-gold shrink-0">
                      <MapPin className="w-4 h-4 md:w-5 md:h-5" />
                    </div>
                    <div>
                      <h4 className="font-sans font-semibold text-charcoal text-xs md:text-sm">
                        {item.location}
                      </h4>
                      <p className="font-sans text-xs md:text-sm text-muted-gray leading-relaxed mt-0.5 md:mt-1">
                        {item.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-4 md:gap-6 mt-6 md:mt-10">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-charcoal rounded-2xl border border-white/5 p-4 md:p-8"
          >
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-champagne-gold/10 flex items-center justify-center text-champagne-gold mb-4 md:mb-5">
              <Handshake className="w-5 h-5 md:w-6 md:h-6" />
            </div>

            <p className="text-champagne-gold font-sans text-[10px] md:text-xs tracking-[0.18em] uppercase mb-2">
              Strategic Partner
            </p>

            <h3 className="font-serif text-xl md:text-3xl font-bold text-white mb-3 md:mb-4">
              RSU ENT PROPERTIES DUBAI
            </h3>

            <p className="font-sans text-xs md:text-sm text-stone-gray leading-relaxed">
              Through our collaboration with RSU ENT PROPERTIES DUBAI, we provide buyers and
              investors access to premium Dubai real estate opportunities backed by trusted local
              expertise.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-2xl border border-stone-gray/30 p-4 md:p-8"
          >
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-champagne-gold/10 flex items-center justify-center text-champagne-gold mb-4 md:mb-5">
              <Megaphone className="w-5 h-5 md:w-6 md:h-6" />
            </div>

            <p className="text-champagne-gold font-sans text-[10px] md:text-xs tracking-[0.18em] uppercase mb-2">
              Beyond Property Advisory
            </p>

            <h3 className="font-serif text-xl md:text-3xl font-bold text-charcoal mb-3 md:mb-4">
              Real Estate Marketing Solutions
            </h3>

            <div className="space-y-2 md:space-y-3 font-sans text-xs md:text-sm text-muted-gray leading-relaxed">
              <p>
                Beyond property consulting, we provide complete real estate marketing solutions
                for developers and builders including social media management, digital advertising,
                project branding, content creation and lead generation.
              </p>

              <p className="hidden md:block">
                Our global marketing operations are supported through our London office, bringing
                international strategies to real estate growth.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}