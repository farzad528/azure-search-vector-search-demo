export interface SearchRequest {
    vector: {
        value: number[];
        fields: string;
        k: number;
    };
    select?: string;
    search?: string;
    filter?: string;
    queryType?: string;
    queryLanguage?: string;
    semanticConfiguration?: string;
    captions?: string;
    answers?: string;
    highlightPreTag?: string;
    highlightPostTag?: string;
}

export interface SearchResponse<T extends SearchResult> {
    "@odata.context": string;
    "@search.answers"?: SemanticAnswer[];
    value: T[];
}

export interface SemanticAnswer {
    key: string;
    text: string;
    highlights: string;
    score: number;
}

interface SearchResult {
    "@search.score": number;
    "@search.rerankerScore"?: number;
    "@search.captions"?: SearchCaptions[];
}

interface SearchCaptions {
    text: string;
    highlights: string;
}

export interface TextSearchResult extends SearchResult {
    id: string;
    title: string;
    titleVector: number[];
    content: string;
    contentVector: number[];
    category: string;
}

export interface ImageSearchResult extends SearchResult {
    id: string;
    title: string;
    imageUrl: string;
}

export interface TextEmbeddingResponse {
    data: {
        embedding: number[];
    }[];
}

export interface ImageEmbeddingResponse {
    vector: number[];
}
