import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, X } from 'lucide-react';

interface ToastProps {
  message: string;
  visible: boolean;
  onClose: () => void;
}

export default function Toast({ message, visible, onClose }: ToastProps) {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(onClose, 4000);
      return () => clearTimeout(timer);
    }
  }, [visible, onClose]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="fixed top-6 right-6 z-[100] flex items-center gap-3 bg-charcoal border border-champagne-gold/30 rounded-2xl px-6 py-4 shadow-2xl"
        >
          <CheckCircle className="w-5 h-5 text-champagne-gold shrink-0" />
          <span className="text-premium-ivory font-sans text-sm">{message}</span>
          <button onClick={onClose} className="ml-3 text-muted-gray hover:text-premium-ivory transition">
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function useToast() {
  const [toast, setToast] = useState({ message: '', visible: false });
  const showToast = (message: string) => setToast({ message, visible: true });
  const hideToast = () => setToast((p) => ({ ...p, visible: false }));
  return { toast, showToast, hideToast };
}
