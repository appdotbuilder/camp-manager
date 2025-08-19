import { db } from '../db';
import { childrenTable, groupsTable, childGroupsTable } from '../db/schema';
import { type AssignChildToGroupInput, type ChildGroup } from '../schema';
import { eq, and } from 'drizzle-orm';

export const assignChildToGroup = async (input: AssignChildToGroupInput): Promise<ChildGroup> => {
  try {
    // Check if child exists
    const childExists = await db.select()
      .from(childrenTable)
      .where(eq(childrenTable.id, input.child_id))
      .execute();

    if (childExists.length === 0) {
      throw new Error(`Child with id ${input.child_id} not found`);
    }

    // Check if group exists
    const groupExists = await db.select()
      .from(groupsTable)
      .where(eq(groupsTable.id, input.group_id))
      .execute();

    if (groupExists.length === 0) {
      throw new Error(`Group with id ${input.group_id} not found`);
    }

    // Check if association already exists
    const existingAssociation = await db.select()
      .from(childGroupsTable)
      .where(
        and(
          eq(childGroupsTable.child_id, input.child_id),
          eq(childGroupsTable.group_id, input.group_id)
        )
      )
      .execute();

    if (existingAssociation.length > 0) {
      throw new Error(`Child ${input.child_id} is already assigned to group ${input.group_id}`);
    }

    // Create the association
    const result = await db.insert(childGroupsTable)
      .values({
        child_id: input.child_id,
        group_id: input.group_id
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Child-group assignment failed:', error);
    throw error;
  }
};