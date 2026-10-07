import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import API from '../lib/api';

export default function LoginScreen({ onAuthenticated }) {
  const [isRegister, setIsRegister] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('employee');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Client-side validation check
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    try {
      if (isRegister) {
        // Registration endpoint
        const res = await API.post('/auth/register', {
          name: fullName,
          email: email.trim(),
          password: password,
          role: role,
        });
        // Auto-login after registration or pass token
        if (res.data.token) {
          localStorage.setItem('servicedesk_token', res.data.token);
          localStorage.setItem('servicedesk_user', JSON.stringify(res.data.user));
          if (onAuthenticated) await onAuthenticated(email, password);
          navigate('/');
        } else {
          setIsRegister(false);
          setError('Account created successfully! Please sign in.');
        }
      } else {
        // Login endpoint
        const user = await onAuthenticated(email.trim(), password);
        if (user) navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please try again.');
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#17252a] p-4">
      {/* ambient gradient blobs - slow, deliberate drift, not decoration for its own sake */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -left-32 -top-32 h-[32rem] w-[32rem] rounded-full bg-[#147a76] opacity-50 blur-3xl"
          style={{ animation: 'blob-drift 24s ease-in-out infinite' }}
        />
        <div
          className="absolute -right-24 top-1/3 h-[28rem] w-[28rem] rounded-full bg-[#f2c14e] opacity-20 blur-3xl"
          style={{ animation: 'blob-drift 30s ease-in-out infinite reverse' }}
        />
        <div
          className="absolute -bottom-40 left-1/3 h-[26rem] w-[26rem] rounded-full bg-[#0c5b59] opacity-70 blur-3xl"
          style={{ animation: 'blob-drift 26s ease-in-out infinite' }}
        />
      </div>

      <div className="relative z-10 flex w-full max-w-md flex-col items-center">
        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center bg-[#f2c14e] text-[#17252a]">
            <ShieldCheck size={18} />
          </span>
          <span className="text-lg font-extrabold tracking-[-0.06em] text-white">
            service<span className="text-[#f2c14e]">/</span>desk
          </span>
        </div>

        <div className="w-full bg-white p-8 rounded-xl shadow-2xl">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">
            {isRegister ? 'Start your service desk.' : 'Welcome back'}
          </h2>
          <p className="text-sm text-slate-500 mb-6">
            {isRegister
              ? 'Create an account and give every request a clear path forward.'
              : 'Enter your credentials to access your control room.'}
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                  Full name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 outline-none focus:border-teal-600"
                  placeholder="John Doe"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                Work email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 outline-none focus:border-teal-600"
                placeholder="you@company.com"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 outline-none focus:border-teal-600"
                placeholder="At least 8 characters"
              />
            </div>

            {isRegister && (
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                  Account type
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 outline-none focus:border-teal-600"
                >
                  <option value="employee">Requester (Employee)</option>
                  <option value="technician">Technician</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-[#147a76] text-white font-medium text-sm rounded-lg hover:bg-[#0c5b59] transition"
            >
              {isRegister ? 'Create account' : 'Enter workspace'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-600">
            {isRegister ? (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsRegister(false);
                    setError('');
                  }}
                  className="text-teal-700 font-semibold hover:underline"
                >
                  Sign in
                </button>
              </p>
            ) : (
              <p>
                New to the service desk?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsRegister(true);
                    setError('');
                  }}
                  className="text-teal-700 font-semibold hover:underline"
                >
                  Create an account
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}