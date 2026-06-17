import { motion } from 'framer-motion';
import {
  Shield,
  Building2,
  Globe2,
  MapPin,
  Clock,
  Phone,
  MessageCircle,
  BadgeCheck,
} from 'lucide-react';
import SectionHeader from '../components/SectionHeader';
import LeadForm from '../components/LeadForm';

const features = [
  {
    icon: <Shield className="w-5 h-5" />,
    title: 'Verified Property Guidance',
    desc: 'Get trusted advice before choosing any residential, commercial or investment property.',
  },
  {
    icon: <Building2 className="w-5 h-5" />,
    title: 'Builder & Project Support',
    desc: 'Compare projects, pricing, location benefits, possession timelines and builder reputation.',
  },
  {
    icon: <Globe2 className="w-5 h-5" />,
    title: 'Pune, Dubai & UK Advisory',
    desc: 'Explore verified opportunities across local and international real estate markets.',
  },
];

const trustPoints = [
  'Verified projects only',
  'Transparent consultation',
  'Investment-focused guidance',
  'End-to-end support',
];

export default function BookExperienceSection() {
  return (
    <section id="book" className="relative bg-deep-black overflow-hidden">
      <div className="absolute inset-0">
        <img
        src="https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=1920"
        alt="Real estate consultation"
        className="w-full h-full object-cover opacity-45 md:opacity-55 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-deep-black/80 via-deep-black/60 to-deep-black/70" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(214,179,106,0.10),transparent_45%)]" />
      </div>
      <div className="relative z-10 max-w-7xl mx-auto px-5 md:px-6 py-16 md:py-24 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          <div>
            <SectionHeader
              label="Consult. Compare. Decide."
              heading="Book A Trusted Real Estate Consultation Today."
              goldText="Consultation Today"
              subtext=""
              center={false}
            />

            <p className="text-stone-gray font-sans text-sm md:text-base leading-relaxed max-w-xl mb-7">
              Share your requirement and our team will help you find verified property options
              across Pune, Dubai and the UK based on your budget, purpose and investment goals.
            </p>

            <div className="space-y-4 mb-8">
              {features.map((feature, i) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, x: -28 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: i * 0.08 }}
                  className="flex gap-4 items-start"
                >
                  <div className="w-11 h-11 rounded-xl bg-champagne-gold/10 border border-champagne-gold/30 flex items-center justify-center text-champagne-gold shrink-0">
                    {feature.icon}
                  </div>

                  <div>
                    <h4 className="font-sans font-semibold text-white text-base">
                      {feature.title}
                    </h4>
                    <p className="font-sans text-sm text-stone-gray leading-relaxed">
                      {feature.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl">
              {trustPoints.map((point, i) => (
                <motion.div
                  key={point}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.25 + i * 0.06 }}
                  className="flex items-center gap-2 text-white/85 font-sans text-sm"
                >
                  <BadgeCheck className="w-4 h-4 text-champagne-gold shrink-0" />
                  {point}
                </motion.div>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 54 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.75, ease: 'easeOut' }}
          >
            <div className="glass-dark rounded-2xl border border-white/10 p-5 md:p-7 max-w-md ml-auto">
              <h3 className="font-serif text-2xl font-bold text-white mb-1">
                Schedule Consultation
              </h3>

              <p className="text-stone-gray font-sans text-sm mb-6">
                Tell us your requirement. Our expert will contact you shortly.
              </p>

              <LeadForm source="real-estate-consultation" variant="book" />
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.25 }}
          className="mt-12 md:mt-16 glass-dark rounded-2xl border border-white/10 p-5 md:p-8"
        >
          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            <div>
              <div className="flex items-center gap-2 text-champagne-gold font-sans text-xs tracking-wider uppercase mb-3">
                <MapPin className="w-4 h-4" />
                Global Presence
              </div>

              <p className="text-white font-sans text-sm leading-relaxed">
                Pune, India • Dubai, UAE • Southampton, United Kingdom
              </p>

              <p className="text-stone-gray font-sans text-xs mt-2 leading-relaxed">
                Real estate advisory and marketing support across local and international markets.
              </p>
            </div>

            <div>
              <div className="flex items-center gap-2 text-champagne-gold font-sans text-xs tracking-wider uppercase mb-3">
                <Clock className="w-4 h-4" />
                Consultation Hours
              </div>

              <p className="text-white font-sans text-sm">
                Mon – Sat: 10:00 AM – 7:00 PM
              </p>

              <p className="text-stone-gray font-sans text-sm">
                Sunday: By appointment only
              </p>
            </div>

            <div>
              <div className="flex items-center gap-2 text-champagne-gold font-sans text-xs tracking-wider uppercase mb-3">
                <Phone className="w-4 h-4" />
                Contact Us
              </div>

              <a
                href="tel:+919593359799"
                className="text-white font-sans text-sm block hover:text-champagne-gold transition"
              >
                +91 95933 59799
              </a>

              <a
                href="https://wa.me/919593359799"
                target="_blank"
                rel="noreferrer"
                className="mt-4 flex items-center gap-3 bg-white/5 rounded-xl p-3 hover:bg-white/10 transition"
              >
                <MessageCircle className="w-5 h-5 text-champagne-gold" />
                <span className="text-white font-sans text-sm">
                  Chat on WhatsApp
                </span>
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}