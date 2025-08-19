import { db } from '../db';
import { disciplinesTable } from '../db/schema';
import { type CreateDisciplineInput, type Discipline } from '../schema';

export const createDiscipline = async (input: CreateDisciplineInput): Promise<Discipline> => {
  try {
    const result = await db.insert(disciplinesTable)
      .values({
        name: input.name,
        result_type: input.result_type,
        aggregation_method: input.aggregation_method
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Discipline creation failed:', error);
    throw error;
  }
};