import React from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { SupportGroup } from '../types';

interface GroupsTabProps {
  groups: SupportGroup[];
  onCreateGroup: () => void;
  onEditGroup: (group: SupportGroup) => void;
  onDeleteGroup: (group: SupportGroup) => void;
}

export const GroupsTab: React.FC<GroupsTabProps> = ({ 
  groups,
  onCreateGroup,
  onEditGroup,
  onDeleteGroup
}) => {
  return (
    <div>
      <div className="mb-6 flex justify-end">
        <button
          onClick={onCreateGroup}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          <Plus className="h-5 w-5" />
          Create New Group
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map((group) => (
          <div key={group.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold">{group.name}</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => onEditGroup(group)}
                  className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                  title="Edit group"
                >
                  <Edit className="h-5 w-5" />
                </button>
                <button
                  onClick={() => onDeleteGroup(group)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                  title="Delete group"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <p className="text-gray-600 mb-4">{group.description}</p>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Capacity:</span>
                <span className="font-medium">{group.capacity}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Current Members:</span>
                <span className="font-medium">{group.current_members}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Created:</span>
                <span className="font-medium">
                  {new Date(group.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t">
              <h4 className="font-medium mb-2">Members</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {group.members?.map((member) => (
                  <div key={member.id} className="text-sm p-2 bg-gray-50 rounded">
                    <p className="font-medium">{member.profiles?.full_name}</p>
                    <p className="text-gray-600 text-xs">{member.profiles?.email}</p>
                    <p className="text-gray-500 text-xs">
                      Joined: {new Date(member.joined_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
                {!group.members?.length && (
                  <p className="text-gray-500 text-sm">No members yet</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};