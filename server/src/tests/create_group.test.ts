import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { groupsTable } from '../db/schema';
import { type CreateGroupInput } from '../schema';
import { createGroup } from '../handlers/create_group';
import { eq } from 'drizzle-orm';

// Simple test input
const testInput: CreateGroupInput = {
  name: 'Test Group'
};

describe('createGroup', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a group', async () => {
    const result = await createGroup(testInput);

    // Basic field validation
    expect(result.name).toEqual('Test Group');
    expect(result.id).toBeDefined();
    expect(typeof result.id).toBe('number');
    expect(result.id).toBeGreaterThan(0);
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save group to database', async () => {
    const result = await createGroup(testInput);

    // Query using proper drizzle syntax
    const groups = await db.select()
      .from(groupsTable)
      .where(eq(groupsTable.id, result.id))
      .execute();

    expect(groups).toHaveLength(1);
    expect(groups[0].name).toEqual('Test Group');
    expect(groups[0].id).toEqual(result.id);
    expect(groups[0].created_at).toBeInstanceOf(Date);
    expect(groups[0].updated_at).toBeInstanceOf(Date);
  });

  it('should create multiple groups with different names', async () => {
    const group1 = await createGroup({ name: 'Group One' });
    const group2 = await createGroup({ name: 'Group Two' });

    expect(group1.name).toEqual('Group One');
    expect(group2.name).toEqual('Group Two');
    expect(group1.id).not.toEqual(group2.id);

    // Verify both are in database
    const allGroups = await db.select()
      .from(groupsTable)
      .execute();

    expect(allGroups).toHaveLength(2);
    const groupNames = allGroups.map(g => g.name).sort();
    expect(groupNames).toEqual(['Group One', 'Group Two']);
  });

  it('should handle unique constraint violation for duplicate group names', async () => {
    // Create first group
    await createGroup({ name: 'Duplicate Name' });

    // Attempt to create second group with same name should fail
    await expect(createGroup({ name: 'Duplicate Name' }))
      .rejects.toThrow(/unique constraint/i);
  });

  it('should set timestamps correctly', async () => {
    const beforeCreation = new Date();
    const result = await createGroup(testInput);
    const afterCreation = new Date();

    // Check that timestamps are within reasonable range
    expect(result.created_at.getTime()).toBeGreaterThanOrEqual(beforeCreation.getTime());
    expect(result.created_at.getTime()).toBeLessThanOrEqual(afterCreation.getTime());
    expect(result.updated_at.getTime()).toBeGreaterThanOrEqual(beforeCreation.getTime());
    expect(result.updated_at.getTime()).toBeLessThanOrEqual(afterCreation.getTime());

    // Initially, created_at and updated_at should be very close
    const timeDifference = Math.abs(result.updated_at.getTime() - result.created_at.getTime());
    expect(timeDifference).toBeLessThan(1000); // Less than 1 second difference
  });
});