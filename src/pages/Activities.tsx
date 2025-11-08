import React, { useState, useEffect } from 'react';
import { Plus, Filter, Search, MapPin } from 'lucide-react';
import { useActivityStore } from '../store/activityStore';
import { useSiteStore } from '../store/siteStore';
import { useAuthStore } from '../store/authStore';
import ActivityCard from '../components/ActivityCard';
import CreateActivityModal from '../components/CreateActivityModal';
import ActivityDetailModal from '../components/ActivityDetailModal';

export default function Activities() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const { activities, fetchActivities, isLoading } = useActivityStore();
  const { fetchSites } = useSiteStore();
  const { user } = useAuthStore();

  useEffect(() => {
    fetchActivities();
    fetchSites();
  }, []);

  const filteredActivities = activities.filter((activity) => {
    const matchesSearch =
      activity.unit.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.building.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'ALL' || activity.type === filterType;
    const matchesStatus =
      filterStatus === 'ALL' || activity.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const canCreateActivity =
    user?.role === 'ADMIN' || user?.role === 'SUPERVISOR';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Activities</h1>
          <p className="text-gray-600 mt-1">
            Manage and track all your drywall activities
          </p>
        </div>
        {canCreateActivity && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:shadow-lg transition"
          >
            <Plus className="w-5 h-5" />
            New Activity
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by unit or building..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
          >
            <option value="ALL">All Types</option>
            <option value="UNIT">Units</option>
            <option value="PATCH">Patches</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
          >
            <option value="ALL">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="ON_HOLD">On Hold</option>
          </select>
        </div>
      </div>

      {/* Activities Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading activities...</p>
        </div>
      ) : filteredActivities.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No activities found
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || filterType !== 'ALL' || filterStatus !== 'ALL'
              ? 'Try adjusting your filters'
              : 'Get started by creating your first activity'}
          </p>
          {canCreateActivity && !searchTerm && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white px-6 py-3 rounded-lg hover:shadow-lg transition"
            >
              <Plus className="w-5 h-5" />
              Create Activity
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredActivities.map((activity) => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              onClick={() => setSelectedActivityId(activity.id)}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <CreateActivityModal onClose={() => setShowCreateModal(false)} />
      )}

      {selectedActivityId && (
        <ActivityDetailModal
          activityId={selectedActivityId}
          onClose={() => setSelectedActivityId(null)}
        />
      )}
    </div>
  );
}
