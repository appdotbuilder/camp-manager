import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { trpc } from '@/utils/trpc';
import { Trophy, Plus, X, Target } from 'lucide-react';
import type { Child, Discipline, ChildWithDisciplines } from '../../../server/src/schema';

interface DisciplineAssignmentProps {
  child: Child;
  disciplines: Discipline[];
  onClose: () => void;
  onSuccess: () => void;
}

export function DisciplineAssignment({ child, disciplines, onClose, onSuccess }: DisciplineAssignmentProps) {
  const [childWithDisciplines, setChildWithDisciplines] = useState<ChildWithDisciplines | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadChildDisciplines = useCallback(async () => {
    try {
      const result = await trpc.getChildWithDisciplines.query({ id: child.id });
      setChildWithDisciplines(result);
    } catch (error) {
      console.error('Failed to load child disciplines:', error);
    }
  }, [child.id]);

  useEffect(() => {
    loadChildDisciplines();
  }, [loadChildDisciplines]);

  const handleAssignDiscipline = async (disciplineId: number) => {
    setIsLoading(true);
    try {
      await trpc.assignChildToDiscipline.mutate({
        child_id: child.id,
        discipline_id: disciplineId
      });
      await loadChildDisciplines();
      onSuccess();
    } catch (error) {
      console.error('Failed to assign discipline:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveDiscipline = async (disciplineId: number) => {
    setIsLoading(true);
    try {
      await trpc.removeChildFromDiscipline.mutate({
        child_id: child.id,
        discipline_id: disciplineId
      });
      await loadChildDisciplines();
      onSuccess();
    } catch (error) {
      console.error('Failed to remove discipline:', error);
    } finally {
      setIsLoading(false);
    }
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

  const assignedDisciplineIds = childWithDisciplines?.disciplines.map(d => d.id) || [];
  const availableDisciplines = disciplines.filter(d => !assignedDisciplineIds.includes(d.id));

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-orange-500" />
            Olympic Disciplines for {child.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Currently Assigned Disciplines */}
          <Card className="border-orange-200 bg-orange-50/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="h-4 w-4" />
                Assigned Disciplines ({assignedDisciplineIds.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {assignedDisciplineIds.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No disciplines assigned yet. Assign some disciplines below to get started! 🏆
                </p>
              ) : (
                <div className="space-y-3">
                  {childWithDisciplines?.disciplines.map((discipline) => (
                    <div key={discipline.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                      <div className="flex-1">
                        <h4 className="font-medium">{discipline.name}</h4>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {getResultTypeLabel(discipline.result_type)}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {getAggregationLabel(discipline.aggregation_method)}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveDiscipline(discipline.id)}
                        disabled={isLoading}
                        className="border-red-200 text-red-600 hover:bg-red-50"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Separator />

          {/* Available Disciplines */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Available Disciplines ({availableDisciplines.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {availableDisciplines.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  {disciplines.length === 0 
                    ? 'No disciplines have been created yet. Create some disciplines first!' 
                    : 'All available disciplines have been assigned to this child.'}
                </p>
              ) : (
                <div className="space-y-3">
                  {availableDisciplines.map((discipline) => (
                    <div key={discipline.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                      <div className="flex-1">
                        <h4 className="font-medium">{discipline.name}</h4>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {getResultTypeLabel(discipline.result_type)}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {getAggregationLabel(discipline.aggregation_method)}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAssignDiscipline(discipline.id)}
                        disabled={isLoading}
                        className="border-green-200 text-green-600 hover:bg-green-50"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end pt-4">
            <Button onClick={onClose} variant="outline">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}