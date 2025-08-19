import { db } from '../db';
import { childrenTable } from '../db/schema';
import { type CreateChildInput, type Child } from '../schema';

export const createChild = async (input: CreateChildInput): Promise<Child> => {
  try {
    // Insert child record
    const result = await db.insert(childrenTable)
      .values({
        name: input.name,
        birth_date: input.birth_date,
        gender: input.gender
      })
      .returning()
      .execute();

    // Return the created child
    const child = result[0];
    return child;
  } catch (error) {
    console.error('Child creation failed:', error);
    throw error;
  }
};