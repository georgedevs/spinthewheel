'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Dialog, Transition } from '@headlessui/react';
import { Lock, LogOut } from 'lucide-react';

interface WinningTicket {
  code: string;
  spinResult: string;
  spinNumber: number;
  createdAt: string;
  isMillionContestant: boolean; 
}

interface SpinStats {
  totalSpins: number;
  millionContestants: number;
  rangeMillionCounts: {
    [key: string]: number;
  };
  remainingSpins: number;
}

const ADMIN_CREDENTIALS = {
  username: 'secretadmin',
  password: 'adminHere'
};

const AUTH_KEY = 'admin_auth';

export default function AdminPage() {
  const [winningTickets, setWinningTickets] = useState<WinningTicket[]>([]);
  const [stats, setStats] = useState<SpinStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    // Check if already authenticated
    const auth = localStorage.getItem(AUTH_KEY);
    if (auth === 'true') {
      setIsAuthenticated(true);
    } else {
      setShowAuthModal(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      localStorage.setItem(AUTH_KEY, 'true');
      setIsAuthenticated(true);
      setShowAuthModal(false);
      setAuthError('');
    } else {
      setAuthError('Invalid credentials');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(AUTH_KEY);
    setIsAuthenticated(false);
    setShowAuthModal(true);
  };

  const fetchData = async () => {
    try {
      const [ticketsResponse, statsResponse] = await Promise.all([
        fetch('/api/admin/winning-tickets'),
        fetch('/api/admin/stats')
      ]);

      if (!ticketsResponse.ok || !statsResponse.ok) {
        throw new Error('Failed to fetch data');
      }

      const tickets = await ticketsResponse.json();
      const statsData = await statsResponse.json();

      setWinningTickets(tickets);
      setStats(statsData);
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <>
      {/* Auth Modal */}
      <Transition show={showAuthModal} as="div">
        <Dialog onClose={() => {}} className="relative z-50">
          <div className="fixed inset-0 bg-black/90" />
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex justify-center mb-4">
                  <Lock className="w-12 h-12 text-primary-500" />
                </div>
                <Dialog.Title as="h3" className="text-2xl font-bold text-center text-white mb-6">
                  Admin Authentication
                </Dialog.Title>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <input
                      type="text"
                      placeholder="Username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full px-4 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-primary-500"
                    />
                  </div>
                  {authError && (
                    <p className="text-red-500 text-sm">{authError}</p>
                  )}
                  <button
                    type="submit"
                    className="w-full py-2 px-4 bg-primary-500 text-white rounded hover:bg-primary-600 transition-colors"
                  >
                    Login
                  </button>
                </form>
              </Dialog.Panel>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Main Dashboard */}
      {isAuthenticated && (
        <main className="min-h-screen bg-gray-900 text-white p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-4xl font-bold">Admin Dashboard</h1>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-800 rounded-lg p-6"
              >
                <h2 className="text-xl mb-2">Total Spins</h2>
                <p className="text-3xl font-bold text-primary-500">{stats?.totalSpins}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gray-800 rounded-lg p-6"
              >
                <h2 className="text-xl mb-2">Remaining Spins</h2>
                <p className="text-3xl font-bold text-primary-500">{stats?.remainingSpins}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gray-800 rounded-lg p-6"
              >
               <h2 className="text-xl mb-2">₦1,000,000 Contestants</h2>
  <p className="text-3xl font-bold text-primary-500">
    {stats?.millionContestants}/16
  </p>
  <div className="mt-2 text-sm text-gray-400">
    {Object.entries(stats?.rangeMillionCounts || {}).map(([range, count]) => (
      <div key={range} className="flex justify-between">
        <span>Range {range}:</span>
        <span>{count}/{range.startsWith('1-') ? '4' : '2'}</span>
      </div>
    ))}
  </div>
              </motion.div>
            </div>

            {/* Winning Tickets Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gray-800 rounded-lg p-6"
            >
              <h2 className="text-2xl font-bold mb-4">Winning Tickets</h2>
              <div className="overflow-x-auto">
              <table className="w-full">
  <thead>
    <tr className="border-b border-gray-700">
      <th className="text-left py-3 px-4">Ticket Code</th>
      <th className="text-left py-3 px-4">Prize Won</th>
      <th className="text-left py-3 px-4">Million Contestant</th>
      <th className="text-left py-3 px-4">Spin Number</th>
      <th className="text-left py-3 px-4">Date</th>
    </tr>
  </thead>
  <tbody>
    {winningTickets.map((ticket) => (
      <tr key={ticket.code} className="border-b border-gray-700">
        <td className="py-3 px-4">{ticket.code}</td>
        <td className="py-3 px-4">
          <span className={ticket.spinResult === '₦1,000,000' ? 'text-yellow-500 font-bold' : ''}>
            {ticket.spinResult}
          </span>
        </td>
        <td className="py-3 px-4">
          {ticket.isMillionContestant && (
            <span className="text-yellow-500">Contestant</span>
          )}
        </td>
        <td className="py-3 px-4">{ticket.spinNumber}</td>
        <td className="py-3 px-4">
          {new Date(ticket.createdAt).toLocaleDateString()}
        </td>
      </tr>
    ))}
  </tbody>
</table>
              </div>
            </motion.div>
          </div>
        </main>
      )}
    </>
  );
}