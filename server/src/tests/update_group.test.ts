import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { groupsTable } from '../db/schema';
import { type UpdateGroupInput } from '../schema';
import { updateGroup } from '../handlers/update_group';
import { eq } from 'drizzle-orm';

describe('updateGroup', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update a group successfully', async () => {
    // Create a test group first
    const createResult = await db.insert(groupsTable)
      .values({
        name: 'Original Group Name'
      })
      .returning()
      .execute();

    const groupId = createResult[0].id;
    const originalCreatedAt = createResult[0].created_at;

    const updateInput: UpdateGroupInput = {
      id: groupId,
      name: 'Updated Group Name'
    };

    // Update the group
    const result = await updateGroup(updateInput);

    // Verify the returned data
    expect(result.id).toBe(groupId);
    expect(result.name).toBe('Updated Group Name');
    expect(result.created_at).toEqual(originalCreatedAt);
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at.getTime()).toBeGreaterThan(originalCreatedAt.getTime());
  });

  it('should save updated group to database', async () => {
    // Create a test group first
    const createResult = await db.insert(groupsTable)
      .values({
        name: 'Test Group'
      })
      .returning()
      .execute();

    const groupId = createResult[0].id;

    const updateInput: UpdateGroupInput = {
      id: groupId,
      name: 'Modified Group Name'
    };

    // Update the group
    await updateGroup(updateInput);

    // Verify the group was updated in the database
    const groups = await db.select()
      .from(groupsTable)
      .where(eq(groupsTable.id, groupId))
      .execute();

    expect(groups).toHaveLength(1);
    expect(groups[0].name).toBe('Modified Group Name');
    expect(groups[0].updated_at).toBeInstanceOf(Date);
  });

  it('should throw error when group does not exist', async () => {
    const updateInput: UpdateGroupInput = {
      id: 999, // Non-existent ID
      name: 'New Name'
    };

    await expect(updateGroup(updateInput)).rejects.toThrow(/Group with id 999 not found/i);
  });

  it('should handle duplicate group name constraint', async () => {
    // Create two test groups
    const group1 = await db.insert(groupsTable)
      .values({ name: 'Existing Group' })
      .returning()
      .execute();

    const group2 = await db.insert(groupsTable)
      .values({ name: 'Another Group' })
      .returning()
      .execute();

    const updateInput: UpdateGroupInput = {
      id: group2[0].id,
      name: 'Existing Group' // Try to use the same name as group1
    };

    // Should throw error due to unique constraint
    await expect(updateGroup(updateInput)).rejects.toThrow();
  });

  it('should update only the specified group', async () => {
    // Create multiple test groups
    const group1 = await db.insert(groupsTable)
      .values({ name: 'Group 1' })
      .returning()
      .execute();

    const group2 = await db.insert(groupsTable)
      .values({ name: 'Group 2' })
      .returning()
      .execute();

    const updateInput: UpdateGroupInput = {
      id: group1[0].id,
      name: 'Updated Group 1'
    };

    // Update only group1
    await updateGroup(updateInput);

    // Verify group1 was updated
    const updatedGroup1 = await db.select()
      .from(groupsTable)
      .where(eq(groupsTable.id, group1[0].id))
      .execute();

    expect(updatedGroup1[0].name).toBe('Updated Group 1');

    // Verify group2 was not affected
    const unchangedGroup2 = await db.select()
      .from(groupsTable)
      .where(eq(groupsTable.id, group2[0].id))
      .execute();

    expect(unchangedGroup2[0].name).toBe('Group 2');
  });
});