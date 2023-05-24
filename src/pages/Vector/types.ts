export interface SearchResult {
  "@search.score?": number;
  "@search.rerankerScore?": number;
  "@search.captions": SearchCaptions[];
  category: string;
  content: string;
  title: string;
  id: string;
}

export interface SearchCaptions {
  text: string;
  highlights: string;
}

export interface SemanticAnswer {
  key: string;
  text: string;
  highlights: string;
  score: number;
}
