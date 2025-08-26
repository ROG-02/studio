"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmail, signUpWithEmail, signOutUser, auth } from '@/lib/firebase';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Both fields are required');
      return;
    }
    try {
      await signInWithEmail(email, password);
      window.localStorage.setItem('isAuthenticated', 'true');
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Both fields are required');
      return;
    }
    try {
      await signUpWithEmail(email, password);
      window.localStorage.setItem('isAuthenticated', 'true');
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
      window.localStorage.removeItem('isAuthenticated');
      router.push('/login');
    } catch (err: any) {
      setError(err.message || 'Sign out failed');
    }
  };

  return (
  <div className="flex items-center justify-center min-h-screen bg-premium-gradient-animated">
      <div className="w-full max-w-sm p-6 rounded-lg shadow-lg bg-black bg-opacity-80 border-2 border-cyan-400" style={{ fontFamily: 'monospace' }}>
        <div className="mb-6 flex items-center justify-between">
          <span className="text-cyan-400 font-bold tracking-widest">SECURE_DATA</span>
          <span className="flex space-x-1">
            <span className="w-2 h-2 bg-gray-700 rounded-full"></span>
            <span className="w-2 h-2 bg-gray-700 rounded-full"></span>
            <span className="w-2 h-2 bg-gray-700 rounded-full"></span>
          </span>
        </div>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
  <form onSubmit={handleLogin} autoComplete="off" spellCheck={false}>
          <div className="mb-6">
            <label htmlFor="email" className="block text-cyan-400 tracking-widest mb-1">EMAIL</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent border-b-2 border-cyan-400 text-cyan-200 py-2 px-1 focus:outline-none focus:border-cyan-300 placeholder-cyan-600"
              autoComplete="new-email"
              required
              inputMode="email"
              spellCheck={false}
              name="email"
              formNoValidate
            />
          </div>
          <div className="mb-8">
            <label htmlFor="password" className="block text-cyan-400 tracking-widest mb-1">PASSWORD</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent border-b-2 border-cyan-400 text-cyan-200 py-2 px-1 focus:outline-none focus:border-cyan-300 placeholder-cyan-600"
              autoComplete="new-password"
              required
              inputMode="text"
              spellCheck={false}
              name="password"
              formNoValidate
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 border-2 border-cyan-400 text-cyan-400 font-bold tracking-widest rounded hover:bg-cyan-400 hover:text-black transition-colors duration-200 mb-2"
          >
            LOGIN
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
