import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { groupsTable, childrenTable, childGroupsTable } from '../db/schema';
import { type DeleteByIdInput } from '../schema';
import { deleteGroup } from '../handlers/delete_group';
import { eq } from 'drizzle-orm';

// Test input for deleting a group
const testInput: DeleteByIdInput = {
  id: 1
};

describe('deleteGroup', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete an existing group successfully', async () => {
    // Create a test group first
    const [createdGroup] = await db.insert(groupsTable)
      .values({
        name: 'Test Group'
      })
      .returning()
      .execute();

    // Delete the group
    const result = await deleteGroup({ id: createdGroup.id });

    // Verify deletion was successful
    expect(result.success).toBe(true);

    // Verify group no longer exists in database
    const groups = await db.select()
      .from(groupsTable)
      .where(eq(groupsTable.id, createdGroup.id))
      .execute();

    expect(groups).toHaveLength(0);
  });

  it('should return false when trying to delete non-existent group', async () => {
    // Try to delete a group that doesn't exist
    const result = await deleteGroup({ id: 999 });

    // Should return success: false
    expect(result.success).toBe(false);
  });

  it('should cascade delete associated child-group relationships', async () => {
    // Create test group
    const [createdGroup] = await db.insert(groupsTable)
      .values({
        name: 'Test Group'
      })
      .returning()
      .execute();

    // Create test child
    const [createdChild] = await db.insert(childrenTable)
      .values({
        name: 'Test Child',
        birth_date: new Date('2020-01-01'),
        gender: 'male'
      })
      .returning()
      .execute();

    // Create child-group association
    await db.insert(childGroupsTable)
      .values({
        child_id: createdChild.id,
        group_id: createdGroup.id
      })
      .execute();

    // Verify association exists
    const associations = await db.select()
      .from(childGroupsTable)
      .where(eq(childGroupsTable.group_id, createdGroup.id))
      .execute();
    
    expect(associations).toHaveLength(1);

    // Delete the group
    const result = await deleteGroup({ id: createdGroup.id });

    // Verify deletion was successful
    expect(result.success).toBe(true);

    // Verify group no longer exists
    const groups = await db.select()
      .from(groupsTable)
      .where(eq(groupsTable.id, createdGroup.id))
      .execute();

    expect(groups).toHaveLength(0);

    // Verify associated child-group relationship was cascade deleted
    const remainingAssociations = await db.select()
      .from(childGroupsTable)
      .where(eq(childGroupsTable.group_id, createdGroup.id))
      .execute();

    expect(remainingAssociations).toHaveLength(0);

    // Verify child still exists (only relationship was deleted)
    const children = await db.select()
      .from(childrenTable)
      .where(eq(childrenTable.id, createdChild.id))
      .execute();

    expect(children).toHaveLength(1);
  });

  it('should handle deletion of group with multiple child associations', async () => {
    // Create test group
    const [createdGroup] = await db.insert(groupsTable)
      .values({
        name: 'Multi-Child Group'
      })
      .returning()
      .execute();

    // Create multiple test children
    const [child1] = await db.insert(childrenTable)
      .values({
        name: 'Child 1',
        birth_date: new Date('2020-01-01'),
        gender: 'male'
      })
      .returning()
      .execute();

    const [child2] = await db.insert(childrenTable)
      .values({
        name: 'Child 2',
        birth_date: new Date('2021-01-01'),
        gender: 'female'
      })
      .returning()
      .execute();

    // Create multiple child-group associations
    await db.insert(childGroupsTable)
      .values([
        { child_id: child1.id, group_id: createdGroup.id },
        { child_id: child2.id, group_id: createdGroup.id }
      ])
      .execute();

    // Verify associations exist
    const associations = await db.select()
      .from(childGroupsTable)
      .where(eq(childGroupsTable.group_id, createdGroup.id))
      .execute();
    
    expect(associations).toHaveLength(2);

    // Delete the group
    const result = await deleteGroup({ id: createdGroup.id });

    // Verify deletion was successful
    expect(result.success).toBe(true);

    // Verify all associated relationships were cascade deleted
    const remainingAssociations = await db.select()
      .from(childGroupsTable)
      .where(eq(childGroupsTable.group_id, createdGroup.id))
      .execute();

    expect(remainingAssociations).toHaveLength(0);

    // Verify both children still exist
    const remainingChildren = await db.select()
      .from(childrenTable)
      .execute();

    expect(remainingChildren).toHaveLength(2);
  });
});