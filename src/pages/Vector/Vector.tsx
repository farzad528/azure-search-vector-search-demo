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
import styles from "./Vector.module.css";
import { SearchResult, SemanticAnswer } from "./types";
import {
  generateTextQueryVector,
  getTextSearchResults,
} from "../../api/textSearch";

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
