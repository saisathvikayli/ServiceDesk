import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
    <div className="flex min-h-screen bg-slate-100 items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
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
            className="w-full py-3 bg-teal-700 text-white font-medium text-sm rounded-lg hover:bg-teal-800 transition"
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
  );
}