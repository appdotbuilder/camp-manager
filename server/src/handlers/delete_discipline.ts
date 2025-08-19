import { db } from '../db';
import { disciplinesTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import { type DeleteByIdInput, type Discipline } from '../schema';

export const deleteDiscipline = async (input: DeleteByIdInput): Promise<Discipline> => {
  try {
    const result = await db.delete(disciplinesTable)
      .where(eq(disciplinesTable.id, input.id))
      .returning()
      .execute();

    if (result.length === 0) {
      throw new Error('Discipline not found');
    }

    return result[0];
  } catch (error) {
    console.error('Delete discipline failed:', error);
    throw error;
  }
};