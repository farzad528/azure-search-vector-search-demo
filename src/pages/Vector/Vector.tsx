import { useState } from "react";
import {
  Checkbox,
  ChoiceGroup,
  DefaultButton,
  IChoiceGroupOption,
  Panel,
  Spinner,
  Stack,
  TextField,
} from "@fluentui/react";

import styles from "./Vector.module.css";
import {
  DismissCircle24Filled,
  Search24Regular,
  SearchInfo20Regular,
} from "@fluentui/react-icons";
import { getSearchResults } from "../../api/search";
import noResults from "../../assets/no-results.svg";
import generateQueryVector from "../../api/generateQueryVector";

interface SearchResult {
  "@search.score": number;
  "@search.rerankerScore?": number;
  "@search.captions"?: SearchCaptions[];
  "@search.highlights": any;
  url: string;
  content: string;
  title: string;
  id: string;
}

interface SearchCaptions {
  text: string;
  highlights: string;
}

const approaches: IChoiceGroupOption[] = [
  { key: "vec", text: "Vectors Only" },
  { key: "vecf", text: "Vectors with Filter" },
  { key: "hs", text: "Vectors + Text (Hybrid Search)" },
];

export const Vector = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [queryVector, setQueryVector] = useState([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [count, setCount] = useState<number>(0);
  const [searchResults, setSearchResults] = useState([]);
  const [isConfigPanelOpen, setIsConfigPanelOpen] = useState(false);
  const [approach, setApproach] = useState<string>();
  const [useSemanticRanker, setUseSemanticRanker] = useState<boolean>(true);
  const [useSemanticCaptions, setUseSemanticCaptions] =
    useState<boolean>(false);
  const [apiRequest, setApiRequest] = useState<boolean>(false);

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      setLoading(true);
      // Pass searchQuery value to generateQueryVector function and await the result
      const queryVector = await generateQueryVector(searchQuery);
      setQueryVector(queryVector);
      setApiRequest(true);
      const results = await getSearchResults(searchQuery);
      console.log(results);
      setCount(results["@odata.count"]);
      setSearchResults(results.value);
      setLoading(false);
    }
  };

  const handleClear = () => {
    setSearchQuery("");
  };

  const handleOnChange = (
    _ev: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
    newValue?: string
  ) => {
    if (!newValue) {
      setSearchQuery("");
    } else if (newValue.length <= 1000) {
      setSearchQuery(newValue);
    }
  };

  const onApproachChange = (
    _ev?: React.FormEvent<HTMLElement | HTMLInputElement>,
    option?: IChoiceGroupOption
  ) => {
    setApproach(option?.key);
  };

  const onUseSemanticRankerChange = (
    _ev?: React.FormEvent<HTMLElement | HTMLInputElement>,
    checked?: boolean
  ) => {
    setUseSemanticRanker(!!checked);
  };

  const onUseSemanticCaptionsChange = (
    _ev?: React.FormEvent<HTMLElement | HTMLInputElement>,
    checked?: boolean
  ) => {
    setUseSemanticCaptions(!!checked);
  };

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
            placeholder="Type something here (e.g. vacations by bodies of water)"
            onChange={handleOnChange}
            onKeyDown={handleKeyDown}
          />
          <SearchInfo20Regular
            className={styles.settingsButton}
            onClick={() => setIsConfigPanelOpen(!isConfigPanelOpen)}
          />
          {searchQuery.length > 0 && (
            <DismissCircle24Filled onClick={handleClear} />
          )}
        </Stack>
      </div>
      <div className={styles.spinner}>
        {loading && <Spinner label="Getting results" />}
      </div>
      {!loading && count === 0 && apiRequest ? (
        <div className={styles.noResultsFound}>
          <img alt="no results" src={noResults} />
          <p>Bummer. No results found.</p>
          <p>Try rephrasing your search</p>
        </div>
      ) : count > 0 && apiRequest ? (
        <div className={styles.resultCount}>
          Showing {count} result
          {searchResults.length === 1 ? "" : "s"}
        </div>
      ) : (
        <p>Type something to do a vector search over text!</p>
      )}

      <div className={styles.searchResultsContainer}>
        {searchResults.map((searchResult: SearchResult) => {
          const score = searchResult["@search.score"];
          const scoreBgColor =
            score >= 10 && score <= 50
              ? "#a9d18e"
              : score >= 5 && score < 10
              ? "#f5b85a"
              : "#f29c8b";
          const scoreTextColor =
            score >= 10 && score <= 50
              ? "#3c6e47"
              : score >= 5 && score < 10
              ? "#9c6d2f"
              : "#6f2e1c";

          return (
            <Stack horizontal className={styles.searchResultCard}>
              <div key={searchResult.id} className="">
                <p className={styles.searchResultCardTitle}>
                  {searchResult.title}
                </p>
                <a
                  href={searchResult.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <p className={styles.searchResultCardUrl}>
                    {searchResult.url}
                  </p>
                </a>

                <p
                  className={styles.searchResultCardCaption}
                  dangerouslySetInnerHTML={{
                    __html: searchResult["@search.highlights"].content[0],
                  }}
                ></p>
              </div>
              <div className={styles.searchResultCardSimilarityScore}>
                <span>
                  similarity score:{" "}
                  <p
                    style={{
                      backgroundColor: scoreBgColor,
                      color: scoreTextColor,
                      padding: "0.25rem",
                      borderRadius: "0.5rem",
                      textAlign: "center",
                    }}
                  >
                    {searchResult["@search.score"]}
                  </p>{" "}
                </span>
              </div>
            </Stack>
          );
        })}
      </div>
      <Panel
        headerText="See Query Vector"
        isOpen={isConfigPanelOpen}
        isBlocking={false}
        onDismiss={() => setIsConfigPanelOpen(false)}
        closeButtonAriaLabel="Close"
        onRenderFooterContent={() => (
          <DefaultButton onClick={() => setIsConfigPanelOpen(false)}>
            Close
          </DefaultButton>
        )}
        isFooterAtBottom={true}
      >
        <ChoiceGroup
          label="Approach"
          options={approaches}
          defaultSelectedKey="vec"
          onChange={onApproachChange}
        />
        {approach === "hs" && (
          <>
            <Checkbox
              className={styles.vectorSettingsSeparator}
              checked={useSemanticRanker}
              label="Use semantic ranker for retrieval"
              onChange={onUseSemanticRankerChange}
            />
            <Checkbox
              className={styles.vectorSettingsSeparator}
              checked={useSemanticCaptions}
              label="Use semantic captions"
              onChange={onUseSemanticCaptionsChange}
              disabled={!useSemanticRanker}
            />
          </>
        )}

        {queryVector && (
          <p>
            Query vector:{" "}
            <code className={styles.queryVector}>
              {JSON.stringify(queryVector)}
            </code>
          </p>
        )}
      </Panel>
    </div>
  );
};
