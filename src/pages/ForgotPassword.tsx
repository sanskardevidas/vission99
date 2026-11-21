import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, Phone, ShieldCheck } from 'lucide-react';
import { normalizeMobile, requestPasswordOtp, resetPasswordWithOtp } from '../partner/store';

const inputClass =
  'w-full min-h-[48px] bg-white border border-stone-gray rounded-xl pl-11 pr-4 py-3 text-[#101010] text-sm placeholder-muted-gray focus:border-[#D9B66F] focus:outline-none transition-colors';

// Step 1: enter the registered mobile -> SMS code. Step 2: enter the code + a new password.
export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'mobile' | 'reset'>('mobile');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function sendCode(e?: FormEvent) {
    e?.preventDefault();
    setFormError('');
    setInfo('');
    if (!normalizeMobile(mobile)) {
      setErrors({ mobile: 'Enter a valid 10-digit mobile number.' });
      return;
    }
    setErrors({});
    setLoading(true);
    const r = await requestPasswordOtp(mobile);
    setLoading(false);
    if (!r.ok) {
      setFormError(r.error);
      return;
    }
    setInfo('If this number is registered, a 6-digit code has been sent by SMS. It is valid for 10 minutes.');
    setStep('reset');
  }

  async function resetPassword(e: FormEvent) {
    e.preventDefault();
    setFormError('');
    const next: Record<string, string> = {};
    if (!/^\d{6}$/.test(otp)) next.otp = 'Enter the 6-digit code from the SMS.';
    if (password.length < 8) next.password = 'Password must be at least 8 characters.';
    if (confirm !== password) next.confirm = 'Passwords do not match.';
    setErrors(next);
    if (Object.keys(next).length) return;

    setLoading(true);
    const r = await resetPasswordWithOtp(mobile, otp, password);
    setLoading(false);
    if (!r.ok) {
      setFormError(r.error);
      return;
    }
    setDone(true);
    setTimeout(() => navigate('/login', { replace: true }), 2500);
  }

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-[#F6F1E9]">
      <div className="min-h-full flex items-center justify-center px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-full max-w-md bg-white rounded-2xl p-6 sm:p-8 shadow-[0_8px_32px_rgba(16,16,16,0.08)]"
        >
          <Link to="/" className="font-serif text-lg font-extrabold tracking-wide text-[#D9B66F]">
            VISSION99 AQAAR
          </Link>
          <h1 className="mt-4 font-serif text-3xl font-bold text-[#101010]">Forgot Password</h1>

          {done ? (
            <div role="status" className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
              Your password has been reset. Redirecting you to login…
            </div>
          ) : step === 'mobile' ? (
            <form onSubmit={sendCode} noValidate className="mt-2 space-y-4">
              <p className="text-sm text-[#292929]/70">
                Enter your registered mobile number and we'll text you a 6-digit code.
              </p>
              <div>
                <label htmlFor="fp-mobile" className="block mb-1 text-sm font-medium text-[#292929]">Mobile Number</label>
                <div className="relative">
                  <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D9B66F]" />
                  <input
                    id="fp-mobile" type="tel" inputMode="numeric" autoComplete="username"
                    value={mobile} onChange={(e) => setMobile(e.target.value)}
                    placeholder="10-digit mobile number" className={inputClass}
                    aria-invalid={!!errors.mobile} aria-describedby={errors.mobile ? 'fp-mobile-err' : undefined}
                  />
                </div>
                {errors.mobile && <p id="fp-mobile-err" role="alert" className="mt-1 text-sm text-red-600">{errors.mobile}</p>}
              </div>
              {formError && <p role="alert" className="text-sm text-red-600">{formError}</p>}
              <button type="submit" disabled={loading} className="w-full min-h-[48px] bg-[#D9B66F] text-[#101010] font-semibold rounded-xl px-3 py-3 hover:brightness-105 transition disabled:opacity-50">
                {loading ? 'Sending code…' : 'Send Code'}
              </button>
            </form>
          ) : (
            <form onSubmit={resetPassword} noValidate className="mt-2 space-y-4">
              {info && <p role="status" className="text-sm text-[#292929]/70">{info}</p>}
              <div>
                <label htmlFor="fp-otp" className="block mb-1 text-sm font-medium text-[#292929]">6-digit code</label>
                <div className="relative">
                  <ShieldCheck size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D9B66F]" />
                  <input
                    id="fp-otp" type="text" inputMode="numeric" autoComplete="one-time-code" maxLength={6}
                    value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter code" className={inputClass}
                    aria-invalid={!!errors.otp} aria-describedby={errors.otp ? 'fp-otp-err' : undefined}
                  />
                </div>
                {errors.otp && <p id="fp-otp-err" role="alert" className="mt-1 text-sm text-red-600">{errors.otp}</p>}
              </div>
              <div>
                <label htmlFor="fp-pass" className="block mb-1 text-sm font-medium text-[#292929]">New Password</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D9B66F]" />
                  <input
                    id="fp-pass" type={show ? 'text' : 'password'} autoComplete="new-password"
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters" className={`${inputClass} pr-12`}
                    aria-invalid={!!errors.password} aria-describedby={errors.password ? 'fp-pass-err' : undefined}
                  />
                  <button type="button" onClick={() => setShow(!show)} aria-label={show ? 'Hide password' : 'Show password'}
                    className="absolute right-2 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center text-[#292929]/60 hover:text-[#D9B66F]">
                    {show ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.password && <p id="fp-pass-err" role="alert" className="mt-1 text-sm text-red-600">{errors.password}</p>}
              </div>
              <div>
                <label htmlFor="fp-confirm" className="block mb-1 text-sm font-medium text-[#292929]">Confirm Password</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D9B66F]" />
                  <input
                    id="fp-confirm" type={show ? 'text' : 'password'} autoComplete="new-password"
                    value={confirm} onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Re-enter password" className={inputClass}
                    aria-invalid={!!errors.confirm} aria-describedby={errors.confirm ? 'fp-confirm-err' : undefined}
                  />
                </div>
                {errors.confirm && <p id="fp-confirm-err" role="alert" className="mt-1 text-sm text-red-600">{errors.confirm}</p>}
              </div>
              {formError && <p role="alert" className="text-sm text-red-600">{formError}</p>}
              <button type="submit" disabled={loading} className="w-full min-h-[48px] bg-[#D9B66F] text-[#101010] font-semibold rounded-xl px-3 py-3 hover:brightness-105 transition disabled:opacity-50">
                {loading ? 'Resetting…' : 'Reset Password'}
              </button>
              <button type="button" onClick={() => { setStep('mobile'); setErrors({}); setFormError(''); }} className="w-full text-sm text-[#292929]/70 hover:underline">
                Use a different number
              </button>
              <button type="button" onClick={() => sendCode()} disabled={loading} className="w-full text-sm text-[#8a6a1f] hover:underline disabled:opacity-50">
                Resend code
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-sm">
            <Link to="/login" className="text-[#8a6a1f] font-semibold hover:underline">Back to Login</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
