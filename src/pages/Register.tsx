import { useState, useEffect, FormEvent } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
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

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
    setSuccess('');
    setDuplicate(false);

    if (!fullName.trim()) {
      setError('Full name is required');
      return;
    }

    if (!normalizeMobile(mobile)) {
      setError('Enter a valid 10-digit Indian mobile number');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

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
          className="space-y-5"
        >
          <div>
            <label className="block text-sm font-medium mb-2">
              Full Name
            </label>

            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-champagne-gold focus:ring-2 focus:ring-champagne-gold/20"
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Mobile Number
            </label>

            <input
              type="tel"
              inputMode="tel"
              autoComplete="username"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-champagne-gold focus:ring-2 focus:ring-champagne-gold/20"
              placeholder="10-digit mobile number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              required
              minLength={8}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-champagne-gold focus:ring-2 focus:ring-champagne-gold/20"
              placeholder="Enter password"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Confirm Password
            </label>

            <input
              type="password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(e.target.value)
              }
              required
              minLength={8}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-champagne-gold focus:ring-2 focus:ring-champagne-gold/20"
              placeholder="Confirm password"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg p-3">
              {error}
              {duplicate && <> <Link to="/login" className="font-semibold underline">Go to Login</Link></>}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-600 text-sm rounded-lg p-3">
              {success}
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