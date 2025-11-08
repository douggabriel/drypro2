import React, { useEffect, useState } from 'react';
import { X, MapPin, Calendar, Users, AlertCircle } from 'lucide-react';
import { useActivityStore } from '../store/activityStore';
import { cn, getStatusColor, getPriorityColor, formatDate } from '../lib/utils';
import PhaseProgress from './PhaseProgress';

interface ActivityDetailModalProps {
  activityId: string;
  onClose: () => void;
}

export default function ActivityDetailModal({
  activityId,
  onClose
}: ActivityDetailModalProps) {
  const { selectedActivity, fetchActivity, isLoading } = useActivityStore();
  const [activeTab, setActiveTab] = useState<'phases' | 'details'>('phases');

  useEffect(() => {
    fetchActivity(activityId);
  }, [activityId]);

  if (isLoading || !selectedActivity) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading activity...</p>
        </div>
      </div>
    );
  }

  const totalPhases = selectedActivity.phases?.length || 0;
  const completedPhases =
    selectedActivity.phases?.filter((p) => p.status === 'COMPLETED').length || 0;
  const progress = totalPhases > 0 ? (completedPhases / totalPhases) * 100 : 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedActivity.building} - {selectedActivity.unit}
              </h2>
              <p className="text-gray-600 mt-1">
                Floor {selectedActivity.floor}
                {selectedActivity.area && ` • ${selectedActivity.area}`}
              </p>
              <div className="flex items-center gap-2 mt-3">
                <span
                  className={cn(
                    'px-3 py-1 text-xs font-semibold rounded-full',
                    getStatusColor(selectedActivity.status)
                  )}
                >
                  {selectedActivity.status.replace('_', ' ')}
                </span>
                <span
                  className={cn(
                    'px-3 py-1 text-xs font-semibold rounded-full',
                    getPriorityColor(selectedActivity.priority)
                  )}
                >
                  {selectedActivity.priority}
                </span>
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">
                  {selectedActivity.type}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Overall Progress</span>
              <span className="font-semibold">{Math.round(progress)}%</span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-pink-500 transition-all duration-500"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex px-6">
            <button
              onClick={() => setActiveTab('phases')}
              className={cn(
                'px-6 py-3 font-medium text-sm border-b-2 transition',
                activeTab === 'phases'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              )}
            >
              Phase Progress
            </button>
            <button
              onClick={() => setActiveTab('details')}
              className={cn(
                'px-6 py-3 font-medium text-sm border-b-2 transition',
                activeTab === 'details'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              )}
            >
              Details
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {activeTab === 'phases' ? (
            <PhaseProgress
              activityId={selectedActivity.id}
              phases={selectedActivity.phases || []}
              onUpdate={() => fetchActivity(activityId)}
            />
          ) : (
            <div className="space-y-6">
              {/* Site Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Site Information
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-700">
                    <MapPin className="w-4 h-4" />
                    <span>{selectedActivity.site?.name || 'N/A'}</span>
                  </div>
                  {selectedActivity.deadline && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <Calendar className="w-4 h-4" />
                      <span>Due: {formatDate(selectedActivity.deadline)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Workers */}
              {selectedActivity.workers && selectedActivity.workers.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Assigned Workers
                  </h3>
                  <div className="space-y-2">
                    {selectedActivity.workers.map((aw: any) => (
                      <div
                        key={aw.workerId}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-pink-400 rounded-full flex items-center justify-center text-white font-semibold">
                          {aw.worker.firstName[0]}
                          {aw.worker.lastName[0]}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {aw.worker.firstName} {aw.worker.lastName}
                          </p>
                          <p className="text-sm text-gray-600">
                            {aw.worker.email}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedActivity.notes && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Notes
                  </h3>
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-gray-700">{selectedActivity.notes}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
