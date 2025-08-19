import { db } from '../db';
import { groupsTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import { type DeleteByIdInput } from '../schema';

export const deleteGroup = async (input: DeleteByIdInput): Promise<{ success: boolean }> => {
  try {
    // Delete the group - child-group relationships will be cascade deleted
    const result = await db.delete(groupsTable)
      .where(eq(groupsTable.id, input.id))
      .returning()
      .execute();

    // Return success status based on whether a record was actually deleted
    return { success: result.length > 0 };
  } catch (error) {
    console.error('Group deletion failed:', error);
    throw error;
  }
};