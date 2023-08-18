import axios from "axios";
import { ImageEmbeddingResponse, ImageSearchResult, SearchRequest, SearchResponse } from "./types";

export const generateImageQueryVector = async (queryVector: string): Promise<number[]> => {
    const requestData = {
        text: queryVector
    };

    const response = await axios.post<ImageEmbeddingResponse>(
        `${import.meta.env.VITE_COGNITIVE_SERVICES_ENDPOINT}/computervision/retrieval:vectorizeText?api-version=${
            import.meta.env.VITE_COGNITIVE_SERVICES_API_VERSION
        }`,
        requestData,
        {
            headers: {
                "Content-Type": "application/json",
                "Ocp-Apim-Subscription-Key": `${import.meta.env.VITE_COGNITIVE_SERVICES_API_KEY ?? ""}`
            }
        }
    );

    const embeddings = response.data.vector;
    return embeddings;
};

export const getImageSearchResults = async (vector: number[]): Promise<SearchResponse<ImageSearchResult>> => {
    const payload: SearchRequest = {
        vector: {
            value: vector,
            fields: "imageVector",
            k: 3
        },
        select: "title,imageUrl"
    };

    const url = `${import.meta.env.VITE_SEARCH_SERVICE_ENDPOINT}/indexes/${import.meta.env.VITE_SEARCH_IMAGE_INDEX_NAME}/docs/search?api-version=${
        import.meta.env.VITE_SEARCH_API_VERSION
    }&model-version=${import.meta.env.VITE_SEARCH_MODEL_VERSION}`;
    const response = await axios.post<SearchResponse<ImageSearchResult>>(url, payload, {
        headers: {
            "Content-Type": "application/json",
            "api-key": `${import.meta.env.VITE_SEARCH_SERVICE_ADMIN_KEY ?? ""}`
        }
    });

    return response.data;
};
