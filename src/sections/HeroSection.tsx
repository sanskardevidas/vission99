import { motion } from 'framer-motion';
import {
  ArrowRight,
  Building2,
  Globe,
  Users,
  Star,
  MapPin,
  Phone,
  BadgeCheck,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const stats = [
  {
    icon: <Building2 className="w-5 h-5" />,
    value: '100+',
    label: 'Verified Projects',
  },
  {
    icon: <Globe className="w-5 h-5" />,
    value: '3',
    label: 'Global Offices',
  },
  {
    icon: <Users className="w-5 h-5" />,
    value: '500+',
    label: 'Happy Clients',
  },
  {
    icon: <Star className="w-5 h-5" />,
    value: '5★',
    label: 'Trusted Service',
  },
];

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-deep-black">
      {/* Background Image */}
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 20, ease: 'linear' }}
        style={{
          backgroundImage:
            'url(https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=1920)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-deep-black/70 via-deep-black/55 to-deep-black/30" />
      </motion.div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-32 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* Left Side */}
          <div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-champagne-gold/30 bg-champagne-gold/10 mb-6"
            >
              <Globe className="w-4 h-4 text-champagne-gold" />
              <span className="text-champagne-gold font-sans text-xs tracking-wider uppercase">
                International Property Experts
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 2.5, delay: 0.2 }}     
              className="font-serif text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white leading-[1.05] mb-6"
            >
              Invest Beyond{' '}
              <span className="text-champagne-gold">
                Borders
              </span>
              <br />
              In Pune, Dubai & UK
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="text-stone-gray font-sans text-base md:text-lg leading-relaxed max-w-2xl mb-8"
            >
              Helping buyers and investors discover trusted real estate opportunities worldwide.
            </motion.p>
                        <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex flex-wrap gap-4 mb-8"
            >
              <Link to="/projects">
                <motion.button
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-champagne-gold text-deep-black font-sans font-semibold px-8 py-4 rounded-xl flex items-center gap-2 hover:bg-soft-gold hover:shadow-[0_0_30px_rgba(214,179,106,0.3)] transition-all duration-300"
                >
                  Explore Properties
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </Link>

              <a href="#book">
                <motion.button
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-transparent border border-white/20 text-white font-sans font-semibold px-8 py-4 rounded-xl flex items-center gap-2 hover:border-champagne-gold hover:text-champagne-gold transition-all duration-300"
                >
                  Schedule Consultation
                </motion.button>
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="flex flex-wrap gap-6 text-sm font-sans text-stone-gray"
            >
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-champagne-gold" />
                Pune
              </div>

              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-champagne-gold" />
                Dubai
              </div>

              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-champagne-gold" />
                Southampton UK
              </div>
            </motion.div>

          </div>

          {/* Right Side Trust Card */}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              duration: 0.8,
              delay: 0.5,
              ease: 'easeOut',
            }}
            className="hidden lg:block"
          >
            <div className="glass-dark rounded-3xl border border-white/10 p-8 max-w-md ml-auto hover:border-champagne-gold/40 transition-all duration-500">

              <div className="flex items-center gap-2 text-champagne-gold font-sans text-xs tracking-[0.15em] uppercase mb-4">
                <BadgeCheck className="w-4 h-4" />
                Trusted Global Real Estate Partner
              </div>

              <h3 className="font-serif text-3xl text-white mb-4">
                Connecting Buyers With Premium Opportunities
              </h3>

              <p className="text-stone-gray font-sans text-sm leading-relaxed mb-6">
                Verified real estate opportunities across Pune, Dubai and UK
                with complete support for investors and home buyers.
              </p>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-white">
                  <BadgeCheck className="w-5 h-5 text-champagne-gold shrink-0" />
                  Verified Builder Projects
                </div>

                <div className="flex items-center gap-3 text-white">
                  <BadgeCheck className="w-5 h-5 text-champagne-gold shrink-0" />
                  Investment Advisory Support
                </div>

                <div className="flex items-center gap-3 text-white">
                  <BadgeCheck className="w-5 h-5 text-champagne-gold shrink-0" />
                  Site Visit Assistance
                </div>

                <div className="flex items-center gap-3 text-white">
                  <BadgeCheck className="w-5 h-5 text-champagne-gold shrink-0" />
                  International Property Access
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/10 flex items-center gap-3">
                <Phone className="w-5 h-5 text-champagne-gold" />

                <div>
                  <p className="text-muted-gray text-xs font-sans">
                    Call Us
                  </p>

                  <p className="text-white font-semibold font-sans">
                    +91 95933 59799
                  </p>
                </div>
              </div>

            </div>
          </motion.div>

        </div>
                <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.9 }}
          className="mt-16 md:mt-20"
        >
          <div className="glass-dark rounded-2xl border border-white/10 px-6 md:px-10 py-6 md:py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{
                    duration: 0.5,
                    delay: 1 + i * 0.1,
                  }}
                  className="flex flex-col items-center text-center gap-2"
                >
                  <div className="w-10 h-10 rounded-full bg-champagne-gold/10 flex items-center justify-center text-champagne-gold">
                    {stat.icon}
                  </div>

                  <p className="font-serif text-2xl md:text-3xl font-bold text-white">
                    {stat.value}
                  </p>

                  <p className="text-muted-gray font-sans text-xs">
                    {stat.label}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}