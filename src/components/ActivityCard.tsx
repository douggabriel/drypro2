import React from 'react';
import { Activity } from '../store/activityStore';
import { MapPin, Calendar, Users } from 'lucide-react';
import { cn, getStatusColor, getPriorityColor, formatDate } from '../lib/utils';

interface ActivityCardProps {
  activity: Activity;
  onClick: () => void;
}

export default function ActivityCard({ activity, onClick }: ActivityCardProps) {
  const totalPhases = activity.phases?.length || 0;
  const completedPhases =
    activity.phases?.filter((p) => p.status === 'COMPLETED').length || 0;
  const progress = totalPhases > 0 ? (completedPhases / totalPhases) * 100 : 0;

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:border-orange-300 transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">
            {activity.building} - {activity.unit}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Floor {activity.floor}
            {activity.area && ` • ${activity.area}`}
          </p>
        </div>
        <span
          className={cn(
            'px-3 py-1 text-xs font-semibold rounded-full',
            activity.type === 'UNIT'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-purple-100 text-purple-700'
          )}
        >
          {activity.type}
        </span>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin className="w-4 h-4" />
          <span>{activity.site?.name || 'Site'}</span>
        </div>

        {activity.deadline && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>Due: {formatDate(activity.deadline)}</span>
          </div>
        )}

        {activity.workers && activity.workers.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="w-4 h-4" />
            <span>
              {activity.workers.length} Worker
              {activity.workers.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>Progress</span>
          <span className="font-semibold">{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-orange-500 to-pink-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span
          className={cn(
            'px-3 py-1 text-xs font-medium rounded-full',
            getStatusColor(activity.status)
          )}
        >
          {activity.status.replace('_', ' ')}
        </span>
        <span
          className={cn(
            'px-3 py-1 text-xs font-medium rounded-full',
            getPriorityColor(activity.priority)
          )}
        >
          {activity.priority}
        </span>
      </div>
    </div>
  );
}
