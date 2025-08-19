import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/utils/trpc';
import { useState } from 'react';
import { X, Users, UserMinus } from 'lucide-react';
import type { GroupWithChildren, Child } from '../../../server/src/schema';

interface GroupDetailsProps {
  group: GroupWithChildren;
  onClose: () => void;
  onSuccess: () => void;
}

export function GroupDetails({ group, onClose, onSuccess }: GroupDetailsProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleRemoveChild = async (childId: number) => {
    if (!window.confirm('Remove this child from the group?')) return;
    
    setIsLoading(true);
    try {
      await trpc.removeChildFromGroup.mutate({
        child_id: childId,
        group_id: group.id
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to remove child from group:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateAge = (birthDate: Date) => {
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1;
    }
    return age;
  };

  const getGenderEmoji = (gender: string) => {
    switch (gender) {
      case 'male': return '👦';
      case 'female': return '👧';
      default: return '🧒';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl border-0 shadow-xl bg-white max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">👥</span>
            <Users className="h-5 w-5 text-purple-600" />
            {group.name}
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
        
        <CardContent className="overflow-y-auto max-h-[70vh]">
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold">Children in this group</h3>
                <p className="text-gray-600">
                  {group.children.length} {group.children.length === 1 ? 'child' : 'children'} assigned
                </p>
              </div>
              <Badge variant="secondary" className="text-sm">
                Created: {group.created_at.toLocaleDateString()}
              </Badge>
            </div>
            
            {group.children.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-lg">No children assigned yet</p>
                <p className="text-sm">Use the Children tab to assign children to this group</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {group.children.map((child: Child) => (
                  <Card key={child.id} className="border border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="text-2xl">
                            {getGenderEmoji(child.gender)}
                          </div>
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-gray-900 mb-2">
                              {child.name}
                            </h4>
                            <div className="space-y-1 text-sm text-gray-600">
                              <p>
                                <span className="font-medium">Age:</span> {calculateAge(child.birth_date)} years old
                              </p>
                              <p>
                                <span className="font-medium">Birth Date:</span> {child.birth_date.toLocaleDateString()}
                              </p>
                              <p>
                                <span className="font-medium">Gender:</span> {child.gender.charAt(0).toUpperCase() + child.gender.slice(1)}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveChild(child.id)}
                          disabled={isLoading}
                          className="border-red-200 text-red-600 hover:bg-red-50"
                        >
                          <UserMinus className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </CardContent>
        
        <div className="p-6 border-t bg-gray-50/50">
          <div className="flex justify-end">
            <Button 
              variant="outline" 
              onClick={onClose}
            >
              Close
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}