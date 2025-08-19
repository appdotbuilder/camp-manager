import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/utils/trpc';
import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, UserCheck, Users } from 'lucide-react';
import type { Group, CreateGroupInput, GroupWithChildren } from '../../../server/src/schema';
import { GroupForm } from '@/components/GroupForm';
import { GroupDetails } from '@/components/GroupDetails';

export function GroupsManagement() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<GroupWithChildren | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const loadGroups = useCallback(async () => {
    try {
      const result = await trpc.getGroups.query();
      setGroups(result);
    } catch (error) {
      console.error('Failed to load groups:', error);
    }
  }, []);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  const handleCreateGroup = async (data: CreateGroupInput) => {
    setIsLoading(true);
    try {
      const response = await trpc.createGroup.mutate(data);
      setGroups((prev: Group[]) => [...prev, response]);
      setShowForm(false);
    } catch (error) {
      console.error('Failed to create group:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateGroup = async (data: CreateGroupInput) => {
    if (!editingGroup) return;
    
    setIsLoading(true);
    try {
      const response = await trpc.updateGroup.mutate({
        id: editingGroup.id,
        ...data
      });
      setGroups((prev: Group[]) => 
        prev.map(group => group.id === editingGroup.id ? response : group)
      );
      setEditingGroup(null);
    } catch (error) {
      console.error('Failed to update group:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteGroup = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this group? This will remove all child assignments.')) return;
    
    try {
      await trpc.deleteGroup.mutate({ id });
      setGroups((prev: Group[]) => prev.filter(group => group.id !== id));
    } catch (error) {
      console.error('Failed to delete group:', error);
    }
  };

  const handleViewDetails = async (group: Group) => {
    try {
      const groupWithChildren = await trpc.getGroupWithChildren.query({ id: group.id });
      setSelectedGroup(groupWithChildren);
      setShowDetails(true);
    } catch (error) {
      console.error('Failed to load group details:', error);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingGroup(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <Card className="border-0 shadow-md bg-white/80 backdrop-blur">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-purple-600" />
              Groups Management
            </CardTitle>
            <Button 
              onClick={() => setShowForm(true)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Group
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Group Form */}
      {(showForm || editingGroup) && (
        <GroupForm
          initialData={editingGroup || undefined}
          onSubmit={editingGroup ? handleUpdateGroup : handleCreateGroup}
          onCancel={resetForm}
          isLoading={isLoading}
        />
      )}

      {/* Group Details Modal */}
      {showDetails && selectedGroup && (
        <GroupDetails
          group={selectedGroup}
          onClose={() => {
            setShowDetails(false);
            setSelectedGroup(null);
          }}
          onSuccess={() => {
            loadGroups();
          }}
        />
      )}

      {/* Groups List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {groups.length === 0 ? (
          <Card className="border-0 shadow-md bg-white/80 backdrop-blur col-span-full">
            <CardContent className="text-center py-12">
              <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No groups found</p>
              <p className="text-gray-400">Create some groups to organize your camp activities!</p>
            </CardContent>
          </Card>
        ) : (
          groups.map((group: Group) => (
            <Card key={group.id} className="border-0 shadow-md bg-white/80 backdrop-blur hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">👥</div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {group.name}
                      </h3>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2 mb-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewDetails(group)}
                    className="border-green-200 text-green-600 hover:bg-green-50 flex-1"
                  >
                    <Users className="h-4 w-4 mr-1" />
                    View Children
                  </Button>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingGroup(group)}
                    className="border-blue-200 text-blue-600 hover:bg-blue-50 flex-1"
                  >
                    <Edit2 className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteGroup(group.id)}
                    className="border-red-200 text-red-600 hover:bg-red-50 flex-1"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
                
                <div className="mt-4 text-xs text-gray-400">
                  Created: {group.created_at.toLocaleDateString()}
                  {group.updated_at.getTime() !== group.created_at.getTime() && (
                    <span> • Updated: {group.updated_at.toLocaleDateString()}</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}