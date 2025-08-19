import { db } from '../db';
import { childrenTable, groupsTable, childGroupsTable } from '../db/schema';
import { type ChildWithGroups, type DeleteByIdInput } from '../schema';
import { eq } from 'drizzle-orm';

export const getChildWithGroups = async (input: DeleteByIdInput): Promise<ChildWithGroups | null> => {
  try {
    // First, get the child by ID
    const childResults = await db.select()
      .from(childrenTable)
      .where(eq(childrenTable.id, input.id))
      .execute();

    if (childResults.length === 0) {
      return null;
    }

    const child = childResults[0];

    // Then get all groups associated with this child
    const groupResults = await db.select({
      id: groupsTable.id,
      name: groupsTable.name,
      created_at: groupsTable.created_at,
      updated_at: groupsTable.updated_at
    })
      .from(groupsTable)
      .innerJoin(childGroupsTable, eq(groupsTable.id, childGroupsTable.group_id))
      .where(eq(childGroupsTable.child_id, input.id))
      .execute();

    // Construct the result with child data and associated groups
    return {
      id: child.id,
      name: child.name,
      birth_date: child.birth_date,
      gender: child.gender,
      created_at: child.created_at,
      updated_at: child.updated_at,
      groups: groupResults
    };
  } catch (error) {
    console.error('Get child with groups failed:', error);
    throw error;
  }
};