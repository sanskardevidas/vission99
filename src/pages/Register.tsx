import { useState, useEffect, FormEvent } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { ROLE_ROUTE, lookupReferrer, normalizeMobile, registerPartner } from '../partner/store';

export default function Register() {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const refId = searchParams.get('ref');
  const [referrer, setReferrer] = useState<{ id: string; name: string } | null | undefined>(refId ? undefined : null);
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState('');

  const [loading, setLoading] = useState(false);
  const [duplicate, setDuplicate] = useState(false);

  // Referral link: the referrer is captured automatically from ?ref=
  useEffect(() => {
    if (!refId) return;
    let live = true;
    lookupReferrer(refId).then(r => { if (live) setReferrer(r); });
    return () => { live = false; };
  }, [refId]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    setError('');
    setDuplicate(false);

    const next: Record<string, string> = {};
    if (!fullName.trim()) next.fullName = 'Full name is required.';
    if (!normalizeMobile(mobile)) next.mobile = 'Enter a valid 10-digit mobile number.';
    if (password.length < 8) next.password = 'Password must be at least 8 characters.';
    if (confirmPassword !== password) next.confirmPassword = 'Passwords do not match.';
    if (!accepted) next.accepted = 'Please accept the Terms and Privacy Policy to continue.';
    setErrors(next);
    if (Object.keys(next).length) return;

    if (refId && referrer === null) {
      setError('This referral link is not valid. Please ask your referrer for a new link.');
      return;
    }

    setLoading(true);
    const result = await registerPartner({ name: fullName, mobile, password, refId: referrer?.id ?? null });
    setLoading(false);

    if (!result.ok) {
      setError(result.error);
      setDuplicate(!!result.duplicate);
      return;
    }

    navigate(ROLE_ROUTE[result.partner.role], { replace: true });
  }

  return (
    <div className="min-h-screen bg-deep-black flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-deep-black">
            Create Account
          </h1>

          <p className="text-gray-500 mt-2">
            Join Vission99 Properties
          </p>
        </div>

        {refId && referrer !== undefined && (
          <div className={`mb-5 rounded-lg border p-3 text-sm ${referrer ? 'border-champagne-gold/50 bg-champagne-gold/10 text-deep-black' : 'border-red-200 bg-red-50 text-red-600'}`}>
            {referrer
              ? <>Referred by <strong>{referrer.name}</strong> ({referrer.id})</>
              : 'This referral link is not valid.'}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          noValidate
          className="space-y-5"
        >
          <div>
            <label htmlFor="reg-name" className="block text-sm font-medium mb-2">
              Full Name
            </label>

            <input
              id="reg-name"
              type="text"
              autoComplete="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              aria-invalid={!!errors.fullName}
              aria-describedby={errors.fullName ? 'reg-name-err' : undefined}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-champagne-gold focus:ring-2 focus:ring-champagne-gold/20"
              placeholder="Enter your full name"
            />
            {errors.fullName && <p id="reg-name-err" role="alert" className="mt-1 text-sm text-red-600">{errors.fullName}</p>}
          </div>

          <div>
            <label htmlFor="reg-mobile" className="block text-sm font-medium mb-2">
              Mobile Number
            </label>

            <input
              id="reg-mobile"
              type="tel"
              inputMode="numeric"
              autoComplete="username"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              aria-invalid={!!errors.mobile}
              aria-describedby={errors.mobile ? 'reg-mobile-err' : undefined}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-champagne-gold focus:ring-2 focus:ring-champagne-gold/20"
              placeholder="10-digit mobile number"
            />
            {errors.mobile && <p id="reg-mobile-err" role="alert" className="mt-1 text-sm text-red-600">{errors.mobile}</p>}
          </div>

          <div>
            <label htmlFor="reg-password" className="block text-sm font-medium mb-2">
              Password
            </label>

            <div className="relative">
              <input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? 'reg-password-err' : undefined}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-champagne-gold focus:ring-2 focus:ring-champagne-gold/20 pr-14"
                placeholder="At least 8 characters"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center text-gray-500 hover:text-champagne-gold"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && <p id="reg-password-err" role="alert" className="mt-1 text-sm text-red-600">{errors.password}</p>}
          </div>

          <div>
            <label htmlFor="reg-confirm" className="block text-sm font-medium mb-2">
              Confirm Password
            </label>

            <input
              id="reg-confirm"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              aria-invalid={!!errors.confirmPassword}
              aria-describedby={errors.confirmPassword ? 'reg-confirm-err' : undefined}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-champagne-gold focus:ring-2 focus:ring-champagne-gold/20"
              placeholder="Re-enter password"
            />
            {errors.confirmPassword && <p id="reg-confirm-err" role="alert" className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
          </div>

          <div>
            <label className="flex items-start gap-3 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                aria-invalid={!!errors.accepted}
                aria-describedby={errors.accepted ? 'reg-terms-err' : undefined}
                className="mt-1 h-4 w-4 accent-champagne-gold"
              />
              <span>
                I agree to the{' '}
                <Link to="/terms" target="_blank" className="font-semibold text-champagne-gold underline">Terms of Service</Link>
                {' '}and{' '}
                <Link to="/privacy" target="_blank" className="font-semibold text-champagne-gold underline">Privacy Policy</Link>.
              </span>
            </label>
            {errors.accepted && <p id="reg-terms-err" role="alert" className="mt-1 text-sm text-red-600">{errors.accepted}</p>}
          </div>

          {error && (
            <div role="alert" className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg p-3">
              {error}
              {duplicate && <> <Link to="/login" className="font-semibold underline">Go to Login</Link></>}
            </div>
          )}

          <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading}
            className="w-full bg-champagne-gold text-deep-black font-semibold py-3 rounded-lg hover:opacity-90 transition disabled:opacity-50"
          >
            {loading
              ? 'Creating Account...'
              : 'Create Account'}
          </motion.button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            Already have an account?
          </p>

          <Link
            to="/login"
            className="text-champagne-gold font-semibold hover:underline"
          >
            Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
}