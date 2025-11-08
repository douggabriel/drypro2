import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useActivityStore } from '../store/activityStore';
import {
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Activity as ActivityIcon
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn, getStatusColor, getPriorityColor } from '../lib/utils';

export default function Dashboard() {
  const { user } = useAuthStore();
  const { activities, fetchActivities } = useActivityStore();
  const [stats, setStats] = useState({
    total: 0,
    inProgress: 0,
    completed: 0,
    pending: 0
  });

  useEffect(() => {
    fetchActivities();
  }, []);

  useEffect(() => {
    if (activities) {
      setStats({
        total: activities.length,
        inProgress: activities.filter((a) => a.status === 'IN_PROGRESS').length,
        completed: activities.filter((a) => a.status === 'COMPLETED').length,
        pending: activities.filter((a) => a.status === 'PENDING').length
      });
    }
  }, [activities]);

  const statCards = [
    {
      title: 'Total Activities',
      value: stats.total,
      icon: ActivityIcon,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'In Progress',
      value: stats.inProgress,
      icon: Clock,
      color: 'from-orange-500 to-pink-500',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Completed',
      value: stats.completed,
      icon: CheckCircle,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Pending',
      value: stats.pending,
      icon: AlertCircle,
      color: 'from-yellow-500 to-amber-500',
      bgColor: 'bg-yellow-50'
    }
  ];

  const recentActivities = activities.slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="text-gray-600 mt-1">
          Here's what's happening with your projects today
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stat.value}
                </p>
              </div>
              <div
                className={cn(
                  'w-14 h-14 rounded-xl flex items-center justify-center',
                  stat.bgColor
                )}
              >
                <stat.icon className="w-7 h-7 text-gray-700" />
              </div>
            </div>
            <div className="mt-4">
              <div
                className={cn(
                  'h-1 rounded-full bg-gradient-to-r',
                  stat.color
                )}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Recent Activities</h2>
          <Link
            to="/activities"
            className="text-sm text-orange-600 hover:text-orange-700 font-medium"
          >
            View All →
          </Link>
        </div>

        {recentActivities.length === 0 ? (
          <div className="text-center py-12">
            <ActivityIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No activities yet</p>
            <Link
              to="/activities"
              className="inline-block mt-4 px-6 py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition"
            >
              Create Your First Activity
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentActivities.map((activity) => {
              const totalPhases = activity.phases?.length || 0;
              const completedPhases =
                activity.phases?.filter((p) => p.status === 'COMPLETED')
                  .length || 0;
              const progress =
                totalPhases > 0 ? (completedPhases / totalPhases) * 100 : 0;

              return (
                <Link
                  key={activity.id}
                  to={`/activities/${activity.id}`}
                  className="block p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-semibold text-gray-900">
                          {activity.building} - {activity.unit}
                        </span>
                        <span
                          className={cn(
                            'px-2 py-1 text-xs font-medium rounded-full',
                            getStatusColor(activity.status)
                          )}
                        >
                          {activity.status.replace('_', ' ')}
                        </span>
                        <span
                          className={cn(
                            'px-2 py-1 text-xs font-medium rounded-full',
                            getPriorityColor(activity.priority)
                          )}
                        >
                          {activity.priority}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Floor {activity.floor} • {activity.site?.name || 'Site'}
                      </p>
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                          <span>Progress</span>
                          <span>{Math.round(progress)}%</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-orange-500 to-pink-500 transition-all"
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
