import { db } from '../db';
import { childrenTable, childDisciplinesTable, disciplinesTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import { type DeleteByIdInput, type ChildWithDisciplines } from '../schema';

export const getChildWithDisciplines = async (input: DeleteByIdInput): Promise<ChildWithDisciplines> => {
  try {
    // First, get the child
    const childResult = await db.select()
      .from(childrenTable)
      .where(eq(childrenTable.id, input.id))
      .execute();

    if (childResult.length === 0) {
      throw new Error('Child not found');
    }

    const child = childResult[0];

    // Get all disciplines assigned to this child
    const disciplinesResult = await db.select({
      discipline: disciplinesTable
    })
      .from(childDisciplinesTable)
      .innerJoin(disciplinesTable, eq(childDisciplinesTable.discipline_id, disciplinesTable.id))
      .where(eq(childDisciplinesTable.child_id, input.id))
      .execute();

    const disciplines = disciplinesResult.map(result => result.discipline);

    return {
      ...child,
      disciplines
    };
  } catch (error) {
    console.error('Get child with disciplines failed:', error);
    throw error;
  }
};