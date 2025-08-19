import { db } from '../db';
import { groupsTable, childrenTable, childGroupsTable } from '../db/schema';
import { type GroupWithChildren, type DeleteByIdInput } from '../schema';
import { eq } from 'drizzle-orm';

export const getGroupWithChildren = async (input: DeleteByIdInput): Promise<GroupWithChildren | null> => {
  try {
    // First, get the group
    const groups = await db.select()
      .from(groupsTable)
      .where(eq(groupsTable.id, input.id))
      .execute();

    if (groups.length === 0) {
      return null;
    }

    const group = groups[0];

    // Get all children associated with this group
    const childrenWithGroups = await db.select({
      child: childrenTable
    })
      .from(childrenTable)
      .innerJoin(childGroupsTable, eq(childrenTable.id, childGroupsTable.child_id))
      .where(eq(childGroupsTable.group_id, input.id))
      .execute();

    // Extract children from the joined result
    const children = childrenWithGroups.map(result => result.child);

    return {
      id: group.id,
      name: group.name,
      created_at: group.created_at,
      updated_at: group.updated_at,
      children: children
    };
  } catch (error) {
    console.error('Get group with children failed:', error);
    throw error;
  }
};