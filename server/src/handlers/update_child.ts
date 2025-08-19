import { db } from '../db';
import { childrenTable } from '../db/schema';
import { type UpdateChildInput, type Child } from '../schema';
import { eq } from 'drizzle-orm';

export const updateChild = async (input: UpdateChildInput): Promise<Child> => {
  try {
    // Build update object with only provided fields
    const updateData: any = {
      updated_at: new Date()
    };

    if (input.name !== undefined) {
      updateData.name = input.name;
    }

    if (input.birth_date !== undefined) {
      updateData.birth_date = input.birth_date;
    }

    if (input.gender !== undefined) {
      updateData.gender = input.gender;
    }

    // Update the child record
    const result = await db.update(childrenTable)
      .set(updateData)
      .where(eq(childrenTable.id, input.id))
      .returning()
      .execute();

    // Check if child was found and updated
    if (result.length === 0) {
      throw new Error(`Child with id ${input.id} not found`);
    }

    return result[0];
  } catch (error) {
    console.error('Child update failed:', error);
    throw error;
  }
};