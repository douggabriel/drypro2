import { create } from 'zustand';
import api from '../lib/axios';
import { toast } from 'sonner';

export interface Activity {
  id: string;
  type: 'UNIT' | 'PATCH';
  siteId: string;
  building: string;
  floor: string;
  unit: string;
  area?: string;
  supervisorId: string;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD';
  deadline?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  site?: any;
  supervisor?: any;
  workers?: any[];
  phases?: any[];
}

interface ActivityState {
  activities: Activity[];
  selectedActivity: Activity | null;
  isLoading: boolean;
  error: string | null;
  fetchActivities: () => Promise<void>;
  fetchActivity: (id: string) => Promise<void>;
  createActivity: (data: any) => Promise<Activity>;
  updateActivity: (id: string, data: any) => Promise<void>;
  deleteActivity: (id: string) => Promise<void>;
  setSelectedActivity: (activity: Activity | null) => void;
}

export const useActivityStore = create<ActivityState>((set, get) => ({
  activities: [],
  selectedActivity: null,
  isLoading: false,
  error: null,

  fetchActivities: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/activities');
      set({ activities: response.data, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to fetch activities',
        isLoading: false
      });
      toast.error('Failed to fetch activities');
    }
  },

  fetchActivity: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/activities/${id}`);
      set({ selectedActivity: response.data, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to fetch activity',
        isLoading: false
      });
      toast.error('Failed to fetch activity');
    }
  },

  createActivity: async (data: any) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/activities', data);
      set((state) => ({
        activities: [response.data, ...state.activities],
        isLoading: false
      }));
      toast.success('Activity created successfully');
      return response.data;
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to create activity',
        isLoading: false
      });
      toast.error('Failed to create activity');
      throw error;
    }
  },

  updateActivity: async (id: string, data: any) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.patch(`/activities/${id}`, data);
      set((state) => ({
        activities: state.activities.map((a) =>
          a.id === id ? response.data : a
        ),
        selectedActivity:
          state.selectedActivity?.id === id ? response.data : state.selectedActivity,
        isLoading: false
      }));
      toast.success('Activity updated successfully');
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to update activity',
        isLoading: false
      });
      toast.error('Failed to update activity');
      throw error;
    }
  },

  deleteActivity: async (id: string) => {
    try {
      await api.delete(`/activities/${id}`);
      set((state) => ({
        activities: state.activities.filter((a) => a.id !== id)
      }));
      toast.success('Activity deleted successfully');
    } catch (error: any) {
      toast.error('Failed to delete activity');
      throw error;
    }
  },

  setSelectedActivity: (activity: Activity | null) => {
    set({ selectedActivity: activity });
  }
}));
