import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { childrenTable, groupsTable, childGroupsTable } from '../db/schema';
import { type DeleteByIdInput, type CreateChildInput, type CreateGroupInput, type AssignChildToGroupInput } from '../schema';
import { deleteChild } from '../handlers/delete_child';
import { eq } from 'drizzle-orm';

// Test inputs
const testChildInput: CreateChildInput = {
  name: 'Test Child',
  birth_date: new Date('2020-01-15'),
  gender: 'male'
};

const testGroupInput: CreateGroupInput = {
  name: 'Test Group'
};

describe('deleteChild', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should successfully delete an existing child', async () => {
    // Create a child first
    const childResult = await db.insert(childrenTable)
      .values({
        name: testChildInput.name,
        birth_date: testChildInput.birth_date,
        gender: testChildInput.gender
      })
      .returning()
      .execute();

    const child = childResult[0];
    const deleteInput: DeleteByIdInput = { id: child.id };

    // Delete the child
    const result = await deleteChild(deleteInput);

    expect(result.success).toBe(true);

    // Verify the child is deleted from database
    const deletedChildren = await db.select()
      .from(childrenTable)
      .where(eq(childrenTable.id, child.id))
      .execute();

    expect(deletedChildren).toHaveLength(0);
  });

  it('should return false when trying to delete non-existent child', async () => {
    const deleteInput: DeleteByIdInput = { id: 99999 }; // Non-existent ID

    const result = await deleteChild(deleteInput);

    expect(result.success).toBe(false);
  });

  it('should cascade delete child-group relationships', async () => {
    // Create a child
    const childResult = await db.insert(childrenTable)
      .values({
        name: testChildInput.name,
        birth_date: testChildInput.birth_date,
        gender: testChildInput.gender
      })
      .returning()
      .execute();

    const child = childResult[0];

    // Create a group
    const groupResult = await db.insert(groupsTable)
      .values({
        name: testGroupInput.name
      })
      .returning()
      .execute();

    const group = groupResult[0];

    // Assign child to group
    await db.insert(childGroupsTable)
      .values({
        child_id: child.id,
        group_id: group.id
      })
      .execute();

    // Verify the relationship exists
    const relationsBefore = await db.select()
      .from(childGroupsTable)
      .where(eq(childGroupsTable.child_id, child.id))
      .execute();

    expect(relationsBefore).toHaveLength(1);

    // Delete the child
    const deleteInput: DeleteByIdInput = { id: child.id };
    const result = await deleteChild(deleteInput);

    expect(result.success).toBe(true);

    // Verify child is deleted
    const deletedChildren = await db.select()
      .from(childrenTable)
      .where(eq(childrenTable.id, child.id))
      .execute();

    expect(deletedChildren).toHaveLength(0);

    // Verify child-group relationships are cascade deleted
    const relationsAfter = await db.select()
      .from(childGroupsTable)
      .where(eq(childGroupsTable.child_id, child.id))
      .execute();

    expect(relationsAfter).toHaveLength(0);

    // Verify group still exists (only child and relationships are deleted)
    const existingGroups = await db.select()
      .from(groupsTable)
      .where(eq(groupsTable.id, group.id))
      .execute();

    expect(existingGroups).toHaveLength(1);
  });

  it('should handle multiple group associations correctly', async () => {
    // Create a child
    const childResult = await db.insert(childrenTable)
      .values({
        name: testChildInput.name,
        birth_date: testChildInput.birth_date,
        gender: testChildInput.gender
      })
      .returning()
      .execute();

    const child = childResult[0];

    // Create multiple groups
    const group1Result = await db.insert(groupsTable)
      .values({ name: 'Group 1' })
      .returning()
      .execute();

    const group2Result = await db.insert(groupsTable)
      .values({ name: 'Group 2' })
      .returning()
      .execute();

    const group1 = group1Result[0];
    const group2 = group2Result[0];

    // Assign child to both groups
    await db.insert(childGroupsTable)
      .values([
        { child_id: child.id, group_id: group1.id },
        { child_id: child.id, group_id: group2.id }
      ])
      .execute();

    // Verify both relationships exist
    const relationsBefore = await db.select()
      .from(childGroupsTable)
      .where(eq(childGroupsTable.child_id, child.id))
      .execute();

    expect(relationsBefore).toHaveLength(2);

    // Delete the child
    const deleteInput: DeleteByIdInput = { id: child.id };
    const result = await deleteChild(deleteInput);

    expect(result.success).toBe(true);

    // Verify all child-group relationships are deleted
    const relationsAfter = await db.select()
      .from(childGroupsTable)
      .where(eq(childGroupsTable.child_id, child.id))
      .execute();

    expect(relationsAfter).toHaveLength(0);

    // Verify both groups still exist
    const existingGroups = await db.select()
      .from(groupsTable)
      .execute();

    expect(existingGroups).toHaveLength(2);
  });

  it('should handle deletion of child with various data types correctly', async () => {
    // Create child with female gender and different date
    const femaleChildInput: CreateChildInput = {
      name: 'Jane Doe',
      birth_date: new Date('2018-12-25'),
      gender: 'female'
    };

    const childResult = await db.insert(childrenTable)
      .values({
        name: femaleChildInput.name,
        birth_date: femaleChildInput.birth_date,
        gender: femaleChildInput.gender
      })
      .returning()
      .execute();

    const child = childResult[0];
    const deleteInput: DeleteByIdInput = { id: child.id };

    // Delete the child
    const result = await deleteChild(deleteInput);

    expect(result.success).toBe(true);

    // Verify deletion
    const deletedChildren = await db.select()
      .from(childrenTable)
      .where(eq(childrenTable.id, child.id))
      .execute();

    expect(deletedChildren).toHaveLength(0);
  });
});