import { create } from 'zustand';
import api from '../lib/axios';
import { toast } from 'sonner';

export interface Phase {
  id: string;
  activityId: string;
  phaseNumber: number;
  phaseName: string;
  percentage: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  startedAt?: string;
  completedAt?: string;
  completedById?: string;
  completedBy?: any;
  notes?: string;
  photos?: any[];
  audioNotes?: any[];
}

interface PhaseState {
  updatePhase: (phaseId: string, data: any, files?: any) => Promise<void>;
  undoPhaseUpdate: (phaseId: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export const usePhaseStore = create<PhaseState>((set) => ({
  isLoading: false,
  error: null,

  updatePhase: async (phaseId: string, data: any, files?: any) => {
    set({ isLoading: true, error: null });
    try {
      const formData = new FormData();

      // Append regular data
      if (data.percentage !== undefined) {
        formData.append('percentage', data.percentage.toString());
      }
      if (data.status) formData.append('status', data.status);
      if (data.notes) formData.append('notes', data.notes);

      // Append files
      if (files?.photos) {
        files.photos.forEach((photo: File) => {
          formData.append('photos', photo);
        });
      }
      if (files?.audio) {
        // When appending a Blob, we need to specify a filename
        formData.append('audio', files.audio, 'audio.webm');
      }

      await api.patch(`/phases/${phaseId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      set({ isLoading: false });
      toast.success('Phase updated successfully');
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to update phase',
        isLoading: false
      });
      toast.error('Failed to update phase');
      throw error;
    }
  },

  undoPhaseUpdate: async (phaseId: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.post(`/phases/${phaseId}/undo`);
      set({ isLoading: false });
      toast.success('Phase update undone');
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to undo phase update',
        isLoading: false
      });
      toast.error('Failed to undo phase update');
      throw error;
    }
  }
}));
