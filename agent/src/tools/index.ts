import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { listCurrentIterationItems, getWorkItemById } from './backlogTools.js';

/**
 * Tool for listing all items in the current iteration
 */
export const listItemsTool = new DynamicStructuredTool({
  name: 'list_current_iteration_items',
  description: 'Lists all work items (user stories, tasks, bugs) in the current sprint iteration with their ID, type, title, state, and owner. Use this when the user asks about items in the current sprint or iteration.',
  schema: z.object({}),
  func: async () => {
    return await listCurrentIterationItems();
  },
});

/**
 * Tool for getting detailed information about a specific work item
 */
export const getWorkItemTool = new DynamicStructuredTool({
  name: 'get_work_item_by_id',
  description: 'Retrieves detailed information about a specific work item by its ID, including title, state, acceptance criteria, child items, and linked pull requests. Use this when the user asks about a specific work item number.',
  schema: z.object({
    workItemId: z.number().describe('The numeric ID of the work item to retrieve'),
  }),
  func: async ({ workItemId }) => {
    return await getWorkItemById(workItemId);
  },
});

export const informationalTools = [listItemsTool, getWorkItemTool];
