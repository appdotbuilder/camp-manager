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
  deleteByIdInputSchema
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