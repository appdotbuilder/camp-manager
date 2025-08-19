import { db } from '../db';
import { disciplinesTable } from '../db/schema';
import { type Discipline } from '../schema';

export const getDisciplines = async (): Promise<Discipline[]> => {
  try {
    const result = await db.select()
      .from(disciplinesTable)
      .orderBy(disciplinesTable.created_at)
      .execute();

    return result;
  } catch (error) {
    console.error('Get disciplines failed:', error);
    throw error;
  }
};