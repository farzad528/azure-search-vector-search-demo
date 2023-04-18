import axios from 'axios';

export const getImageSearchResults = async (search: string) => {
  try {
    const payload: any = {
      search,
      count: "true",
      top: 20,
    };

    const url = `${process.env.REACT_APP_SEARCH_SERVICE_ENDPOINT}/indexes/${process.env.REACT_APP_INDEX_NAME}/docs/search?api-version=${process.env.REACT_APP_API_VERSION}`;
    //const url = `https://azsfonh.eastus2.cloudapp.azure.com/indexes/fsunavala-vector-index-images?api-version=${process.env.REACT_APP_API_VERSION}&service=vectordemo`;
    const response = await axios.post(url, payload, {
      headers: {
        "Content-Type": "application/json",
        "api-key": `${process.env.REACT_APP_SEARCH_SERVICE_ADMIN_KEY ?? ""}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};