import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Phone, Mail, Calendar, Globe2, Wallet, MessageSquare, ArrowRight, Shield } from 'lucide-react';
import type { Lead } from '../types';
import { addLead } from '../utils/storage';
import { normalizeMobile } from '../partner/store';

interface LeadFormProps {
  source?: string;
  variant?: 'book' | 'callback';
  onSuccess?: () => void;
}

type Key = 'name' | 'phone' | 'email' | 'date' | 'country' | 'budget' | 'message';
interface Field {
  key: Key;
  label: string;
  icon: JSX.Element;
  type: 'text' | 'tel' | 'email' | 'date' | 'select';
  placeholder?: string;
  options?: string[];
  required?: boolean;
}

const COUNTRIES = ['India', 'Dubai (UAE)', 'United Kingdom', 'Other'];
const BUDGETS = ['Under ₹50 Lakh', '₹50 Lakh – ₹1 Crore', '₹1 – 2 Crore', '₹2 – 5 Crore', 'Above ₹5 Crore'];

const icon = 'w-4 h-4';
const BOOK_FIELDS: Field[] = [
  { key: 'name', label: 'Full Name', icon: <User className={icon} />, type: 'text', placeholder: 'Your full name', required: true },
  { key: 'phone', label: 'Mobile Number', icon: <Phone className={icon} />, type: 'tel', placeholder: '10-digit mobile number', required: true },
  { key: 'email', label: 'Email Address', icon: <Mail className={icon} />, type: 'email', placeholder: 'you@example.com', required: true },
  { key: 'country', label: 'Country of Interest', icon: <Globe2 className={icon} />, type: 'select', options: COUNTRIES, required: true },
  { key: 'budget', label: 'Budget', icon: <Wallet className={icon} />, type: 'select', options: BUDGETS, required: true },
  { key: 'date', label: 'Preferred Date (optional)', icon: <Calendar className={icon} />, type: 'date' },
  { key: 'message', label: 'Requirements (optional)', icon: <MessageSquare className={icon} />, type: 'text', placeholder: 'Any specific requirement?' },
];
const CALLBACK_FIELDS: Field[] = [
  { key: 'name', label: 'Name', icon: <User className={icon} />, type: 'text', placeholder: 'Your name', required: true },
  { key: 'phone', label: 'Phone', icon: <Phone className={icon} />, type: 'tel', placeholder: '10-digit mobile number', required: true },
  { key: 'email', label: 'Email', icon: <Mail className={icon} />, type: 'email', placeholder: 'you@example.com', required: true },
  { key: 'budget', label: 'Budget', icon: <Wallet className={icon} />, type: 'select', options: BUDGETS, required: true },
  { key: 'message', label: 'Message (optional)', icon: <MessageSquare className={icon} />, type: 'text', placeholder: 'How can we help?' },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const inputClass =
  'w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-white font-sans text-sm placeholder-muted-gray focus:border-champagne-gold focus:outline-none transition-colors';

export default function LeadForm({ source = 'website', variant = 'book', onSuccess }: LeadFormProps) {
  const fields = variant === 'book' ? BOOK_FIELDS : CALLBACK_FIELDS;
  const [form, setForm] = useState<Record<Key, string>>({
    name: '', phone: '', email: '', date: '', country: '', budget: '', message: '',
  });
  const [errors, setErrors] = useState<Partial<Record<Key, string>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const uid = `lead-${variant}`;

  const validate = () => {
    const e: Partial<Record<Key, string>> = {};
    if (!form.name.trim()) e.name = 'Please enter your name.';
    if (!normalizeMobile(form.phone)) e.phone = 'Enter a valid 10-digit mobile number.';
    if (!EMAIL_RE.test(form.email.trim())) e.email = 'Enter a valid email address.';
    if (variant === 'book' && !form.country) e.country = 'Please choose a country.';
    if (!form.budget) e.budget = 'Please choose a budget.';
    return e;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;

    // Preferred date has no column of its own, so it travels with the message.
    const message = [form.date && `Preferred date: ${form.date}`, form.message.trim()].filter(Boolean).join(' | ');
    const lead: Lead = {
      id: Date.now().toString(),
      name: form.name.trim(),
      phone: normalizeMobile(form.phone) ?? form.phone,
      email: form.email.trim(),
      preferredLocation: form.country,
      interestedProject: '',
      budget: form.budget,
      message,
      source,
      status: 'new',
      createdAt: new Date().toISOString(),
    };

    setSubmitting(true);
    setSubmitError(null);
    try {
      await addLead(lead);
      setSubmitted(true);
      onSuccess?.();
    } catch (error) {
      console.error('Failed to submit lead:', error);
      setSubmitError('Something went wrong. Please try again or contact us directly.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12" role="status">
        <div className="w-16 h-16 rounded-full bg-champagne-gold/20 flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-champagne-gold" />
        </div>
        <h3 className="font-serif text-2xl font-bold text-white mb-2">Thank You!</h3>
        <p className="text-stone-gray font-sans text-sm">
          {variant === 'book'
            ? 'Your consultation request has been received. Our team will contact you shortly.'
            : 'Our expert will call you back shortly.'}
        </p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {fields.map((field, i) => {
        const id = `${uid}-${field.key}`;
        const err = errors[field.key];
        const common = {
          id,
          value: form[field.key],
          'aria-invalid': !!err,
          'aria-describedby': err ? `${id}-err` : undefined,
          className: inputClass,
        };
        const set = (v: string) => setForm((f) => ({ ...f, [field.key]: v }));
        return (
          <motion.div
            key={field.key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.05 }}
          >
            <label htmlFor={id} className="block mb-1.5 text-xs font-sans font-medium tracking-wide text-white/80">
              {field.label}{field.required && <span className="text-champagne-gold"> *</span>}
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-gray">{field.icon}</div>
              {field.type === 'select' ? (
                <select {...common} onChange={(e) => set(e.target.value)}>
                  <option value="" className="text-black">Select…</option>
                  {field.options!.map((o) => <option key={o} value={o} className="text-black">{o}</option>)}
                </select>
              ) : (
                <input
                  {...common}
                  type={field.type}
                  inputMode={field.type === 'tel' ? 'numeric' : undefined}
                  autoComplete={field.key === 'name' ? 'name' : field.key === 'phone' ? 'tel' : field.key === 'email' ? 'email' : undefined}
                  placeholder={field.placeholder}
                  onChange={(e) => set(e.target.value)}
                />
              )}
            </div>
            {err && <p id={`${id}-err`} role="alert" className="mt-1 text-xs text-red-400 font-sans">{err}</p>}
          </motion.div>
        );
      })}
      {submitError && <p role="alert" className="text-center text-red-400 font-sans text-sm">{submitError}</p>}
      <motion.button
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
        type="submit"
        disabled={submitting}
        className="w-full bg-champagne-gold text-deep-black font-sans font-semibold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-soft-gold hover:shadow-[0_0_30px_rgba(214,179,106,0.3)] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {submitting ? 'Submitting...' : variant === 'book' ? 'Book My Consultation' : 'Get Expert Callback'}
        <ArrowRight className="w-4 h-4" />
      </motion.button>
      <p className="text-center text-muted-gray font-sans text-xs">
        <Shield className="w-3 h-3 inline mr-1" />
        Your details are safe and secure with us.
      </p>
    </form>
  );
}
