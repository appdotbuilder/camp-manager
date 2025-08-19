import { db } from '../db';
import { childDisciplinesTable } from '../db/schema';
import { type AssignChildToDisciplineInput, type ChildDiscipline } from '../schema';

export const assignChildToDiscipline = async (input: AssignChildToDisciplineInput): Promise<ChildDiscipline> => {
  try {
    const result = await db.insert(childDisciplinesTable)
      .values({
        child_id: input.child_id,
        discipline_id: input.discipline_id
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Assign child to discipline failed:', error);
    throw error;
  }
};