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
import {
  DismissCircle24Filled,
  Search24Regular,
  SearchInfo20Regular,
} from "@fluentui/react-icons";
import { useState } from "react";
import generateImageQueryVector from "../../api/generateImageQueryVector";
import { getImageSearchResults } from "../../api/imageSearch";
import styles from "./ImagePage.module.css";
import noResults from "../../assets/no-results.svg";

interface SearchResult {
  "@search.score?": number;
  "@search.rerankerScore?": number;
  imageUrl: string;
  title: string;
  id: string;
}

const approaches: IChoiceGroupOption[] = [
  { key: "vec", text: "Vectors Only" },
  { key: "vecf", text: "Vectors with Filter" },
  { key: "hs", text: "Vectors + Text (Hybrid Search)" },
];

export const ImagePage = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [imageQueryVector, setImageQueryVector] = useState([]);
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
      // Pass searchQuery value to generateImageQueryVector function and await the result
      const queryVector = await generateImageQueryVector(searchQuery);
      setImageQueryVector(queryVector);
      setApiRequest(true);
      const results = await getImageSearchResults(searchQuery);
      console.log(results.value);
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
            placeholder="Type something here (e.g. brown suede shoes)"
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
      {/* {!loading && count === 0 && apiRequest ? (
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
        <p>Type something to do a vector search over images!</p>
      )} */}
      <div className={styles.searchResultsContainer}>
        <Stack className={styles.imageSearchResultCard}>
          <div className={styles.imageContainer}>
            <img src="https://images.pexels.com/photos/1643113/pexels-photo-1643113.jpeg" alt="brown mountains" />
          </div>
        </Stack>
        <Stack className={styles.imageSearchResultCard}>
          <div className={styles.imageContainer}>
            <img src="https://images.pexels.com/photos/1785493/pexels-photo-1785493.jpeg" alt="brown mountains" />
          </div>
        </Stack>
        <Stack className={styles.imageSearchResultCard}>
          <div className={styles.imageContainer}>
            <img src="https://images.pexels.com/photos/2686558/pexels-photo-2686558.jpeg" alt="brown mountains" />
          </div>
        </Stack>
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

        {imageQueryVector && (
          <>
            <p>Embedding model name:</p>
            <code className={styles.imageQueryVectorModel}>
              Cognitive Services Version 4.0 preview
            </code>
            <p>
              Query vector:{" "}
              <code className={styles.imageQueryVector}>
                {JSON.stringify(imageQueryVector)}
              </code>
            </p>
          </>
        )}
      </Panel>
    </div>
  );
};
