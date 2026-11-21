import loginBg from '../assets/IMG_9781.JPG.jpeg';
import { useState, FormEvent, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Phone, Lock, TrendingUp, UsersRound, CalendarCheck, Megaphone } from 'lucide-react';
import { ROLE_ROUTE, isLoaded, normalizeMobile, refresh, getSessionPartner, signIn } from '../partner/store';

export default function Login() {
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ mobile?: string; password?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  // Already signed in? Go straight to the dashboard for the partner's current role.
  useEffect(() => {
    let live = true;
    (async () => {
      if (!isLoaded()) await refresh();
      const partner = getSessionPartner();
      if (live && partner) navigate(ROLE_ROUTE[partner.role], { replace: true });
    })();
    return () => { live = false; };
  }, [navigate]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    const errs: { mobile?: string; password?: string } = {};
    if (!normalizeMobile(mobile)) errs.mobile = 'Enter a valid 10-digit mobile number.';
    if (!password) errs.password = 'Enter your password.';
    setFieldErrors(errs);
    if (errs.mobile || errs.password) return;
    setSubmitting(true);
    const result = await signIn(mobile, password);
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    navigate(ROLE_ROUTE[result.partner.role], { replace: true });
  }

  const benefits = [
    { icon: TrendingUp, text: 'Track your sales & commissions' },
    { icon: UsersRound, text: 'Manage your team' },
    { icon: CalendarCheck, text: 'Schedule site visits' },
    { icon: Megaphone, text: 'Access marketing materials' },
  ];

  const inputClass =
    'w-full min-h-[48px] bg-white border border-stone-gray rounded-xl pl-11 pr-4 py-3 text-[#101010] text-sm placeholder-muted-gray focus:border-[#D9B66F] focus:outline-none transition-colors';

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-[#F6F1E9]">
      <div className="min-h-full flex flex-col lg:flex-row">
        {/* Visual section */}
        <div
          className="relative lg:w-1/2 lg:min-h-screen px-6 py-6 lg:p-14 flex flex-col text-white bg-[#101010]"
          style={{
            backgroundImage: `url(${loginBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-[#101010]/85 via-[#101010]/70 to-[#101010]/95" />

          <div className="relative z-10 flex flex-col flex-1">
            <Link to="/" className="font-serif text-xl lg:text-2xl font-extrabold tracking-wide text-[#D9B66F]">
              VISSION99 AQAAR
            </Link>

            <div className="mt-6 lg:mt-auto">
              <h1 className="font-serif text-3xl lg:text-5xl font-extrabold">Welcome Back!</h1>
              <p className="mt-2 lg:mt-3 text-sm lg:text-lg text-white/80">
                Login to your VISSION99 AQAAR Partner Account
              </p>

              <ul className="hidden lg:block mt-10 space-y-5">
                {benefits.map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-center gap-4">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full border border-[#D9B66F]/50 bg-[#D9B66F]/10 text-[#D9B66F]">
                      <Icon size={20} />
                    </span>
                    <span className="text-white/90">{text}</span>
                  </li>
                ))}
              </ul>
            </div>

            <p className="hidden lg:block mt-auto pt-12 text-xl font-semibold text-[#D9B66F]">
              स्वप्न तुमचे, दिशा आमची
            </p>
          </div>
        </div>

        {/* Form section */}
        <div className="lg:w-1/2 flex items-center justify-center px-4 py-8 lg:p-14">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="w-full max-w-md bg-white rounded-2xl p-6 sm:p-8 shadow-[0_8px_32px_rgba(16,16,16,0.08)]"
          >
            <h2 className="font-serif text-3xl font-bold text-[#101010]">Login</h2>
            <p className="mt-1 mb-6 text-sm text-[#292929]/70">
              Enter your credentials to access your account
            </p>

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <div>
                <label htmlFor="login-mobile" className="block mb-1 text-sm font-medium text-[#292929]">
                  Mobile Number
                </label>
                <div className="relative">
                  <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D9B66F]" />
                  <input
                    id="login-mobile"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="username"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="10-digit mobile number"
                    className={inputClass}
                    aria-invalid={!!fieldErrors.mobile}
                    aria-describedby={fieldErrors.mobile ? 'login-mobile-err' : undefined}
                  />
                </div>
                {fieldErrors.mobile && <p id="login-mobile-err" role="alert" className="mt-1 text-sm text-red-600">{fieldErrors.mobile}</p>}
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="login-password" className="block mb-1 text-sm font-medium text-[#292929]">
                    Password
                  </label>
                  <Link to="/forgot-password" className="mb-1 text-sm font-medium text-[#8a6a1f] hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D9B66F]" />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    autoComplete="current-password"
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className={`${inputClass} pr-14`}
                    aria-invalid={!!fieldErrors.password}
                    aria-describedby={fieldErrors.password ? 'login-password-err' : undefined}
                  />
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center text-[#292929]/60 hover:text-[#D9B66F]"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </motion.button>
                </div>
                {fieldErrors.password && <p id="login-password-err" role="alert" className="mt-1 text-sm text-red-600">{fieldErrors.password}</p>}
              </div>

              {error && <p role="alert" className="text-red-600 text-sm">{error}</p>}

              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                type="submit"
                disabled={submitting}
                className="w-full min-h-[48px] bg-[#D9B66F] text-[#101010] font-semibold rounded-xl px-3 py-3 hover:brightness-105 transition disabled:opacity-50"
              >
                {submitting ? 'Signing In...' : 'Login →'}
              </motion.button>
            </form>

            <div className="mt-6 pt-6 border-t border-[#F6F1E9] text-center">
              <p className="text-sm text-[#292929]/70 mb-3">New to VISSION99 AQAAR?</p>
              <Link
                to="/register"
                className="flex w-full min-h-[48px] items-center justify-center rounded-xl border border-[#D9B66F] text-[#101010] font-semibold hover:bg-[#D9B66F]/15 transition"
              >
                Register as a Partner
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
