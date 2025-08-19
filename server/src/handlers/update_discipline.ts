import { db } from '../db';
import { disciplinesTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import { type UpdateDisciplineInput, type Discipline } from '../schema';

export const updateDiscipline = async (input: UpdateDisciplineInput): Promise<Discipline> => {
  try {
    const updateData: Partial<typeof disciplinesTable.$inferInsert> = {
      updated_at: new Date()
    };

    if (input.name !== undefined) {
      updateData.name = input.name;
    }
    if (input.result_type !== undefined) {
      updateData.result_type = input.result_type;
    }
    if (input.aggregation_method !== undefined) {
      updateData.aggregation_method = input.aggregation_method;
    }

    const result = await db.update(disciplinesTable)
      .set(updateData)
      .where(eq(disciplinesTable.id, input.id))
      .returning()
      .execute();

    if (result.length === 0) {
      throw new Error('Discipline not found');
    }

    return result[0];
  } catch (error) {
    console.error('Update discipline failed:', error);
    throw error;
  }
};