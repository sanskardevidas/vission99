import loginBg from '../assets/IMG_9781.JPG.jpeg';
import { useState, FormEvent, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const { signIn, user, isAdmin, loading } = useAuth();

  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      if (isAdmin) {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    }
  }, [user, isAdmin, loading, navigate]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    setError('');
    setSubmitting(true);

    const result = await signIn(email, password);

    setSubmitting(false);

    if (result.error) {
      setError(result.error);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 relative bg-deep-black"
      style={{
        backgroundImage: `url(${loginBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-deep-black/70" />

      <div className="relative z-10 w-full max-w-md bg-deep-black/60 backdrop-blur-md border border-white/10 rounded-2xl p-8">
        <h1 className="font-serif text-3xl font-bold mb-2 text-center text-white">
          Welcome Back
        </h1>

        <p className="text-center text-white/60 mb-6 text-sm">
          Login to your Vission99 account
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm font-medium text-white/80">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-muted-gray focus:border-champagne-gold focus:outline-none transition-colors"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium text-white/80">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs text-champagne-gold hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-muted-gray focus:border-champagne-gold focus:outline-none transition-colors"
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-champagne-gold text-deep-black font-semibold rounded-xl px-3 py-3 hover:bg-soft-gold transition disabled:opacity-50"
          >
            {submitting ? 'Signing In...' : 'Login'}
          </button>
        </form>

        <p className="text-sm text-center mt-4 text-white/70">
          Don't have an account?{' '}
          <Link to="/register" className="text-champagne-gold hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}