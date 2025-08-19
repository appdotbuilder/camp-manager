import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { trpc } from '@/utils/trpc';
import { Plus, Edit, Trash2, Users } from 'lucide-react';
import type { Discipline, CreateDisciplineInput } from '../../../server/src/schema';

export function DisciplinesManagement() {
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingDiscipline, setEditingDiscipline] = useState<Discipline | null>(null);
  const [formData, setFormData] = useState<CreateDisciplineInput>({
    name: '',
    result_type: 'one_time',
    aggregation_method: 'best_result'
  });

  const loadDisciplines = useCallback(async () => {
    try {
      const result = await trpc.getDisciplines.query();
      setDisciplines(result);
    } catch (error) {
      console.error('Failed to load disciplines:', error);
    }
  }, []);

  useEffect(() => {
    loadDisciplines();
  }, [loadDisciplines]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (editingDiscipline) {
        const response = await trpc.updateDiscipline.mutate({
          id: editingDiscipline.id,
          ...formData
        });
        setDisciplines((prev: Discipline[]) => 
          prev.map(d => d.id === response.id ? response : d)
        );
        setEditingDiscipline(null);
      } else {
        const response = await trpc.createDiscipline.mutate(formData);
        setDisciplines((prev: Discipline[]) => [...prev, response]);
      }
      
      setFormData({
        name: '',
        result_type: 'one_time',
        aggregation_method: 'best_result'
      });
    } catch (error) {
      console.error('Failed to save discipline:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (discipline: Discipline) => {
    setEditingDiscipline(discipline);
    setFormData({
      name: discipline.name,
      result_type: discipline.result_type,
      aggregation_method: discipline.aggregation_method
    });
  };

  const handleDelete = async (id: number) => {
    try {
      await trpc.deleteDiscipline.mutate({ id });
      setDisciplines((prev: Discipline[]) => prev.filter(d => d.id !== id));
    } catch (error) {
      console.error('Failed to delete discipline:', error);
    }
  };

  const cancelEdit = () => {
    setEditingDiscipline(null);
    setFormData({
      name: '',
      result_type: 'one_time',
      aggregation_method: 'best_result'
    });
  };

  const getResultTypeLabel = (type: string) => {
    switch (type) {
      case 'one_time': return 'Single Result';
      case 'multiple_times': return 'Multiple Attempts';
      case 'number': return 'Count/Score';
      case 'multiple_numbers': return 'Multiple Scores';
      default: return type;
    }
  };

  const getAggregationLabel = (method: string) => {
    switch (method) {
      case 'best_result': return 'Best Result';
      case 'sum': return 'Sum';
      case 'mean': return 'Average';
      default: return method;
    }
  };

  return (
    <div className="space-y-6">
      {/* Create/Edit Form */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            {editingDiscipline ? 'Edit Discipline' : 'Create New Discipline'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Input
                  placeholder="Discipline name (e.g., Long Jump, 50m Sprint)"
                  value={formData.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData((prev: CreateDisciplineInput) => ({ ...prev, name: e.target.value }))
                  }
                  required
                />
              </div>
              
              <div>
                <Select 
                  value={formData.result_type} 
                  onValueChange={(value) => setFormData((prev: CreateDisciplineInput) => ({ 
                    ...prev, 
                    result_type: value as CreateDisciplineInput['result_type']
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select result type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="one_time">Single Result (e.g., Long Jump distance)</SelectItem>
                    <SelectItem value="multiple_times">Multiple Attempts (e.g., Sprint times)</SelectItem>
                    <SelectItem value="number">Count/Score (e.g., Sit-ups)</SelectItem>
                    <SelectItem value="multiple_numbers">Multiple Scores (e.g., Archery arrows)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Select 
                  value={formData.aggregation_method} 
                  onValueChange={(value) => setFormData((prev: CreateDisciplineInput) => ({ 
                    ...prev, 
                    aggregation_method: value as CreateDisciplineInput['aggregation_method']
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select aggregation method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="best_result">Best Result</SelectItem>
                    <SelectItem value="sum">Sum Total</SelectItem>
                    <SelectItem value="mean">Average</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : (editingDiscipline ? 'Update Discipline' : 'Create Discipline')}
              </Button>
              {editingDiscipline && (
                <Button type="button" variant="outline" onClick={cancelEdit}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Disciplines List */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur">
        <CardHeader>
          <CardTitle>Olympic Disciplines</CardTitle>
        </CardHeader>
        <CardContent>
          {disciplines.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No disciplines created yet. Create your first Olympic discipline above! 🏆
            </p>
          ) : (
            <div className="grid gap-4">
              {disciplines.map((discipline: Discipline) => (
                <div key={discipline.id} className="border rounded-lg p-4 bg-white/50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{discipline.name}</h3>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="secondary">
                          {getResultTypeLabel(discipline.result_type)}
                        </Badge>
                        <Badge variant="outline">
                          {getAggregationLabel(discipline.aggregation_method)}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        Created: {discipline.created_at.toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(discipline)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Discipline</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{discipline.name}"? 
                              This will also delete all associated results and cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(discipline.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}