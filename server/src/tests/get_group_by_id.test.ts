import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { groupsTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import { type DeleteByIdInput } from '../schema';
import { getGroupById } from '../handlers/get_group_by_id';

describe('getGroupById', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return group when it exists', async () => {
    // Create a test group directly in database
    const insertResult = await db.insert(groupsTable)
      .values({
        name: 'Test Group'
      })
      .returning()
      .execute();

    const createdGroup = insertResult[0];
    
    const input: DeleteByIdInput = {
      id: createdGroup.id
    };

    const result = await getGroupById(input);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(createdGroup.id);
    expect(result!.name).toEqual('Test Group');
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should return null when group does not exist', async () => {
    const input: DeleteByIdInput = {
      id: 999 // Non-existent ID
    };

    const result = await getGroupById(input);

    expect(result).toBeNull();
  });

  it('should return the correct group when multiple groups exist', async () => {
    // Create multiple test groups directly in database
    const insertResults = await db.insert(groupsTable)
      .values([
        { name: 'First Group' },
        { name: 'Second Group' },
        { name: 'Third Group' }
      ])
      .returning()
      .execute();

    const group2 = insertResults[1]; // Second group

    const input: DeleteByIdInput = {
      id: group2.id
    };

    const result = await getGroupById(input);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(group2.id);
    expect(result!.name).toEqual('Second Group');
    expect(result!.id).not.toEqual(insertResults[0].id);
    expect(result!.id).not.toEqual(insertResults[2].id);
  });

  it('should verify group exists in database after creation', async () => {
    // Create a group directly in database
    const insertResult = await db.insert(groupsTable)
      .values({
        name: 'Database Test Group'
      })
      .returning()
      .execute();

    const createdGroup = insertResult[0];

    // Verify in database directly
    const dbGroups = await db.select()
      .from(groupsTable)
      .where(eq(groupsTable.id, createdGroup.id))
      .execute();

    expect(dbGroups).toHaveLength(1);
    expect(dbGroups[0].name).toEqual('Database Test Group');

    // Verify via handler
    const handlerResult = await getGroupById({ id: createdGroup.id });
    expect(handlerResult).not.toBeNull();
    expect(handlerResult!.name).toEqual(dbGroups[0].name);
    expect(handlerResult!.id).toEqual(dbGroups[0].id);
    expect(handlerResult!.created_at).toEqual(dbGroups[0].created_at);
    expect(handlerResult!.updated_at).toEqual(dbGroups[0].updated_at);
  });

  it('should handle edge case with ID 0', async () => {
    const input: DeleteByIdInput = {
      id: 0
    };

    const result = await getGroupById(input);

    expect(result).toBeNull();
  });

  it('should handle negative ID values', async () => {
    const input: DeleteByIdInput = {
      id: -1
    };

    const result = await getGroupById(input);

    expect(result).toBeNull();
  });
});