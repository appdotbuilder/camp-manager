import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { trpc } from '@/utils/trpc';
import { Trophy, Target, Users, Plus, Medal } from 'lucide-react';
import type { 
  Discipline, 
  Child, 
  RecordResultInput, 
  DisciplineResults,
  DisciplineWithChildren 
} from '../../../server/src/schema';

export function ResultsManagement() {
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedDiscipline, setSelectedDiscipline] = useState<number | null>(null);
  const [disciplineResults, setDisciplineResults] = useState<DisciplineResults | null>(null);
  const [disciplineWithChildren, setDisciplineWithChildren] = useState<DisciplineWithChildren | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form for recording results
  const [resultForm, setResultForm] = useState<RecordResultInput>({
    child_id: 0,
    discipline_id: 0,
    value: 0,
    attempt_number: 1
  });

  const loadDisciplines = useCallback(async () => {
    try {
      const result = await trpc.getDisciplines.query();
      setDisciplines(result);
    } catch (error) {
      console.error('Failed to load disciplines:', error);
    }
  }, []);

  const loadChildren = useCallback(async () => {
    try {
      const result = await trpc.getChildren.query();
      setChildren(result);
    } catch (error) {
      console.error('Failed to load children:', error);
    }
  }, []);

  const loadDisciplineDetails = useCallback(async (disciplineId: number) => {
    try {
      setIsLoading(true);
      const [results, withChildren] = await Promise.all([
        trpc.getDisciplineResults.query({ discipline_id: disciplineId }),
        trpc.getDisciplineWithChildren.query({ id: disciplineId })
      ]);
      setDisciplineResults(results);
      setDisciplineWithChildren(withChildren);
    } catch (error) {
      console.error('Failed to load discipline details:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDisciplines();
    loadChildren();
  }, [loadDisciplines, loadChildren]);

  useEffect(() => {
    if (selectedDiscipline) {
      loadDisciplineDetails(selectedDiscipline);
      setResultForm(prev => ({ ...prev, discipline_id: selectedDiscipline }));
    }
  }, [selectedDiscipline, loadDisciplineDetails]);

  const handleRecordResult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resultForm.child_id || !resultForm.discipline_id) return;

    setIsLoading(true);
    try {
      await trpc.recordResult.mutate(resultForm);
      
      // Reload discipline results
      if (selectedDiscipline) {
        await loadDisciplineDetails(selectedDiscipline);
      }
      
      // Reset form
      setResultForm({
        child_id: 0,
        discipline_id: selectedDiscipline || 0,
        value: 0,
        attempt_number: 1
      });
    } catch (error) {
      console.error('Failed to record result:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignChild = async (childId: number) => {
    if (!selectedDiscipline) return;
    
    try {
      await trpc.assignChildToDiscipline.mutate({
        child_id: childId,
        discipline_id: selectedDiscipline
      });
      
      // Reload discipline details
      await loadDisciplineDetails(selectedDiscipline);
    } catch (error) {
      console.error('Failed to assign child to discipline:', error);
    }
  };

  const handleRemoveChild = async (childId: number) => {
    if (!selectedDiscipline) return;
    
    try {
      await trpc.removeChildFromDiscipline.mutate({
        child_id: childId,
        discipline_id: selectedDiscipline
      });
      
      // Reload discipline details
      await loadDisciplineDetails(selectedDiscipline);
    } catch (error) {
      console.error('Failed to remove child from discipline:', error);
    }
  };

  const getRankingIcon = (index: number) => {
    switch (index) {
      case 0: return '🥇';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return `${index + 1}`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Discipline Selection */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Select Discipline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select 
            value={selectedDiscipline?.toString() || ''} 
            onValueChange={(value) => setSelectedDiscipline(parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose a discipline to manage results" />
            </SelectTrigger>
            <SelectContent>
              {disciplines.map((discipline) => (
                <SelectItem key={discipline.id} value={discipline.id.toString()}>
                  {discipline.name} - {discipline.result_type === 'one_time' ? 'Single Result' : 
                   discipline.result_type === 'multiple_times' ? 'Multiple Attempts' :
                   discipline.result_type === 'number' ? 'Count/Score' : 'Multiple Scores'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedDiscipline && disciplineWithChildren && disciplineResults && (
        <Tabs defaultValue="results" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="results" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Rankings
            </TabsTrigger>
            <TabsTrigger value="record" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Record Results
            </TabsTrigger>
            <TabsTrigger value="participants" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Participants
            </TabsTrigger>
          </TabsList>

          {/* Rankings Tab */}
          <TabsContent value="results">
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Medal className="h-5 w-5" />
                  {disciplineResults.name} - Rankings
                </CardTitle>
                <div className="flex gap-2 mt-2">
                  <Badge variant="secondary">
                    {disciplineResults.result_type === 'one_time' ? 'Single Result' : 
                     disciplineResults.result_type === 'multiple_times' ? 'Multiple Attempts' :
                     disciplineResults.result_type === 'number' ? 'Count/Score' : 'Multiple Scores'}
                  </Badge>
                  <Badge variant="outline">
                    {disciplineResults.aggregation_method === 'best_result' ? 'Best Result' :
                     disciplineResults.aggregation_method === 'sum' ? 'Sum Total' : 'Average'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {disciplineResults.results.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No results recorded yet. Start by recording some results! 📊
                  </p>
                ) : (
                  <div className="space-y-4">
                    {disciplineResults.results.map((result, index) => (
                      <div key={result.child_id} className="flex items-center justify-between p-4 bg-white/50 rounded-lg border">
                        <div className="flex items-center gap-4">
                          <div className="text-2xl font-bold w-12 text-center">
                            {getRankingIcon(index)}
                          </div>
                          <div>
                            <h3 className="font-semibold">{result.child_name}</h3>
                            <p className="text-sm text-gray-500">
                              {result.total_attempts} attempt{result.total_attempts !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-600">
                            {result.aggregated_value.toFixed(2)}
                          </div>
                          <p className="text-sm text-gray-500">
                            {disciplineResults.aggregation_method === 'best_result' ? 'Best' :
                             disciplineResults.aggregation_method === 'sum' ? 'Total' : 'Average'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Record Results Tab */}
          <TabsContent value="record">
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Record New Result
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRecordResult} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <Select 
                        value={resultForm.child_id.toString()} 
                        onValueChange={(value) => setResultForm((prev: RecordResultInput) => ({ 
                          ...prev, 
                          child_id: parseInt(value) 
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select child" />
                        </SelectTrigger>
                        <SelectContent>
                          {disciplineWithChildren.children.map((child) => (
                            <SelectItem key={child.id} value={child.id.toString()}>
                              {child.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Input
                        type="number"
                        placeholder="Result value"
                        value={resultForm.value || ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setResultForm((prev: RecordResultInput) => ({ 
                            ...prev, 
                            value: parseFloat(e.target.value) || 0 
                          }))
                        }
                        step="0.01"
                        required
                      />
                    </div>
                    
                    {(disciplineResults.result_type === 'multiple_times' || 
                      disciplineResults.result_type === 'multiple_numbers') && (
                      <div>
                        <Input
                          type="number"
                          placeholder="Attempt number"
                          value={resultForm.attempt_number}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setResultForm((prev: RecordResultInput) => ({ 
                              ...prev, 
                              attempt_number: parseInt(e.target.value) || 1 
                            }))
                          }
                          min="1"
                        />
                      </div>
                    )}
                  </div>
                  
                  <Button type="submit" disabled={isLoading || !resultForm.child_id}>
                    {isLoading ? 'Recording...' : 'Record Result'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Participants Tab */}
          <TabsContent value="participants">
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Manage Participants
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Assigned Children ({disciplineWithChildren.children.length})</h3>
                    {disciplineWithChildren.children.length === 0 ? (
                      <p className="text-gray-500">No children assigned to this discipline yet.</p>
                    ) : (
                      <div className="grid gap-2">
                        {disciplineWithChildren.children.map((child) => (
                          <div key={child.id} className="flex items-center justify-between p-3 bg-white/50 rounded border">
                            <div>
                              <span className="font-medium">{child.name}</span>
                              <span className="text-sm text-gray-500 ml-2">
                                {child.gender} • {new Date().getFullYear() - child.birth_date.getFullYear()} years old
                              </span>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveChild(child.id)}
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">Available Children</h3>
                    {children.filter(child => 
                      !disciplineWithChildren.children.some(assigned => assigned.id === child.id)
                    ).length === 0 ? (
                      <p className="text-gray-500">All children are already assigned to this discipline.</p>
                    ) : (
                      <div className="grid gap-2">
                        {children
                          .filter(child => 
                            !disciplineWithChildren.children.some(assigned => assigned.id === child.id)
                          )
                          .map((child) => (
                            <div key={child.id} className="flex items-center justify-between p-3 bg-gray-50 rounded border">
                              <div>
                                <span className="font-medium">{child.name}</span>
                                <span className="text-sm text-gray-500 ml-2">
                                  {child.gender} • {new Date().getFullYear() - child.birth_date.getFullYear()} years old
                                </span>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleAssignChild(child.id)}
                              >
                                Assign
                              </Button>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}