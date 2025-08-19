import { db } from '../db';
import { disciplinesTable, resultsTable, childrenTable } from '../db/schema';
import { eq, sql } from 'drizzle-orm';
import { type GetDisciplineResultsInput, type DisciplineResults } from '../schema';

export const getDisciplineResults = async (input: GetDisciplineResultsInput): Promise<DisciplineResults> => {
  try {
    // First, get the discipline details
    const disciplineResult = await db.select()
      .from(disciplinesTable)
      .where(eq(disciplinesTable.id, input.discipline_id))
      .execute();

    if (disciplineResult.length === 0) {
      throw new Error('Discipline not found');
    }

    const discipline = disciplineResult[0];

    // Get all results for this discipline with child information
    const resultsQuery = await db.select({
      child_id: resultsTable.child_id,
      child_name: childrenTable.name,
      value: resultsTable.value,
      attempt_number: resultsTable.attempt_number
    })
      .from(resultsTable)
      .innerJoin(childrenTable, eq(resultsTable.child_id, childrenTable.id))
      .where(eq(resultsTable.discipline_id, input.discipline_id))
      .execute();

    // Aggregate results by child
    const childResultsMap = new Map<number, { child_name: string; values: number[]; attempts: number }>();

    resultsQuery.forEach(result => {
      const value = parseFloat(result.value);
      if (!childResultsMap.has(result.child_id)) {
        childResultsMap.set(result.child_id, {
          child_name: result.child_name,
          values: [],
          attempts: 0
        });
      }
      const childData = childResultsMap.get(result.child_id)!;
      childData.values.push(value);
      childData.attempts++;
    });

    // Calculate aggregated values based on aggregation method
    const aggregatedResults = Array.from(childResultsMap.entries()).map(([childId, data]) => {
      let aggregatedValue: number;

      switch (discipline.aggregation_method) {
        case 'best_result':
          // For sprint/time-based disciplines, lower is better. For others, higher is better.
          // We'll assume higher is better by default (user can interpret based on discipline type)
          aggregatedValue = Math.max(...data.values);
          break;
        case 'sum':
          aggregatedValue = data.values.reduce((sum, val) => sum + val, 0);
          break;
        case 'mean':
          aggregatedValue = data.values.reduce((sum, val) => sum + val, 0) / data.values.length;
          break;
        default:
          aggregatedValue = data.values[0] || 0;
      }

      return {
        child_id: childId,
        child_name: data.child_name,
        aggregated_value: aggregatedValue,
        total_attempts: data.attempts
      };
    });

    // Sort results by aggregated value (descending by default - higher is better)
    aggregatedResults.sort((a, b) => b.aggregated_value - a.aggregated_value);

    return {
      id: discipline.id,
      name: discipline.name,
      result_type: discipline.result_type,
      aggregation_method: discipline.aggregation_method,
      results: aggregatedResults
    };
  } catch (error) {
    console.error('Get discipline results failed:', error);
    throw error;
  }
};