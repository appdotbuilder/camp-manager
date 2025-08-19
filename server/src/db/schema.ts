import { serial, text, pgTable, timestamp, pgEnum, integer, primaryKey, numeric } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enum for gender
export const genderEnum = pgEnum('gender', ['male', 'female', 'other']);

// Enums for Olympics module
export const resultTypeEnum = pgEnum('result_type', ['one_time', 'multiple_times', 'number', 'multiple_numbers']);
export const aggregationMethodEnum = pgEnum('aggregation_method', ['best_result', 'sum', 'mean']);

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

// Disciplines table for Olympics module
export const disciplinesTable = pgTable('disciplines', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  result_type: resultTypeEnum('result_type').notNull(),
  aggregation_method: aggregationMethodEnum('aggregation_method').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Many-to-many relationship table for children and disciplines
export const childDisciplinesTable = pgTable('child_disciplines', {
  child_id: integer('child_id').notNull().references(() => childrenTable.id, { onDelete: 'cascade' }),
  discipline_id: integer('discipline_id').notNull().references(() => disciplinesTable.id, { onDelete: 'cascade' }),
  assigned_at: timestamp('assigned_at').defaultNow().notNull()
}, (table) => ({
  pk: primaryKey({ columns: [table.child_id, table.discipline_id] })
}));

// Results table for storing Olympic results
export const resultsTable = pgTable('results', {
  id: serial('id').primaryKey(),
  child_id: integer('child_id').notNull().references(() => childrenTable.id, { onDelete: 'cascade' }),
  discipline_id: integer('discipline_id').notNull().references(() => disciplinesTable.id, { onDelete: 'cascade' }),
  value: numeric('value').notNull(),
  attempt_number: integer('attempt_number').notNull().default(1),
  recorded_at: timestamp('recorded_at').defaultNow().notNull()
});

// Define relations
export const childrenRelations = relations(childrenTable, ({ many }) => ({
  childGroups: many(childGroupsTable),
  childDisciplines: many(childDisciplinesTable),
  results: many(resultsTable),
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

export const disciplinesRelations = relations(disciplinesTable, ({ many }) => ({
  childDisciplines: many(childDisciplinesTable),
  results: many(resultsTable),
}));

export const childDisciplinesRelations = relations(childDisciplinesTable, ({ one }) => ({
  child: one(childrenTable, {
    fields: [childDisciplinesTable.child_id],
    references: [childrenTable.id],
  }),
  discipline: one(disciplinesTable, {
    fields: [childDisciplinesTable.discipline_id],
    references: [disciplinesTable.id],
  }),
}));

export const resultsRelations = relations(resultsTable, ({ one }) => ({
  child: one(childrenTable, {
    fields: [resultsTable.child_id],
    references: [childrenTable.id],
  }),
  discipline: one(disciplinesTable, {
    fields: [resultsTable.discipline_id],
    references: [disciplinesTable.id],
  }),
}));

// TypeScript types for the table schemas
export type Child = typeof childrenTable.$inferSelect;
export type NewChild = typeof childrenTable.$inferInsert;
export type Group = typeof groupsTable.$inferSelect;
export type NewGroup = typeof groupsTable.$inferInsert;
export type ChildGroup = typeof childGroupsTable.$inferSelect;
export type NewChildGroup = typeof childGroupsTable.$inferInsert;
export type Discipline = typeof disciplinesTable.$inferSelect;
export type NewDiscipline = typeof disciplinesTable.$inferInsert;
export type ChildDiscipline = typeof childDisciplinesTable.$inferSelect;
export type NewChildDiscipline = typeof childDisciplinesTable.$inferInsert;
export type Result = typeof resultsTable.$inferSelect;
export type NewResult = typeof resultsTable.$inferInsert;

// Export all tables for proper query building
export const tables = {
  children: childrenTable,
  groups: groupsTable,
  childGroups: childGroupsTable,
  disciplines: disciplinesTable,
  childDisciplines: childDisciplinesTable,
  results: resultsTable
};