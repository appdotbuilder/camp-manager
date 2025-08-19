import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { childrenTable } from '../db/schema';
import { type FilterChildrenInput, type CreateChildInput } from '../schema';
import { getChildren } from '../handlers/get_children';

// Test data setup
const testChildren: CreateChildInput[] = [
  {
    name: 'Alice Johnson',
    birth_date: new Date('2015-03-15'),
    gender: 'female'
  },
  {
    name: 'Bob Smith',
    birth_date: new Date('2016-07-22'),
    gender: 'male'
  },
  {
    name: 'Charlie Brown',
    birth_date: new Date('2015-03-15'), // Same birth date as Alice
    gender: 'male'
  },
  {
    name: 'Diana Prince',
    birth_date: new Date('2017-11-08'),
    gender: 'female'
  }
];

// Helper function to create test children in database
const createTestChildren = async () => {
  for (const child of testChildren) {
    await db.insert(childrenTable)
      .values({
        name: child.name,
        birth_date: child.birth_date,
        gender: child.gender
      })
      .execute();
  }
};

describe('getChildren', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return all children when no filter is provided', async () => {
    await createTestChildren();
    
    const result = await getChildren();

    expect(result).toHaveLength(4);
    
    // Verify all children are returned
    const names = result.map(child => child.name).sort();
    expect(names).toEqual(['Alice Johnson', 'Bob Smith', 'Charlie Brown', 'Diana Prince']);
    
    // Verify structure of returned data
    result.forEach(child => {
      expect(child.id).toBeDefined();
      expect(child.name).toBeDefined();
      expect(child.birth_date).toBeInstanceOf(Date);
      expect(child.gender).toBeDefined();
      expect(child.created_at).toBeInstanceOf(Date);
      expect(child.updated_at).toBeInstanceOf(Date);
    });
  });

  it('should return empty array when no children exist', async () => {
    const result = await getChildren();
    
    expect(result).toHaveLength(0);
    expect(result).toEqual([]);
  });

  it('should filter children by name (partial match, case-insensitive)', async () => {
    await createTestChildren();
    
    const filter: FilterChildrenInput = { name: 'alice' };
    const result = await getChildren(filter);

    expect(result).toHaveLength(1);
    expect(result[0].name).toEqual('Alice Johnson');
  });

  it('should filter children by name with partial match', async () => {
    await createTestChildren();
    
    const filter: FilterChildrenInput = { name: 'Brown' };
    const result = await getChildren(filter);

    expect(result).toHaveLength(1);
    expect(result[0].name).toEqual('Charlie Brown');
  });

  it('should filter children by birth_date', async () => {
    await createTestChildren();
    
    const filter: FilterChildrenInput = { 
      birth_date: new Date('2015-03-15') 
    };
    const result = await getChildren(filter);

    expect(result).toHaveLength(2);
    const names = result.map(child => child.name).sort();
    expect(names).toEqual(['Alice Johnson', 'Charlie Brown']);
    
    // Verify both have the same birth date
    result.forEach(child => {
      expect(child.birth_date).toEqual(new Date('2015-03-15'));
    });
  });

  it('should filter children by gender', async () => {
    await createTestChildren();
    
    const filter: FilterChildrenInput = { gender: 'female' };
    const result = await getChildren(filter);

    expect(result).toHaveLength(2);
    const names = result.map(child => child.name).sort();
    expect(names).toEqual(['Alice Johnson', 'Diana Prince']);
    
    // Verify all are female
    result.forEach(child => {
      expect(child.gender).toEqual('female');
    });
  });

  it('should filter children by multiple criteria', async () => {
    await createTestChildren();
    
    const filter: FilterChildrenInput = { 
      gender: 'male',
      birth_date: new Date('2015-03-15')
    };
    const result = await getChildren(filter);

    expect(result).toHaveLength(1);
    expect(result[0].name).toEqual('Charlie Brown');
    expect(result[0].gender).toEqual('male');
    expect(result[0].birth_date).toEqual(new Date('2015-03-15'));
  });

  it('should return empty array when filter matches no children', async () => {
    await createTestChildren();
    
    const filter: FilterChildrenInput = { name: 'Nonexistent Child' };
    const result = await getChildren(filter);

    expect(result).toHaveLength(0);
    expect(result).toEqual([]);
  });

  it('should handle complex name filtering', async () => {
    await createTestChildren();
    
    // Test partial match with common substring
    const filter: FilterChildrenInput = { name: 'o' }; // Should match Bob, Brown, Johnson
    const result = await getChildren(filter);

    expect(result).toHaveLength(3);
    const names = result.map(child => child.name).sort();
    expect(names).toEqual(['Alice Johnson', 'Bob Smith', 'Charlie Brown']);
  });

  it('should handle all three filters combined', async () => {
    await createTestChildren();
    
    const filter: FilterChildrenInput = { 
      name: 'Charlie',
      birth_date: new Date('2015-03-15'),
      gender: 'male'
    };
    const result = await getChildren(filter);

    expect(result).toHaveLength(1);
    expect(result[0].name).toEqual('Charlie Brown');
    expect(result[0].gender).toEqual('male');
    expect(result[0].birth_date).toEqual(new Date('2015-03-15'));
  });

  it('should handle edge case with restrictive multiple filters', async () => {
    await createTestChildren();
    
    // Filter that should match nothing (Alice is female, not male)
    const filter: FilterChildrenInput = { 
      name: 'Alice',
      gender: 'male'
    };
    const result = await getChildren(filter);

    expect(result).toHaveLength(0);
    expect(result).toEqual([]);
  });
});