import { db } from '../db';
import { groupsTable } from '../db/schema';
import { type UpdateGroupInput, type Group } from '../schema';
import { eq } from 'drizzle-orm';

export const updateGroup = async (input: UpdateGroupInput): Promise<Group> => {
  try {
    // Update group record and return updated data
    const result = await db.update(groupsTable)
      .set({
        name: input.name,
        updated_at: new Date()
      })
      .where(eq(groupsTable.id, input.id))
      .returning()
      .execute();

    if (result.length === 0) {
      throw new Error(`Group with id ${input.id} not found`);
    }

    return result[0];
  } catch (error) {
    console.error('Group update failed:', error);
    throw error;
  }
};