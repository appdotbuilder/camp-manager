import { db } from '../db';
import { groupsTable } from '../db/schema';
import { type Group } from '../schema';

export const getGroups = async (): Promise<Group[]> => {
  try {
    // Fetch all groups from the database
    const result = await db.select()
      .from(groupsTable)
      .execute();

    return result;
  } catch (error) {
    console.error('Failed to fetch groups:', error);
    throw error;
  }
};