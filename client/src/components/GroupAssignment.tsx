import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { trpc } from '@/utils/trpc';
import { useState, useEffect, useCallback } from 'react';
import { X, Users, Plus, Minus } from 'lucide-react';
import type { Child, Group, ChildWithGroups } from '../../../server/src/schema';

interface GroupAssignmentProps {
  child: Child;
  groups: Group[];
  onClose: () => void;
  onSuccess: () => void;
}

export function GroupAssignment({ child, groups, onClose, onSuccess }: GroupAssignmentProps) {
  const [childWithGroups, setChildWithGroups] = useState<ChildWithGroups | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<{
    toAdd: number[];
    toRemove: number[];
  }>({ toAdd: [], toRemove: [] });

  const loadChildWithGroups = useCallback(async () => {
    try {
      const result = await trpc.getChildWithGroups.query({ id: child.id });
      setChildWithGroups(result);
    } catch (error) {
      console.error('Failed to load child with groups:', error);
    }
  }, [child.id]);

  useEffect(() => {
    loadChildWithGroups();
  }, [loadChildWithGroups]);

  const isChildInGroup = (groupId: number) => {
    if (!childWithGroups) return false;
    const inCurrentGroups = childWithGroups.groups.some(g => g.id === groupId);
    const inPendingAdd = pendingChanges.toAdd.includes(groupId);
    const inPendingRemove = pendingChanges.toRemove.includes(groupId);
    
    return (inCurrentGroups && !inPendingRemove) || inPendingAdd;
  };

  const handleGroupToggle = (groupId: number, checked: boolean) => {
    if (!childWithGroups) return;
    
    const currentlyInGroup = childWithGroups.groups.some(g => g.id === groupId);
    
    setPendingChanges(prev => {
      const newChanges = { ...prev };
      
      if (checked) {
        // Want to add to group
        if (currentlyInGroup) {
          // Already in group, remove from toRemove if present
          newChanges.toRemove = newChanges.toRemove.filter(id => id !== groupId);
        } else {
          // Not in group, add to toAdd
          newChanges.toAdd = [...newChanges.toAdd.filter(id => id !== groupId), groupId];
        }
      } else {
        // Want to remove from group
        if (currentlyInGroup) {
          // In group, add to toRemove
          newChanges.toRemove = [...newChanges.toRemove.filter(id => id !== groupId), groupId];
        } else {
          // Not in group, remove from toAdd if present
          newChanges.toAdd = newChanges.toAdd.filter(id => id !== groupId);
        }
      }
      
      return newChanges;
    });
  };

  const handleSaveChanges = async () => {
    setIsLoading(true);
    try {
      // Process removals first
      for (const groupId of pendingChanges.toRemove) {
        await trpc.removeChildFromGroup.mutate({
          child_id: child.id,
          group_id: groupId
        });
      }
      
      // Process additions
      for (const groupId of pendingChanges.toAdd) {
        await trpc.assignChildToGroup.mutate({
          child_id: child.id,
          group_id: groupId
        });
      }
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to update group assignments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const hasPendingChanges = pendingChanges.toAdd.length > 0 || pendingChanges.toRemove.length > 0;

  const getGenderEmoji = (gender: string) => {
    switch (gender) {
      case 'male': return '👦';
      case 'female': return '👧';
      default: return '🧒';
    }
  };

  if (!childWithGroups) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-md border-0 shadow-xl">
          <CardContent className="text-center py-8">
            <p>Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl border-0 shadow-xl bg-white max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-600" />
            <span className="text-2xl mr-2">{getGenderEmoji(child.gender)}</span>
            Group Assignments - {child.name}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="overflow-y-auto max-h-[60vh]">
          <div className="space-y-4">
            <div className="text-sm text-gray-600 mb-4">
              Select the groups this child should be assigned to:
            </div>
            
            {groups.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p>No groups available</p>
                <p className="text-sm">Create some groups first to assign children</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {groups.map((group: Group) => {
                  const checked = isChildInGroup(group.id);
                  const currentlyInGroup = childWithGroups.groups.some(g => g.id === group.id);
                  const isPendingAdd = pendingChanges.toAdd.includes(group.id);
                  const isPendingRemove = pendingChanges.toRemove.includes(group.id);
                  
                  return (
                    <div key={group.id} className="flex items-center space-x-3 p-3 border rounded-lg bg-gray-50/50">
                      <Checkbox
                        id={`group-${group.id}`}
                        checked={checked}
                        onCheckedChange={(checked: boolean) => handleGroupToggle(group.id, checked)}
                      />
                      <label
                        htmlFor={`group-${group.id}`}
                        className="flex-1 cursor-pointer flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg">👥</span>
                          <span className="font-medium">{group.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {currentlyInGroup && !isPendingRemove && (
                            <Badge variant="secondary" className="text-xs">
                              Current
                            </Badge>
                          )}
                          {isPendingAdd && (
                            <Badge className="text-xs bg-green-100 text-green-700 border-green-200">
                              <Plus className="h-3 w-3 mr-1" />
                              Will Add
                            </Badge>
                          )}
                          {isPendingRemove && (
                            <Badge className="text-xs bg-red-100 text-red-700 border-red-200">
                              <Minus className="h-3 w-3 mr-1" />
                              Will Remove
                            </Badge>
                          )}
                        </div>
                      </label>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </CardContent>
        
        <div className="p-6 border-t bg-gray-50/50">
          <div className="flex gap-3">
            <Button 
              onClick={handleSaveChanges}
              disabled={isLoading || !hasPendingChanges}
              className="flex-1 bg-purple-600 hover:bg-purple-700"
            >
              {isLoading ? 'Saving Changes...' : 'Save Changes'}
            </Button>
            <Button 
              variant="outline" 
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
          
          {hasPendingChanges && (
            <div className="mt-3 text-sm text-gray-600">
              <p>
                {pendingChanges.toAdd.length > 0 && `Will add to ${pendingChanges.toAdd.length} group(s)`}
                {pendingChanges.toAdd.length > 0 && pendingChanges.toRemove.length > 0 && ' • '}
                {pendingChanges.toRemove.length > 0 && `Will remove from ${pendingChanges.toRemove.length} group(s)`}
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}