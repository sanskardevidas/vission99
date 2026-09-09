import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, type PanInfo, type Variants } from 'framer-motion';
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

const AUTOPLAY_MS = 3200;
const SWIPE_THRESHOLD = 60;

const cardVariants: Variants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 80 : -80,
    opacity: 0,
    scale: 0.85,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (dir: number) => ({
    x: dir > 0 ? -80 : 80,
    opacity: 0,
    scale: 0.85,
  }),
};

function StepSlot({
  step,
  isCenter,
  direction,
}: {
  step: (typeof steps)[number];
  isCenter: boolean;
  direction: number;
}) {
  return (
    <div className="relative">
      <AnimatePresence mode="popLayout" custom={direction} initial={false}>
        <motion.div
          key={step.num}
          custom={direction}
          variants={cardVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className={`rounded-2xl border p-5 md:p-6 min-h-[220px] md:min-h-[260px] flex flex-col transition-shadow duration-300 ${
            isCenter
              ? 'bg-charcoal border-white/10 shadow-[0_25px_60px_rgba(214,179,106,0.2)] md:scale-[1.05]'
              : 'bg-white border-stone-gray/30 opacity-80 md:scale-[0.94]'
          }`}
        >
          <div
            className={`relative w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center mb-4 md:mb-6 border-2 border-champagne-gold ${
              isCenter ? 'bg-champagne-gold/15 text-champagne-gold animate-pulse-gold' : 'bg-champagne-gold/10 text-champagne-gold'
            }`}
          >
            {step.icon}
            <span className="absolute -top-2 -right-2 w-6 h-6 md:w-7 md:h-7 rounded-full bg-champagne-gold text-deep-black font-sans text-[9px] md:text-[10px] font-bold flex items-center justify-center">
              {step.num}
            </span>
          </div>

          <h4 className={`font-serif text-base md:text-xl font-bold mb-2 md:mb-3 leading-tight ${isCenter ? 'text-white' : 'text-charcoal'}`}>
            {step.title}
          </h4>

          <p className={`font-sans text-xs md:text-sm leading-relaxed ${isCenter ? 'text-stone-gray' : 'text-muted-gray'}`}>
            {step.text}
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function MobileStepCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const resumeTimer = useRef<number>();

  const scrollToIndex = (i: number) => {
    const card = cardRefs.current[i];
    const track = trackRef.current;
    if (!card || !track) return;
    const target = card.offsetLeft - (track.clientWidth - card.clientWidth) / 2;
    track.scrollTo({ left: target, behavior: 'smooth' });
  };

  useEffect(() => {
    if (paused) return;

    const id = window.setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % steps.length;
        scrollToIndex(next);
        return next;
      });
    }, AUTOPLAY_MS);

    return () => window.clearInterval(id);
  }, [paused]);

  const pauseThenResume = () => {
    setPaused(true);
    window.clearTimeout(resumeTimer.current);
    resumeTimer.current = window.setTimeout(() => setPaused(false), AUTOPLAY_MS * 2.2);
  };

  const handleScroll = () => {
    const track = trackRef.current;
    if (!track) return;

    const trackCenter = track.scrollLeft + track.clientWidth / 2;
    let closest = 0;
    let minDist = Infinity;

    cardRefs.current.forEach((card, i) => {
      if (!card) return;
      const cardCenter = card.offsetLeft + card.clientWidth / 2;
      const dist = Math.abs(cardCenter - trackCenter);
      if (dist < minDist) {
        minDist = dist;
        closest = i;
      }
    });

    setActiveIndex(closest);
  };

  return (
    <div className="relative">
      <div
        ref={trackRef}
        onScroll={handleScroll}
        onPointerDown={pauseThenResume}
        className="flex gap-3 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-hide -mx-6 px-[9%] md:px-[22%]"
      >
        {steps.map((step, i) => {
          const isActive = i === activeIndex;
          return (
            <div
              key={step.num}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              className={`shrink-0 snap-center w-[82%] md:w-[56%] min-h-[300px] rounded-2xl border p-6 flex flex-col transition-colors duration-500 ${
                isActive
                  ? 'bg-charcoal border-white/10 shadow-[0_20px_50px_rgba(214,179,106,0.15)]'
                  : 'bg-white border-stone-gray/30'
              }`}
            >
              <div
                className={`relative w-12 h-12 rounded-full flex items-center justify-center mb-4 border-2 border-champagne-gold transition-colors duration-500 ${
                  isActive ? 'bg-champagne-gold/15 text-champagne-gold animate-pulse-gold' : 'bg-champagne-gold/10 text-champagne-gold'
                }`}
              >
                {step.icon}
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-champagne-gold text-deep-black font-sans text-[9px] font-bold flex items-center justify-center">
                  {step.num}
                </span>
              </div>

              <h4 className={`font-serif text-xl font-bold mb-2 leading-snug transition-colors duration-500 ${isActive ? 'text-white' : 'text-charcoal'}`}>
                {step.title}
              </h4>

              <p className={`font-sans text-base leading-relaxed transition-colors duration-500 ${isActive ? 'text-stone-gray' : 'text-muted-gray'}`}>
                {step.text}
              </p>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-center gap-2 mt-6">
        {steps.map((step, i) => (
          <button
            key={step.num}
            aria-label={`Go to step ${i + 1}`}
            onClick={() => {
              pauseThenResume();
              scrollToIndex(i);
              setActiveIndex(i);
            }}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === activeIndex ? 'w-6 bg-champagne-gold' : 'w-1.5 bg-champagne-gold/25'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default function HowItWorksSection() {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<number>();

  const go = (dir: number) => {
    setDirection(dir);
    setIndex((prev) => (prev + dir + steps.length) % steps.length);
  };

  useEffect(() => {
    if (paused) return;

    timerRef.current = window.setInterval(() => {
      setDirection(1);
      setIndex((prev) => (prev + 1) % steps.length);
    }, AUTOPLAY_MS);

    return () => window.clearInterval(timerRef.current);
  }, [paused]);

  const handleManual = (dir: number) => {
    go(dir);
    setPaused(true);
    window.setTimeout(() => setPaused(false), AUTOPLAY_MS * 2);
  };

  const handleDragEnd = (_e: unknown, info: PanInfo) => {
    if (info.offset.x <= -SWIPE_THRESHOLD) {
      handleManual(1);
    } else if (info.offset.x >= SWIPE_THRESHOLD) {
      handleManual(-1);
    }
  };

  const prevIdx = (index - 1 + steps.length) % steps.length;
  const nextIdx = (index + 1) % steps.length;

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

        <div className="lg:hidden mt-10">
          <MobileStepCarousel />
        </div>

        <div
          className="hidden lg:block relative mt-16"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <motion.div
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.15}
            onDragEnd={handleDragEnd}
            className="grid grid-cols-3 gap-3 md:gap-6 cursor-grab active:cursor-grabbing"
          >
            <StepSlot step={steps[prevIdx]} isCenter={false} direction={direction} />
            <StepSlot step={steps[index]} isCenter direction={direction} />
            <StepSlot step={steps[nextIdx]} isCenter={false} direction={direction} />
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleManual(-1)}
            aria-label="Previous step"
            className="hidden md:flex absolute -left-5 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white border border-stone-gray/30 items-center justify-center text-charcoal hover:border-champagne-gold hover:text-champagne-gold transition shadow-lg"
          >
            <ChevronLeft className="w-5 h-5" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleManual(1)}
            aria-label="Next step"
            className="hidden md:flex absolute -right-5 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white border border-stone-gray/30 items-center justify-center text-charcoal hover:border-champagne-gold hover:text-champagne-gold transition shadow-lg"
          >
            <ChevronRight className="w-5 h-5" />
          </motion.button>

          <div className="flex items-center justify-center gap-2 mt-6 md:mt-8">
            {steps.map((step, i) => (
              <button
                key={step.num}
                aria-label={`Go to step ${i + 1}`}
                onClick={() => {
                  setDirection(i > index ? 1 : -1);
                  setIndex(i);
                  setPaused(true);
                  window.setTimeout(() => setPaused(false), AUTOPLAY_MS * 2);
                }}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === index ? 'w-6 bg-champagne-gold' : 'w-1.5 bg-champagne-gold/25 hover:bg-champagne-gold/50'
                }`}
              />
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-16 md:mt-20 bg-white rounded-2xl border border-stone-gray/30 p-6 md:p-8"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {trustItems.map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-lg bg-champagne-gold/10 flex items-center justify-center text-champagne-gold shrink-0">
                  {item.icon}
                </div>

                <span className="font-sans font-medium text-sm text-charcoal">
                  {item.label}
                </span>
              </motion.div>
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