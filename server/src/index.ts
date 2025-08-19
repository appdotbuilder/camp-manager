import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';

// Import schemas
import {
  createChildInputSchema,
  updateChildInputSchema,
  filterChildrenInputSchema,
  createGroupInputSchema,
  updateGroupInputSchema,
  assignChildToGroupInputSchema,
  removeChildFromGroupInputSchema,
  deleteByIdInputSchema,
  // Olympics module schemas
  createDisciplineInputSchema,
  updateDisciplineInputSchema,
  assignChildToDisciplineInputSchema,
  removeChildFromDisciplineInputSchema,
  recordResultInputSchema,
  getDisciplineResultsInputSchema
} from './schema';

// Import handlers - Children
import { createChild } from './handlers/create_child';
import { getChildren } from './handlers/get_children';
import { getChildById } from './handlers/get_child_by_id';
import { updateChild } from './handlers/update_child';
import { deleteChild } from './handlers/delete_child';
import { getChildWithGroups } from './handlers/get_child_with_groups';

// Import handlers - Groups
import { createGroup } from './handlers/create_group';
import { getGroups } from './handlers/get_groups';
import { getGroupById } from './handlers/get_group_by_id';
import { updateGroup } from './handlers/update_group';
import { deleteGroup } from './handlers/delete_group';
import { getGroupWithChildren } from './handlers/get_group_with_children';

// Import handlers - Child-Group associations
import { assignChildToGroup } from './handlers/assign_child_to_group';
import { removeChildFromGroup } from './handlers/remove_child_from_group';

// Import handlers - Olympics module
import { createDiscipline } from './handlers/create_discipline';
import { getDisciplines } from './handlers/get_disciplines';
import { getDisciplineById } from './handlers/get_discipline_by_id';
import { updateDiscipline } from './handlers/update_discipline';
import { deleteDiscipline } from './handlers/delete_discipline';
import { getDisciplineWithChildren } from './handlers/get_discipline_with_children';
import { assignChildToDiscipline } from './handlers/assign_child_to_discipline';
import { removeChildFromDiscipline } from './handlers/remove_child_from_discipline';
import { recordResult } from './handlers/record_result';
import { getDisciplineResults } from './handlers/get_discipline_results';
import { getChildWithDisciplines } from './handlers/get_child_with_disciplines';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  // Health check
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),

  // Children routes
  createChild: publicProcedure
    .input(createChildInputSchema)
    .mutation(({ input }) => createChild(input)),
  
  getChildren: publicProcedure
    .input(filterChildrenInputSchema.optional())
    .query(({ input }) => getChildren(input)),
  
  getChildById: publicProcedure
    .input(deleteByIdInputSchema)
    .query(({ input }) => getChildById(input)),
  
  updateChild: publicProcedure
    .input(updateChildInputSchema)
    .mutation(({ input }) => updateChild(input)),
  
  deleteChild: publicProcedure
    .input(deleteByIdInputSchema)
    .mutation(({ input }) => deleteChild(input)),
  
  getChildWithGroups: publicProcedure
    .input(deleteByIdInputSchema)
    .query(({ input }) => getChildWithGroups(input)),

  // Groups routes
  createGroup: publicProcedure
    .input(createGroupInputSchema)
    .mutation(({ input }) => createGroup(input)),
  
  getGroups: publicProcedure
    .query(() => getGroups()),
  
  getGroupById: publicProcedure
    .input(deleteByIdInputSchema)
    .query(({ input }) => getGroupById(input)),
  
  updateGroup: publicProcedure
    .input(updateGroupInputSchema)
    .mutation(({ input }) => updateGroup(input)),
  
  deleteGroup: publicProcedure
    .input(deleteByIdInputSchema)
    .mutation(({ input }) => deleteGroup(input)),
  
  getGroupWithChildren: publicProcedure
    .input(deleteByIdInputSchema)
    .query(({ input }) => getGroupWithChildren(input)),

  // Child-Group association routes
  assignChildToGroup: publicProcedure
    .input(assignChildToGroupInputSchema)
    .mutation(({ input }) => assignChildToGroup(input)),
  
  removeChildFromGroup: publicProcedure
    .input(removeChildFromGroupInputSchema)
    .mutation(({ input }) => removeChildFromGroup(input)),

  // Olympics module - Discipline routes
  createDiscipline: publicProcedure
    .input(createDisciplineInputSchema)
    .mutation(({ input }) => createDiscipline(input)),
  
  getDisciplines: publicProcedure
    .query(() => getDisciplines()),
  
  getDisciplineById: publicProcedure
    .input(deleteByIdInputSchema)
    .query(({ input }) => getDisciplineById(input)),
  
  updateDiscipline: publicProcedure
    .input(updateDisciplineInputSchema)
    .mutation(({ input }) => updateDiscipline(input)),
  
  deleteDiscipline: publicProcedure
    .input(deleteByIdInputSchema)
    .mutation(({ input }) => deleteDiscipline(input)),
  
  getDisciplineWithChildren: publicProcedure
    .input(deleteByIdInputSchema)
    .query(({ input }) => getDisciplineWithChildren(input)),

  // Olympics module - Child-Discipline association routes
  assignChildToDiscipline: publicProcedure
    .input(assignChildToDisciplineInputSchema)
    .mutation(({ input }) => assignChildToDiscipline(input)),
  
  removeChildFromDiscipline: publicProcedure
    .input(removeChildFromDisciplineInputSchema)
    .mutation(({ input }) => removeChildFromDiscipline(input)),
  
  getChildWithDisciplines: publicProcedure
    .input(deleteByIdInputSchema)
    .query(({ input }) => getChildWithDisciplines(input)),

  // Olympics module - Results routes
  recordResult: publicProcedure
    .input(recordResultInputSchema)
    .mutation(({ input }) => recordResult(input)),
  
  getDisciplineResults: publicProcedure
    .input(getDisciplineResultsInputSchema)
    .query(({ input }) => getDisciplineResults(input)),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`Summer Camp Management TRPC server listening at port: ${port}`);
}

start();