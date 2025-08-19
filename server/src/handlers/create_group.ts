import { db } from '../db';
import { groupsTable } from '../db/schema';
import { type CreateGroupInput, type Group } from '../schema';

export const createGroup = async (input: CreateGroupInput): Promise<Group> => {
  try {
    // Insert group record
    const result = await db.insert(groupsTable)
      .values({
        name: input.name
      })
      .returning()
      .execute();

    // Return the created group
    return result[0];
  } catch (error) {
    console.error('Group creation failed:', error);
    throw error;
  }
};