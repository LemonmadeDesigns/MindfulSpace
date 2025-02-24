import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Tag, Users, Edit2, Trash2, X, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../utils/supabase';

interface Post {
  id: string;
  title: string;
  content: string;
  category: string;
  created_at: string;
  author_id: string;
  profiles?: {
    full_name: string;
  } | null;
}

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
      setError(err instanceof Error ? err.message : 'Failed to delete post');
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
            {isDeleting ? 'Deleting...' : 'Delete Post'}
          </button>
        </div>
      </div>
    </div>
  );
};

const Forum = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteModalData, setDeleteModalData] = useState<{ isOpen: boolean; postId: string; title: string }>({
    isOpen: false,
    postId: '',
    title: ''
  });

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('forum_posts')
          .select(`
            id,
            title,
            content,
            category,
            created_at,
            author_id,
            profiles (
              full_name
            )
          `)
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;
        setPosts(data || []);
      } catch (err) {
        console.error('Error fetching posts:', err);
        setError('Failed to load posts');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();

    // Set up real-time subscription
    const channel = supabase.channel('forum_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'forum_posts'
        },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            setPosts(prev => prev.filter(post => post.id !== payload.old.id));
          } else if (payload.eventType === 'INSERT') {
            fetchPosts();
          } else if (payload.eventType === 'UPDATE') {
            setPosts(prev => prev.map(post => 
              post.id === payload.new.id ? { ...post, ...payload.new } : post
            ));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleDeletePost = async (postId: string) => {
    if (!user) throw new Error('You must be logged in to delete posts');

    try {
      const { error } = await supabase
        .from('forum_posts')
        .delete()
        .eq('id', postId)
        .eq('author_id', user.id);

      if (error) throw error;

      // Update local state immediately
      setPosts(prev => prev.filter(p => p.id !== postId));
      setDeleteModalData({ isOpen: false, postId: '', title: '' });
    } catch (err) {
      console.error('Error deleting post:', err);
      throw new Error('Failed to delete post');
    }
  };

  const handleEditPost = (post: Post) => {
    setSelectedPost(post);
    setIsModalOpen(true);
  };

  const openDeleteModal = (post: Post) => {
    setDeleteModalData({
      isOpen: true,
      postId: post.id,
      title: post.title
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Community Forum</h1>
        {user && (
          <button
            onClick={() => {
              setSelectedPost(undefined);
              setIsModalOpen(true);
            }}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            New Post
          </button>
        )}
      </div>

      {error && (
        <div className="mb-8 bg-red-50 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      )}

      {/* Categories */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {['Support', 'Discussion', 'Success Stories'].map((category) => (
          <div key={category} className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2">{category}</h3>
            <div className="flex items-center text-gray-600 space-x-4">
              <span className="flex items-center">
                <MessageSquare className="h-4 w-4 mr-1" />
                {posts.filter(post => post.category === category).length} posts
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Posts List */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold">Recent Discussions</h2>
        </div>
        <div className="divide-y">
          {loading ? (
            <div className="p-6 text-center text-gray-500">Loading posts...</div>
          ) : posts.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No posts yet. Be the first to share!</div>
          ) : (
            posts.map((post) => (
              <div key={post.id} className="p-6 hover:bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-medium hover:text-purple-600 cursor-pointer">
                    {post.title}
                  </h3>
                  <div className="flex items-center space-x-2">
                    {user?.id === post.author_id && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditPost(post)}
                          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                        >
                          <Edit2 className="h-4 w-4 text-gray-500" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(post)}
                          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    {post.profiles?.full_name || 'Anonymous'}
                  </span>
                  <span className="flex items-center">
                    <Tag className="h-4 w-4 mr-1" />
                    {post.category}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={deleteModalData.isOpen}
        onClose={() => setDeleteModalData({ isOpen: false, postId: '', title: '' })}
        onConfirm={() => handleDeletePost(deleteModalData.postId)}
        title={deleteModalData.title}
      />
    </div>
  );
};

export default Forum;