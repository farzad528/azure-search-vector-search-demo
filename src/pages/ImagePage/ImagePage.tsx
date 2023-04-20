import React, { useState } from "react";
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
import axios from "axios";
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

const apiUrl = process.env.REACT_APP_COGNITIVE_SERVICES_ENDPOINT;
const apiKey = process.env.REACT_APP_COGNITIVE_SERVICES_API_KEY;
const apiVersion = process.env.REACT_APP_COGNITIVE_SERVICES_API_VERSION;

async function generateImageQueryVector(queryVector: string) {
  const requestData = {
    text: queryVector,
  };
  const response = await axios.post(
    `${apiUrl}/computervision/retrieval:vectorizeText?api-version=${apiVersion}`,
    requestData,
    {
      headers: {
        "Content-Type": "application/json",
        "Ocp-Apim-Subscription-Key": apiKey,
      },
    }
  );
  const embeddings = response.data.vector;
  console.log(embeddings);
  return embeddings;
}

async function getImageSearchResults(vector: number[]) {
  const payload: any = {
    vector: {
      value: vector,
      fields: "imageVector",
      k: 10,
    },
    select: "title,imageUrl",
  };

  const url = `${process.env.REACT_APP_SEARCH_SERVICE_ENDPOINT}/indexes/${process.env.REACT_APP_INDEX_NAME}/docs/search?api-version=${process.env.REACT_APP_API_VERSION}`;
  const response = await axios.post(url, payload, {
    headers: {
      "Content-Type": "application/json",
      "api-key": `${process.env.REACT_APP_SEARCH_SERVICE_ADMIN_KEY ?? ""}`,
    },
  });

  return response.data;
}

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
      const queryVector = await generateImageQueryVector(searchQuery);
      setImageQueryVector(queryVector);
      const results = await getImageSearchResults(queryVector);
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
      <div className={styles.searchResultsContainer}>
        {searchResults.map((result: SearchResult) => (
          <Stack key={result.id} className={styles.imageSearchResultCard}>
            <div className={styles.imageContainer}>
              <img src={result.imageUrl} alt={result.title} />
            </div>
          </Stack>
        ))}
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
              Cognitive Services - Computer Vision Florence v4.0 preview
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
