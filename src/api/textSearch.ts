import axios from "axios";

export const generateTextQueryVector = async (
  queryVector: string
): Promise<number[]> => {
  const requestData = {
    input: queryVector,
  };

  const response = await axios.post(
    `${process.env.REACT_APP_OPENAI_SERVICE_ENDPOINT}/openai/deployments/${process.env.REACT_APP_OPENAI_DEPLOYMENT_NAME}/embeddings?api-version=${process.env.REACT_APP_OPENAI_API_VERSION}`,
    requestData,
    {
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.REACT_APP_OPENAI_API_KEY,
      },
    }
  );

  const embeddings = response.data.data[0].embedding;
  return embeddings;
};

export const getTextSearchResults = async (
  vector: number[],
  approach: string,
  searchQuery: string,
  useSemanticRanker: boolean,
  useSemanticCaptions: boolean,
  filterText: string
): Promise<any> => {
  const payload: any = {
    vector: {
      value: vector,
      // Change your desired fields here
      fields: "contentVector",
      k: 10,
    },
    // Optionally, select parameters to reduce the response payload size
    // select: "title, content, category",
  };

  if (approach === "hs") {
    payload.search = searchQuery;
  }

  if (approach === "vecf") {
    payload.filter = filterText;
  }

  if (useSemanticRanker) {
    payload.queryType = "semantic";
    payload.queryLanguage = "en-us";
    payload.semanticConfiguration = "my-semantic-config";
  }

  if (useSemanticCaptions) {
    payload.captions = "extractive";
    payload.answers = "extractive";
    payload.highlightPreTag = "<b>";
    payload.highlightPostTag = "</b>";
  }

  const url = `${process.env.REACT_APP_SEARCH_SERVICE_ENDPOINT}/indexes/${process.env.REACT_APP_SEARCH_TEXT_INDEX_NAME}/docs/search?api-version=${process.env.REACT_APP_SEARCH_API_VERSION}`;

  const response = await axios.post(url, payload, {
    headers: {
      "Content-Type": "application/json",
      "api-key": `${process.env.REACT_APP_SEARCH_SERVICE_ADMIN_KEY ?? ""}`,
    },
  });

  return response.data;
};
