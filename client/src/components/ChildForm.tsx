import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState, useEffect } from 'react';
import { X, UserPlus } from 'lucide-react';
import type { CreateChildInput, Child } from '../../../server/src/schema';

interface ChildFormProps {
  initialData?: Child;
  onSubmit: (data: CreateChildInput) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ChildForm({ initialData, onSubmit, onCancel, isLoading = false }: ChildFormProps) {
  const [formData, setFormData] = useState<CreateChildInput>({
    name: '',
    birth_date: new Date(),
    gender: 'other'
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        birth_date: initialData.birth_date,
        gender: initialData.gender
      });
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    
    await onSubmit(formData);
  };

  const formatDateForInput = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  return (
    <Card className="border-0 shadow-lg bg-white/90 backdrop-blur">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-blue-600" />
          {initialData ? 'Edit Child' : 'Add New Child'}
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
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              placeholder="Enter child's full name"
              value={formData.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData((prev: CreateChildInput) => ({ ...prev, name: e.target.value }))
              }
              required
              className="bg-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="birth_date">Birth Date</Label>
            <Input
              id="birth_date"
              type="date"
              value={formatDateForInput(formData.birth_date)}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData((prev: CreateChildInput) => ({ 
                  ...prev, 
                  birth_date: new Date(e.target.value) 
                }))
              }
              required
              className="bg-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender">Gender</Label>
            <Select
              value={formData.gender}
              onValueChange={(value: 'male' | 'female' | 'other') =>
                setFormData((prev: CreateChildInput) => ({ ...prev, gender: value }))
              }
            >
              <SelectTrigger className="bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">👦 Male</SelectItem>
                <SelectItem value="female">👧 Female</SelectItem>
                <SelectItem value="other">🧒 Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              type="submit" 
              disabled={isLoading || !formData.name.trim()}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? 'Saving...' : (initialData ? 'Update Child' : 'Add Child')}
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