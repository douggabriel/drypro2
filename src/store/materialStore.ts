import { create } from 'zustand';
import api from '../lib/axios';
import { toast } from 'sonner';

export interface Material {
  id: string;
  name: string;
  category: string;
  defaultUnit: string;
  minimumStock?: number;
  currentStock?: number;
  costPerUnit?: number;
  supplier?: string;
  isActive: boolean;
}

export interface MaterialRequest {
  id: string;
  requestedById: string;
  materialId: string;
  activityId?: string;
  quantity: number;
  unit: string;
  urgency: 'LOW' | 'NORMAL' | 'URGENT' | 'CRITICAL';
  justification: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PARTIALLY_APPROVED';
  approvedById?: string;
  approverNotes?: string;
  requestedAt: string;
  respondedAt?: string;
  material?: Material;
  requestedBy?: any;
  approvedBy?: any;
  activity?: any;
}

interface MaterialState {
  materials: Material[];
  requests: MaterialRequest[];
  isLoading: boolean;
  error: string | null;
  fetchMaterials: () => Promise<void>;
  fetchRequests: () => Promise<void>;
  createRequest: (data: any) => Promise<void>;
  approveRequest: (id: string, notes?: string) => Promise<void>;
  rejectRequest: (id: string, notes?: string) => Promise<void>;
}

export const useMaterialStore = create<MaterialState>((set) => ({
  materials: [],
  requests: [],
  isLoading: false,
  error: null,

  fetchMaterials: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/materials');
      set({ materials: response.data, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to fetch materials',
        isLoading: false
      });
      toast.error('Failed to fetch materials');
    }
  },

  fetchRequests: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/material-requests');
      set({ requests: response.data, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to fetch requests',
        isLoading: false
      });
      toast.error('Failed to fetch material requests');
    }
  },

  createRequest: async (data: any) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/material-requests', data);
      set((state) => ({
        requests: [response.data, ...state.requests],
        isLoading: false
      }));
      toast.success('Material request submitted successfully');
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to create request',
        isLoading: false
      });
      toast.error('Failed to submit material request');
      throw error;
    }
  },

  approveRequest: async (id: string, notes?: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.patch(`/material-requests/${id}/approve`, {
        approverNotes: notes
      });
      set((state) => ({
        requests: state.requests.map((r) =>
          r.id === id ? response.data : r
        ),
        isLoading: false
      }));
      toast.success('Material request approved');
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to approve request',
        isLoading: false
      });
      toast.error('Failed to approve material request');
      throw error;
    }
  },

  rejectRequest: async (id: string, notes?: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.patch(`/material-requests/${id}/reject`, {
        approverNotes: notes
      });
      set((state) => ({
        requests: state.requests.map((r) =>
          r.id === id ? response.data : r
        ),
        isLoading: false
      }));
      toast.success('Material request rejected');
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to reject request',
        isLoading: false
      });
      toast.error('Failed to reject material request');
      throw error;
    }
  }
}));
