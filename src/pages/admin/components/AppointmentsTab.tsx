import React from 'react';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { AdminAppointment } from '../types';

interface AppointmentsTabProps {
  appointments: AdminAppointment[];
  onUpdateStatus: (id: string, status: string) => Promise<void>;
}

export const AppointmentsTab: React.FC<AppointmentsTabProps> = ({ 
  appointments,
  onUpdateStatus
}) => {
  return (
    <div className="space-y-4">
      {appointments.map((apt) => (
        <div key={apt.id} className="border rounded-lg p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="font-medium">{apt.profiles?.full_name || 'Unknown User'}</p>
              <p className="text-sm text-gray-600">{apt.profiles?.email || 'No email'}</p>
            </div>
            <div className="flex space-x-2">
              {apt.status === 'pending' && (
                <>
                  <button
                    onClick={() => onUpdateStatus(apt.id, 'confirmed')}
                    className="p-1 text-green-600 hover:bg-green-50 rounded-full"
                    title="Confirm"
                  >
                    <CheckCircle className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => onUpdateStatus(apt.id, 'cancelled')}
                    className="p-1 text-red-600 hover:bg-red-50 rounded-full"
                    title="Cancel"
                  >
                    <XCircle className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>
          </div>
          <p className="text-sm mb-2">
            <Clock className="h-4 w-4 inline mr-1" />
            {new Date(apt.date_time).toLocaleString()}
          </p>
          <p className="text-sm text-gray-600">{apt.reason}</p>
          <span className={`inline-block mt-2 px-2 py-1 text-xs rounded-full ${
            apt.status === 'confirmed' ? 'bg-green-100 text-green-800' :
            apt.status === 'cancelled' ? 'bg-red-100 text-red-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
          </span>
        </div>
      ))}
      {appointments.length === 0 && (
        <p className="text-center py-4 text-gray-500">No appointments yet</p>
      )}
    </div>
  );
};