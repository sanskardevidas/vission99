import { motion } from 'framer-motion';
import {
  Instagram,
  Megaphone,
  Palette,
  Globe,
  ArrowRight,
  Video,
  Target,
  BarChart3,
  BadgeCheck,
} from 'lucide-react';

const services = [
  {
    icon: <Instagram className="w-6 h-6" />,
    title: 'Social Media Management',
    desc: 'Daily content planning, posting, page management and brand consistency for real estate projects.',
  },
  {
    icon: <Target className="w-6 h-6" />,
    title: 'Lead Generation Ads',
    desc: 'Targeted campaigns for home buyers, investors, NRI clients and site visit enquiries.',
  },
  {
    icon: <Video className="w-6 h-6" />,
    title: 'Reels & Video Content',
    desc: 'Premium reels, walkthrough videos, project highlights and location-based content.',
  },
  {
    icon: <Palette className="w-6 h-6" />,
    title: 'Project Branding',
    desc: 'Creative strategy, premium posters, campaign designs and builder-focused presentation.',
  },
];

const highlights = [
  'Instagram, Facebook & LinkedIn marketing',
  'Buyer-focused lead generation campaigns',
  'Premium creatives, reels and ad copies',
  'Southampton, UK based creative collaboration',
];

export default function VRExperienceSection() {
  return (
    <section id="marketing" className="relative bg-deep-black section-padding overflow-hidden">
      <div className="absolute inset-0">
        <img
          src="https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1920"
          alt="Real estate marketing team"
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-deep-black via-deep-black/95 to-deep-black" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55 }}
              className="text-champagne-gold font-sans text-xs md:text-sm tracking-[0.22em] uppercase mb-5"
            >
              Real Estate Marketing
            </motion.p>

            <motion.h2
              initial={{ opacity: 0, y: 34 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6"
            >
              Grow Your Project With{' '}
              <span className="text-champagne-gold">Powerful Social Media</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.65, delay: 0.2 }}
              className="text-stone-gray font-sans text-base md:text-lg leading-relaxed max-w-xl mb-8"
            >
              We help real estate builders, developers and channel partners generate quality leads through premium content,
              social media management, paid ads and digital branding.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.65, delay: 0.3 }}
              className="grid sm:grid-cols-2 gap-4 mb-9"
            >
              {highlights.map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-champagne-gold/10 flex items-center justify-center text-champagne-gold shrink-0 mt-0.5">
                    <BadgeCheck className="w-4 h-4" />
                  </div>
                  <p className="text-white/85 font-sans text-sm leading-relaxed">{item}</p>
                </div>
              ))}
            </motion.div>

            <a href="#book">
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="bg-champagne-gold text-deep-black font-sans font-semibold px-8 py-4 rounded-xl inline-flex items-center gap-2 hover:bg-soft-gold hover:shadow-[0_0_30px_rgba(214,179,106,0.28)] transition-all duration-300"
              >
                Start Marketing Your Project
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </a>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.75, ease: 'easeOut' }}
            className="relative"
          >
            <div className="glass-dark rounded-3xl border border-white/10 p-6 md:p-8">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                  <Megaphone className="w-7 h-7 text-champagne-gold mb-4" />
                  <p className="font-serif text-3xl font-bold text-white">Lead</p>
                  <p className="font-sans text-sm text-stone-gray">Focused Campaigns</p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                  <Globe className="w-7 h-7 text-champagne-gold mb-4" />
                  <p className="font-serif text-3xl font-bold text-white">UK</p>
                  <p className="font-sans text-sm text-stone-gray">Creative Support</p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                  <BarChart3 className="w-7 h-7 text-champagne-gold mb-4" />
                  <p className="font-serif text-3xl font-bold text-white">ROI</p>
                  <p className="font-sans text-sm text-stone-gray">Driven Ads</p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                  <Video className="w-7 h-7 text-champagne-gold mb-4" />
                  <p className="font-serif text-3xl font-bold text-white">Reels</p>
                  <p className="font-sans text-sm text-stone-gray">Premium Content</p>
                </div>
              </div>

              <div className="rounded-2xl bg-champagne-gold/10 border border-champagne-gold/30 p-5">
                <p className="text-champagne-gold font-sans text-xs tracking-[0.18em] uppercase mb-2">
                  Southampton Collaboration
                </p>
                <h3 className="font-serif text-2xl font-bold text-white mb-2">
                  International quality content for Indian real estate projects.
                </h3>
                <p className="font-sans text-sm text-stone-gray leading-relaxed">
                  Strategy, creatives and campaign support designed to make projects look premium and attract serious buyers.
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
          {services.map((service, i) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 34 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: i * 0.08 }}
              whileHover={{ y: -8 }}
              className="bg-white rounded-2xl border border-white/10 p-6 hover:border-champagne-gold/60 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-champagne-gold/10 text-champagne-gold flex items-center justify-center mb-5">
                {service.icon}
              </div>

              <h3 className="font-serif text-xl font-bold text-charcoal mb-3">
                {service.title}
              </h3>

              <p className="font-sans text-sm text-muted-gray leading-relaxed">
                {service.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}