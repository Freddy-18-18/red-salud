export interface DocumentChunk {
    id?: string;
    content: string;
    metadata: {
        source: string;
        title?: string;
        url?: string;
        page?: number;
        [key: string]: any;
    };
    embedding?: number[];
    similarity?: number;
}

export interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export interface RagContext {
    chunks: DocumentChunk[];
    summary?: string;
}
