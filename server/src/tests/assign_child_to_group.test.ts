import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { childrenTable, groupsTable, childGroupsTable } from '../db/schema';
import { type AssignChildToGroupInput } from '../schema';
import { assignChildToGroup } from '../handlers/assign_child_to_group';
import { eq, and } from 'drizzle-orm';

describe('assignChildToGroup', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should assign a child to a group successfully', async () => {
    // Create a child first
    const [child] = await db.insert(childrenTable)
      .values({
        name: 'Test Child',
        birth_date: new Date('2020-01-01'),
        gender: 'male'
      })
      .returning()
      .execute();

    // Create a group
    const [group] = await db.insert(groupsTable)
      .values({
        name: 'Test Group'
      })
      .returning()
      .execute();

    const input: AssignChildToGroupInput = {
      child_id: child.id,
      group_id: group.id
    };

    const result = await assignChildToGroup(input);

    // Verify the result
    expect(result.child_id).toEqual(child.id);
    expect(result.group_id).toEqual(group.id);
    expect(result.assigned_at).toBeInstanceOf(Date);
  });

  it('should save the assignment to database', async () => {
    // Create prerequisites
    const [child] = await db.insert(childrenTable)
      .values({
        name: 'Test Child',
        birth_date: new Date('2020-01-01'),
        gender: 'female'
      })
      .returning()
      .execute();

    const [group] = await db.insert(groupsTable)
      .values({
        name: 'Test Group'
      })
      .returning()
      .execute();

    const input: AssignChildToGroupInput = {
      child_id: child.id,
      group_id: group.id
    };

    await assignChildToGroup(input);

    // Verify in database
    const assignments = await db.select()
      .from(childGroupsTable)
      .where(
        and(
          eq(childGroupsTable.child_id, child.id),
          eq(childGroupsTable.group_id, group.id)
        )
      )
      .execute();

    expect(assignments).toHaveLength(1);
    expect(assignments[0].child_id).toEqual(child.id);
    expect(assignments[0].group_id).toEqual(group.id);
    expect(assignments[0].assigned_at).toBeInstanceOf(Date);
  });

  it('should throw error when child does not exist', async () => {
    // Create only a group
    const [group] = await db.insert(groupsTable)
      .values({
        name: 'Test Group'
      })
      .returning()
      .execute();

    const input: AssignChildToGroupInput = {
      child_id: 999, // Non-existent child
      group_id: group.id
    };

    await expect(assignChildToGroup(input)).rejects.toThrow(/child with id 999 not found/i);
  });

  it('should throw error when group does not exist', async () => {
    // Create only a child
    const [child] = await db.insert(childrenTable)
      .values({
        name: 'Test Child',
        birth_date: new Date('2020-01-01'),
        gender: 'other'
      })
      .returning()
      .execute();

    const input: AssignChildToGroupInput = {
      child_id: child.id,
      group_id: 999 // Non-existent group
    };

    await expect(assignChildToGroup(input)).rejects.toThrow(/group with id 999 not found/i);
  });

  it('should throw error when assignment already exists', async () => {
    // Create prerequisites
    const [child] = await db.insert(childrenTable)
      .values({
        name: 'Test Child',
        birth_date: new Date('2020-01-01'),
        gender: 'male'
      })
      .returning()
      .execute();

    const [group] = await db.insert(groupsTable)
      .values({
        name: 'Test Group'
      })
      .returning()
      .execute();

    const input: AssignChildToGroupInput = {
      child_id: child.id,
      group_id: group.id
    };

    // Create the assignment first time
    await assignChildToGroup(input);

    // Try to create the same assignment again
    await expect(assignChildToGroup(input)).rejects.toThrow(/already assigned to group/i);
  });

  it('should allow same child to be assigned to different groups', async () => {
    // Create a child
    const [child] = await db.insert(childrenTable)
      .values({
        name: 'Test Child',
        birth_date: new Date('2020-01-01'),
        gender: 'female'
      })
      .returning()
      .execute();

    // Create two different groups
    const [group1] = await db.insert(groupsTable)
      .values({
        name: 'Test Group 1'
      })
      .returning()
      .execute();

    const [group2] = await db.insert(groupsTable)
      .values({
        name: 'Test Group 2'
      })
      .returning()
      .execute();

    // Assign child to first group
    const result1 = await assignChildToGroup({
      child_id: child.id,
      group_id: group1.id
    });

    // Assign same child to second group
    const result2 = await assignChildToGroup({
      child_id: child.id,
      group_id: group2.id
    });

    // Verify both assignments exist
    expect(result1.child_id).toEqual(child.id);
    expect(result1.group_id).toEqual(group1.id);
    expect(result2.child_id).toEqual(child.id);
    expect(result2.group_id).toEqual(group2.id);

    // Check database
    const assignments = await db.select()
      .from(childGroupsTable)
      .where(eq(childGroupsTable.child_id, child.id))
      .execute();

    expect(assignments).toHaveLength(2);
  });

  it('should allow different children to be assigned to same group', async () => {
    // Create two children
    const [child1] = await db.insert(childrenTable)
      .values({
        name: 'Test Child 1',
        birth_date: new Date('2020-01-01'),
        gender: 'male'
      })
      .returning()
      .execute();

    const [child2] = await db.insert(childrenTable)
      .values({
        name: 'Test Child 2',
        birth_date: new Date('2021-01-01'),
        gender: 'female'
      })
      .returning()
      .execute();

    // Create one group
    const [group] = await db.insert(groupsTable)
      .values({
        name: 'Test Group'
      })
      .returning()
      .execute();

    // Assign first child to group
    const result1 = await assignChildToGroup({
      child_id: child1.id,
      group_id: group.id
    });

    // Assign second child to same group
    const result2 = await assignChildToGroup({
      child_id: child2.id,
      group_id: group.id
    });

    // Verify both assignments exist
    expect(result1.child_id).toEqual(child1.id);
    expect(result1.group_id).toEqual(group.id);
    expect(result2.child_id).toEqual(child2.id);
    expect(result2.group_id).toEqual(group.id);

    // Check database
    const assignments = await db.select()
      .from(childGroupsTable)
      .where(eq(childGroupsTable.group_id, group.id))
      .execute();

    expect(assignments).toHaveLength(2);
  });
});