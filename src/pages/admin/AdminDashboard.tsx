import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Calendar, MessageCircle, Shield, Users, MessageSquare, Search, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../utils/supabase';
import { AppointmentsTab } from './components/AppointmentsTab';
import { ChatsTab } from './components/ChatsTab';
import { UsersTab } from './components/UsersTab';
import { GroupsTab } from './components/GroupsTab';
import { ForumTab } from './components/ForumTab';
import { GroupModal } from './components/GroupModal';
import type { AdminAppointment, AdminChat, ChatMessage, UserProfile, ForumPost, SupportGroup, GroupFormData } from './types';

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title: string;
}

const DeleteModal: React.FC<DeleteModalProps> = ({ isOpen, onClose, onConfirm, title }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  const handleConfirm = async () => {
    setIsDeleting(true);
    setError('');
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      setError('Failed to delete post. Please try again.');
      console.error('Error deleting post:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-center gap-3 text-red-600 mb-4">
          <AlertTriangle className="h-6 w-6" />
          <h3 className="text-lg font-semibold">Delete Post</h3>
        </div>
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete this post? This action cannot be undone.
        </p>
        <div className="bg-gray-50 p-3 rounded-lg mb-6">
          <p className="text-gray-700">{title}</p>
        </div>
        {error && (
          <div className="mb-6 p-3 bg-red-50 text-red-700 rounded-lg flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            {error}
          </div>
        )}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isDeleting}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [appointments, setAppointments] = useState<AdminAppointment[]>([]);
  const [chats, setChats] = useState<AdminChat[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'appointments' | 'chats' | 'users' | 'groups' | 'forum'>('appointments');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [groups, setGroups] = useState<SupportGroup[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [forumPosts, setForumPosts] = useState<ForumPost[]>([]);
  const [deleteModalData, setDeleteModalData] = useState<{ isOpen: boolean; postId: string; title: string }>({
    isOpen: false,
    postId: '',
    title: ''
  });
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<SupportGroup | undefined>();

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }
      
      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      setIsAdmin(data?.role === 'admin');
      setLoading(false);
    };

    checkAdminStatus();
  }, [user]);

  useEffect(() => {
    if (!isAdmin) return;

    let subscriptions: any[] = [];

    const fetchData = async () => {
      try {
        // Fetch appointments
        const { data: appointmentsData, error: appointmentsError } = await supabase
          .from('appointments')
          .select(`
            id,
            date_time,
            reason,
            status,
            user_id,
            profiles!appointments_user_id_fkey (
              full_name,
              email
            )
          `)
          .order('date_time', { ascending: true });

        if (appointmentsError) throw appointmentsError;
        setAppointments(appointmentsData || []);

        // Fetch users
        const { data: usersData, error: usersError } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });

        if (usersError) throw usersError;
        setUsers(usersData || []);

        // Fetch forum posts
        const { data: postsData, error: postsError } = await supabase
          .from('forum_posts')
          .select(`
            *,
            profiles!forum_posts_author_id_fkey (
              full_name,
              email
            )
          `)
          .order('created_at', { ascending: false });

        if (postsError) throw postsError;
        setForumPosts(postsData || []);

        // Fetch groups with members
        const { data: groupsData, error: groupsError } = await supabase
          .from('support_groups')
          .select(`
            *,
            members:group_memberships(
              id,
              joined_at,
              profiles(
                full_name,
                email
              )
            )
          `)
          .order('created_at', { ascending: false });

        if (groupsError) throw groupsError;
        setGroups(groupsData || []);

        // Fetch chat messages
        const { data: chatMessages, error: chatError } = await supabase
          .from('chat_messages')
          .select(`
            id,
            content,
            created_at,
            is_admin,
            read,
            user_id,
            profiles!chat_messages_user_id_fkey (
              full_name,
              email
            )
          `)
          .order('created_at', { ascending: false });

        if (chatError) throw chatError;

        if (chatMessages) {
          const chatsByUser = chatMessages.reduce((acc: any, message: any) => {
            if (!acc[message.user_id]) {
              acc[message.user_id] = {
                user_id: message.user_id,
                profiles: message.profiles,
                last_message: {
                  content: message.content,
                  created_at: message.created_at,
                  is_admin: message.is_admin
                },
                unread_count: !message.read && !message.is_admin ? 1 : 0
              };
            } else if (!message.read && !message.is_admin) {
              acc[message.user_id].unread_count += 1;
            }
            return acc;
          }, {});

          setChats(Object.values(chatsByUser));
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Set up real-time subscriptions
    const appointmentsSub = supabase
      .channel('admin_appointments')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'appointments'
      }, () => {
        fetchData();
      })
      .subscribe();

    const chatsSub = supabase
      .channel('admin_chats')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'chat_messages'
      }, () => {
        fetchData();
      })
      .subscribe();

    const groupsSub = supabase
      .channel('admin_groups')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'support_groups'
      }, () => {
        fetchData();
      })
      .subscribe();

    const forumSub = supabase
      .channel('admin_forum')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'forum_posts'
      }, () => {
        fetchData();
      })
      .subscribe();

    subscriptions = [appointmentsSub, chatsSub, groupsSub, forumSub];

    return () => {
      subscriptions.forEach(sub => {
        if (sub) {
          supabase.removeChannel(sub);
        }
      });
    };
  }, [isAdmin]);

  useEffect(() => {
    let chatSub: any = null;

    const fetchMessages = async () => {
      if (!selectedChat) return;

      try {
        const { data, error } = await supabase
          .from('chat_messages')
          .select(`
            *,
            profiles!chat_messages_user_id_fkey (
              full_name,
              email
            ),
            admin:profiles!chat_messages_admin_id_fkey (
              full_name
            )
          `)
          .eq('user_id', selectedChat)
          .order('created_at', { ascending: true });

        if (error) throw error;
        setChatMessages(data || []);

        // Mark messages as read
        await supabase
          .from('chat_messages')
          .update({ read: true })
          .eq('user_id', selectedChat)
          .eq('is_admin', false);
      } catch (err) {
        console.error('Error fetching messages:', err);
        setError('Failed to load messages');
      }
    };

    if (selectedChat) {
      fetchMessages();

      chatSub = supabase
        .channel(`chat_${selectedChat}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'chat_messages',
          filter: `user_id=eq.${selectedChat}`
        }, () => {
          fetchMessages();
        })
        .subscribe();
    }

    return () => {
      if (chatSub) {
        supabase.removeChannel(chatSub);
      }
    };
  }, [selectedChat]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChat || !newMessage.trim() || !user) return;

    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert([{
          user_id: selectedChat,
          content: newMessage.trim(),
          is_admin: true,
          admin_id: user.id
        }]);

      if (error) throw error;
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
    }
  };

  const handleUpdateAppointmentStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      console.error('Error updating appointment:', err);
      setError('Failed to update appointment status');
    }
  };

  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;

      setUsers(prev =>
        prev.map(user =>
          user.id === userId ? { ...user, role: newRole } : user
        )
      );
    } catch (err) {
      console.error('Error updating user role:', err);
      setError('Failed to update user role');
    }
  };

  const handleDeletePost = async (post: ForumPost) => {
    if (!user) throw new Error('You must be logged in to delete posts');

    try {
      // First verify admin status
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role !== 'admin') {
        throw new Error('Only admins can delete posts');
      }

      // Delete the post
      const { error } = await supabase
        .from('forum_posts')
        .delete()
        .eq('id', post.id);

      if (error) throw error;

      // Update local state immediately
      setForumPosts(prev => prev.filter(p => p.id !== post.id));
      setDeleteModalData({ isOpen: false, postId: '', title: '' });

      // Fetch updated posts list to ensure sync
      const { data: updatedPosts, error: fetchError } = await supabase
        .from('forum_posts')
        .select(`
          *,
          profiles!forum_posts_author_id_fkey (
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      if (updatedPosts) {
        setForumPosts(updatedPosts);
      }
    } catch (err) {
      console.error('Error deleting post:', err);
      throw new Error('Failed to delete post');
    }
  };

  const handleCreateOrUpdateGroup = async (formData: GroupFormData) => {
    try {
      if (selectedGroup) {
        // Update existing group
        const { error: groupError } = await supabase
          .from('support_groups')
          .update({
            name: formData.name,
            description: formData.description,
            capacity: formData.capacity
          })
          .eq('id', selectedGroup.id);

        if (groupError) throw groupError;

        // Update sessions
        await supabase
          .from('group_sessions')
          .delete()
          .eq('group_id', selectedGroup.id);

        const { error: sessionsError } = await supabase
          .from('group_sessions')
          .insert(
            formData.sessions.map(session => ({
              group_id: selectedGroup.id,
              session_time: session
            }))
          );

        if (sessionsError) throw sessionsError;

        // Update indicators
        await supabase
          .from('group_indicators')
          .delete()
          .eq('group_id', selectedGroup.id);

        const { error: indicatorsError } = await supabase
          .from('group_indicators')
          .insert(
            formData.indicators.map(indicator => ({
              group_id: selectedGroup.id,
              indicator
            }))
          );

        if (indicatorsError) throw indicatorsError;

        // Update resources
        await supabase
          .from('group_resources')
          .delete()
          .eq('group_id', selectedGroup.id);

        const { error: resourcesError } = await supabase
          .from('group_resources')
          .insert(
            formData.resources.map(resource => ({
              group_id: selectedGroup.id,
              resource
            }))
          );

        if (resourcesError) throw resourcesError;

      } else {
        // Create new group
        const { data: newGroup, error: groupError } = await supabase
          .from('support_groups')
          .insert([{
            name: formData.name,
            description: formData.description,
            capacity: formData.capacity
          }])
          .select()
          .single();

        if (groupError) throw groupError;

        // Insert sessions
        const { error: sessionsError } = await supabase
          .from('group_sessions')
          .insert(
            formData.sessions.map(session => ({
              group_id: newGroup.id,
              session_time: session
            }))
          );

        if (sessionsError) throw sessionsError;

        // Insert indicators
        const { error: indicatorsError } = await supabase
          .from('group_indicators')
          .insert(
            formData.indicators.map(indicator => ({
              group_id: newGroup.id,
              indicator
            }))
          );

        if (indicatorsError) throw indicatorsError;

        // Insert resources
        const { error: resourcesError } = await supabase
          .from('group_resources')
          .insert(
            formData.resources.map(resource => ({
              group_id: newGroup.id,
              resource
            }))
          );

        if (resourcesError) throw resourcesError;
      }

      setIsGroupModalOpen(false);
      setSelectedGroup(undefined);
    } catch (err) {
      console.error('Error saving group:', err);
      throw new Error('Failed to save group');
    }
  };

  const handleDeleteGroup = async (group: SupportGroup) => {
    try {
      // Delete the group (cascade delete will handle related records)
      const { error } = await supabase
        .from('support_groups')
        .delete()
        .eq('id', group.id);

      if (error) throw error;

      // Update local state
      setGroups(prev => prev.filter(g => g.id !== group.id));
    } catch (err) {
      console.error('Error deleting group:', err);
      setError('Failed to delete group');
    }
  };

  const filteredUsers = searchQuery
    ? users.filter(user =>
        user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : users;

  const filteredGroups = searchQuery
    ? groups.filter(group =>
        group.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        group.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : groups;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <div className="flex space-x-4 mb-8">
        <button
          onClick={() => setActiveTab('appointments')}
          className={`px-4 py-2 rounded-lg ${
            activeTab === 'appointments'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Calendar className="h-5 w-5 inline-block mr-2" />
          Appointments
        </button>
        <button
          onClick={() => setActiveTab('chats')}
          className={`px-4 py-2 rounded-lg ${
            activeTab === 'chats'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <MessageCircle className="h-5 w-5 inline-block mr-2" />
          Chats
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-lg ${
            activeTab === 'users'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Shield className="h-5 w-5 inline-block mr-2" />
          Users
        </button>
        <button
          onClick={() => setActiveTab('groups')}
          className={`px-4 py-2 rounded-lg ${
            activeTab === 'groups'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Users className="h-5 w-5 inline-block mr-2" />
          Groups
        </button>
        <button
          onClick={() => setActiveTab('forum')}
          className={`px-4 py-2 rounded-lg ${
            activeTab === 'forum'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <MessageSquare className="h-5 w-5 inline-block mr-2" />
          Forum
        </button>
      </div>

      {(activeTab === 'users' || activeTab === 'groups') && (
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-200 focus:border-purple-500"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            {(searchQuery || activeTab !== 'appointments') && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-sm text-gray-500 hover:text-gray-700"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {activeTab === 'appointments' && (
        <AppointmentsTab
          appointments={appointments}
          onUpdateStatus={handleUpdateAppointmentStatus}
        />
      )}

      {activeTab === 'chats' && (
        <ChatsTab
          chats={chats}
          selectedChat={selectedChat}
          chatMessages={chatMessages}
          onSelectChat={setSelectedChat}
          onSendMessage={handleSendMessage}
          newMessage={newMessage}
          onNewMessageChange={setNewMessage}
        />
      )}

      {activeTab === 'users' && (
        <UsersTab
          users={filteredUsers}
          onUpdateRole={handleUpdateUserRole}
        />
      )}

      {activeTab === 'groups' && (
        <GroupsTab
          groups={filteredGroups}
          onCreateGroup={() => {
            setSelectedGroup(undefined);
            setIsGroupModalOpen(true);
          }}
          onEditGroup={(group) => {
            setSelectedGroup(group);
            setIsGroupModalOpen(true);
          }}
          onDeleteGroup={handleDeleteGroup}
        />
      )}

      {activeTab === 'forum' && (
        <ForumTab
          posts={forumPosts}
          onDeletePost={(post) => {
            setDeleteModalData({
              isOpen: true,
              postId: post.id,
              title: post.title
            });
          }}
        />
      )}

      {/* Modals */}
      <DeleteModal
        isOpen={deleteModalData.isOpen}
        onClose={() => setDeleteModalData({ isOpen: false, postId: '', title: '' })}
        onConfirm={() => {
          const post = forumPosts.find(p => p.id === deleteModalData.postId);
          if (post) {
            return handleDeletePost(post);
          }
          return Promise.reject(new Error('Post not found'));
        }}
        title={deleteModalData.title}
      />

      <GroupModal
        isOpen={isGroupModalOpen}
        onClose={() => {
          setIsGroupModalOpen(false);
          setSelectedGroup(undefined);
        }}
        onSubmit={handleCreateOrUpdateGroup}
        group={selectedGroup}
      />
    </div>
  );
};

export default AdminDashboard;