import React, { useState } from 'react';
import { X } from 'lucide-react';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { dateTime: string; reason: string }) => Promise<void>;
  onCancel?: (appointmentId: string) => Promise<void>;
  appointment?: {
    id: string;
    date_time: string;
    reason: string;
    status: string;
  };
  mode?: 'create' | 'view';
}

export const AppointmentModal: React.FC<AppointmentModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  onCancel,
  appointment,
  mode = 'create'
}) => {
  const [dateTime, setDateTime] = useState(appointment?.date_time || '');
  const [reason, setReason] = useState(appointment?.reason || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dateTime || !reason) return;

    setLoading(true);
    setError('');

    try {
      await onSubmit({ dateTime, reason });
      onClose();
    } catch (err) {
      setError('Failed to schedule appointment. Please try again.');
      console.error('Appointment error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!appointment?.id || !onCancel) return;

    setLoading(true);
    setError('');

    try {
      await onCancel(appointment.id);
      onClose();
    } catch (err) {
      setError('Failed to cancel appointment. Please try again.');
      console.error('Cancellation error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">
              {mode === 'create' ? 'Schedule Appointment' : 'Appointment Details'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="dateTime" className="block text-sm font-medium text-gray-700 mb-1">
                Date & Time
              </label>
              <input
                type="datetime-local"
                id="dateTime"
                value={dateTime}
                onChange={(e) => setDateTime(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-200 focus:border-purple-500"
                required
                disabled={mode === 'view'}
              />
            </div>

            <div>
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
                Reason for Visit
              </label>
              <textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-200 focus:border-purple-500"
                rows={4}
                required
                disabled={mode === 'view'}
              />
            </div>

            <div className="flex justify-end space-x-3">
              {mode === 'view' && appointment?.status === 'pending' && onCancel && (
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {loading ? 'Cancelling...' : 'Cancel Appointment'}
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Close
              </button>
              {mode === 'create' && (
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  {loading ? 'Scheduling...' : 'Schedule Appointment'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};