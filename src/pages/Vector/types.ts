// export interface SearchResult {
//   "@search.score?": number;
//   "@search.rerankerScore?": number;
//   "@search.captions": SearchCaptions[];
//   category: string;
//   content: string;
//   title: string;
//   id: string;
// }
export interface SearchResult {
  "@search.score": number;
  "@search.rerankerScore": number;
  "@search.captions": SearchCaptions[];
  title: string;
  content: string;
  category: string;
  key: string;
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
