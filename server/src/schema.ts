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