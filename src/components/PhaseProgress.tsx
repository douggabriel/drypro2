import React, { useState } from 'react';
import {
  Check,
  Upload,
  Camera,
  ChevronRight,
  RotateCcw,
  X
} from 'lucide-react';
import { usePhaseStore } from '../store/phaseStore';
import { useAuthStore } from '../store/authStore';
import { cn, formatDateTime } from '../lib/utils';
import { Button } from './ui/button';
import { useDropzone } from 'react-dropzone';
import ImageZoomModal from './ImageZoomModal';

const PHASES = [
  {
    id: 1,
    name: 'PLASTERBOARD_FIXING',
    displayName: 'Plasterboard Fixing',
    color: '#FF6B6B'
  },
  { id: 2, name: 'TAPING', displayName: 'Taping', color: '#4ECDC4' },
  { id: 3, name: 'SECOND_COAT', displayName: 'Second Coat', color: '#45B7D1' },
  { id: 4, name: 'TOP_COAT', displayName: 'Top Coat', color: '#96CEB4' },
  { id: 5, name: 'SANDING', displayName: 'Sanding', color: '#FFEAA7' }
];

interface PhaseProgressProps {
  activityId: string;
  phases: any[];
  onUpdate: () => void;
}

export default function PhaseProgress({
  activityId,
  phases,
  onUpdate
}: PhaseProgressProps) {
  const [selectedPhase, setSelectedPhase] = useState<any>(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [progress, setProgress] = useState(0);
  const [notes, setNotes] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [zoomImages, setZoomImages] = useState<{ path: string }[] | null>(null);
  const [zoomImageIndex, setZoomImageIndex] = useState(0);
  const { updatePhase, undoPhaseUpdate, isLoading } = usePhaseStore();
  const { user } = useAuthStore();
  const canUndo = user?.role === 'ADMIN' || user?.role === 'SUPERVISOR';

  const { getRootProps, getInputProps } = useDropzone({
    accept: { 'image/*': [] },
    onDrop: (acceptedFiles) => {
      setPhotos([...photos, ...acceptedFiles]);
    }
  });

  const handlePhaseClick = (phase: any) => {
    setSelectedPhase(phase);
    setShowUpdateModal(true);
    setProgress(phase.percentage || 0);
    setNotes(phase.notes || '');
    setPhotos([]);
  };

  const handleAdvancePhase = async () => {
    if (!selectedPhase) return;

    if (
      !window.confirm(
        `Mark ${PHASES[selectedPhase.phaseNumber - 1].displayName} as completed?`
      )
    )
      return;

    try {
      await updatePhase(
        selectedPhase.id,
        {
          percentage: 100,
          status: 'COMPLETED',
          notes
        },
        {
          photos
        }
      );

      onUpdate();
      setShowUpdateModal(false);
      resetForm();
    } catch (error) {
      console.error('Failed to advance phase:', error);
    }
  };

  const handleUpdateProgress = async () => {
    if (!selectedPhase) return;

    try {
      const status =
        progress === 100
          ? 'COMPLETED'
          : progress > 0
          ? 'IN_PROGRESS'
          : 'PENDING';

      await updatePhase(
        selectedPhase.id,
        {
          percentage: progress,
          status,
          notes
        },
        {
          photos
        }
      );

      onUpdate();
      setShowUpdateModal(false);
      resetForm();
    } catch (error) {
      console.error('Failed to update phase:', error);
    }
  };

  const handleUndo = async (phaseId: string) => {
    if (!window.confirm('Undo last action? This cannot be reversed.')) return;

    try {
      await undoPhaseUpdate(phaseId);
      onUpdate();
    } catch (error) {
      console.error('Failed to undo phase:', error);
    }
  };

  const resetForm = () => {
    setProgress(0);
    setNotes('');
    setPhotos([]);
    setSelectedPhase(null);
  };

  return (
    <div className="space-y-4">
      {PHASES.map((phase) => {
        const phaseData = phases.find((p) => p.phaseNumber === phase.id) || {};
        const isCompleted = phaseData.status === 'COMPLETED';
        const isInProgress = phaseData.status === 'IN_PROGRESS';
        const percentage = phaseData.percentage || 0;

        return (
          <div
            key={phase.id}
            className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition"
          >
            <div
              onClick={() => handlePhaseClick(phaseData)}
              className="cursor-pointer p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center font-bold text-white',
                      isCompleted
                        ? 'bg-green-500'
                        : isInProgress
                        ? 'bg-blue-500'
                        : 'bg-gray-300'
                    )}
                  >
                    {isCompleted ? (
                      <Check className="w-6 h-6" />
                    ) : (
                      <span>{phase.id}</span>
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {phase.displayName}
                    </h4>
                    {phaseData.status && (
                      <p className="text-xs text-gray-600">
                        Status: {phaseData.status.replace('_', ' ')}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-700">
                    {percentage}%
                  </span>
                  {phaseData.id && canUndo && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUndo(phaseData.id);
                      }}
                      className="p-2 hover:bg-gray-100 rounded-lg transition"
                    >
                      <RotateCcw className="w-4 h-4 text-gray-600" />
                    </button>
                  )}
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all duration-500"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: phase.color
                    }}
                  ></div>
                </div>

                {phaseData.completedBy && (
                  <p className="text-xs text-gray-600">
                    Completed by {phaseData.completedBy.firstName}{' '}
                    {phaseData.completedBy.lastName} on{' '}
                    {formatDateTime(phaseData.completedAt)}
                  </p>
                )}

                {phaseData.photos && phaseData.photos.length > 0 && (
                  <div className="flex gap-2 mt-2">
                    {phaseData.photos.slice(0, 3).map((photo: any, idx: number) => (
                      <img
                        key={idx}
                        src={`/${photo.path}`}
                        alt="Phase"
                        className="w-16 h-16 object-cover rounded-lg cursor-pointer hover:opacity-80 transition"
                        onClick={(e) => {
                          e.stopPropagation();
                          setZoomImages(phaseData.photos);
                          setZoomImageIndex(idx);
                        }}
                      />
                    ))}
                    {phaseData.photos.length > 3 && (
                      <div
                        className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center text-sm font-semibold text-gray-600 cursor-pointer hover:bg-gray-300 transition"
                        onClick={(e) => {
                          e.stopPropagation();
                          setZoomImages(phaseData.photos);
                          setZoomImageIndex(3);
                        }}
                      >
                        +{phaseData.photos.length - 3}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {/* Update Modal */}
      {showUpdateModal && selectedPhase && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">
                Update {PHASES[selectedPhase.phaseNumber - 1]?.displayName}
              </h3>
              <button
                onClick={() => {
                  setShowUpdateModal(false);
                  resetForm();
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Progress Slider */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Progress (%)
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progress}
                  onChange={(e) => setProgress(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                />
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-gray-600">0%</span>
                  <span className="text-2xl font-bold text-orange-600">
                    {progress}%
                  </span>
                  <span className="text-sm text-gray-600">100%</span>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                  rows={3}
                  placeholder="Add notes about this phase..."
                />
              </div>

              {/* Photo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Photos
                </label>
                <div
                  {...getRootProps()}
                  className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-orange-500 transition"
                >
                  <input {...getInputProps()} />
                  <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    Drop photos here or click to upload
                  </p>
                </div>

                {photos.length > 0 && (
                  <div className="mt-3 grid grid-cols-4 gap-2">
                    {photos.map((photo, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(photo)}
                          alt={`Upload ${index + 1}`}
                          className="w-full h-20 object-cover rounded-lg"
                        />
                        <button
                          onClick={() =>
                            setPhotos(photos.filter((_, i) => i !== index))
                          }
                          className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleUpdateProgress}
                  disabled={isLoading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold"
                >
                  {isLoading ? 'Updating...' : 'Update Progress'}
                </Button>
                {progress < 100 && (
                  <Button
                    onClick={handleAdvancePhase}
                    disabled={isLoading}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-3 rounded-xl font-semibold"
                  >
                    Mark Complete
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Zoom Modal */}
      {zoomImages && (
        <ImageZoomModal
          images={zoomImages}
          initialIndex={zoomImageIndex}
          onClose={() => setZoomImages(null)}
        />
      )}
    </div>
  );
}
