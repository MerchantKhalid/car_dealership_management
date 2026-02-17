'use client';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import { Settings, Users, Plus } from 'lucide-react';
import { handleClientError } from '@/lib/error-handler';
export default function SettingsPage() {
  const { data: session } = useSession();
  const [showRegister, setShowRegister] = useState(false);
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'SALESPERSON',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (registerData.password !== registerData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerData),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error);
      }
      toast.success('User registered successfully!');
      setShowRegister(false);
      setRegisterData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'SALESPERSON',
        phone: '',
      });
    } catch (error) {
      const message = handleClientError(error, 'generateReport');
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="page-title">Settings</h1>
      {/* User Profile */}
      <div className="card p-6">
        <h2
          className="text-lg font-semibold text-gray-900 mb-4
flex items-center gap-2"
        >
          <Settings className="h-5 w-5" />
          Your Profile
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Name</label>
            <p className="text-gray-900">{session?.user?.name}</p>
          </div>
          <div>
            <label className="label">Email</label>
            <p className="text-gray-900">{session?.user?.email}</p>
          </div>
          <div>
            <label className="label">Role</label>
            <p className="text-gray-900">{session?.user?.role}</p>
          </div>
        </div>
      </div>
      {/* Team Management (Owner only) */}
      {session?.user?.role === 'OWNER' && (
        <div className="card p-6">
          <div
            className="flex items-center justify-between
mb-4"
          >
            <h2
              className="text-lg font-semibold text-gray-900
flex items-center gap-2"
            >
              <Users className="h-5 w-5" />
              Team Management
            </h2>
            <button
              onClick={() => setShowRegister(!showRegister)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add User
            </button>
          </div>
          {showRegister && (
            <form
              onSubmit={handleRegister}
              className="border-t
pt-4 mt-4 space-y-4"
            >
              <div
                className="grid grid-cols-1 sm:grid-cols-2
gap-4"
              >
                <div>
                  <label className="label">Name *</label>
                  <input
                    value={registerData.name}
                    onChange={(e) =>
                      setRegisterData({
                        ...registerData,
                        name: e.target.value,
                      })
                    }
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="label">Email *</label>
                  <input
                    type="email"
                    value={registerData.email}
                    onChange={(e) =>
                      setRegisterData({
                        ...registerData,
                        email: e.target.value,
                      })
                    }
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="label">Password *</label>
                  <input
                    type="password"
                    value={registerData.password}
                    onChange={(e) =>
                      setRegisterData({
                        ...registerData,
                        password: e.target.value,
                      })
                    }
                    className="input-field"
                    required
                    minLength={6}
                  />
                </div>
                <div>
                  <label className="label">Confirm Password *</label>
                  <input
                    type="password"
                    value={registerData.confirmPassword}
                    onChange={(e) =>
                      setRegisterData({
                        ...registerData,
                        confirmPassword: e.target.value,
                      })
                    }
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="label">Role *</label>
                  <select
                    value={registerData.role}
                    onChange={(e) =>
                      setRegisterData({
                        ...registerData,
                        role: e.target.value,
                      })
                    }
                    className="input-field"
                  >
                    <option value="SALESPERSON">Salesperson</option>
                    <option value="MECHANIC">Mechanic</option>
                    <option value="VIEWER">Viewer</option>
                    <option value="OWNER">Owner</option>
                  </select>
                </div>
                <div>
                  <label className="label">Phone</label>
                  <input
                    value={registerData.phone}
                    onChange={(e) =>
                      setRegisterData({
                        ...registerData,
                        phone: e.target.value,
                      })
                    }
                    className="input-field"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowRegister(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary"
                >
                  {loading ? 'Registering...' : 'Register User'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
