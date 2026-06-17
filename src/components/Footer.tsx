import { Building2, Phone, Mail, MapPin, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const quickLinks = [
  { label: 'Home', path: '/' },
  { label: 'Projects', path: '/projects' },
  { label: 'About', path: '/#founder' },
  { label: 'Consultation', path: '/#book' },
];

const services = [
  'Property Advisory',
  'Verified Projects',
  'Dubai Investment',
  'Marketing Solutions',
];

export default function Footer() {
  return (
    <footer className="bg-deep-black border-t border-white/5">
      <div className="max-w-7xl mx-auto px-5 md:px-6 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
          <div>
            <Link to="/" className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-champagne-gold/10 border border-champagne-gold/30 flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5 text-champagne-gold" />
              </div>

              <div>
                <p className="font-serif text-lg font-bold text-white leading-tight">
                  VISSION<span className="text-champagne-gold">99</span>
                </p>
                <p className="text-[10px] text-muted-gray font-sans tracking-[0.15em] uppercase">
                  Global Real Estate Advisory
                </p>
              </div>
            </Link>

            <p className="text-muted-gray font-sans text-sm leading-relaxed max-w-md">
              Helping buyers and investors discover verified real estate opportunities across Pune, Dubai and the UK.
            </p>

            <p className="text-champagne-gold font-sans text-[10px] md:text-xs tracking-[0.15em] uppercase mt-4">
              Trusted Guidance Beyond Borders
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6 md:gap-8">
            <div>
              <h4 className="font-sans font-semibold text-white text-xs tracking-wide uppercase mb-4">
                Quick Links
              </h4>

              <ul className="space-y-2.5">
                {quickLinks.map((link) => (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      className="text-stone-gray font-sans text-sm hover:text-champagne-gold transition-colors inline-flex items-center gap-2"
                    >
                      <ArrowUpRight className="w-3 h-3" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-sans font-semibold text-white text-xs tracking-wide uppercase mb-4">
                Services
              </h4>

              <ul className="space-y-2.5">
                {services.map((service) => (
                  <li key={service} className="text-stone-gray font-sans text-sm">
                    {service}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div>
            <h4 className="font-sans font-semibold text-white text-xs tracking-wide uppercase mb-4">
              Contact
            </h4>

            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-stone-gray font-sans text-sm">
                <MapPin className="w-4 h-4 text-champagne-gold shrink-0 mt-0.5" />
                Pune • Dubai • Southampton UK
              </li>

              <li className="flex items-center gap-3 text-stone-gray font-sans text-sm">
                <Phone className="w-4 h-4 text-champagne-gold shrink-0" />
                <a href="tel:+919593359799" className="hover:text-champagne-gold transition">
                  +91 95933 59799
                </a>
              </li>

              <li className="flex items-center gap-3 text-stone-gray font-sans text-sm">
                <Mail className="w-4 h-4 text-champagne-gold shrink-0" />
                <a href="mailto:info@vission99.com" className="hover:text-champagne-gold transition">
                  info@vission99.com
                </a>
              </li>
            </ul>

            <a
              href="#book"
              className="mt-5 inline-flex items-center gap-2 bg-champagne-gold text-deep-black font-sans font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-soft-gold transition"
            >
              Schedule Consultation
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-white/5 py-4">
        <div className="max-w-7xl mx-auto px-5 md:px-6 flex flex-col md:flex-row items-center justify-between gap-2">
          <p className="text-muted-gray font-sans text-[11px] text-center">
            © 2026 Vission99 Global Real Estate Advisory. All rights reserved.
          </p>

          <div className="flex items-center gap-4">
            <span className="text-muted-gray font-sans text-[11px] hover:text-champagne-gold cursor-pointer transition">
              Privacy
            </span>
            <span className="text-muted-gray font-sans text-[11px] hover:text-champagne-gold cursor-pointer transition">
              Terms
            </span>
            <span className="text-muted-gray font-sans text-[11px] hover:text-champagne-gold cursor-pointer transition">
              RERA Disclaimer
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}