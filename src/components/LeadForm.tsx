import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Phone, Mail, Calendar, MapPin, MessageSquare, ArrowRight, Shield } from 'lucide-react';
import type { Lead } from '../types';
import { addLead } from '../utils/storage';

interface LeadFormProps {
  source?: string;
  variant?: 'book' | 'callback';
  onSuccess?: () => void;
}

export default function LeadForm({ source = 'website', variant = 'book', onSuccess }: LeadFormProps) {
  const [form, setForm] = useState({
  name: '',
  phone: '',
  email: '',
  date: '',
  address: '',
  message: '',
  budget: '',
});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const lead: Lead = {
      id: Date.now().toString(),
      name: form.name,
      phone: form.phone,
      email: form.email,
      preferredLocation: form.address,
      interestedProject: '',
      budget: form.budget,
      message: form.message,
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

  const fields = variant === 'book'
    ? [
        { key: 'name', icon: <User className="w-4 h-4" />, placeholder: 'Full Name', type: 'text' },
        { key: 'phone', icon: <Phone className="w-4 h-4" />, placeholder: 'Mobile Number', type: 'tel' },
        { key: 'email', icon: <Mail className="w-4 h-4" />, placeholder: 'Email Address', type: 'email' },
        { key: 'date', icon: <Calendar className="w-4 h-4" />, placeholder: 'Preferred Date', type: 'date' },
        
        {
          key: 'address',
          icon: <MapPin className="w-4 h-4" />,
          placeholder: 'Enter Complete Property Address',
          type: 'textarea',
    },
        { key: 'message', icon: <MessageSquare className="w-4 h-4" />, placeholder: 'Any specific requirement? (Optional)', type: 'text' },
      ]
    : [
        { key: 'name', icon: <User className="w-4 h-4" />, placeholder: 'Name', type: 'text' },
        { key: 'phone', icon: <Phone className="w-4 h-4" />, placeholder: 'Phone', type: 'tel' },
        { key: 'email', icon: <Mail className="w-4 h-4" />, placeholder: 'Email', type: 'email' },
        { key: 'budget', icon: <MapPin className="w-4 h-4" />, placeholder: 'Budget', type: 'text' },
        { key: 'message', icon: <MessageSquare className="w-4 h-4" />, placeholder: 'Message', type: 'text' },
      ];

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12"
      >
        <div className="w-16 h-16 rounded-full bg-champagne-gold/20 flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-champagne-gold" />
        </div>
        <h3 className="font-serif text-2xl font-bold text-white mb-2">Thank You!</h3>
        <p className="text-stone-gray font-sans text-sm">
          {variant === 'book'
            ? 'Your experience visit has been booked successfully.'
            : 'Our expert will call you back shortly.'}
        </p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {fields.map((field, i) => (
        <motion.div
          key={field.key}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: i * 0.05 }}
          className="relative"
        >
         <div className="absolute left-4 top-4 text-muted-gray">
  {field.icon}
</div>

{field.type === 'textarea' ? (
  <textarea
    rows={4}
    value={form[field.key as keyof typeof form]}
    onChange={(e) =>
      setForm((f) => ({ ...f, [field.key]: e.target.value }))
    }
    placeholder={field.placeholder}
    required={field.key !== 'message'}
    className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-white font-sans text-sm placeholder-muted-gray focus:border-champagne-gold focus:outline-none transition-colors resize-none"
  />
) : (
  <input
    type={field.type}
    value={form[field.key as keyof typeof form]}
    onChange={(e) =>
      setForm((f) => ({ ...f, [field.key]: e.target.value }))
    }
    placeholder={field.placeholder}
    required={field.key !== 'message'}
    className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-white font-sans text-sm placeholder-muted-gray focus:border-champagne-gold focus:outline-none transition-colors"
  />
)}
        </motion.div>
      ))}
      {submitError && (
        <p className="text-center text-red-400 font-sans text-sm">{submitError}</p>
      )}
      <motion.button
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
        type="submit"
        disabled={submitting}
        className="w-full bg-champagne-gold text-deep-black font-sans font-semibold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-soft-gold hover:shadow-[0_0_30px_rgba(214,179,106,0.3)] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {submitting
          ? 'Submitting...'
          : variant === 'book' ? 'Book My Experience' : 'Get Expert Callback'}
        <ArrowRight className="w-4 h-4" />
      </motion.button>
      <p className="text-center text-muted-gray font-sans text-xs">
        <Shield className="w-3 h-3 inline mr-1" />
        Your details are safe and secure with us.
      </p>
    </form>
  );
}
