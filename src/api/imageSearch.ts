import axios from "axios";  
  
export const generateImageQueryVector = async (queryVector: string) => {
  const requestData = {
    text: queryVector,
  };
  const response = await axios.post(
    `${process.env.REACT_APP_COGNITIVE_SERVICES_ENDPOINT}/computervision/retrieval:vectorizeText?api-version=${process.env.REACT_APP_COGNITIVE_SERVICES_API_VERSION}`,
    requestData,
    {
      headers: {
        "Content-Type": "application/json",
        "Ocp-Apim-Subscription-Key":
          process.env.REACT_APP_COGNITIVE_SERVICES_API_KEY,
      },
    }
  );
  const embeddings = response.data.vector;
  return embeddings;
};

export const getImageSearchResults = async (vector: number[]) => {
  const payload: any = {
    vector: {
      value: vector,
      fields: "imageVector",
      k: 3,
    },
    select: "title,imageUrl",
  };

  const url = `${process.env.REACT_APP_SEARCH_SERVICE_ENDPOINT}/indexes/${process.env.REACT_APP_SEARCH_IMAGE_INDEX_NAME}/docs/search?api-version=${process.env.REACT_APP_SEARCH_API_VERSION}`;
  const response = await axios.post(url, payload, {
    headers: {
      "Content-Type": "application/json",
      "api-key": `${process.env.REACT_APP_SEARCH_SERVICE_ADMIN_KEY ?? ""}`,
    },
  });

  return response.data;
};
