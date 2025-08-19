import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { childrenTable, groupsTable, childGroupsTable } from '../db/schema';
import { type RemoveChildFromGroupInput } from '../schema';
import { removeChildFromGroup } from '../handlers/remove_child_from_group';
import { eq, and } from 'drizzle-orm';

describe('removeChildFromGroup', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should successfully remove a child from a group', async () => {
    // Create a child
    const childResult = await db.insert(childrenTable)
      .values({
        name: 'Test Child',
        birth_date: new Date('2020-01-01'),
        gender: 'male'
      })
      .returning()
      .execute();
    
    const child = childResult[0];

    // Create a group
    const groupResult = await db.insert(groupsTable)
      .values({
        name: 'Test Group'
      })
      .returning()
      .execute();
    
    const group = groupResult[0];

    // Create child-group association
    await db.insert(childGroupsTable)
      .values({
        child_id: child.id,
        group_id: group.id
      })
      .execute();

    // Verify association exists
    const beforeRemoval = await db.select()
      .from(childGroupsTable)
      .where(
        and(
          eq(childGroupsTable.child_id, child.id),
          eq(childGroupsTable.group_id, group.id)
        )
      )
      .execute();
    
    expect(beforeRemoval).toHaveLength(1);

    // Remove child from group
    const input: RemoveChildFromGroupInput = {
      child_id: child.id,
      group_id: group.id
    };

    const result = await removeChildFromGroup(input);

    // Verify successful removal
    expect(result.success).toBe(true);

    // Verify association no longer exists
    const afterRemoval = await db.select()
      .from(childGroupsTable)
      .where(
        and(
          eq(childGroupsTable.child_id, child.id),
          eq(childGroupsTable.group_id, group.id)
        )
      )
      .execute();
    
    expect(afterRemoval).toHaveLength(0);
  });

  it('should return false when trying to remove non-existent association', async () => {
    // Create a child
    const childResult = await db.insert(childrenTable)
      .values({
        name: 'Test Child',
        birth_date: new Date('2020-01-01'),
        gender: 'female'
      })
      .returning()
      .execute();
    
    const child = childResult[0];

    // Create a group
    const groupResult = await db.insert(groupsTable)
      .values({
        name: 'Test Group'
      })
      .returning()
      .execute();
    
    const group = groupResult[0];

    // Try to remove association that doesn't exist
    const input: RemoveChildFromGroupInput = {
      child_id: child.id,
      group_id: group.id
    };

    const result = await removeChildFromGroup(input);

    // Should return false since no association existed
    expect(result.success).toBe(false);
  });

  it('should return false when child does not exist', async () => {
    // Create a group
    const groupResult = await db.insert(groupsTable)
      .values({
        name: 'Test Group'
      })
      .returning()
      .execute();
    
    const group = groupResult[0];

    // Try to remove association with non-existent child
    const input: RemoveChildFromGroupInput = {
      child_id: 99999, // Non-existent child ID
      group_id: group.id
    };

    const result = await removeChildFromGroup(input);

    // Should return false since child doesn't exist
    expect(result.success).toBe(false);
  });

  it('should return false when group does not exist', async () => {
    // Create a child
    const childResult = await db.insert(childrenTable)
      .values({
        name: 'Test Child',
        birth_date: new Date('2020-01-01'),
        gender: 'other'
      })
      .returning()
      .execute();
    
    const child = childResult[0];

    // Try to remove association with non-existent group
    const input: RemoveChildFromGroupInput = {
      child_id: child.id,
      group_id: 99999 // Non-existent group ID
    };

    const result = await removeChildFromGroup(input);

    // Should return false since group doesn't exist
    expect(result.success).toBe(false);
  });

  it('should only remove the specified association', async () => {
    // Create two children
    const child1Result = await db.insert(childrenTable)
      .values({
        name: 'Child One',
        birth_date: new Date('2020-01-01'),
        gender: 'male'
      })
      .returning()
      .execute();
    
    const child2Result = await db.insert(childrenTable)
      .values({
        name: 'Child Two',
        birth_date: new Date('2021-01-01'),
        gender: 'female'
      })
      .returning()
      .execute();
    
    const child1 = child1Result[0];
    const child2 = child2Result[0];

    // Create a group
    const groupResult = await db.insert(groupsTable)
      .values({
        name: 'Test Group'
      })
      .returning()
      .execute();
    
    const group = groupResult[0];

    // Create associations for both children
    await db.insert(childGroupsTable)
      .values([
        {
          child_id: child1.id,
          group_id: group.id
        },
        {
          child_id: child2.id,
          group_id: group.id
        }
      ])
      .execute();

    // Remove only child1 from group
    const input: RemoveChildFromGroupInput = {
      child_id: child1.id,
      group_id: group.id
    };

    const result = await removeChildFromGroup(input);

    expect(result.success).toBe(true);

    // Verify child1's association is removed
    const child1Association = await db.select()
      .from(childGroupsTable)
      .where(
        and(
          eq(childGroupsTable.child_id, child1.id),
          eq(childGroupsTable.group_id, group.id)
        )
      )
      .execute();
    
    expect(child1Association).toHaveLength(0);

    // Verify child2's association still exists
    const child2Association = await db.select()
      .from(childGroupsTable)
      .where(
        and(
          eq(childGroupsTable.child_id, child2.id),
          eq(childGroupsTable.group_id, group.id)
        )
      )
      .execute();
    
    expect(child2Association).toHaveLength(1);
  });

  it('should handle multiple groups correctly', async () => {
    // Create a child
    const childResult = await db.insert(childrenTable)
      .values({
        name: 'Test Child',
        birth_date: new Date('2020-01-01'),
        gender: 'male'
      })
      .returning()
      .execute();
    
    const child = childResult[0];

    // Create two groups
    const group1Result = await db.insert(groupsTable)
      .values({
        name: 'Group One'
      })
      .returning()
      .execute();
    
    const group2Result = await db.insert(groupsTable)
      .values({
        name: 'Group Two'
      })
      .returning()
      .execute();
    
    const group1 = group1Result[0];
    const group2 = group2Result[0];

    // Create associations for both groups
    await db.insert(childGroupsTable)
      .values([
        {
          child_id: child.id,
          group_id: group1.id
        },
        {
          child_id: child.id,
          group_id: group2.id
        }
      ])
      .execute();

    // Remove child from group1 only
    const input: RemoveChildFromGroupInput = {
      child_id: child.id,
      group_id: group1.id
    };

    const result = await removeChildFromGroup(input);

    expect(result.success).toBe(true);

    // Verify group1 association is removed
    const group1Association = await db.select()
      .from(childGroupsTable)
      .where(
        and(
          eq(childGroupsTable.child_id, child.id),
          eq(childGroupsTable.group_id, group1.id)
        )
      )
      .execute();
    
    expect(group1Association).toHaveLength(0);

    // Verify group2 association still exists
    const group2Association = await db.select()
      .from(childGroupsTable)
      .where(
        and(
          eq(childGroupsTable.child_id, child.id),
          eq(childGroupsTable.group_id, group2.id)
        )
      )
      .execute();
    
    expect(group2Association).toHaveLength(1);
  });
});