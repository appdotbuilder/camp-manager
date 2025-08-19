import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { groupsTable } from '../db/schema';
import { getGroups } from '../handlers/get_groups';

describe('getGroups', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no groups exist', async () => {
    const result = await getGroups();

    expect(result).toEqual([]);
    expect(result).toHaveLength(0);
  });

  it('should return all groups when groups exist', async () => {
    // Create test groups
    await db.insert(groupsTable).values([
      { name: 'Group A' },
      { name: 'Group B' },
      { name: 'Group C' }
    ]).execute();

    const result = await getGroups();

    expect(result).toHaveLength(3);
    
    // Check that all groups are returned
    const groupNames = result.map(group => group.name).sort();
    expect(groupNames).toEqual(['Group A', 'Group B', 'Group C']);
    
    // Verify structure of returned groups
    result.forEach(group => {
      expect(group.id).toBeDefined();
      expect(typeof group.id).toBe('number');
      expect(typeof group.name).toBe('string');
      expect(group.created_at).toBeInstanceOf(Date);
      expect(group.updated_at).toBeInstanceOf(Date);
    });
  });

  it('should return groups in creation order', async () => {
    // Create groups with slight delay to ensure different timestamps
    await db.insert(groupsTable).values({ name: 'First Group' }).execute();
    
    // Small delay to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));
    
    await db.insert(groupsTable).values({ name: 'Second Group' }).execute();

    const result = await getGroups();

    expect(result).toHaveLength(2);
    expect(result[0].name).toEqual('First Group');
    expect(result[1].name).toEqual('Second Group');
    
    // Verify timestamps show proper ordering
    expect(result[0].created_at <= result[1].created_at).toBe(true);
  });

  it('should handle large number of groups', async () => {
    // Create multiple groups
    const groupsToCreate = Array.from({ length: 50 }, (_, i) => ({
      name: `Group ${i + 1}`
    }));

    await db.insert(groupsTable).values(groupsToCreate).execute();

    const result = await getGroups();

    expect(result).toHaveLength(50);
    
    // Verify all groups have valid structure
    result.forEach((group, index) => {
      expect(group.name).toEqual(`Group ${index + 1}`);
      expect(group.id).toBeDefined();
      expect(group.created_at).toBeInstanceOf(Date);
      expect(group.updated_at).toBeInstanceOf(Date);
    });
  });

  it('should return groups with unique names', async () => {
    // Create groups with unique names (enforced by schema)
    await db.insert(groupsTable).values([
      { name: 'Unique Group 1' },
      { name: 'Unique Group 2' },
      { name: 'Unique Group 3' }
    ]).execute();

    const result = await getGroups();
    const names = result.map(group => group.name);
    const uniqueNames = [...new Set(names)];

    expect(names).toHaveLength(uniqueNames.length);
    expect(result).toHaveLength(3);
  });
});