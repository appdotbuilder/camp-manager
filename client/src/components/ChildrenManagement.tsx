import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { trpc } from '@/utils/trpc';
import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Edit2, Trash2, Users } from 'lucide-react';
import type { Child, CreateChildInput, FilterChildrenInput, Group } from '../../../server/src/schema';
import { ChildForm } from '@/components/ChildForm';
import { GroupAssignment } from '@/components/GroupAssignment';

export function ChildrenManagement() {
  const [children, setChildren] = useState<Child[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingChild, setEditingChild] = useState<Child | null>(null);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [showGroupAssignment, setShowGroupAssignment] = useState(false);

  // Filter state
  const [filters, setFilters] = useState<FilterChildrenInput>({
    name: '',
    gender: undefined
  });

  const loadChildren = useCallback(async () => {
    try {
      const result = await trpc.getChildren.query(filters);
      setChildren(result);
    } catch (error) {
      console.error('Failed to load children:', error);
    }
  }, [filters]);

  const loadGroups = useCallback(async () => {
    try {
      const result = await trpc.getGroups.query();
      setGroups(result);
    } catch (error) {
      console.error('Failed to load groups:', error);
    }
  }, []);

  useEffect(() => {
    loadChildren();
    loadGroups();
  }, [loadChildren, loadGroups]);

  const handleCreateChild = async (data: CreateChildInput) => {
    setIsLoading(true);
    try {
      const response = await trpc.createChild.mutate(data);
      setChildren((prev: Child[]) => [...prev, response]);
      setShowForm(false);
    } catch (error) {
      console.error('Failed to create child:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateChild = async (data: CreateChildInput) => {
    if (!editingChild) return;
    
    setIsLoading(true);
    try {
      const response = await trpc.updateChild.mutate({
        id: editingChild.id,
        ...data
      });
      setChildren((prev: Child[]) => 
        prev.map(child => child.id === editingChild.id ? response : child)
      );
      setEditingChild(null);
    } catch (error) {
      console.error('Failed to update child:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteChild = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this child?')) return;
    
    try {
      await trpc.deleteChild.mutate({ id });
      setChildren((prev: Child[]) => prev.filter(child => child.id !== id));
    } catch (error) {
      console.error('Failed to delete child:', error);
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

  const resetForm = () => {
    setShowForm(false);
    setEditingChild(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <Card className="border-0 shadow-md bg-white/80 backdrop-blur">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Children Management
            </CardTitle>
            <Button 
              onClick={() => setShowForm(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Child
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Filters */}
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <Input
                placeholder="Search by name..."
                value={filters.name || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFilters((prev: FilterChildrenInput) => ({ ...prev, name: e.target.value || undefined }))
                }
                className="bg-white"
              />
            </div>
            <Select
              value={filters.gender || 'all'}
              onValueChange={(value: string) =>
                setFilters((prev: FilterChildrenInput) => ({ 
                  ...prev, 
                  gender: value === 'all' ? undefined : value as 'male' | 'female' | 'other' 
                }))
              }
            >
              <SelectTrigger className="w-48 bg-white">
                <SelectValue placeholder="Filter by gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Genders</SelectItem>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Child Form */}
      {(showForm || editingChild) && (
        <ChildForm
          initialData={editingChild || undefined}
          onSubmit={editingChild ? handleUpdateChild : handleCreateChild}
          onCancel={resetForm}
          isLoading={isLoading}
        />
      )}

      {/* Group Assignment Modal */}
      {showGroupAssignment && selectedChild && (
        <GroupAssignment
          child={selectedChild}
          groups={groups}
          onClose={() => {
            setShowGroupAssignment(false);
            setSelectedChild(null);
          }}
          onSuccess={() => {
            loadChildren();
            loadGroups();
          }}
        />
      )}

      {/* Children List */}
      <div className="grid gap-4">
        {children.length === 0 ? (
          <Card className="border-0 shadow-md bg-white/80 backdrop-blur">
            <CardContent className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No children found</p>
              <p className="text-gray-400">Add some children to get started!</p>
            </CardContent>
          </Card>
        ) : (
          children.map((child: Child) => (
            <Card key={child.id} className="border-0 shadow-md bg-white/80 backdrop-blur hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="text-3xl">
                      {getGenderEmoji(child.gender)}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {child.name}
                      </h3>
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
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedChild(child);
                        setShowGroupAssignment(true);
                      }}
                      className="border-purple-200 text-purple-600 hover:bg-purple-50"
                    >
                      <Users className="h-4 w-4 mr-1" />
                      Groups
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingChild(child)}
                      className="border-blue-200 text-blue-600 hover:bg-blue-50"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteChild(child.id)}
                      className="border-red-200 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="mt-4 text-xs text-gray-400">
                  Added: {child.created_at.toLocaleDateString()}
                  {child.updated_at.getTime() !== child.created_at.getTime() && (
                    <span> • Updated: {child.updated_at.toLocaleDateString()}</span>
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