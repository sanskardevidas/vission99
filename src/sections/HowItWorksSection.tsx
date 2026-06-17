import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Building2,
  BarChart3,
  Car,
  IndianRupee,
  FileText,
  PenLine,
  KeyRound,
  Shield,
  BadgeCheck,
  RefreshCw,
  HeartHandshake,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import SectionHeader from '../components/SectionHeader';

const steps = [
  {
    num: '01',
    title: 'Understand Your Requirements',
    text: 'We understand your budget, preferred location, lifestyle needs and investment goals.',
    icon: <Search className="w-6 h-6" />,
  },
  {
    num: '02',
    title: 'Explore Verified Projects',
    text: 'Compare carefully selected projects across Pune, Dubai and UK with complete transparency.',
    icon: <Building2 className="w-6 h-6" />,
  },
  {
    num: '03',
    title: 'Get Expert Guidance',
    text: 'Receive unbiased advice on pricing, rental yield, appreciation and builder reputation.',
    icon: <BarChart3 className="w-6 h-6" />,
  },
  {
    num: '04',
    title: 'Schedule Site Visits',
    text: 'Visit shortlisted properties physically or virtually with expert assistance.',
    icon: <Car className="w-6 h-6" />,
  },
  {
    num: '05',
    title: 'Home Loan Assistance',
    text: 'Get support with loan eligibility, documentation and financing options.',
    icon: <IndianRupee className="w-6 h-6" />,
  },
  {
    num: '06',
    title: 'Documentation Support',
    text: 'We help verify project details, RERA information and required paperwork.',
    icon: <FileText className="w-6 h-6" />,
  },
  {
    num: '07',
    title: 'Booking & Registration',
    text: 'Complete booking and registration smoothly with complete guidance.',
    icon: <PenLine className="w-6 h-6" />,
  },
  {
    num: '08',
    title: 'Possession & Beyond',
    text: 'Our support continues even after possession for a seamless experience.',
    icon: <KeyRound className="w-6 h-6" />,
  },
];

const trustItems = [
  { icon: <Shield className="w-5 h-5" />, label: 'Expert Guidance' },
  { icon: <BadgeCheck className="w-5 h-5" />, label: 'Verified Projects' },
  { icon: <RefreshCw className="w-5 h-5" />, label: 'Transparent Process' },
  { icon: <HeartHandshake className="w-5 h-5" />, label: 'End-to-End Support' },
];

