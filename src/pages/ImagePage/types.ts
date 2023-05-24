export interface SearchResult {
  "@search.score?": number;
  "@search.rerankerScore?": number;
  imageUrl: string;
  title: string;
  id: string;
}
