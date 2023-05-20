import React, { useState, useCallback } from "react";
import { Spinner, Stack, TextField } from "@fluentui/react";
import { DismissCircle24Filled, Search24Regular } from "@fluentui/react-icons";
import axios from "axios";
import styles from "./ImagePage.module.css";

interface SearchResult {
  "@search.score?": number;
  "@search.rerankerScore?": number;
  imageUrl: string;
  title: string;
  id: string;
}

const generateImageQueryVector = async (queryVector: string) => {
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

const getImageSearchResults = async (vector: number[]) => {
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

export const ImagePage = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  const handleOnKeyDown = useCallback(
    async (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (searchQuery.length === 0) {
          setSearchResults([]);
          return;
        }

        setLoading(true);
        const queryVector = await generateImageQueryVector(searchQuery);
        const results = await getImageSearchResults(queryVector);
        setSearchResults(results.value);
        setLoading(false);
      }
    },
    [searchQuery]
  );

  const handleOnChange = useCallback(
    (
      _ev: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
      newValue?: string
    ) => {
      setSearchQuery(newValue ?? "");
    },
    []
  );

  return (
    <div className={styles.vectorContainer}>
      <div>
        <Stack horizontal className={styles.questionInputContainer}>
          <Search24Regular />
          <TextField
            className={styles.questionInputTextArea}
            resizable={false}
            borderless
            value={searchQuery}
            placeholder="Type something here (e.g. fancy shoes)"
            onChange={handleOnChange}
            onKeyDown={handleOnKeyDown}
          />
          {searchQuery.length > 0 && (
            <DismissCircle24Filled onClick={() => setSearchQuery("")} />
          )}
        </Stack>
      </div>
      <div className={styles.spinner}>
        {loading && <Spinner label="Getting results" />}
      </div>
      <div className={styles.searchResultsContainer}>
        {searchResults.map((result: SearchResult) => (
          <Stack key={result.id} className={styles.imageSearchResultCard}>
            <div className={styles.imageContainer}>
              <img src={result.imageUrl} alt={result.title} />
            </div>
          </Stack>
        ))}
      </div>
    </div>
  );
};
