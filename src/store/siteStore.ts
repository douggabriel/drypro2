import { create } from 'zustand';
import api from '../lib/axios';
import { toast } from 'sonner';

export interface Site {
  id: string;
  name: string;
  address: string;
  city?: string;
  state?: string;
  zipCode?: string;
  isActive: boolean;
  createdAt: string;
}

interface SiteState {
  sites: Site[];
  isLoading: boolean;
  error: string | null;
  fetchSites: () => Promise<void>;
  createSite: (data: any) => Promise<void>;
}

export const useSiteStore = create<SiteState>((set) => ({
  sites: [],
  isLoading: false,
  error: null,

  fetchSites: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/sites');
      set({ sites: response.data, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to fetch sites',
        isLoading: false
      });
      toast.error('Failed to fetch sites');
    }
  },

  createSite: async (data: any) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/sites', data);
      set((state) => ({
        sites: [...state.sites, response.data],
        isLoading: false
      }));
      toast.success('Site created successfully');
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to create site',
        isLoading: false
      });
      toast.error('Failed to create site');
      throw error;
    }
  }
}));
