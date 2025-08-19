import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DisciplinesManagement } from '@/components/DisciplinesManagement';
import { ResultsManagement } from '@/components/ResultsManagement';
import { Medal, BarChart3 } from 'lucide-react';

export function OlympicsManagement() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="disciplines" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="disciplines" className="flex items-center gap-2">
            <Medal className="h-4 w-4" />
            Disciplines
          </TabsTrigger>
          <TabsTrigger value="results" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Results & Rankings
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="disciplines">
          <DisciplinesManagement />
        </TabsContent>
        
        <TabsContent value="results">
          <ResultsManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}