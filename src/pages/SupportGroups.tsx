import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../utils/supabase';
import { Users, Calendar, BookOpen, AlertCircle } from 'lucide-react';

interface Group {
  id: string;
  name: string;
  description: string;
  capacity: number;
  current_members: number;
  indicators: string[];
  sessions: string[];
  resources: string[];
}

interface JoinModalProps {
  group: Group;
  onClose: () => void;
  onJoin: (groupId: string) => Promise<void>;
}

const JoinModal: React.FC<JoinModalProps> = ({ group, onClose, onJoin }) => {
  const [agreement, setAgreement] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleJoin = async () => {
    if (!agreement) {
      setError('Please agree to the group guidelines to continue');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onJoin(group.id);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join group');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Join {group.name}</h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>

          <div className="space-y-4 mb-6">
            <div className="bg-purple-50 text-purple-700 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Meeting Times</h4>
              <ul className="list-disc list-inside">
                {group.sessions.map((session) => (
                  <li key={session}>{session}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-2">Group Guidelines:</h4>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-2">
                <li>Maintain confidentiality of all group discussions</li>
                <li>Respect all group members and their experiences</li>
                <li>Attend sessions regularly and arrive on time</li>
                <li>Participate actively but allow others to share</li>
                <li>Follow the guidance of group facilitators</li>
              </ul>
            </div>
          </div>

          <div className="mb-6">
            <label className="flex items-start space-x-2">
              <input
                type="checkbox"
                checked={agreement}
                onChange={(e) => setAgreement(e.target.checked)}
                className="mt-1"
              />
              <span className="text-sm text-gray-600">
                I understand and agree to follow the group guidelines, maintaining
                confidentiality and showing respect to all members.
              </span>
            </label>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              {error}
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleJoin}
              disabled={!agreement || loading}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              {loading ? 'Joining...' : 'Join Group'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const SupportGroups = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [userGroups, setUserGroups] = useState<Set<string>>(new Set());
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        // Fetch groups with their indicators, sessions, and resources
        const { data: groupsData, error: groupsError } = await supabase
          .from('support_groups')
          .select('*');

        if (groupsError) throw groupsError;

        const enrichedGroups = await Promise.all(
          groupsData.map(async (group) => {
            // Fetch indicators
            const { data: indicators } = await supabase
              .from('group_indicators')
              .select('indicator')
              .eq('group_id', group.id);

            // Fetch sessions
            const { data: sessions } = await supabase
              .from('group_sessions')
              .select('session_time')
              .eq('group_id', group.id);

            // Fetch resources
            const { data: resources } = await supabase
              .from('group_resources')
              .select('resource')
              .eq('group_id', group.id);

            return {
              ...group,
              indicators: indicators?.map(i => i.indicator) || [],
              sessions: sessions?.map(s => s.session_time) || [],
              resources: resources?.map(r => r.resource) || []
            };
          })
        );

        setGroups(enrichedGroups);

        // If user is logged in, fetch their group memberships
        if (user) {
          const { data: memberships } = await supabase
            .from('group_memberships')
            .select('group_id')
            .eq('user_id', user.id);

          if (memberships) {
            setUserGroups(new Set(memberships.map(m => m.group_id)));
          }
        }
      } catch (err) {
        setError('Failed to load support groups');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, [user]);

  const handleJoinGroup = async (groupId: string) => {
    if (!user) {
      setError('Please log in to join a group');
      return;
    }

    try {
      const { error: joinError } = await supabase
        .from('group_memberships')
        .insert([
          { group_id: groupId, user_id: user.id }
        ]);

      if (joinError) throw joinError;

      setUserGroups(new Set([...userGroups, groupId]));
    } catch (err) {
      throw new Error('Failed to join group');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4">
      <h1 className="text-4xl font-bold mb-8">Support Groups</h1>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {groups.map((group) => (
          <div key={group.id} className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-2">{group.name}</h3>
            <p className="text-gray-600 mb-4">{group.description}</p>

            <div className="space-y-4 mb-6">
              <div className="flex items-center text-gray-600">
                <Users className="h-5 w-5 mr-2" />
                <span>{group.current_members}/{group.capacity} members</span>
              </div>

              <div>
                <div className="flex items-center text-gray-600 mb-2">
                  <Calendar className="h-5 w-5 mr-2" />
                  <span className="font-medium">Meeting Times</span>
                </div>
                <ul className="list-disc list-inside text-sm text-gray-600 ml-7">
                  {group.sessions.map((session) => (
                    <li key={session}>{session}</li>
                  ))}
                </ul>
              </div>

              <div>
                <div className="flex items-center text-gray-600 mb-2">
                  <BookOpen className="h-5 w-5 mr-2" />
                  <span className="font-medium">Resources</span>
                </div>
                <ul className="list-disc list-inside text-sm text-gray-600 ml-7">
                  {group.resources.map((resource) => (
                    <li key={resource}>{resource}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex flex-wrap gap-2">
                {group.indicators.map((indicator) => (
                  <span
                    key={indicator}
                    className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                  >
                    {indicator}
                  </span>
                ))}
              </div>

              <button
                onClick={() => setSelectedGroup(group)}
                disabled={userGroups.has(group.id) || group.current_members >= group.capacity}
                className={`px-4 py-2 rounded-lg ${
                  userGroups.has(group.id)
                    ? 'bg-green-100 text-green-700 cursor-default'
                    : group.current_members >= group.capacity
                    ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
              >
                {userGroups.has(group.id)
                  ? 'Joined'
                  : group.current_members >= group.capacity
                  ? 'Full'
                  : 'Join Group'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedGroup && (
        <JoinModal
          group={selectedGroup}
          onClose={() => setSelectedGroup(null)}
          onJoin={handleJoinGroup}
        />
      )}
    </div>
  );
};

export default SupportGroups;