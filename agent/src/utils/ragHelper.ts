import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { FaissStore } from "@langchain/community/vectorstores/faiss";
import { Document } from "@langchain/core/documents";

interface WorkItem {
  id: number;
  title: string;
  type: string;
  state: string;
  assignedTo: string;
  area: string;
  tags: string[];
  acceptanceCriteria?: string[];
  severity?: string;
  children?: any[];
  links?: any[];
}

interface BacklogResponse {
  items: string | WorkItem[];
}

export class AgentRAGHelper {
  private vectorStore: FaissStore | null = null;
  private initialized: boolean = false;

  async initialize(backlogData: BacklogResponse): Promise<void> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required for RAG");
    }

    const embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey,
      modelName: "embedding-001",
    });

    // Parse items if it's a JSON string
    let items: WorkItem[];
    if (typeof backlogData.items === 'string') {
      const parsed = JSON.parse(backlogData.items);
      items = parsed.items || parsed;
    } else {
      items = backlogData.items;
    }

    const documents = this.backlogToDocuments(items);
    this.vectorStore = await FaissStore.fromDocuments(documents, embeddings);
    this.initialized = true;
    console.log(`✓ Agent RAG initialized with ${documents.length} documents`);
  }

  private backlogToDocuments(items: WorkItem[]): Document[] {
    return items.map((item) => {
      const contentParts = [
        `ID: ${item.id}`,
        `Title: ${item.title}`,
        `Type: ${item.type}`,
        `State: ${item.state}`,
        `Assigned to: ${item.assignedTo}`,
        `Area: ${item.area}`,
        `Tags: ${item.tags.join(", ")}`,
      ];

      if (item.severity) {
        contentParts.push(`Severity: ${item.severity}`);
      }

      if (item.acceptanceCriteria && item.acceptanceCriteria.length > 0) {
        contentParts.push(
          `Acceptance Criteria:\n${item.acceptanceCriteria.map((ac, i) => `${i + 1}. ${ac}`).join("\n")}`
        );
      }

      if (item.children && item.children.length > 0) {
        contentParts.push(
          `Child items: ${item.children.map(c => `${c.title} (${c.state})`).join(", ")}`
        );
      }

      const content = contentParts.filter(Boolean).join("\n");

      return new Document({
        pageContent: content,
        metadata: {
          id: item.id,
          title: item.title,
          type: item.type,
          state: item.state,
          assignedTo: item.assignedTo,
          area: item.area,
          tags: item.tags,
        },
      });
    });
  }

  async search(query: string, limit: number = 5): Promise<any[]> {
    if (!this.initialized || !this.vectorStore) {
      throw new Error("RAG not initialized. Call initialize() first.");
    }

    const results = await this.vectorStore.similaritySearch(query, limit);
    
    return results.map((doc) => ({
      id: doc.metadata.id,
      title: doc.metadata.title,
      type: doc.metadata.type,
      state: doc.metadata.state,
      assignedTo: doc.metadata.assignedTo,
      area: doc.metadata.area,
      tags: doc.metadata.tags,
      excerpt: doc.pageContent.substring(0, 300) + "...",
    }));
  }

  isInitialized(): boolean {
    return this.initialized;
  }
}
