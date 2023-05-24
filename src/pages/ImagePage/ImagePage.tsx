import React, { useState, useCallback } from "react";
import { Spinner, Stack, TextField } from "@fluentui/react";
import { DismissCircle24Filled, Search24Regular } from "@fluentui/react-icons";
import styles from "./ImagePage.module.css";
import { SearchResult } from "./types";
import {
  generateImageQueryVector,
  getImageSearchResults,
} from "../../api/imageSearch";

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
