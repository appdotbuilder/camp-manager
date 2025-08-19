import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState, useEffect } from 'react';
import { X, UserCheck } from 'lucide-react';
import type { CreateGroupInput, Group } from '../../../server/src/schema';

interface GroupFormProps {
  initialData?: Group;
  onSubmit: (data: CreateGroupInput) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function GroupForm({ initialData, onSubmit, onCancel, isLoading = false }: GroupFormProps) {
  const [formData, setFormData] = useState<CreateGroupInput>({
    name: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name
      });
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    
    await onSubmit(formData);
  };

  return (
    <Card className="border-0 shadow-lg bg-white/90 backdrop-blur">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2">
          <UserCheck className="h-5 w-5 text-purple-600" />
          {initialData ? 'Edit Group' : 'Create New Group'}
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Group Name</Label>
            <Input
              id="name"
              placeholder="Enter group name (e.g., Swimming, Arts & Crafts)"
              value={formData.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData((prev: CreateGroupInput) => ({ ...prev, name: e.target.value }))
              }
              required
              className="bg-white"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              type="submit" 
              disabled={isLoading || !formData.name.trim()}
              className="flex-1 bg-purple-600 hover:bg-purple-700"
            >
              {isLoading ? 'Saving...' : (initialData ? 'Update Group' : 'Create Group')}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}