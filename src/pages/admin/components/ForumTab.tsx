import React from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';
import { ForumPost } from '../types';

interface ForumTabProps {
  posts: ForumPost[];
  onDeletePost: (post: ForumPost) => void;
}

export const ForumTab: React.FC<ForumTabProps> = ({ posts, onDeletePost }) => {
  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <div key={post.id} className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-semibold mb-2">{post.title}</h3>
              <p className="text-gray-600">{post.content}</p>
            </div>
            <button
              onClick={() => onDeletePost(post)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
              title="Delete post"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
          <div className="flex justify-between items-center text-sm text-gray-500">
            <div>
              <span className="font-medium">{post.profiles?.full_name || 'Unknown User'}</span>
              <span className="mx-2">•</span>
              <span>{post.profiles?.email || 'No email'}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                {post.category}
              </span>
              <span>{new Date(post.created_at).toLocaleString()}</span>
            </div>
          </div>
        </div>
      ))}
      {posts.length === 0 && (
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-900 mb-2">No forum posts found</p>
          <p className="text-gray-600">
            There are currently no posts in the forum.
          </p>
        </div>
      )}
    </div>
  );
};