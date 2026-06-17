import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  Phone,
  Menu,
  X,
  ArrowRight
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Projects', href: '/projects' },
  { label: 'Social Media', href: '#marketing' },
  { label: 'Why Us', href: '#how-it-works' },
  { label: 'About', href: '#founder' },
  { label: 'Contact', href: '#book' },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handler = () => {
      setScrolled(window.scrollY > 30);
    };

    window.addEventListener('scroll', handler);

    return () => {
      window.removeEventListener('scroll', handler);
    };
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const scrollToSection = (id: string) => {
    const section = document.getElementById(id);

    if (section) {
      section.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  const handleNavClick = (href: string) => {
    if (href.startsWith('#')) {
      scrollToSection(href.replace('#', ''));
      setMobileOpen(false);
    }
  };

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-deep-black/90 backdrop-blur-xl border-b border-white/10 h-[72px]'
            : 'bg-transparent h-[90px]'
        }`}
      >
        <div className="max-w-7xl mx-auto px-5 md:px-6 h-full flex items-center justify-between">

          {/* LOGO */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-champagne-gold/10 border border-champagne-gold/30 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-champagne-gold" />
            </div>

            <div>
              <h2 className="font-serif text-lg md:text-2xl font-bold text-white">
                VISSION<span className="text-champagne-gold">99</span>
              </h2>

              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-gray">
                Properties
              </p>
            </div>
          </Link>

          {/* DESKTOP MENU */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((item) => {
              if (item.href.startsWith('#')) {
                return (
                  <button
                    key={item.label}
                    onClick={() => handleNavClick(item.href)}
                    className="text-white/75 hover:text-champagne-gold transition-colors font-medium"
                  >
                    {item.label}
                  </button>
                );
              }

              return (
                <Link
                  key={item.label}
                  to={item.href}
                  className="text-white/75 hover:text-champagne-gold transition-colors font-medium"
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* RIGHT SIDE */}
          <div className="hidden lg:flex items-center gap-3">

            <a
              href="tel:+919593359799"
              className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-white hover:text-champagne-gold hover:border-champagne-gold transition"
            >
              <Phone className="w-5 h-5" />
            </a>

            <button
              onClick={() => scrollToSection('book')}
              className="bg-champagne-gold text-deep-black font-semibold px-7 py-3 rounded-xl flex items-center gap-2 hover:bg-soft-gold transition"
            >
              Schedule Consultation
              <ArrowRight className="w-4 h-4" />
            </button>

          </div>

          {/* MOBILE */}
          <div className="flex lg:hidden items-center gap-3">

            <a
              href="tel:+919593359799"
              className="w-11 h-11 rounded-full border border-white/10 flex items-center justify-center text-white"
            >
              <Phone className="w-5 h-5" />
            </a>

            <button
              onClick={() => setMobileOpen(true)}
              className="w-11 h-11 rounded-full border border-white/10 flex items-center justify-center text-white"
            >
              <Menu className="w-5 h-5" />
            </button>

          </div>
        </div>
      </motion.header>

      {/* MOBILE MENU */}

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.35 }}
            className="fixed inset-0 bg-deep-black z-[70]"
          >
            <div className="p-6 flex justify-between items-center">

              <h2 className="font-serif text-2xl text-white">
                VISSION
                <span className="text-champagne-gold">99</span>
              </h2>

              <button
                onClick={() => setMobileOpen(false)}
                className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex flex-col items-center gap-8 mt-16">

              {navLinks.map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: index * 0.05,
                  }}
                >
                  {item.href.startsWith('#') ? (
                    <button
                      onClick={() => handleNavClick(item.href)}
                      className="font-serif text-3xl text-white hover:text-champagne-gold transition"
                    >
                      {item.label}
                    </button>
                  ) : (
                    <Link
                      to={item.href}
                      className="font-serif text-3xl text-white hover:text-champagne-gold transition"
                    >
                      {item.label}
                    </Link>
                  )}
                </motion.div>
              ))}

              <button
                onClick={() => scrollToSection('book')}
                className="mt-4 bg-champagne-gold text-deep-black px-8 py-4 rounded-xl font-semibold flex items-center gap-2"
              >
                Schedule Consultation
                <ArrowRight className="w-4 h-4" />
              </button>

            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}