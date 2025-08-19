import { db } from '../db';
import { resultsTable } from '../db/schema';
import { type RecordResultInput, type OlympicResult } from '../schema';

export const recordResult = async (input: RecordResultInput): Promise<OlympicResult> => {
  try {
    const result = await db.insert(resultsTable)
      .values({
        child_id: input.child_id,
        discipline_id: input.discipline_id,
        value: input.value.toString(), // Convert number to string for numeric column
        attempt_number: input.attempt_number
      })
      .returning()
      .execute();

    const recordedResult = result[0];
    return {
      ...recordedResult,
      value: parseFloat(recordedResult.value) // Convert string back to number
    };
  } catch (error) {
    console.error('Record result failed:', error);
    throw error;
  }
};