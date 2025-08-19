import { z } from 'zod';

// Child schema
export const childSchema = z.object({
  id: z.number(),
  name: z.string(),
  birth_date: z.coerce.date(),
  gender: z.enum(['male', 'female', 'other']),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Child = z.infer<typeof childSchema>;

// Input schema for creating children
export const createChildInputSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  birth_date: z.coerce.date(),
  gender: z.enum(['male', 'female', 'other'])
});

export type CreateChildInput = z.infer<typeof createChildInputSchema>;

// Input schema for updating children
export const updateChildInputSchema = z.object({
  id: z.number(),
  name: z.string().min(1, 'Name is required').optional(),
  birth_date: z.coerce.date().optional(),
  gender: z.enum(['male', 'female', 'other']).optional()
});

export type UpdateChildInput = z.infer<typeof updateChildInputSchema>;

// Schema for filtering children
export const filterChildrenInputSchema = z.object({
  name: z.string().optional(),
  birth_date: z.coerce.date().optional(),
  gender: z.enum(['male', 'female', 'other']).optional()
});

export type FilterChildrenInput = z.infer<typeof filterChildrenInputSchema>;

// Group schema
export const groupSchema = z.object({
  id: z.number(),
  name: z.string(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Group = z.infer<typeof groupSchema>;

// Input schema for creating groups
export const createGroupInputSchema = z.object({
  name: z.string().min(1, 'Group name is required')
});

export type CreateGroupInput = z.infer<typeof createGroupInputSchema>;

// Input schema for updating groups
export const updateGroupInputSchema = z.object({
  id: z.number(),
  name: z.string().min(1, 'Group name is required')
});

export type UpdateGroupInput = z.infer<typeof updateGroupInputSchema>;

// Child-Group association schema
export const childGroupSchema = z.object({
  child_id: z.number(),
  group_id: z.number(),
  assigned_at: z.coerce.date()
});

export type ChildGroup = z.infer<typeof childGroupSchema>;

// Input schema for assigning child to group
export const assignChildToGroupInputSchema = z.object({
  child_id: z.number(),
  group_id: z.number()
});

export type AssignChildToGroupInput = z.infer<typeof assignChildToGroupInputSchema>;

// Input schema for removing child from group
export const removeChildFromGroupInputSchema = z.object({
  child_id: z.number(),
  group_id: z.number()
});

export type RemoveChildFromGroupInput = z.infer<typeof removeChildFromGroupInputSchema>;

// Child with groups schema (for detailed views)
export const childWithGroupsSchema = z.object({
  id: z.number(),
  name: z.string(),
  birth_date: z.coerce.date(),
  gender: z.enum(['male', 'female', 'other']),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
  groups: z.array(groupSchema)
});

export type ChildWithGroups = z.infer<typeof childWithGroupsSchema>;

// Group with children schema (for detailed views)
export const groupWithChildrenSchema = z.object({
  id: z.number(),
  name: z.string(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
  children: z.array(childSchema)
});

export type GroupWithChildren = z.infer<typeof groupWithChildrenSchema>;

// Input schema for deleting records
export const deleteByIdInputSchema = z.object({
  id: z.number()
});

export type DeleteByIdInput = z.infer<typeof deleteByIdInputSchema>;

// Olympics Module Schemas

// Discipline schema
export const disciplineSchema = z.object({
  id: z.number(),
  name: z.string(),
  result_type: z.enum(['one_time', 'multiple_times', 'number', 'multiple_numbers']),
  aggregation_method: z.enum(['best_result', 'sum', 'mean']),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Discipline = z.infer<typeof disciplineSchema>;

// Input schema for creating disciplines
export const createDisciplineInputSchema = z.object({
  name: z.string().min(1, 'Discipline name is required'),
  result_type: z.enum(['one_time', 'multiple_times', 'number', 'multiple_numbers']),
  aggregation_method: z.enum(['best_result', 'sum', 'mean'])
});

export type CreateDisciplineInput = z.infer<typeof createDisciplineInputSchema>;

// Input schema for updating disciplines
export const updateDisciplineInputSchema = z.object({
  id: z.number(),
  name: z.string().min(1, 'Discipline name is required').optional(),
  result_type: z.enum(['one_time', 'multiple_times', 'number', 'multiple_numbers']).optional(),
  aggregation_method: z.enum(['best_result', 'sum', 'mean']).optional()
});

export type UpdateDisciplineInput = z.infer<typeof updateDisciplineInputSchema>;

// Child-Discipline association schema
export const childDisciplineSchema = z.object({
  child_id: z.number(),
  discipline_id: z.number(),
  assigned_at: z.coerce.date()
});

export type ChildDiscipline = z.infer<typeof childDisciplineSchema>;

// Input schema for assigning child to discipline
export const assignChildToDisciplineInputSchema = z.object({
  child_id: z.number(),
  discipline_id: z.number()
});

export type AssignChildToDisciplineInput = z.infer<typeof assignChildToDisciplineInputSchema>;

// Input schema for removing child from discipline
export const removeChildFromDisciplineInputSchema = z.object({
  child_id: z.number(),
  discipline_id: z.number()
});

export type RemoveChildFromDisciplineInput = z.infer<typeof removeChildFromDisciplineInputSchema>;

// Result schema
export const resultSchema = z.object({
  id: z.number(),
  child_id: z.number(),
  discipline_id: z.number(),
  value: z.number(),
  attempt_number: z.number(),
  recorded_at: z.coerce.date()
});

export type OlympicResult = z.infer<typeof resultSchema>;

// Input schema for recording results
export const recordResultInputSchema = z.object({
  child_id: z.number(),
  discipline_id: z.number(),
  value: z.number(),
  attempt_number: z.number().default(1)
});

export type RecordResultInput = z.infer<typeof recordResultInputSchema>;

// Input schema for getting results by discipline
export const getDisciplineResultsInputSchema = z.object({
  discipline_id: z.number()
});

export type GetDisciplineResultsInput = z.infer<typeof getDisciplineResultsInputSchema>;

// Child with disciplines schema
export const childWithDisciplinesSchema = z.object({
  id: z.number(),
  name: z.string(),
  birth_date: z.coerce.date(),
  gender: z.enum(['male', 'female', 'other']),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
  disciplines: z.array(disciplineSchema)
});

export type ChildWithDisciplines = z.infer<typeof childWithDisciplinesSchema>;

// Discipline with children schema
export const disciplineWithChildrenSchema = z.object({
  id: z.number(),
  name: z.string(),
  result_type: z.enum(['one_time', 'multiple_times', 'number', 'multiple_numbers']),
  aggregation_method: z.enum(['best_result', 'sum', 'mean']),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
  children: z.array(childSchema)
});

export type DisciplineWithChildren = z.infer<typeof disciplineWithChildrenSchema>;

// Aggregated result schema for rankings
export const aggregatedResultSchema = z.object({
  child_id: z.number(),
  child_name: z.string(),
  aggregated_value: z.number(),
  total_attempts: z.number()
});

export type AggregatedResult = z.infer<typeof aggregatedResultSchema>;

// Discipline results schema (discipline with aggregated results)
export const disciplineResultsSchema = z.object({
  id: z.number(),
  name: z.string(),
  result_type: z.enum(['one_time', 'multiple_times', 'number', 'multiple_numbers']),
  aggregation_method: z.enum(['best_result', 'sum', 'mean']),
  results: z.array(aggregatedResultSchema)
});

export type DisciplineResults = z.infer<typeof disciplineResultsSchema>;