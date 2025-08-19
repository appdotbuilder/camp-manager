import { db } from '../db';
import { childDisciplinesTable } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { type RemoveChildFromDisciplineInput, type ChildDiscipline } from '../schema';

export const removeChildFromDiscipline = async (input: RemoveChildFromDisciplineInput): Promise<ChildDiscipline> => {
  try {
    const result = await db.delete(childDisciplinesTable)
      .where(and(
        eq(childDisciplinesTable.child_id, input.child_id),
        eq(childDisciplinesTable.discipline_id, input.discipline_id)
      ))
      .returning()
      .execute();

    if (result.length === 0) {
      throw new Error('Child-discipline assignment not found');
    }

    return result[0];
  } catch (error) {
    console.error('Remove child from discipline failed:', error);
    throw error;
  }
};