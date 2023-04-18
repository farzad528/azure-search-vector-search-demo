import axios from "axios";

export const getSearchResults = async (search: string) => {
  try {
    const payload: any = {
      search,
      queryType: "simple",
      count: "true",
      top: 20,
      highlightPreTag: "<b>",
      highlightPostTag: "</b>",
      highlight: "content",
    };

    const url = `${process.env.REACT_APP_SEARCH_SERVICE_ENDPOINT}/indexes/athlete-index/docs/search?api-version=${process.env.REACT_APP_API_VERSION}`;

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
