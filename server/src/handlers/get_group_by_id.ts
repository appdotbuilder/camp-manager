import { db } from '../db';
import { groupsTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import { type Group, type DeleteByIdInput } from '../schema';

export const getGroupById = async (input: DeleteByIdInput): Promise<Group | null> => {
  try {
    const result = await db.select()
      .from(groupsTable)
      .where(eq(groupsTable.id, input.id))
      .limit(1)
      .execute();

    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error('Failed to get group by ID:', error);
    throw error;
  }
};