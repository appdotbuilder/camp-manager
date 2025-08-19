import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { childrenTable } from '../db/schema';
import { type CreateChildInput } from '../schema';
import { createChild } from '../handlers/create_child';
import { eq } from 'drizzle-orm';

// Test inputs
const testInput: CreateChildInput = {
  name: 'John Doe',
  birth_date: new Date('2018-05-15'),
  gender: 'male'
};

const testInputFemale: CreateChildInput = {
  name: 'Jane Smith',
  birth_date: new Date('2019-08-22'),
  gender: 'female'
};

const testInputOther: CreateChildInput = {
  name: 'Alex Johnson',
  birth_date: new Date('2020-01-10'),
  gender: 'other'
};

describe('createChild', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a child with male gender', async () => {
    const result = await createChild(testInput);

    // Basic field validation
    expect(result.name).toEqual('John Doe');
    expect(result.birth_date).toEqual(new Date('2018-05-15'));
    expect(result.gender).toEqual('male');
    expect(result.id).toBeDefined();
    expect(typeof result.id).toEqual('number');
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should create a child with female gender', async () => {
    const result = await createChild(testInputFemale);

    expect(result.name).toEqual('Jane Smith');
    expect(result.birth_date).toEqual(new Date('2019-08-22'));
    expect(result.gender).toEqual('female');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should create a child with other gender', async () => {
    const result = await createChild(testInputOther);

    expect(result.name).toEqual('Alex Johnson');
    expect(result.birth_date).toEqual(new Date('2020-01-10'));
    expect(result.gender).toEqual('other');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save child to database', async () => {
    const result = await createChild(testInput);

    // Query using proper drizzle syntax
    const children = await db.select()
      .from(childrenTable)
      .where(eq(childrenTable.id, result.id))
      .execute();

    expect(children).toHaveLength(1);
    expect(children[0].name).toEqual('John Doe');
    expect(children[0].birth_date).toEqual(new Date('2018-05-15'));
    expect(children[0].gender).toEqual('male');
    expect(children[0].created_at).toBeInstanceOf(Date);
    expect(children[0].updated_at).toBeInstanceOf(Date);
  });

  it('should create multiple children with unique IDs', async () => {
    const result1 = await createChild(testInput);
    const result2 = await createChild(testInputFemale);

    expect(result1.id).not.toEqual(result2.id);
    expect(result1.name).toEqual('John Doe');
    expect(result2.name).toEqual('Jane Smith');

    // Verify both are in database
    const allChildren = await db.select()
      .from(childrenTable)
      .execute();

    expect(allChildren).toHaveLength(2);
  });

  it('should set created_at and updated_at timestamps', async () => {
    const beforeCreation = new Date();
    const result = await createChild(testInput);
    const afterCreation = new Date();

    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.created_at.getTime()).toBeGreaterThanOrEqual(beforeCreation.getTime());
    expect(result.created_at.getTime()).toBeLessThanOrEqual(afterCreation.getTime());
    expect(result.updated_at.getTime()).toBeGreaterThanOrEqual(beforeCreation.getTime());
    expect(result.updated_at.getTime()).toBeLessThanOrEqual(afterCreation.getTime());
  });

  it('should handle birth dates correctly', async () => {
    const birthDate = new Date('2015-12-25');
    const input: CreateChildInput = {
      name: 'Christmas Baby',
      birth_date: birthDate,
      gender: 'female'
    };

    const result = await createChild(input);

    expect(result.birth_date).toEqual(birthDate);
    expect(result.birth_date.getFullYear()).toEqual(2015);
    expect(result.birth_date.getMonth()).toEqual(11); // December is month 11
    expect(result.birth_date.getDate()).toEqual(25);
  });
});