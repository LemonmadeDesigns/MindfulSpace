import React, { useState, useEffect, useRef } from 'react';
import { Send, X, Edit2, Trash2, Check, AlertTriangle, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../utils/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface ChatMessage {
  id: string;
  content: string;
  is_admin: boolean;
  created_at: string;
  updated_at?: string;
  user_id: string;
  admin_id?: string;
  user: {
    full_name: string;
    email: string;
  };
  admin?: {
    full_name: string;
  };
}

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  message: string;
}

interface UserStatus {
  id: string;
  is_online: boolean;
  last_seen: string;
}

const DeleteModal: React.FC<DeleteModalProps> = ({ isOpen, onClose, onConfirm, message }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  const handleConfirm = async () => {
    setIsDeleting(true);
    setError('');
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete message');
      console.error('Error deleting message:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-center gap-3 text-red-600 mb-4">
          <AlertTriangle className="h-6 w-6" />
          <h3 className="text-lg font-semibold">Delete Message</h3>
        </div>
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete this message? This action cannot be undone.
        </p>
        <div className="bg-gray-50 p-3 rounded-lg mb-6">
          <p className="text-gray-700">{message}</p>
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

export const ChatModal: React.FC<ChatModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingMessage, setEditingMessage] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    messageId: string;
    content: string;
  }>({
    isOpen: false,
    messageId: '',
    content: ''
  });
  const [isTyping, setIsTyping] = useState(false);
  const [userStatus, setUserStatus] = useState<UserStatus | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    let channelInstance: RealtimeChannel | null = null;

    const setupChatAndSubscription = async () => {
      if (!isOpen || !user) return;

      try {
        // Initial fetch of messages with user profiles
        const { data: existingMessages, error: fetchError } = await supabase
          .from('chat_messages')
          .select(`
            *,
            user:profiles!chat_messages_user_id_fkey (
              full_name,
              email
            ),
            admin:profiles!chat_messages_admin_id_fkey (
              full_name
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: true });

        if (fetchError) throw fetchError;
        setMessages(existingMessages || []);

        // Set up realtime subscription for messages
        channelInstance = supabase
          .channel(`chat-${user.id}`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'chat_messages',
              filter: `user_id=eq.${user.id}`,
            },
            async (payload) => {
              if (payload.eventType === 'INSERT') {
                const { data } = await supabase
                  .from('chat_messages')
                  .select(`
                    *,
                    user:profiles!chat_messages_user_id_fkey (
                      full_name,
                      email
                    ),
                    admin:profiles!chat_messages_admin_id_fkey (
                      full_name
                    )
                  `)
                  .eq('id', payload.new.id)
                  .single();

                if (data) {
                  setMessages(prev => [...prev, data]);
                  scrollToBottom();
                }
              } else if (payload.eventType === 'DELETE') {
                setMessages(prev => prev.filter(msg => msg.id !== payload.old.id));
              } else if (payload.eventType === 'UPDATE') {
                const { data } = await supabase
                  .from('chat_messages')
                  .select(`
                    *,
                    user:profiles!chat_messages_user_id_fkey (
                      full_name,
                      email
                    ),
                    admin:profiles!chat_messages_admin_id_fkey (
                      full_name
                    )
                  `)
                  .eq('id', payload.new.id)
                  .single();

                if (data) {
                  setMessages(prev =>
                    prev.map(msg => msg.id === data.id ? data : msg)
                  );
                }
              }
            }
          )
          // Subscribe to typing indicators
          .on(
            'broadcast',
            { event: 'typing' },
            ({ payload }) => {
              if (payload.userId !== user.id) {
                setIsTyping(true);
                if (typingTimeoutRef.current) {
                  clearTimeout(typingTimeoutRef.current);
                }
                typingTimeoutRef.current = setTimeout(() => {
                  setIsTyping(false);
                }, 3000);
              }
            }
          )
          .subscribe();

        channelRef.current = channelInstance;
        scrollToBottom();

        // Update user status
        await supabase
          .from('user_status')
          .upsert({
            id: user.id,
            is_online: true,
            last_seen: new Date().toISOString()
          });

        // Subscribe to user status changes
        channelInstance
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'user_status',
              filter: `id=eq.${user.id}`,
            },
            (payload) => {
              if (payload.new) {
                setUserStatus(payload.new as UserStatus);
              }
            }
          );

      } catch (error) {
        console.error('Error setting up chat:', error);
        setError(error instanceof Error ? error.message : 'Failed to load messages');
      }
    };

    setupChatAndSubscription();

    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      // Update user status when leaving
      if (user) {
        supabase
          .from('user_status')
          .upsert({
            id: user.id,
            is_online: false,
            last_seen: new Date().toISOString()
          });
      }
    };
  }, [isOpen, user]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newMessage.trim()) return;

    setLoading(true);
    setError('');

    try {
      const { data, error: sendError } = await supabase
        .from('chat_messages')
        .insert([
          {
            user_id: user.id,
            content: newMessage.trim(),
            is_admin: false
          }
        ])
        .select(`
          *,
          user:profiles!chat_messages_user_id_fkey (
            full_name,
            email
          ),
          admin:profiles!chat_messages_admin_id_fkey (
            full_name
          )
        `)
        .single();

      if (sendError) throw sendError;
      
      if (data) {
        setMessages(prev => [...prev, data]);
        setNewMessage('');
        scrollToBottom();
      }
      
      messageInputRef.current?.focus();
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const handleEditMessage = async (messageId: string, newContent: string) => {
    if (!user || !newContent.trim()) return;

    try {
      const { data, error: updateError } = await supabase
        .from('chat_messages')
        .update({ content: newContent.trim() })
        .eq('id', messageId)
        .eq('user_id', user.id)
        .select(`
          *,
          user:profiles!chat_messages_user_id_fkey (
            full_name,
            email
          ),
          admin:profiles!chat_messages_admin_id_fkey (
            full_name
          )
        `)
        .single();

      if (updateError) throw updateError;

      if (data) {
        setMessages(prev => prev.map(msg => 
          msg.id === messageId ? data : msg
        ));
      }
      
      setEditingMessage(null);
      setEditContent('');
    } catch (err) {
      console.error('Error updating message:', err);
      setError('Failed to update message');
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!user) return;

    try {
      const { error: deleteError } = await supabase
        .from('chat_messages')
        .delete()
        .eq('id', messageId)
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;
      
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
      setDeleteModal({ isOpen: false, messageId: '', content: '' });
    } catch (err) {
      console.error('Error deleting message:', err);
      throw new Error('Failed to delete message');
    }
  };

  const handleTyping = () => {
    if (!channelRef.current || !user) return;

    channelRef.current.send({
      type: 'broadcast',
      event: 'typing',
      payload: { userId: user.id }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full h-[80vh] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold">Chat Support</h2>
            {userStatus && (
              <p className="text-sm text-gray-500">
                {userStatus.is_online ? (
                  <span className="text-green-600">● Online</span>
                ) : (
                  <span className="text-gray-500">
                    Last seen: {new Date(userStatus.last_seen).toLocaleString()}
                  </span>
                )}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-700 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            {error}
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.is_admin ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  message.is_admin
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium">
                    {message.is_admin
                      ? message.admin?.full_name || 'Support Team'
                      : message.user?.full_name}
                  </span>
                  {message.updated_at && message.updated_at !== message.created_at && (
                    <span className="text-xs opacity-75">(edited)</span>
                  )}
                </div>
                {editingMessage === message.id ? (
                  <div className="mt-2">
                    <input
                      type="text"
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full px-3 py-1 rounded border text-gray-800"
                      autoFocus
                    />
                    <div className="flex justify-end gap-2 mt-2">
                      <button
                        onClick={() => {
                          setEditingMessage(null);
                          setEditContent('');
                        }}
                        className="p-1 hover:bg-black hover:bg-opacity-10 rounded-full transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEditMessage(message.id, editContent)}
                        className="p-1 hover:bg-black hover:bg-opacity-10 rounded-full transition-colors"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <p>{message.content}</p>
                )}
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs opacity-75">
                    {new Date(message.created_at).toLocaleTimeString()}
                  </span>
                  {!message.is_admin && !editingMessage && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingMessage(message.id);
                          setEditContent(message.content);
                        }}
                        className="p-1 hover:bg-black hover:bg-opacity-10 rounded-full transition-colors"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeleteModal({
                          isOpen: true,
                          messageId: message.id,
                          content: message.content
                        })}
                        className="p-1 hover:bg-black hover:bg-opacity-10 rounded-full transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex items-center gap-2 text-gray-500">
              <div className="flex gap-1">
                <span className="animate-bounce">.</span>
                <span className="animate-bounce delay-100">.</span>
                <span className="animate-bounce delay-200">.</span>
              </div>
              <span className="text-sm">Someone is typing</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="p-4 border-t">
          <div className="flex gap-2">
            <input
              ref={messageInputRef}
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleTyping}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-200 focus:border-purple-500"
            />
            <button
              type="submit"
              disabled={loading || !newMessage.trim()}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              {loading ? 'Sending...' : 'Send'}
            </button>
          </div>
        </form>

        <DeleteModal
          isOpen={deleteModal.isOpen}
          onClose={() => setDeleteModal({ isOpen: false, messageId: '', content: '' })}
          onConfirm={() => handleDeleteMessage(deleteModal.messageId)}
          message={deleteModal.content}
        />
      </div>
    </div>
  );
};