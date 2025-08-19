import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChildrenManagement } from '@/components/ChildrenManagement';
import { GroupsManagement } from '@/components/GroupsManagement';
import { Users, UserCheck } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto p-6">
        <Card className="mb-6 border-0 shadow-lg bg-white/80 backdrop-blur">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              🏕️ Summer Camp Manager
            </CardTitle>
            <p className="text-gray-600 text-lg mt-2">
              Manage children and groups for your summer camp activities
            </p>
          </CardHeader>
        </Card>

        <Tabs defaultValue="children" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 bg-white/80 backdrop-blur">
            <TabsTrigger value="children" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Children
            </TabsTrigger>
            <TabsTrigger value="groups" className="flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              Groups
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="children">
            <ChildrenManagement />
          </TabsContent>
          
          <TabsContent value="groups">
            <GroupsManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default App;