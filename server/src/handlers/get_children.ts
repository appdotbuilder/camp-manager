import { db } from '../db';
import { childrenTable } from '../db/schema';
import { type Child, type FilterChildrenInput } from '../schema';
import { eq, ilike, and, type SQL } from 'drizzle-orm';

export const getChildren = async (filter?: FilterChildrenInput): Promise<Child[]> => {
  try {
    // Build conditions array if filters are provided
    const conditions: SQL<unknown>[] = [];

    if (filter) {
      if (filter.name) {
        // Case-insensitive partial match for name using ilike
        conditions.push(ilike(childrenTable.name, `%${filter.name}%`));
      }

      if (filter.birth_date) {
        // Exact date match for birth_date
        conditions.push(eq(childrenTable.birth_date, filter.birth_date));
      }

      if (filter.gender) {
        // Exact match for gender
        conditions.push(eq(childrenTable.gender, filter.gender));
      }
    }

    // Build query with or without conditions
    const query = conditions.length > 0
      ? db.select().from(childrenTable).where(conditions.length === 1 ? conditions[0] : and(...conditions))
      : db.select().from(childrenTable);

    // Execute query and return results
    const results = await query.execute();
    return results;
  } catch (error) {
    console.error('Failed to fetch children:', error);
    throw error;
  }
};