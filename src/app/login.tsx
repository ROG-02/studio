
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [accessKey, setAccessKey] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Simple validation
    if (!username || !accessKey) {
      setError('Both fields are required');
      return;
    }

    // Simulate authentication
    const isAuthenticated = username === 'admin' && accessKey === 'securekey123';
    if (isAuthenticated) {
      // Set a session (for demo, use localStorage)
      window.localStorage.setItem('isAuthenticated', 'true');
      router.push('/');
    } else {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-200">
      <div className="w-full max-w-sm p-6 rounded-lg shadow-lg bg-black border-2 border-cyan-400" style={{ fontFamily: 'monospace' }}>
        <div className="mb-6 flex items-center justify-between">
          <span className="text-cyan-400 font-bold tracking-widest">SECURE_DATA</span>
          <span className="flex space-x-1">
            <span className="w-2 h-2 bg-gray-700 rounded-full"></span>
            <span className="w-2 h-2 bg-gray-700 rounded-full"></span>
            <span className="w-2 h-2 bg-gray-700 rounded-full"></span>
          </span>
        </div>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <form onSubmit={handleLogin}>
          <div className="mb-6">
            <label htmlFor="username" className="block text-cyan-400 tracking-widest mb-1">USERNAME</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-transparent border-b-2 border-cyan-400 text-cyan-200 py-2 px-1 focus:outline-none focus:border-cyan-300 placeholder-cyan-600"
              autoComplete="username"
              required
            />
          </div>
          <div className="mb-8">
            <label htmlFor="accessKey" className="block text-cyan-400 tracking-widest mb-1">ACCESS_KEY</label>
            <input
              type="password"
              id="accessKey"
              value={accessKey}
              onChange={(e) => setAccessKey(e.target.value)}
              className="w-full bg-transparent border-b-2 border-cyan-400 text-cyan-200 py-2 px-1 focus:outline-none focus:border-cyan-300 placeholder-cyan-600"
              autoComplete="current-password"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 border-2 border-cyan-400 text-cyan-400 font-bold tracking-widest rounded hover:bg-cyan-400 hover:text-black transition-colors duration-200"
          >
            INITIATE_CONNECTION
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
"use client";
