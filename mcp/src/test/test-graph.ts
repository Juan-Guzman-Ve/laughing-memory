import { KnowledgeGraph } from '../server/graphHelper.js';
import { loadBacklog } from '../server/backlogHelper.js';

/**
 * Test Knowledge Graph - structural queries
 */
async function testKnowledgeGraph() {
  console.log('=== Testing Knowledge Graph ===\n');
  
  try {
    const backlogData = await loadBacklog();
    console.log(`Loaded ${backlogData.items.length} work items\n`);
    
    const kg = new KnowledgeGraph();
    kg.initialize(backlogData);
    
    const stats = kg.getStats();
    console.log('Knowledge Graph built:');
    console.log(`  Nodes: ${stats.totalNodes}, Edges: ${stats.totalEdges}`);
    console.log(`  Types: UserStory=${stats.byType.UserStory}, Task=${stats.byType.Task}, Bug=${stats.byType.Bug}\n`);
    
    // Test by tag
    console.log('Test: Get items with "security" tag');
    const securityItems = kg.getByTag('security');
    console.log(`Found ${securityItems.length} items`);
    if (securityItems.length > 0) {
      console.log(`  - ${securityItems[0].title} (${securityItems[0].type})`);
    }
    console.log();
    
    // Test by type
    console.log('Test: Get all Bugs');
    const bugs = kg.getByType('Bug');
    console.log(`Found ${bugs.length} bugs`);
    if (bugs.length > 0) {
      console.log(`  - ${bugs[0].title}`);
    }
    if (bugs.length > 1) {
      console.log(`  - ${bugs[1].title}`);
    }
    console.log();
    
    // Test by state
    console.log('Test: Get Active items');
    const activeItems = kg.getByState('Active');
    console.log(`Found ${activeItems.length} active items\n`);
    
    console.log('✓ Knowledge Graph test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testKnowledgeGraph().catch(console.error);
