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
import styles from "./Vector.module.css";

interface SearchResult {
  "@search.score?": number;
  "@search.rerankerScore?": number;
  "@search.captions": SearchCaptions[];
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

const apiUrl = process.env.REACT_APP_OPENAI_SERVICE_ENDPOINT;
const apiKey = process.env.REACT_APP_OPENAI_API_KEY;
const deploymentName = process.env.REACT_APP_OPENAI_DEPLOYMENT_NAME;
const apiVersion = process.env.REACT_APP_OPENAI_API_VERSION;

async function generateTextQueryVector(queryVector: string) {
  const requestData = {
    input: queryVector,
  };
  const response = await axios.post(
    `${apiUrl}/openai/deployments/${deploymentName}/embeddings?api-version=${apiVersion}`,

    requestData,
    {
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
    }
  );
  const embeddings = response.data.data[0].embedding;
  console.log(embeddings);
  return embeddings;
}

async function getTextSearchResults(
  vector: number[],
  approach: string,
  searchQuery: string,
  useSemanticRanker: boolean,
  useSemanticCaptions: boolean
) {
  const payload: any = {
    vector: {
      value: vector,
      fields: "contentVector",
      k: 10,
    },
    select: "title,content",
  };

  // Add search query for hybrid search if needed
  if (approach === "hs") {
    payload.search = searchQuery;
  }

  // Add queryType and queryLanguage if useSemanticRanker is true
  if (useSemanticRanker) {
    payload.queryType = "semantic";
    payload.queryLanguage = "en-us";
    payload.semanticConfiguration = "my-semantic-config";
  }

  // Add captions, highlightPreTag, and highlightPostTag if useSemanticCaptions is true
  if (useSemanticCaptions) {
    payload.captions = "extractive";
    payload.highlightPreTag = "<b>";
    payload.highlightPostTag = "</b>";
  }

  const url = `${process.env.REACT_APP_SEARCH_SERVICE_ENDPOINT}/indexes/${process.env.REACT_APP_SEARCH_TEXT_INDEX_NAME}/docs/search?api-version=${process.env.REACT_APP_SEARCH_API_VERSION}`;
  const response = await axios.post(url, payload, {
    headers: {
      "Content-Type": "application/json",
      "api-key": `${process.env.REACT_APP_SEARCH_SERVICE_ADMIN_KEY ?? ""}`,
    },
  });

  return response.data;
}

export const Vector = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [textQueryVector, setTextQueryVector] = useState([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isConfigPanelOpen, setIsConfigPanelOpen] = useState(false);
  const [approach, setApproach] = useState<string>("vec");
  const [useSemanticRanker, setUseSemanticRanker] = useState<boolean>(false);
  const [useSemanticCaptions, setUseSemanticCaptions] =
    useState<boolean>(false);

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      setLoading(true);
      const queryVector = await generateTextQueryVector(searchQuery);
      setTextQueryVector(queryVector);
      const results = await getTextSearchResults(
        queryVector,
        approach,
        searchQuery,
        useSemanticRanker,
        useSemanticCaptions
      );
      console.log(results.value);
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
    setApproach(option?.key ?? "vec");
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
            placeholder="Type something here (e.g. networking services)"
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
          <Stack horizontal className={styles.searchResultCard}>
            <div key={result.id} className={styles.textContainer}>
              <p className={styles.searchResultCardTitle}> {result.title}</p>
              <p
                dangerouslySetInnerHTML={{
                  __html:
                    result["@search.captions"] &&
                    result["@search.captions"][0].highlights
                      ? result["@search.captions"][0].highlights
                      : result["@search.captions"] &&
                        result["@search.captions"][0].text
                      ? result["@search.captions"][0].text
                      : result.content,
                }}
              ></p>
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

        {textQueryVector && (
          <>
            <p>Embedding model name:</p>
            <code className={styles.textQueryVectorModel}>
              OpenAI text-embedding-ada-002
            </code>
            <p>
              Query vector:{" "}
              <code className={styles.textQueryVector}>
                {JSON.stringify(textQueryVector)}
              </code>
            </p>
          </>
        )}
      </Panel>
    </div>
  );
};