export default function HowItWorksSection() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [autoCompleted, setAutoCompleted] = useState(false);

  const scrollToStep = (index: number) => {
    const container = scrollRef.current;
    if (!container) return;

    const card = container.querySelector<HTMLElement>('[data-step-card]');
    if (!card) return;

    const gap = 24;
    const scrollAmount = (card.offsetWidth + gap) * index;

    container.scrollTo({
      left: scrollAmount,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    if (autoCompleted) return;

    const interval = window.setInterval(() => {
      setActiveStep((prev) => {
        if (prev >= steps.length - 4) {
          window.clearInterval(interval);
          setAutoCompleted(true);
          return prev;
        }

        const next = prev + 1;
        scrollToStep(next);
        return next;
      });
    }, 1100);

    return () => window.clearInterval(interval);
  }, [autoCompleted]);

  const manualScroll = (direction: 'left' | 'right') => {
    const container = scrollRef.current;
    if (!container) return;

    const card = container.querySelector<HTMLElement>('[data-step-card]');
    if (!card) return;

    const amount = card.offsetWidth + 24;

    container.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  };

  return (
    <section id="how-it-works" className="bg-premium-ivory section-padding overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeader
          label="How It Works"
          heading="Your Property Journey Made Simple"
          goldText="Made Simple"
          subtext="From consultation to possession, we guide you every step of the way."
          light
        />

        <div className="hidden lg:block mt-12 relative">
          <div className="flex justify-end gap-3 mb-6">
            <button
              onClick={() => manualScroll('left')}
              className="w-11 h-11 rounded-full bg-white border border-stone-gray/30 flex items-center justify-center text-charcoal hover:border-champagne-gold hover:text-champagne-gold transition"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              onClick={() => manualScroll('right')}
              className="w-11 h-11 rounded-full bg-white border border-stone-gray/30 flex items-center justify-center text-charcoal hover:border-champagne-gold hover:text-champagne-gold transition"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto scroll-smooth pb-6 scrollbar-hide"
          >
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                data-step-card
                initial={{ opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.55, delay: i * 0.08, ease: 'easeOut' }}
                className="relative shrink-0 basis-[calc(25%-18px)] min-w-[calc(25%-18px)]"
              >
                <div
                  className={`bg-white rounded-2xl border p-6 min-h-[260px] transition-all duration-500 ${
                    i >= activeStep && i < activeStep + 4
                      ? 'border-champagne-gold/50 shadow-[0_20px_50px_rgba(214,179,106,0.12)]'
                      : 'border-stone-gray/30'
                  }`}
                >
                  <div className="relative w-16 h-16 rounded-full bg-champagne-gold/10 border-2 border-champagne-gold flex items-center justify-center text-champagne-gold mb-6 animate-pulse-gold">
                    {step.icon}
                    <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-champagne-gold text-deep-black font-sans text-[10px] font-bold flex items-center justify-center">
                      {step.num}
                    </span>
                  </div>

                  <h4 className="font-serif text-xl font-bold text-charcoal mb-3 leading-tight">
                    {step.title}
                  </h4>

                  <p className="font-sans text-sm text-muted-gray leading-relaxed">
                    {step.text}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="lg:hidden mt-10 space-y-6 relative">
          <div className="absolute left-7 top-0 bottom-0 w-px bg-champagne-gold/30" />

          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, x: -28 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-20px' }}
              transition={{ duration: 0.45, delay: i * 0.06 }}
              className="relative flex gap-5 items-start"
            >
              <div className="relative shrink-0">
                <div className="w-14 h-14 rounded-full bg-champagne-gold/10 border-2 border-champagne-gold flex items-center justify-center text-champagne-gold">
                  {step.icon}
                </div>

                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-champagne-gold text-deep-black font-sans text-[9px] font-bold flex items-center justify-center">
                  {step.num}
                </span>
              </div>

              <div className="bg-white rounded-2xl border border-stone-gray/30 p-5 flex-1">
                <h4 className="font-serif text-lg font-bold text-charcoal mb-2">
                  {step.title}
                </h4>

                <p className="font-sans text-sm text-muted-gray leading-relaxed">
                  {step.text}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-16 md:mt-20 bg-white rounded-2xl border border-stone-gray/30 p-6 md:p-8"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {trustItems.map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-champagne-gold/10 flex items-center justify-center text-champagne-gold shrink-0">
                  {item.icon}
                </div>

                <span className="font-sans font-medium text-sm text-charcoal">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.2 }}
          className="mt-10 bg-charcoal rounded-2xl border border-white/5 p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-5"
        >
          <div>
            <p className="text-champagne-gold font-sans text-xs tracking-[0.18em] uppercase mb-2">
              Ready To Start?
            </p>

            <h3 className="font-serif text-2xl md:text-3xl font-bold text-white">
              Ready to find your ideal property?
            </h3>

            <p className="font-sans text-sm text-stone-gray mt-2">
              Schedule a consultation and let our experts guide you with the right options.
            </p>
          </div>

          <a href="#book">
            <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="bg-champagne-gold text-deep-black font-sans font-semibold px-7 py-3.5 rounded-xl flex items-center gap-2 hover:bg-soft-gold hover:shadow-[0_0_25px_rgba(214,179,106,0.3)] transition-all duration-300"
            >
                Schedule Consultation
                <ArrowRight className="w-4 h-4" />
                </motion.button>
            </a>
        </motion.div>
      </div>
    </section>
  );
}