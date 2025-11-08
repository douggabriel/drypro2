import React, { useState, useEffect } from 'react';
import { User, MapPin, Users, Plus, X } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useSiteStore } from '../store/siteStore';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import api from '../lib/axios';

export default function Settings() {
  const { user } = useAuthStore();
  const { sites, fetchSites } = useSiteStore();
  const [activeTab, setActiveTab] = useState<'profile' | 'sites' | 'workers'>('profile');

  // Profile state
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || ''
  });

  // Site form state
  const [showSiteForm, setShowSiteForm] = useState(false);
  const [siteData, setSiteData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: ''
  });

  // Worker form state
  const [showWorkerForm, setShowWorkerForm] = useState(false);
  const [workerData, setWorkerData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'TRADE_WORKER' as 'TRADE_WORKER' | 'SUPERVISOR'
  });

  const [workers, setWorkers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const isSupervisorOrAdmin = user?.role === 'SUPERVISOR' || user?.role === 'ADMIN';

  useEffect(() => {
    if (isSupervisorOrAdmin) {
      fetchSites();
      fetchWorkers();
    }
  }, [isSupervisorOrAdmin]);

  const fetchWorkers = async () => {
    try {
      const response = await api.get('/users');
      setWorkers(response.data);
    } catch (error) {
      console.error('Failed to fetch workers:', error);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.patch('/users/profile', profileData);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSite = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.post('/sites', siteData);
      toast.success('Construction site created successfully!');
      setShowSiteForm(false);
      setSiteData({ name: '', address: '', city: '', state: '', zipCode: '' });
      fetchSites();
    } catch (error) {
      toast.error('Failed to create site');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.post('/auth/register', workerData);
      toast.success('Worker created successfully!');
      setShowWorkerForm(false);
      setWorkerData({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phone: '',
        role: 'TRADE_WORKER'
      });
      fetchWorkers();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create worker');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account and preferences</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-8">
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'profile'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Profile
            </div>
          </button>

          {isSupervisorOrAdmin && (
            <>
              <button
                onClick={() => setActiveTab('sites')}
                className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'sites'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Construction Sites
                </div>
              </button>

              <button
                onClick={() => setActiveTab('workers')}
                className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'workers'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Workers
                </div>
              </button>
            </>
          )}
        </nav>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Profile Information</h2>
          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  value={profileData.firstName}
                  onChange={(e) =>
                    setProfileData({ ...profileData, firstName: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  value={profileData.lastName}
                  onChange={(e) =>
                    setProfileData({ ...profileData, lastName: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={profileData.phone}
                onChange={(e) =>
                  setProfileData({ ...profileData, phone: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={user?.email}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <input
                type="text"
                value={user?.role}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white px-6 py-2 rounded-lg"
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </div>
      )}

      {/* Sites Tab */}
      {activeTab === 'sites' && isSupervisorOrAdmin && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Construction Sites</h2>
            <button
              onClick={() => setShowSiteForm(true)}
              className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:shadow-lg transition"
            >
              <Plus className="w-4 h-4" />
              Add Site
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sites.map((site) => (
              <div
                key={site.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
              >
                <h3 className="text-lg font-bold text-gray-900 mb-2">{site.name}</h3>
                <p className="text-sm text-gray-600">{site.address}</p>
                {site.city && site.state && (
                  <p className="text-sm text-gray-600">
                    {site.city}, {site.state} {site.zipCode}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Add Site Modal */}
          {showSiteForm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900">Add Construction Site</h3>
                  <button
                    onClick={() => setShowSiteForm(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleCreateSite} className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Site Name *
                    </label>
                    <input
                      type="text"
                      value={siteData.name}
                      onChange={(e) => setSiteData({ ...siteData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address *
                    </label>
                    <input
                      type="text"
                      value={siteData.address}
                      onChange={(e) => setSiteData({ ...siteData, address: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City
                      </label>
                      <input
                        type="text"
                        value={siteData.city}
                        onChange={(e) => setSiteData({ ...siteData, city: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State
                      </label>
                      <input
                        type="text"
                        value={siteData.state}
                        onChange={(e) => setSiteData({ ...siteData, state: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Zip Code
                      </label>
                      <input
                        type="text"
                        value={siteData.zipCode}
                        onChange={(e) => setSiteData({ ...siteData, zipCode: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white py-3 rounded-xl font-semibold"
                    >
                      {isLoading ? 'Creating...' : 'Create Site'}
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setShowSiteForm(false)}
                      variant="outline"
                      className="flex-1 py-3 rounded-xl font-semibold"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Workers Tab */}
      {activeTab === 'workers' && isSupervisorOrAdmin && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Workers</h2>
            <button
              onClick={() => setShowWorkerForm(true)}
              className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:shadow-lg transition"
            >
              <Plus className="w-4 h-4" />
              Add Worker
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {workers.map((worker) => (
              <div
                key={worker.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-pink-400 rounded-full flex items-center justify-center text-white font-semibold">
                    {worker.firstName[0]}
                    {worker.lastName[0]}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900">
                      {worker.firstName} {worker.lastName}
                    </h3>
                    <p className="text-sm text-gray-600">{worker.email}</p>
                    {worker.phone && (
                      <p className="text-sm text-gray-600">{worker.phone}</p>
                    )}
                    <span
                      className={`inline-block mt-2 px-3 py-1 text-xs font-semibold rounded-full ${
                        worker.role === 'ADMIN'
                          ? 'bg-purple-100 text-purple-700'
                          : worker.role === 'SUPERVISOR'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {worker.role}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add Worker Modal */}
          {showWorkerForm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900">Add Worker</h3>
                  <button
                    onClick={() => setShowWorkerForm(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleCreateWorker} className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        value={workerData.firstName}
                        onChange={(e) =>
                          setWorkerData({ ...workerData, firstName: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        value={workerData.lastName}
                        onChange={(e) =>
                          setWorkerData({ ...workerData, lastName: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={workerData.email}
                      onChange={(e) =>
                        setWorkerData({ ...workerData, email: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password *
                    </label>
                    <input
                      type="password"
                      value={workerData.password}
                      onChange={(e) =>
                        setWorkerData({ ...workerData, password: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                      required
                      minLength={6}
                    />
                    <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={workerData.phone}
                      onChange={(e) =>
                        setWorkerData({ ...workerData, phone: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role *
                    </label>
                    <select
                      value={workerData.role}
                      onChange={(e) =>
                        setWorkerData({
                          ...workerData,
                          role: e.target.value as 'TRADE_WORKER' | 'SUPERVISOR'
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                    >
                      <option value="TRADE_WORKER">Trade Worker</option>
                      <option value="SUPERVISOR">Supervisor</option>
                    </select>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white py-3 rounded-xl font-semibold"
                    >
                      {isLoading ? 'Creating...' : 'Create Worker'}
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setShowWorkerForm(false)}
                      variant="outline"
                      className="flex-1 py-3 rounded-xl font-semibold"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
