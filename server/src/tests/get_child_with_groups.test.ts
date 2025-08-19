import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { childrenTable, groupsTable, childGroupsTable } from '../db/schema';
import { type DeleteByIdInput } from '../schema';
import { getChildWithGroups } from '../handlers/get_child_with_groups';

// Test data setup
const createTestChild = async () => {
  const childResults = await db.insert(childrenTable)
    .values({
      name: 'Test Child',
      birth_date: new Date('2015-06-15'),
      gender: 'male'
    })
    .returning()
    .execute();
  return childResults[0];
};

const createTestGroup = async (name: string) => {
  const groupResults = await db.insert(groupsTable)
    .values({
      name: name
    })
    .returning()
    .execute();
  return groupResults[0];
};

const assignChildToGroup = async (childId: number, groupId: number) => {
  await db.insert(childGroupsTable)
    .values({
      child_id: childId,
      group_id: groupId
    })
    .execute();
};

describe('getChildWithGroups', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return child with their groups', async () => {
    // Create test child
    const child = await createTestChild();
    
    // Create test groups
    const group1 = await createTestGroup('Swimming Class');
    const group2 = await createTestGroup('Art Club');
    
    // Assign child to groups
    await assignChildToGroup(child.id, group1.id);
    await assignChildToGroup(child.id, group2.id);

    const input: DeleteByIdInput = { id: child.id };
    const result = await getChildWithGroups(input);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(child.id);
    expect(result!.name).toEqual('Test Child');
    expect(result!.birth_date).toBeInstanceOf(Date);
    expect(result!.birth_date.getFullYear()).toEqual(2015);
    expect(result!.gender).toEqual('male');
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);

    // Check groups
    expect(result!.groups).toHaveLength(2);
    const groupNames = result!.groups.map(g => g.name).sort();
    expect(groupNames).toEqual(['Art Club', 'Swimming Class']);
    
    // Verify group structure
    result!.groups.forEach(group => {
      expect(group.id).toBeDefined();
      expect(group.name).toBeDefined();
      expect(group.created_at).toBeInstanceOf(Date);
      expect(group.updated_at).toBeInstanceOf(Date);
    });
  });

  it('should return child with empty groups array when child has no groups', async () => {
    // Create test child but don't assign to any groups
    const child = await createTestChild();

    const input: DeleteByIdInput = { id: child.id };
    const result = await getChildWithGroups(input);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(child.id);
    expect(result!.name).toEqual('Test Child');
    expect(result!.groups).toHaveLength(0);
    expect(result!.groups).toEqual([]);
  });

  it('should return null when child does not exist', async () => {
    const input: DeleteByIdInput = { id: 999 };
    const result = await getChildWithGroups(input);

    expect(result).toBeNull();
  });

  it('should handle child with single group', async () => {
    // Create test child and one group
    const child = await createTestChild();
    const group = await createTestGroup('Soccer Team');
    
    // Assign child to group
    await assignChildToGroup(child.id, group.id);

    const input: DeleteByIdInput = { id: child.id };
    const result = await getChildWithGroups(input);

    expect(result).not.toBeNull();
    expect(result!.groups).toHaveLength(1);
    expect(result!.groups[0].name).toEqual('Soccer Team');
    expect(result!.groups[0].id).toEqual(group.id);
  });

  it('should return correct child data for female child', async () => {
    // Create female child with different data
    const childResults = await db.insert(childrenTable)
      .values({
        name: 'Jane Doe',
        birth_date: new Date('2010-12-01'),
        gender: 'female'
      })
      .returning()
      .execute();
    
    const child = childResults[0];
    const group = await createTestGroup('Dance Class');
    await assignChildToGroup(child.id, group.id);

    const input: DeleteByIdInput = { id: child.id };
    const result = await getChildWithGroups(input);

    expect(result).not.toBeNull();
    expect(result!.name).toEqual('Jane Doe');
    expect(result!.gender).toEqual('female');
    expect(result!.birth_date.getFullYear()).toEqual(2010);
    expect(result!.groups).toHaveLength(1);
    expect(result!.groups[0].name).toEqual('Dance Class');
  });

  it('should handle multiple children with different groups correctly', async () => {
    // Create two children
    const child1 = await createTestChild();
    
    const child2Results = await db.insert(childrenTable)
      .values({
        name: 'Second Child',
        birth_date: new Date('2012-03-20'),
        gender: 'other'
      })
      .returning()
      .execute();
    const child2 = child2Results[0];

    // Create groups
    const group1 = await createTestGroup('Music Band');
    const group2 = await createTestGroup('Chess Club');
    const group3 = await createTestGroup('Drama Club');

    // Assign child1 to group1 and group2
    await assignChildToGroup(child1.id, group1.id);
    await assignChildToGroup(child1.id, group2.id);

    // Assign child2 to group2 and group3 (group2 is shared)
    await assignChildToGroup(child2.id, group2.id);
    await assignChildToGroup(child2.id, group3.id);

    // Get child1 with groups
    const input1: DeleteByIdInput = { id: child1.id };
    const result1 = await getChildWithGroups(input1);

    expect(result1).not.toBeNull();
    expect(result1!.name).toEqual('Test Child');
    expect(result1!.groups).toHaveLength(2);
    const child1GroupNames = result1!.groups.map(g => g.name).sort();
    expect(child1GroupNames).toEqual(['Chess Club', 'Music Band']);

    // Get child2 with groups
    const input2: DeleteByIdInput = { id: child2.id };
    const result2 = await getChildWithGroups(input2);

    expect(result2).not.toBeNull();
    expect(result2!.name).toEqual('Second Child');
    expect(result2!.gender).toEqual('other');
    expect(result2!.groups).toHaveLength(2);
    const child2GroupNames = result2!.groups.map(g => g.name).sort();
    expect(child2GroupNames).toEqual(['Chess Club', 'Drama Club']);
  });
});