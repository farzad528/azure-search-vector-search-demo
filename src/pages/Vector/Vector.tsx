import React, { useState, useCallback, useMemo } from "react";
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
  Settings20Regular,
} from "@fluentui/react-icons";
import axios from "axios";
import styles from "./Vector.module.css";

interface SearchResult {
  "@search.score?": number;
  "@search.rerankerScore?": number;
  "@search.captions": SearchCaptions[];
  category: string;
  content: string;
  title: string;
  id: string;
}

interface SearchCaptions {
  text: string;
  highlights: string;
}

interface SemanticAnswer {
  key: string;
  text: string;
  highlights: string;
  score: number;
}

const generateTextQueryVector = async (
  queryVector: string
): Promise<number[]> => {
  const requestData = {
    input: queryVector,
  };

  const response = await axios.post(
    `${process.env.REACT_APP_OPENAI_SERVICE_ENDPOINT}/openai/deployments/${process.env.REACT_APP_OPENAI_DEPLOYMENT_NAME}/embeddings?api-version=${process.env.REACT_APP_OPENAI_API_VERSION}`,
    requestData,
    {
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.REACT_APP_OPENAI_API_KEY,
      },
    }
  );

  const embeddings = response.data.data[0].embedding;
  return embeddings;
};

const getTextSearchResults = async (
  vector: number[],
  approach: string,
  searchQuery: string,
  useSemanticRanker: boolean,
  useSemanticCaptions: boolean,
  filterText: string
): Promise<any> => {
  const payload: any = {
    vector: {
      value: vector,
      fields: "contentVector",
      k: 10,
    },
    select: "title,content, category",
  };

  if (approach === "hs") {
    payload.search = searchQuery;
  }

  if (approach === "vecf") {
    payload.filter = filterText;
  }

  if (useSemanticRanker) {
    payload.queryType = "semantic";
    payload.queryLanguage = "en-us";
    payload.semanticConfiguration = "my-semantic-config";
  }

  if (useSemanticCaptions) {
    payload.captions = "extractive";
    payload.answers = "extractive";
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
};

const Vector: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [textQueryVector, setTextQueryVector] = useState<number[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [semanticAnswer, setSemanticAnswer] = useState<SemanticAnswer | null>(
    null
  );
  const [isConfigPanelOpen, setIsConfigPanelOpen] = useState<boolean>(false);
  const [approach, setApproach] = useState<string>("vec");
  const [filterText, setFilterText] = useState<string>("");
  const [useSemanticRanker, setUseSemanticRanker] = useState<boolean>(false);
  const [useSemanticCaptions, setUseSemanticCaptions] =
    useState<boolean>(false);

  const approaches: IChoiceGroupOption[] = useMemo(
    () => [
      { key: "vec", text: "Vectors Only" },
      { key: "vecf", text: "Vectors with Filter" },
      { key: "hs", text: "Vectors + Text (Hybrid Search)" },
    ],
    []
  );

  const handleOnKeyDown = useCallback(
    async (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (searchQuery.length === 0) {
          setSearchResults([]);
          return;
        }

        setLoading(true);
        const queryVector = await generateTextQueryVector(searchQuery);
        setTextQueryVector(queryVector);
        const results = await getTextSearchResults(
          queryVector,
          approach,
          searchQuery,
          useSemanticRanker,
          useSemanticCaptions,
          filterText
        );
        setSearchResults(results.value);
        setSemanticAnswer(
          results["@search.answers"] && results["@search.answers"][0]
            ? results["@search.answers"][0]
            : null
        );
        setLoading(false);
      }
    },
    [searchQuery, approach, useSemanticRanker, useSemanticCaptions, filterText]
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

  const onApproachChange = useCallback(
    (
      _ev?: React.FormEvent<HTMLElement | HTMLInputElement>,
      option?: IChoiceGroupOption
    ) => {
      setApproach(option?.key ?? "vec");
    },
    []
  );

  const onUseSemanticRankerChange = useCallback(
    (
      _ev?: React.FormEvent<HTMLElement | HTMLInputElement>,
      checked?: boolean
    ) => {
      setUseSemanticRanker(!!checked);
    },
    []
  );

  const onUseSemanticCaptionsChange = useCallback(
    (
      _ev?: React.FormEvent<HTMLElement | HTMLInputElement>,
      checked?: boolean
    ) => {
      setUseSemanticCaptions(!!checked);
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
            placeholder="Type something here (e.g. networking services)"
            onChange={handleOnChange}
            onKeyDown={handleOnKeyDown}
          />
          <Settings20Regular
            className={styles.settingsButton}
            onClick={() => setIsConfigPanelOpen(!isConfigPanelOpen)}
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
        {semanticAnswer && (
          <Stack horizontal className={styles.semanticAnswerCard}>
            <div className={styles.textContainer}>
              <p
                dangerouslySetInnerHTML={{
                  __html: semanticAnswer.highlights,
                }}
              ></p>
            </div>
          </Stack>
        )}
        {searchResults.map((result: SearchResult) => (
          <Stack horizontal className={styles.searchResultCard} key={result.id}>
            <div className={styles.textContainer}>
              <p className={styles.searchResultCardTitle}>{result.title}</p>
              <p className={styles.category}>{result.category}</p>
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
          label="Retreival mode"
          options={approaches}
          defaultSelectedKey="vec"
          onChange={onApproachChange}
        />
        {approach === "vecf" && (
          <TextField
            label="Filter"
            value={filterText}
            onChange={(_ev, newValue) => setFilterText(newValue ?? "")}
            placeholder="(e.g. category eq 'Databases')"
          />
        )}
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
              openai text-embedding-ada-002
            </code>
            <p>Text query vector:</p>
            <code className={styles.textQueryVector}>
              [{textQueryVector.join(", ")}]
            </code>
          </>
        )}
      </Panel>
    </div>
  );
};

export default Vector;
