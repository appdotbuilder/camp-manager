import { db } from '../db';
import { childrenTable } from '../db/schema';
import { type Child, type DeleteByIdInput } from '../schema';
import { eq } from 'drizzle-orm';

export const getChildById = async (input: DeleteByIdInput): Promise<Child | null> => {
  try {
    // Query the child by ID
    const result = await db.select()
      .from(childrenTable)
      .where(eq(childrenTable.id, input.id))
      .execute();

    // Return the child if found, null otherwise
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error('Failed to fetch child by ID:', error);
    throw error;
  }
};