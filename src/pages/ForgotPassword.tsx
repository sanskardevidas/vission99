import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await resetPassword(email);

    setLoading(false);

    if (error) {
      setError(error);
    } else {
      setSent(true);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-deep-black">
      <div className="relative z-10 w-full max-w-md bg-deep-black/60 border border-white/10 rounded-2xl p-8">
        <h1 className="font-serif text-3xl font-bold mb-4 text-center text-white">
          Forgot Password
        </h1>

        {sent ? (
          <p className="text-center text-white/80 text-sm">
            If an account exists for <span className="text-champagne-gold">{email}</span>,
            a password reset link has been sent. Please check your inbox.
          </p>
        ) : (
          <>
            <p className="text-center text-white/60 text-sm mb-6">
              Enter your email and we'll send you a link to reset your password.
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

              {error && <p className="text-red-400 text-sm">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-champagne-gold text-deep-black font-semibold rounded-xl px-3 py-3 hover:bg-soft-gold transition disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          </>
        )}

        <p className="text-sm text-center mt-4 text-white/70">
          <Link to="/login" className="text-champagne-gold hover:underline">
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
}