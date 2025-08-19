import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { groupsTable, childrenTable, childGroupsTable } from '../db/schema';
import { type DeleteByIdInput } from '../schema';
import { getGroupWithChildren } from '../handlers/get_group_with_children';

// Test input
const testInput: DeleteByIdInput = {
  id: 1
};

describe('getGroupWithChildren', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return null for non-existent group', async () => {
    const result = await getGroupWithChildren({ id: 999 });
    expect(result).toBeNull();
  });

  it('should return group with empty children array when no children assigned', async () => {
    // Create a group with no children
    const groupResult = await db.insert(groupsTable)
      .values({
        name: 'Empty Group'
      })
      .returning()
      .execute();

    const result = await getGroupWithChildren({ id: groupResult[0].id });

    expect(result).toBeDefined();
    expect(result?.id).toEqual(groupResult[0].id);
    expect(result?.name).toEqual('Empty Group');
    expect(result?.children).toEqual([]);
    expect(result?.created_at).toBeInstanceOf(Date);
    expect(result?.updated_at).toBeInstanceOf(Date);
  });

  it('should return group with associated children', async () => {
    // Create a group
    const groupResult = await db.insert(groupsTable)
      .values({
        name: 'Test Group'
      })
      .returning()
      .execute();

    // Create children
    const childrenResults = await db.insert(childrenTable)
      .values([
        {
          name: 'Alice',
          birth_date: new Date('2020-01-15'),
          gender: 'female'
        },
        {
          name: 'Bob',
          birth_date: new Date('2019-05-20'),
          gender: 'male'
        }
      ])
      .returning()
      .execute();

    // Associate children with group
    await db.insert(childGroupsTable)
      .values([
        {
          child_id: childrenResults[0].id,
          group_id: groupResult[0].id
        },
        {
          child_id: childrenResults[1].id,
          group_id: groupResult[0].id
        }
      ])
      .execute();

    const result = await getGroupWithChildren({ id: groupResult[0].id });

    expect(result).toBeDefined();
    expect(result?.id).toEqual(groupResult[0].id);
    expect(result?.name).toEqual('Test Group');
    expect(result?.children).toHaveLength(2);
    expect(result?.created_at).toBeInstanceOf(Date);
    expect(result?.updated_at).toBeInstanceOf(Date);

    // Check children details
    const childNames = result?.children.map(child => child.name).sort();
    expect(childNames).toEqual(['Alice', 'Bob']);

    // Verify children have all required fields
    result?.children.forEach(child => {
      expect(child.id).toBeDefined();
      expect(child.name).toBeDefined();
      expect(child.birth_date).toBeInstanceOf(Date);
      expect(child.gender).toBeOneOf(['male', 'female', 'other']);
      expect(child.created_at).toBeInstanceOf(Date);
      expect(child.updated_at).toBeInstanceOf(Date);
    });
  });

  it('should only return children assigned to the specific group', async () => {
    // Create two groups
    const groupsResults = await db.insert(groupsTable)
      .values([
        { name: 'Group A' },
        { name: 'Group B' }
      ])
      .returning()
      .execute();

    // Create children
    const childrenResults = await db.insert(childrenTable)
      .values([
        {
          name: 'Child 1',
          birth_date: new Date('2020-01-01'),
          gender: 'male'
        },
        {
          name: 'Child 2',
          birth_date: new Date('2020-02-01'),
          gender: 'female'
        },
        {
          name: 'Child 3',
          birth_date: new Date('2020-03-01'),
          gender: 'other'
        }
      ])
      .returning()
      .execute();

    // Assign children to different groups
    await db.insert(childGroupsTable)
      .values([
        { child_id: childrenResults[0].id, group_id: groupsResults[0].id }, // Child 1 to Group A
        { child_id: childrenResults[1].id, group_id: groupsResults[0].id }, // Child 2 to Group A
        { child_id: childrenResults[2].id, group_id: groupsResults[1].id }  // Child 3 to Group B
      ])
      .execute();

    // Get Group A - should only have 2 children
    const resultA = await getGroupWithChildren({ id: groupsResults[0].id });
    expect(resultA?.children).toHaveLength(2);
    expect(resultA?.children.map(c => c.name).sort()).toEqual(['Child 1', 'Child 2']);

    // Get Group B - should only have 1 child
    const resultB = await getGroupWithChildren({ id: groupsResults[1].id });
    expect(resultB?.children).toHaveLength(1);
    expect(resultB?.children[0].name).toEqual('Child 3');
  });

  it('should handle child assigned to multiple groups correctly', async () => {
    // Create two groups
    const groupsResults = await db.insert(groupsTable)
      .values([
        { name: 'Math Group' },
        { name: 'Science Group' }
      ])
      .returning()
      .execute();

    // Create a child
    const childResult = await db.insert(childrenTable)
      .values({
        name: 'Multi-Group Child',
        birth_date: new Date('2020-01-01'),
        gender: 'female'
      })
      .returning()
      .execute();

    // Assign child to both groups
    await db.insert(childGroupsTable)
      .values([
        { child_id: childResult[0].id, group_id: groupsResults[0].id },
        { child_id: childResult[0].id, group_id: groupsResults[1].id }
      ])
      .execute();

    // Both groups should include this child
    const mathGroupResult = await getGroupWithChildren({ id: groupsResults[0].id });
    expect(mathGroupResult?.children).toHaveLength(1);
    expect(mathGroupResult?.children[0].name).toEqual('Multi-Group Child');

    const scienceGroupResult = await getGroupWithChildren({ id: groupsResults[1].id });
    expect(scienceGroupResult?.children).toHaveLength(1);
    expect(scienceGroupResult?.children[0].name).toEqual('Multi-Group Child');
  });
});