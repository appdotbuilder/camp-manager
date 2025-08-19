import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { childrenTable } from '../db/schema';
import { type DeleteByIdInput, type CreateChildInput } from '../schema';
import { getChildById } from '../handlers/get_child_by_id';

// Test data for creating children
const testChild: CreateChildInput = {
  name: 'John Doe',
  birth_date: new Date('2015-06-15'),
  gender: 'male'
};

const anotherTestChild: CreateChildInput = {
  name: 'Jane Smith',
  birth_date: new Date('2016-08-20'),
  gender: 'female'
};

describe('getChildById', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return a child when found by ID', async () => {
    // Create a test child
    const insertResult = await db.insert(childrenTable)
      .values({
        name: testChild.name,
        birth_date: testChild.birth_date,
        gender: testChild.gender
      })
      .returning()
      .execute();

    const createdChild = insertResult[0];

    // Test the handler
    const input: DeleteByIdInput = { id: createdChild.id };
    const result = await getChildById(input);

    // Verify the result
    expect(result).not.toBeNull();
    expect(result!.id).toEqual(createdChild.id);
    expect(result!.name).toEqual('John Doe');
    expect(result!.birth_date).toEqual(new Date('2015-06-15'));
    expect(result!.gender).toEqual('male');
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should return null when child is not found', async () => {
    // Test with non-existent ID
    const input: DeleteByIdInput = { id: 99999 };
    const result = await getChildById(input);

    expect(result).toBeNull();
  });

  it('should return correct child when multiple children exist', async () => {
    // Create multiple test children
    const firstChild = await db.insert(childrenTable)
      .values({
        name: testChild.name,
        birth_date: testChild.birth_date,
        gender: testChild.gender
      })
      .returning()
      .execute();

    const secondChild = await db.insert(childrenTable)
      .values({
        name: anotherTestChild.name,
        birth_date: anotherTestChild.birth_date,
        gender: anotherTestChild.gender
      })
      .returning()
      .execute();

    // Test fetching the second child
    const input: DeleteByIdInput = { id: secondChild[0].id };
    const result = await getChildById(input);

    // Verify we get the correct child
    expect(result).not.toBeNull();
    expect(result!.id).toEqual(secondChild[0].id);
    expect(result!.name).toEqual('Jane Smith');
    expect(result!.gender).toEqual('female');
    expect(result!.birth_date).toEqual(new Date('2016-08-20'));

    // Verify it's not the first child
    expect(result!.id).not.toEqual(firstChild[0].id);
    expect(result!.name).not.toEqual('John Doe');
  });

  it('should handle edge case with ID 0', async () => {
    // Test with ID 0 (which should not exist due to serial primary key)
    const input: DeleteByIdInput = { id: 0 };
    const result = await getChildById(input);

    expect(result).toBeNull();
  });

  it('should return child with correct date types', async () => {
    // Create a test child with specific dates
    const specificBirthDate = new Date('2018-12-25');
    const insertResult = await db.insert(childrenTable)
      .values({
        name: 'Christmas Child',
        birth_date: specificBirthDate,
        gender: 'other'
      })
      .returning()
      .execute();

    const createdChild = insertResult[0];

    // Fetch the child
    const input: DeleteByIdInput = { id: createdChild.id };
    const result = await getChildById(input);

    // Verify date fields are proper Date instances
    expect(result).not.toBeNull();
    expect(result!.birth_date).toBeInstanceOf(Date);
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);

    // Verify birth date matches
    expect(result!.birth_date).toEqual(specificBirthDate);
  });
});