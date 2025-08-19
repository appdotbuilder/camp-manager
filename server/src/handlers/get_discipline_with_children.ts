import { db } from '../db';
import { disciplinesTable, childDisciplinesTable, childrenTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import { type DeleteByIdInput, type DisciplineWithChildren } from '../schema';

export const getDisciplineWithChildren = async (input: DeleteByIdInput): Promise<DisciplineWithChildren> => {
  try {
    // First, get the discipline
    const disciplineResult = await db.select()
      .from(disciplinesTable)
      .where(eq(disciplinesTable.id, input.id))
      .execute();

    if (disciplineResult.length === 0) {
      throw new Error('Discipline not found');
    }

    const discipline = disciplineResult[0];

    // Get all children assigned to this discipline
    const childrenResult = await db.select({
      child: childrenTable
    })
      .from(childDisciplinesTable)
      .innerJoin(childrenTable, eq(childDisciplinesTable.child_id, childrenTable.id))
      .where(eq(childDisciplinesTable.discipline_id, input.id))
      .execute();

    const children = childrenResult.map(result => result.child);

    return {
      ...discipline,
      children
    };
  } catch (error) {
    console.error('Get discipline with children failed:', error);
    throw error;
  }
};