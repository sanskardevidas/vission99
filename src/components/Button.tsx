import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface ButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary';
  size?: 'md' | 'lg';
  icon?: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  className?: string;
  dark?: boolean;
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  onClick,
  type = 'button',
  className = '',
  dark = false,
}: ButtonProps) {
  const base = 'inline-flex items-center gap-2 font-sans font-semibold rounded-xl transition-all duration-300 cursor-pointer';

  const sizes = {
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base',
  };

  const primaryClasses = 'bg-champagne-gold text-deep-black hover:bg-soft-gold hover:shadow-[0_0_30px_rgba(214,179,106,0.3)] hover:-translate-y-0.5';

  const secondaryClasses = dark
    ? 'bg-transparent border border-white/20 text-white hover:border-champagne-gold hover:text-champagne-gold'
    : 'bg-transparent border border-charcoal/20 text-charcoal hover:border-champagne-gold hover:text-champagne-gold';

  const variantClasses = variant === 'primary' ? primaryClasses : secondaryClasses;

  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      type={type}
      onClick={onClick}
      className={`${base} ${sizes[size]} ${variantClasses} ${className}`}
    >
      {children}
      {icon && (
        <motion.span
          whileHover={{ x: 4 }}
          transition={{ duration: 0.2 }}
          className="inline-flex"
        >
          {icon}
        </motion.span>
      )}
    </motion.button>
  );
}
