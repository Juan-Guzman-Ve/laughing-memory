import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface WorkItem {
  id: number;
  type: string;
  title: string;
  state: string;
  assignedTo: string;
  area: string;
  tags?: string[];
  severity?: string;
  acceptanceCriteria?: string[];
  children?: Array<{
    id: number;
    type: string;
    title: string;
    state: string;
    assignedTo?: string;
    severity?: string;
  }>;
  links?: Array<{
    type: string;
    id: string;
    repo?: string;
    status?: string;
  }>;
}

export interface BacklogData {
  iteration: {
    name: string;
    startDate: string;
    endDate: string;
  };
  items: WorkItem[];
}

/**
 * Load backlog data from JSON file
 */
export async function loadBacklog(): Promise<BacklogData> {
  const dataPath = path.join(__dirname, '../../../data/backlog.json');
  const content = await fs.readFile(dataPath, 'utf-8');
  return JSON.parse(content);
}

/**
 * Get all items in the current iteration
 */
export async function listCurrentIterationItems(): Promise<string> {
  const backlog = await loadBacklog();
  
  const summary = backlog.items.map(item => {
    return `ID: ${item.id} | Type: ${item.type} | Title: ${item.title} | State: ${item.state} | Owner: ${item.assignedTo}${item.severity ? ` | Severity: ${item.severity}` : ''}`;
  }).join('\n');

  return `Current Iteration: ${backlog.iteration.name} (${backlog.iteration.startDate} to ${backlog.iteration.endDate})\n\n${summary}`;
}

/**
 * Get detailed information about a specific work item by ID
 */
export async function getWorkItemById(workItemId: number): Promise<string> {
  const backlog = await loadBacklog();
  const item = backlog.items.find(i => i.id === workItemId);

  if (!item) {
    return `Work item ${workItemId} not found in current iteration.`;
  }

  let details = `ID: ${item.id}\n`;
  details += `Type: ${item.type}\n`;
  details += `Title: ${item.title}\n`;
  details += `State: ${item.state}\n`;
  details += `Assigned To: ${item.assignedTo}\n`;
  details += `Area: ${item.area}\n`;
  
  if (item.severity) {
    details += `Severity: ${item.severity}\n`;
  }
  
  if (item.tags && item.tags.length > 0) {
    details += `Tags: ${item.tags.join(', ')}\n`;
  }

  if (item.acceptanceCriteria && item.acceptanceCriteria.length > 0) {
    details += `\nAcceptance Criteria:\n`;
    item.acceptanceCriteria.forEach((criteria, idx) => {
      details += `  ${idx + 1}. ${criteria}\n`;
    });
  }

  if (item.children && item.children.length > 0) {
    details += `\nChild Items:\n`;
    item.children.forEach(child => {
      details += `  - ID: ${child.id} | Type: ${child.type} | Title: ${child.title} | State: ${child.state}`;
      if (child.assignedTo) details += ` | Assigned: ${child.assignedTo}`;
      if (child.severity) details += ` | Severity: ${child.severity}`;
      details += '\n';
    });
  }

  if (item.links && item.links.length > 0) {
    details += `\nLinked Items:\n`;
    item.links.forEach(link => {
      details += `  - ${link.type}: ${link.id}`;
      if (link.repo) details += ` (${link.repo})`;
      if (link.status) details += ` [${link.status}]`;
      details += '\n';
    });
  }

  return details;
}
