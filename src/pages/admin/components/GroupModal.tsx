import React, { useState, useEffect } from 'react';
import { Plus, X, AlertTriangle } from 'lucide-react';
import { SupportGroup } from '../types';

interface GroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: GroupFormData) => Promise<void>;
  group?: SupportGroup;
}

export interface GroupFormData {
  name: string;
  description: string;
  capacity: number;
  sessions: string[];
  indicators: string[];
  resources: string[];
}

export const GroupModal: React.FC<GroupModalProps> = ({ isOpen, onClose, onSubmit, group }) => {
  const [formData, setFormData] = useState<GroupFormData>({
    name: group?.name || '',
    description: group?.description || '',
    capacity: group?.capacity || 20,
    sessions: group?.sessions || [''],
    indicators: group?.indicators || [''],
    resources: group?.resources || ['']
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (group) {
      setFormData({
        name: group.name,
        description: group.description,
        capacity: group.capacity,
        sessions: group.sessions || [''],
        indicators: group.indicators || [''],
        resources: group.resources || ['']
      });
    }
  }, [group]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await onSubmit(formData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save group');
    } finally {
      setLoading(false);
    }
  };

  const handleArrayInput = (
    field: 'sessions' | 'indicators' | 'resources',
    index: number,
    value: string
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => (i === index ? value : item))
    }));
  };

  const addArrayItem = (field: 'sessions' | 'indicators' | 'resources') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (field: 'sessions' | 'indicators' | 'resources', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold">
              {group ? 'Edit Support Group' : 'Create New Support Group'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Group Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-200 focus:border-purple-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-200 focus:border-purple-500"
                rows={4}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Capacity
              </label>
              <input
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData(prev => ({ ...prev, capacity: parseInt(e.target.value) }))}
                min="1"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-200 focus:border-purple-500"
                required
              />
            </div>

            {/* Session Times */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Session Times
                </label>
                <button
                  type="button"
                  onClick={() => addArrayItem('sessions')}
                  className="text-purple-600 hover:text-purple-700"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
              {formData.sessions.map((session, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={session}
                    onChange={(e) => handleArrayInput('sessions', index, e.target.value)}
                    placeholder="e.g., Monday 7PM"
                    className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-200 focus:border-purple-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => removeArrayItem('sessions', index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Indicators */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Indicators
                </label>
                <button
                  type="button"
                  onClick={() => addArrayItem('indicators')}
                  className="text-purple-600 hover:text-purple-700"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
              {formData.indicators.map((indicator, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={indicator}
                    onChange={(e) => handleArrayInput('indicators', index, e.target.value)}
                    placeholder="e.g., Stress, Anxiety"
                    className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-200 focus:border-purple-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => removeArrayItem('indicators', index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Resources */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Resources
                </label>
                <button
                  type="button"
                  onClick={() => addArrayItem('resources')}
                  className="text-purple-600 hover:text-purple-700"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
              {formData.resources.map((resource, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={resource}
                    onChange={(e) => handleArrayInput('resources', index, e.target.value)}
                    placeholder="e.g., Counseling, Workshops"
                    className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-200 focus:border-purple-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => removeArrayItem('resources', index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Saving...' : group ? 'Update Group' : 'Create Group'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};