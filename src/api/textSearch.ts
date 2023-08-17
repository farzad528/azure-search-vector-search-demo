import axios from "axios";
import { TextEmbeddingResponse, SearchRequest, SearchResponse, TextSearchResult } from "./types";

export const generateTextQueryVector = async (queryVector: string): Promise<number[]> => {
    const requestData = {
        input: queryVector
    };

    const response = await axios.post<TextEmbeddingResponse>(
        `${import.meta.env.VITE_OPENAI_SERVICE_ENDPOINT}/openai/deployments/${import.meta.env.VITE_OPENAI_DEPLOYMENT_NAME}/embeddings?api-version=${
            import.meta.env.VITE_OPENAI_API_VERSION
        }`,
        requestData,
        {
            headers: {
                "Content-Type": "application/json",
                "api-key": `${import.meta.env.VITE_OPENAI_API_KEY ?? ""}`
            }
        }
    );

    const embeddings = response.data.data[0].embedding;
    return embeddings;
};

export const getTextSearchResults = async (
    vector: number[],
    approach: string,
    searchQuery: string,
    useSemanticCaptions: boolean,
    filterText: string
): Promise<SearchResponse<TextSearchResult>> => {
    const payload: SearchRequest = {
        // Optionally, select parameters to reduce the response payload size
        // select: "title, content, category",
    };

    if (!approach || approach === "text") {
        payload.search = searchQuery;
    } else {
        payload.vector = {
            value: vector,
            // Change your desired fields here
            fields: "contentVector",
            k: 10
        };

        if (approach === "hs") {
            payload.search = searchQuery;
        }

        if (approach === "vecf") {
            payload.filter = filterText;
        }

        if (approach === "hssr") {
            payload.search = searchQuery;
            payload.queryType = "semantic";
            payload.queryLanguage = "en-us";
            payload.semanticConfiguration = "my-semantic-config";
            if (useSemanticCaptions) {
                payload.captions = "extractive";
                payload.answers = "extractive";
                payload.highlightPreTag = "<b>";
                payload.highlightPostTag = "</b>";
            }
        }
    }

    const url = `${import.meta.env.VITE_SEARCH_SERVICE_ENDPOINT}/indexes/${import.meta.env.VITE_SEARCH_TEXT_INDEX_NAME}/docs/search?api-version=${
        import.meta.env.VITE_SEARCH_API_VERSION
    }`;

    const response = await axios.post<SearchResponse<TextSearchResult>>(url, payload, {
        headers: {
            "Content-Type": "application/json",
            "api-key": `${import.meta.env.VITE_SEARCH_SERVICE_ADMIN_KEY ?? ""}`
        }
    });

    return response.data;
};
