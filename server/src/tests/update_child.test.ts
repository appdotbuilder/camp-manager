import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { childrenTable } from '../db/schema';
import { type UpdateChildInput } from '../schema';
import { updateChild } from '../handlers/update_child';
import { eq } from 'drizzle-orm';

describe('updateChild', () => {
  let testChildId: number;

  beforeEach(async () => {
    await createDB();
    
    // Create a test child for updating
    const result = await db.insert(childrenTable)
      .values({
        name: 'Original Child',
        birth_date: new Date('2020-01-01'),
        gender: 'male'
      })
      .returning()
      .execute();
    
    testChildId = result[0].id;
  });

  afterEach(resetDB);

  it('should update only provided fields', async () => {
    const updateInput: UpdateChildInput = {
      id: testChildId,
      name: 'Updated Child Name'
    };

    const result = await updateChild(updateInput);

    expect(result.id).toEqual(testChildId);
    expect(result.name).toEqual('Updated Child Name');
    expect(result.birth_date).toEqual(new Date('2020-01-01')); // Should remain unchanged
    expect(result.gender).toEqual('male'); // Should remain unchanged
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should update multiple fields', async () => {
    const updateInput: UpdateChildInput = {
      id: testChildId,
      name: 'Multi Update Child',
      birth_date: new Date('2021-06-15'),
      gender: 'female'
    };

    const result = await updateChild(updateInput);

    expect(result.id).toEqual(testChildId);
    expect(result.name).toEqual('Multi Update Child');
    expect(result.birth_date).toEqual(new Date('2021-06-15'));
    expect(result.gender).toEqual('female');
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should update birth_date only', async () => {
    const updateInput: UpdateChildInput = {
      id: testChildId,
      birth_date: new Date('2019-12-25')
    };

    const result = await updateChild(updateInput);

    expect(result.id).toEqual(testChildId);
    expect(result.name).toEqual('Original Child'); // Should remain unchanged
    expect(result.birth_date).toEqual(new Date('2019-12-25'));
    expect(result.gender).toEqual('male'); // Should remain unchanged
  });

  it('should update gender only', async () => {
    const updateInput: UpdateChildInput = {
      id: testChildId,
      gender: 'other'
    };

    const result = await updateChild(updateInput);

    expect(result.id).toEqual(testChildId);
    expect(result.name).toEqual('Original Child'); // Should remain unchanged
    expect(result.birth_date).toEqual(new Date('2020-01-01')); // Should remain unchanged
    expect(result.gender).toEqual('other');
  });

  it('should update the database record', async () => {
    const updateInput: UpdateChildInput = {
      id: testChildId,
      name: 'Database Updated Child',
      gender: 'female'
    };

    await updateChild(updateInput);

    // Query the database directly to verify the update
    const dbRecord = await db.select()
      .from(childrenTable)
      .where(eq(childrenTable.id, testChildId))
      .execute();

    expect(dbRecord).toHaveLength(1);
    expect(dbRecord[0].name).toEqual('Database Updated Child');
    expect(dbRecord[0].gender).toEqual('female');
    expect(dbRecord[0].birth_date).toEqual(new Date('2020-01-01')); // Unchanged
  });

  it('should update the updated_at timestamp', async () => {
    // Get original timestamp
    const originalRecord = await db.select()
      .from(childrenTable)
      .where(eq(childrenTable.id, testChildId))
      .execute();
    
    const originalUpdatedAt = originalRecord[0].updated_at;

    // Wait a small amount to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 10));

    const updateInput: UpdateChildInput = {
      id: testChildId,
      name: 'Timestamp Test Child'
    };

    const result = await updateChild(updateInput);

    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
  });

  it('should throw error when child not found', async () => {
    const updateInput: UpdateChildInput = {
      id: 99999, // Non-existent ID
      name: 'Non-existent Child'
    };

    await expect(updateChild(updateInput)).rejects.toThrow(/Child with id 99999 not found/);
  });

  it('should handle empty update gracefully', async () => {
    const updateInput: UpdateChildInput = {
      id: testChildId
    };

    const result = await updateChild(updateInput);

    // Should still update the updated_at timestamp even with no field changes
    expect(result.id).toEqual(testChildId);
    expect(result.name).toEqual('Original Child'); // Unchanged
    expect(result.birth_date).toEqual(new Date('2020-01-01')); // Unchanged
    expect(result.gender).toEqual('male'); // Unchanged
    expect(result.updated_at).toBeInstanceOf(Date);
  });
});