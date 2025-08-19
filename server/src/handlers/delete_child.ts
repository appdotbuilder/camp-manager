import { db } from '../db';
import { childrenTable } from '../db/schema';
import { type DeleteByIdInput } from '../schema';
import { eq } from 'drizzle-orm';

export const deleteChild = async (input: DeleteByIdInput): Promise<{ success: boolean }> => {
  try {
    // Delete the child record by ID
    // This will automatically cascade delete all child-group relationships
    // due to the onDelete: 'cascade' constraint in the schema
    const result = await db.delete(childrenTable)
      .where(eq(childrenTable.id, input.id))
      .execute();

    // Check if any rows were affected (i.e., child was found and deleted)
    const success = result.rowCount !== null && result.rowCount !== undefined && result.rowCount > 0;

    return { success };
  } catch (error) {
    console.error('Child deletion failed:', error);
    throw error;
  }
};