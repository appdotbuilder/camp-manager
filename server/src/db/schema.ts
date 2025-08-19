import { serial, text, pgTable, timestamp, pgEnum, integer, primaryKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enum for gender
export const genderEnum = pgEnum('gender', ['male', 'female', 'other']);

// Children table
export const childrenTable = pgTable('children', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  birth_date: timestamp('birth_date', { mode: 'date' }).notNull(),
  gender: genderEnum('gender').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Groups table
export const groupsTable = pgTable('groups', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Many-to-many relationship table for children and groups
export const childGroupsTable = pgTable('child_groups', {
  child_id: integer('child_id').notNull().references(() => childrenTable.id, { onDelete: 'cascade' }),
  group_id: integer('group_id').notNull().references(() => groupsTable.id, { onDelete: 'cascade' }),
  assigned_at: timestamp('assigned_at').defaultNow().notNull()
}, (table) => ({
  pk: primaryKey({ columns: [table.child_id, table.group_id] })
}));

// Define relations
export const childrenRelations = relations(childrenTable, ({ many }) => ({
  childGroups: many(childGroupsTable),
}));

export const groupsRelations = relations(groupsTable, ({ many }) => ({
  childGroups: many(childGroupsTable),
}));

export const childGroupsRelations = relations(childGroupsTable, ({ one }) => ({
  child: one(childrenTable, {
    fields: [childGroupsTable.child_id],
    references: [childrenTable.id],
  }),
  group: one(groupsTable, {
    fields: [childGroupsTable.group_id],
    references: [groupsTable.id],
  }),
}));

// TypeScript types for the table schemas
export type Child = typeof childrenTable.$inferSelect;
export type NewChild = typeof childrenTable.$inferInsert;
export type Group = typeof groupsTable.$inferSelect;
export type NewGroup = typeof groupsTable.$inferInsert;
export type ChildGroup = typeof childGroupsTable.$inferSelect;
export type NewChildGroup = typeof childGroupsTable.$inferInsert;

// Export all tables for proper query building
export const tables = {
  children: childrenTable,
  groups: groupsTable,
  childGroups: childGroupsTable
};