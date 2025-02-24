import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MessageCircle, Calendar, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../utils/supabase';
import { ChatModal } from '../components/modals/ChatModal';
import { AppointmentModal } from '../components/modals/AppointmentModal';

interface Appointment {
  id: string;
  date_time: string;
  reason: string;
  status: 'pending' | 'confirmed' | 'cancelled';
}

const Support = () => {
  const { user } = useAuth();
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  useEffect(() => {
    let subscription: any = null;

    const fetchAppointments = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('appointments')
          .select('*')
          .eq('user_id', user.id)
          .order('date_time', { ascending: true });
        
        if (error) throw error;
        setAppointments(data || []);
      } catch (err) {
        console.error('Error fetching appointments:', err);
      }
    };

    if (user) {
      fetchAppointments();

      // Set up real-time subscription for appointments
      subscription = supabase
        .channel('appointments')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'appointments',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            // Handle different types of changes
            if (payload.eventType === 'INSERT') {
              setAppointments(prev => [...prev, payload.new as Appointment].sort(
                (a, b) => new Date(a.date_time).getTime() - new Date(b.date_time).getTime()
              ));
            } else if (payload.eventType === 'UPDATE') {
              setAppointments(prev => prev.map(apt => 
                apt.id === payload.new.id ? payload.new as Appointment : apt
              ));
            } else if (payload.eventType === 'DELETE') {
              setAppointments(prev => prev.filter(apt => apt.id !== payload.old.id));
            }
          }
        )
        .subscribe();
    }

    return () => {
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, [user]);

  const handleAppointmentSubmit = async ({ dateTime, reason }: { dateTime: string; reason: string }) => {
    if (!user) throw new Error('You must be logged in to schedule an appointment');

    try {
      const { error } = await supabase
        .from('appointments')
        .insert([{
          user_id: user.id,
          date_time: dateTime,
          reason: reason,
          status: 'pending'
        }]);

      if (error) throw error;
      
      // Close the modal after successful submission
      setIsAppointmentModalOpen(false);
    } catch (err) {
      console.error('Error creating appointment:', err);
      throw err;
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    if (!user) throw new Error('You must be logged in to cancel appointments');

    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('id', appointmentId)
        .eq('user_id', user.id);

      if (error) throw error;
      setSelectedAppointment(null);
    } catch (err) {
      console.error('Error cancelling appointment:', err);
      throw err;
    }
  };

  const handleViewAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
  };

  return (
    <div className="max-w-7xl mx-auto px-4">
      <h1 className="text-4xl font-bold mb-8">Get Support</h1>

      {/* Emergency Contact */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-semibold text-red-700 mb-4">Emergency Support</h2>
        <p className="text-red-600 mb-4">
          If you're experiencing a mental health emergency, please call:
        </p>
        <div className="flex items-center space-x-4">
          <Phone className="h-8 w-8 text-red-600" />
          <div>
            <p className="text-3xl font-bold text-red-700">988</p>
            <p className="text-red-600">Suicide & Crisis Lifeline (24/7)</p>
          </div>
        </div>
      </div>

      {/* Support Options */}
      <div className="grid md:grid-cols-3 gap-8">
        {/* Support Groups */}
        <div className="bg-white rounded-lg shadow-md p-6 flex flex-col h-full">
          <div className="flex-grow">
            <Users className="h-8 w-8 text-purple-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Support Groups</h3>
            <p className="text-gray-600 mb-4">
              Join our therapeutic support groups led by experienced facilitators.
            </p>
          </div>
          <Link
            to="/support/groups"
            className="inline-block bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors text-center"
          >
            Browse Groups
          </Link>
        </div>

        {/* Professional Help */}
        <div className="bg-white rounded-lg shadow-md p-6 flex flex-col h-full">
          <div className="flex-grow">
            <Calendar className="h-8 w-8 text-purple-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Schedule a Consultation</h3>
            <p className="text-gray-600 mb-4">
              Connect with licensed mental health professionals for personalized support.
            </p>
            {appointments.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium mb-2">Your Appointments</h4>
                <div className="space-y-2">
                  {appointments.map((apt) => (
                    <div 
                      key={apt.id} 
                      className="text-sm p-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleViewAppointment(apt)}
                    >
                      <p className="font-medium">
                        {new Date(apt.date_time).toLocaleString()}
                      </p>
                      <p className="text-gray-600">{apt.reason}</p>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                        apt.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        apt.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <button
            onClick={() => {
              setSelectedAppointment(null);
              setIsAppointmentModalOpen(true);
            }}
            className="w-full bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Book Appointment
          </button>
        </div>

        {/* Online Chat */}
        <div className="bg-white rounded-lg shadow-md p-6 flex flex-col h-full">
          <div className="flex-grow">
            <MessageCircle className="h-8 w-8 text-purple-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Chat Support</h3>
            <p className="text-gray-600 mb-4">
              Talk to our trained support team through our secure chat platform.
            </p>
          </div>
          <button
            onClick={() => setIsChatModalOpen(true)}
            className="w-full bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Start Chat
          </button>
        </div>
      </div>

      {/* Contact Information */}
      <div className="mt-8 bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4">Other Ways to Reach Us</h3>
        <div className="space-y-4">
          <div className="flex items-center">
            <Mail className="h-6 w-6 text-purple-600 mr-3" />
            <div>
              <p className="font-medium">Email Support</p>
              <p className="text-gray-600">support@mindfulspace.com</p>
            </div>
          </div>
          <div className="flex items-center">
            <Phone className="h-6 w-6 text-purple-600 mr-3" />
            <div>
              <p className="font-medium">Phone Support</p>
              <p className="text-gray-600">1-800-MINDFUL (Mon-Fri, 9am-5pm EST)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {(isAppointmentModalOpen || selectedAppointment) && (
        <AppointmentModal
          isOpen={isAppointmentModalOpen || !!selectedAppointment}
          onClose={() => {
            setIsAppointmentModalOpen(false);
            setSelectedAppointment(null);
          }}
          onSubmit={handleAppointmentSubmit}
          onCancel={handleCancelAppointment}
          appointment={selectedAppointment || undefined}
          mode={selectedAppointment ? 'view' : 'create'}
        />
      )}
      
      {isChatModalOpen && (
        <ChatModal
          isOpen={isChatModalOpen}
          onClose={() => setIsChatModalOpen(false)}
        />
      )}
    </div>
  );
};

export default Support;