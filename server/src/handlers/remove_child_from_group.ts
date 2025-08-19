import { db } from '../db';
import { childGroupsTable } from '../db/schema';
import { type RemoveChildFromGroupInput } from '../schema';
import { eq, and } from 'drizzle-orm';

export const removeChildFromGroup = async (input: RemoveChildFromGroupInput): Promise<{ success: boolean }> => {
  try {
    // Remove the child-group association
    const result = await db.delete(childGroupsTable)
      .where(
        and(
          eq(childGroupsTable.child_id, input.child_id),
          eq(childGroupsTable.group_id, input.group_id)
        )
      )
      .execute();

    // Return success status based on whether any rows were affected
    return { success: (result.rowCount ?? 0) > 0 };
  } catch (error) {
    console.error('Failed to remove child from group:', error);
    throw error;
  }
};