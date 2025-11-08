import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  MessageCircle
} from 'lucide-react';
import { useMaterialStore } from '../store/materialStore';
import { useActivityStore } from '../store/activityStore';
import { useAuthStore } from '../store/authStore';
import { cn, formatDateTime } from '../lib/utils';
import { Button } from '../components/ui/button';

export default function MaterialRequests() {
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [approverNotes, setApproverNotes] = useState('');

  const [formData, setFormData] = useState({
    materialId: '',
    activityId: '',
    quantity: 1,
    unit: 'SHEETS',
    urgency: 'NORMAL' as 'LOW' | 'NORMAL' | 'URGENT' | 'CRITICAL',
    justification: ''
  });

  const {
    materials,
    requests,
    fetchMaterials,
    fetchRequests,
    createRequest,
    approveRequest,
    rejectRequest,
    isLoading
  } = useMaterialStore();

  const { activities, fetchActivities } = useActivityStore();
  const { user } = useAuthStore();

  useEffect(() => {
    fetchMaterials();
    fetchRequests();
    fetchActivities();
  }, []);

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createRequest(formData);
      setShowRequestModal(false);
      resetForm();
    } catch (error) {
      console.error('Failed to create request:', error);
    }
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;
    try {
      await approveRequest(selectedRequest.id, approverNotes);
      setShowApprovalModal(false);
      setSelectedRequest(null);
      setApproverNotes('');
    } catch (error) {
      console.error('Failed to approve request:', error);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;
    try {
      await rejectRequest(selectedRequest.id, approverNotes);
      setShowApprovalModal(false);
      setSelectedRequest(null);
      setApproverNotes('');
    } catch (error) {
      console.error('Failed to reject request:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      materialId: '',
      activityId: '',
      quantity: 1,
      unit: 'SHEETS',
      urgency: 'NORMAL',
      justification: ''
    });
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'LOW':
        return 'bg-gray-100 text-gray-700';
      case 'NORMAL':
        return 'bg-blue-100 text-blue-700';
      case 'URGENT':
        return 'bg-orange-100 text-orange-700';
      case 'CRITICAL':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'REJECTED':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-600" />;
    }
  };

  const sendToWhatsApp = (request: any) => {
    const date = new Date(request.requestedAt).toLocaleDateString('pt-BR');
    const time = new Date(request.requestedAt).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });

    let location = '';
    if (request.activity) {
      location = `📍 *Local:* ${request.activity.building} - ${request.activity.unit}`;
      if (request.activity.floor) {
        location += ` (Andar ${request.activity.floor})`;
      }
    }

    const urgencyEmoji = {
      LOW: '🟢',
      NORMAL: '🟡',
      URGENT: '🟠',
      CRITICAL: '🔴'
    }[request.urgency] || '⚪';

    const message = `🛠️ *SOLICITAÇÃO DE MATERIAL*

📦 *Material:* ${request.material?.name || 'N/A'}
📊 *Quantidade:* ${request.quantity} ${request.unit}
${urgencyEmoji} *Urgência:* ${request.urgency}

📅 *Data:* ${date} às ${time}
${location}

👤 *Solicitante:* ${request.requestedBy?.firstName} ${request.requestedBy?.lastName}

💬 *Justificativa:*
${request.justification}

---
_Enviado via Drywall Manager_`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;

    window.open(whatsappUrl, '_blank');
  };

  const canApprove = user?.role === 'ADMIN' || user?.role === 'SUPERVISOR';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Material Requests
          </h1>
          <p className="text-gray-600 mt-1">
            Request and manage material requirements
          </p>
        </div>
        <button
          onClick={() => setShowRequestModal(true)}
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:shadow-lg transition"
        >
          <Plus className="w-5 h-5" />
          New Request
        </button>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading requests...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No material requests
            </h3>
            <p className="text-gray-600 mb-6">
              Create your first material request to get started
            </p>
            <button
              onClick={() => setShowRequestModal(true)}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg hover:shadow-lg transition"
            >
              <Plus className="w-5 h-5" />
              Create Request
            </button>
          </div>
        ) : (
          requests.map((request) => (
            <div
              key={request.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-900">
                      {request.material?.name || 'Unknown Material'}
                    </h3>
                    <span
                      className={cn(
                        'px-3 py-1 text-xs font-semibold rounded-full',
                        getUrgencyColor(request.urgency)
                      )}
                    >
                      {request.urgency}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    <p>
                      <strong>Quantity:</strong> {request.quantity}{' '}
                      {request.unit}
                    </p>
                    <p>
                      <strong>Justification:</strong> {request.justification}
                    </p>
                    {request.activity && (
                      <p>
                        <strong>Activity:</strong> {request.activity.building} -{' '}
                        {request.activity.unit}
                      </p>
                    )}
                    <p>
                      <strong>Requested by:</strong>{' '}
                      {request.requestedBy?.firstName}{' '}
                      {request.requestedBy?.lastName} on{' '}
                      {formatDateTime(request.requestedAt)}
                    </p>
                    {request.respondedAt && (
                      <p>
                        <strong>Responded:</strong>{' '}
                        {formatDateTime(request.respondedAt)} by{' '}
                        {request.approvedBy?.firstName}{' '}
                        {request.approvedBy?.lastName}
                      </p>
                    )}
                    {request.approverNotes && (
                      <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs font-medium text-gray-700">
                          Approver Notes:
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {request.approverNotes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-3">
                  {getStatusIcon(request.status)}
                  <span
                    className={cn(
                      'px-3 py-1 text-xs font-semibold rounded-full',
                      request.status === 'APPROVED'
                        ? 'bg-green-100 text-green-700'
                        : request.status === 'REJECTED'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-yellow-100 text-yellow-700'
                    )}
                  >
                    {request.status}
                  </span>

                  <div className="flex flex-col gap-2 mt-2">
                    <button
                      onClick={() => sendToWhatsApp(request)}
                      className="px-4 py-2 bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-600 transition flex items-center gap-2"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Enviar via WhatsApp
                    </button>

                    {canApprove && request.status === 'PENDING' && (
                      <button
                        onClick={() => {
                          setSelectedRequest(request);
                          setShowApprovalModal(true);
                        }}
                        className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition"
                      >
                        Review
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">
                Request Material
              </h3>
              <button
                onClick={() => {
                  setShowRequestModal(false);
                  resetForm();
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitRequest} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Material *
                </label>
                <select
                  value={formData.materialId}
                  onChange={(e) =>
                    setFormData({ ...formData, materialId: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  required
                >
                  <option value="">Select Material</option>
                  {materials.map((material) => (
                    <option key={material.id} value={material.id}>
                      {material.name} ({material.category})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        quantity: Number(e.target.value)
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unit *
                  </label>
                  <select
                    value={formData.unit}
                    onChange={(e) =>
                      setFormData({ ...formData, unit: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  >
                    <option value="SHEETS">Sheets</option>
                    <option value="BOXES">Boxes</option>
                    <option value="BAGS">Bags</option>
                    <option value="UNITS">Units</option>
                    <option value="LITERS">Liters</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Activity (optional)
                </label>
                <select
                  value={formData.activityId}
                  onChange={(e) =>
                    setFormData({ ...formData, activityId: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                >
                  <option value="">Select Activity</option>
                  {activities.map((activity) => (
                    <option key={activity.id} value={activity.id}>
                      {activity.building} - {activity.unit}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Urgency *
                </label>
                <select
                  value={formData.urgency}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      urgency: e.target.value as any
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                >
                  <option value="LOW">Low</option>
                  <option value="NORMAL">Normal</option>
                  <option value="URGENT">Urgent</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Justification *
                </label>
                <textarea
                  value={formData.justification}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      justification: e.target.value
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  rows={3}
                  placeholder="Explain why this material is needed..."
                  required
                />
              </div>

              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 rounded-xl font-semibold"
                >
                  {isLoading ? 'Submitting...' : 'Submit Request'}
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    setShowRequestModal(false);
                    resetForm();
                  }}
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

      {/* Approval Modal */}
      {showApprovalModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">
                Review Material Request
              </h3>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                <p>
                  <strong>Material:</strong> {selectedRequest.material.name}
                </p>
                <p>
                  <strong>Quantity:</strong> {selectedRequest.quantity}{' '}
                  {selectedRequest.unit}
                </p>
                <p>
                  <strong>Justification:</strong>{' '}
                  {selectedRequest.justification}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Approver Notes (optional)
                </label>
                <textarea
                  value={approverNotes}
                  onChange={(e) => setApproverNotes(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  rows={3}
                  placeholder="Add any notes..."
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleApprove}
                  disabled={isLoading}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold"
                >
                  Approve
                </Button>
                <Button
                  onClick={handleReject}
                  disabled={isLoading}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-semibold"
                >
                  Reject
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
