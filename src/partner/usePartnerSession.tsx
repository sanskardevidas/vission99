import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Crown } from 'lucide-react';
import {
  PartnerRecord, Role, Celebration, ROLE_LABEL, ROLE_ROUTE, allPartners, descendants, signOut,
  directReferrals, getSessionPartner, isLoaded, markCelebrationShown, referralLink, refresh, snapshot, subscribe,
} from './store';

// Returns the logged-in partner (null while loading / redirecting). Redirects to /login when
// signed out, and to the correct dashboard when the account's current role differs from `expected`.
export function usePartnerSession(expected: Role) {
  const navigate = useNavigate();
  const snap = useSyncExternalStore(subscribe, snapshot, () => '');
  const partner = useMemo(() => getSessionPartner(), [snap]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { void refresh(); }, []);

  useEffect(() => {
    if (!isLoaded()) return;
    if (!partner) navigate('/login', { replace: true });
    else if (partner.role !== expected) navigate(ROLE_ROUTE[partner.role], { replace: true });
  }, [partner, expected, navigate, snap]);

  const data = useMemo(() => {
    if (!partner) return null;
    const all = allPartners();
    const direct = directReferrals(all, partner.id);
    const team = descendants(all, partner.id);
    const refBy = partner.referredBy ? all.find(p => p.id === partner.referredBy) : undefined;
    return {
      direct,
      team,
      directPP: direct.filter(p => p.role === 'PP'),
      allPP: team.filter(p => p.role === 'PP'),
      allCP: team.filter(p => p.role === 'CP'),
      qualifiedPP: team.filter(p => p.role !== 'CP'),
      referredBy: refBy,
      link: referralLink(partner.id),
    };
  }, [partner, snap]); // eslint-disable-line react-hooks/exhaustive-deps

  return { partner: partner && partner.role === expected ? partner : null, data, signOut };
}

export const initialsOf = (name: string) =>
  name.split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase();

export const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

// Gold-on-black promotion celebration. Each event is shown once, then marked as shown.
const CONFETTI = Array.from({ length: 46 }, (_, i) => ({
  left: (i * 37) % 100,
  delay: (i % 12) * 0.12,
  dur: 3 + (i % 5) * 0.5,
  size: 6 + (i % 4) * 3,
  rot: (i * 53) % 360,
  tone: i % 3 === 0 ? '#F6F1E9' : '#D9B66F',
}));

export function PromotionCelebration({ partner }: { partner: PartnerRecord }) {
  const [active, setActive] = useState<Celebration | null>(null);

  useEffect(() => {
    if (active) return;
    const next = partner.celebrations.find(c => !c.shown);
    if (next) {
      setActive(next);
      markCelebrationShown(partner.id, next.id);
    }
  }, [partner, active]);

  if (!active) return null;
  const roleName = ROLE_LABEL[active.to].toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-[#101010] px-4"
      role="dialog" aria-modal="true" aria-label="Promotion celebration"
    >
      {CONFETTI.map((c, i) => (
        <motion.span
          key={i}
          initial={{ y: -40, opacity: 0, rotate: 0 }}
          animate={{ y: '105vh', opacity: [0, 1, 1, 0], rotate: c.rot + 360 }}
          transition={{ duration: c.dur, delay: c.delay, repeat: Infinity, ease: 'easeIn' }}
          className="pointer-events-none absolute top-0 block rounded-[2px]"
          style={{ left: `${c.left}%`, width: c.size, height: c.size * 1.6, background: c.tone }}
        />
      ))}
      <motion.div
        initial={{ scale: 0.85, y: 30, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 120, damping: 14, delay: 0.15 }}
        className="relative w-full max-w-lg rounded-3xl border border-[#D9B66F]/50 bg-[#101010] p-8 text-center shadow-[0_0_60px_rgba(217,182,111,0.25)] md:p-12"
      >
        <motion.div
          initial={{ rotate: -12, scale: 0.6 }} animate={{ rotate: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 160, damping: 8, delay: 0.4 }}
          className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border-2 border-[#D9B66F] bg-[#D9B66F]/10 text-[#D9B66F]"
        >
          <Crown size={48} />
        </motion.div>
        <h2 className="mt-6 font-serif text-3xl font-extrabold text-[#D9B66F] md:text-4xl">Congratulations!</h2>
        <p className="mt-3 text-lg font-semibold text-white md:text-xl">You Have Been Promoted to {roleName}!</p>
        <p className="mt-2 text-sm text-white/60">{partner.name} · {ROLE_LABEL[active.from]} → {ROLE_LABEL[active.to]}</p>
        <button
          onClick={() => setActive(null)}
          className="mt-8 inline-flex min-h-[48px] items-center justify-center rounded-xl bg-[#D9B66F] px-8 text-sm font-semibold text-[#101010] transition hover:brightness-105 active:scale-[0.97]"
        >
          Continue to Dashboard
        </button>
      </motion.div>
    </motion.div>
  );
}
