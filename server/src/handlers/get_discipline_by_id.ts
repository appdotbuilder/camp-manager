import { db } from '../db';
import { disciplinesTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import { type DeleteByIdInput, type Discipline } from '../schema';

export const getDisciplineById = async (input: DeleteByIdInput): Promise<Discipline> => {
  try {
    const result = await db.select()
      .from(disciplinesTable)
      .where(eq(disciplinesTable.id, input.id))
      .execute();

    if (result.length === 0) {
      throw new Error('Discipline not found');
    }

    return result[0];
  } catch (error) {
    console.error('Get discipline by ID failed:', error);
    throw error;
  }
};