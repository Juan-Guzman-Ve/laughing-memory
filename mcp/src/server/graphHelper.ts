/**
 * Graph Node - represents a work item in the knowledge graph
 */
export interface GraphNode {
  id: number;
  type: string;
  title: string;
  state: string;
  assignedTo?: string;
  area: string;
  tags: string[];
  priority?: string;
  iterationPath?: string;
}

/**
 * Graph Edge - represents a relationship between work items
 */
export interface GraphEdge {
  from: number;
  to: number;
  type: 'parent-child' | 'related' | 'pr-link' | 'blocks' | 'depends-on';
}

/**
 * Knowledge Graph - structural queries over work item relationships
 * Provides methods to query parent-child relationships, filter by area/assignee/tags
 */
export class KnowledgeGraph {
  private nodes: Map<number, GraphNode> = new Map();
  private edges: GraphEdge[] = [];
  private initialized: boolean = false;

  /**
   * Initialize the knowledge graph from backlog data
   * @param backlogData - The backlog data structure from backlog.json
   */
  initialize(backlogData: any): void {
    if (this.initialized) {
      console.log('Knowledge Graph already initialized');
      return;
    }

    try {
      console.log('Initializing Knowledge Graph...');
      
      // Build nodes from work items
      for (const item of backlogData.items) {
        this.nodes.set(item.id, {
          id: item.id,
          type: item.type,
          title: item.title,
          state: item.state,
          assignedTo: item.assignedTo,
          area: item.areaPath,
          tags: item.tags || [],
          priority: item.priority,
          iterationPath: item.iterationPath,
        });

        // Build edges from parent-child relationships
        if (item.children && item.children.length > 0) {
          for (const child of item.children) {
            this.edges.push({
              from: item.id,
              to: child.id,
              type: 'parent-child',
            });
          }
        }

        // Build edges from PR links
        if (item.pullRequests && item.pullRequests.length > 0) {
          for (const pr of item.pullRequests) {
            if (pr.prNumber) {
              this.edges.push({
                from: item.id,
                to: pr.prNumber,
                type: 'pr-link',
              });
            }
          }
        }
      }

      this.initialized = true;
      console.log(`✓ Knowledge Graph initialized: ${this.nodes.size} nodes, ${this.edges.length} edges`);
    } catch (error) {
      console.error('Failed to initialize Knowledge Graph:', error);
      throw new Error(`Knowledge Graph initialization failed: ${error}`);
    }
  }

  /**
   * Get all child work items of a parent
   * @param parentId - ID of the parent work item
   * @returns Array of child work items
   */
  getChildren(parentId: number): GraphNode[] {
    const childIds = this.edges
      .filter(e => e.from === parentId && e.type === 'parent-child')
      .map(e => e.to);
    
    return childIds
      .map(id => this.nodes.get(id))
      .filter(n => n !== undefined) as GraphNode[];
  }

  /**
   * Get the parent of a work item
   * @param childId - ID of the child work item
   * @returns Parent work item or null if none exists
   */
  getParent(childId: number): GraphNode | null {
    const parentEdge = this.edges.find(
      e => e.to === childId && e.type === 'parent-child'
    );
    
    if (!parentEdge) {
      return null;
    }
    
    return this.nodes.get(parentEdge.from) || null;
  }

  /**
   * Get all work items in a specific area
   * @param area - Area path to filter by
   * @returns Array of work items in the area
   */
  getByArea(area: string): GraphNode[] {
    return Array.from(this.nodes.values())
      .filter(n => n.area && n.area.toLowerCase().includes(area.toLowerCase()));
  }

  /**
   * Get all work items assigned to a specific person
   * @param assignee - Name of the assignee
   * @returns Array of work items assigned to the person
   */
  getByAssignee(assignee: string): GraphNode[] {
    return Array.from(this.nodes.values())
      .filter(n => n.assignedTo && n.assignedTo.toLowerCase().includes(assignee.toLowerCase()));
  }

  /**
   * Get all work items with a specific tag
   * @param tag - Tag to filter by
   * @returns Array of work items with the tag
   */
  getByTag(tag: string): GraphNode[] {
    return Array.from(this.nodes.values())
      .filter(n => n.tags.some(t => t.toLowerCase().includes(tag.toLowerCase())));
  }

  /**
   * Get all work items of a specific type
   * @param type - Type to filter by (UserStory, Task, Bug)
   * @returns Array of work items of the type
   */
  getByType(type: string): GraphNode[] {
    return Array.from(this.nodes.values())
      .filter(n => n.type.toLowerCase() === type.toLowerCase());
  }

  /**
   * Get all work items in a specific state
   * @param state - State to filter by (New, Active, Resolved, Closed)
   * @returns Array of work items in the state
   */
  getByState(state: string): GraphNode[] {
    return Array.from(this.nodes.values())
      .filter(n => n.state.toLowerCase() === state.toLowerCase());
  }

  /**
   * Get a specific work item by ID
   * @param id - Work item ID
   * @returns Work item or null if not found
   */
  getById(id: number): GraphNode | null {
    return this.nodes.get(id) || null;
  }

  /**
   * Get all work items (useful for counting, listing)
   * @returns Array of all work items
   */
  getAllNodes(): GraphNode[] {
    return Array.from(this.nodes.values());
  }

  /**
   * Get all edges (relationships)
   * @returns Array of all edges
   */
  getAllEdges(): GraphEdge[] {
    return [...this.edges];
  }

  /**
   * Check if Knowledge Graph is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Get graph statistics
   */
  getStats() {
    return {
      totalNodes: this.nodes.size,
      totalEdges: this.edges.length,
      byType: {
        UserStory: this.getByType('UserStory').length,
        Task: this.getByType('Task').length,
        Bug: this.getByType('Bug').length,
      },
      byState: {
        New: this.getByState('New').length,
        Active: this.getByState('Active').length,
        Resolved: this.getByState('Resolved').length,
        Closed: this.getByState('Closed').length,
      }
    };
  }
}
