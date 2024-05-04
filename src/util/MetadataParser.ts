import yaml from "js-yaml";
import { detectNewlineGraceful } from "./NewLine";

interface ParseResult {
  content: string;
  metadata: any;
}

interface DetectNewline {
  detectNewline(input: string): "\r\n" | "\n" | undefined;
  detectNewlineGraceful: (input: string) => string;
}

/**
 * Parses markdown text to extract metadata enclosed between '---' delimiters and the remaining content.
 * @param text Markdown source text to parse.
 * @returns A `ParseResult` object containing the markdown content and parsed metadata.
 * @throws {TypeError} Throws if the input is not a string.
 * @throws {yaml.YAMLException} Throws if there is an error parsing YAML.
 */
export async function metadataParser(text: string): Promise<ParseResult> {
  let METADATA_START: RegExp;
  let METADATA_END: string;
  let METADATA_FILE_END: string;
  let result: ParseResult = {
    content: text,
    metadata: {},
  };

  const setMetadataPatterns = (): void => {
    const newline = detectNewlineGraceful(text) || "\n"; // Fallback to default newline
    METADATA_START = new RegExp(`^---${newline}`);
    METADATA_END = `${newline}---${newline}`;
    METADATA_FILE_END = `${newline}---`;
  };

  const splitTextWithMetadata = (): void => {
    const metadataEndIndex = text.indexOf(METADATA_END);
    if (metadataEndIndex !== -1) {
      result = {
        content: text.substring(metadataEndIndex + METADATA_END.length),
        metadata: text.substring(0, metadataEndIndex),
      };
    }
  };

  const splitTextWithOnlyMetadata = (): void => {
    if (!result.metadata && text.endsWith(METADATA_FILE_END)) {
      result = {
        content: "",
        metadata: text.substring(0, text.length - METADATA_FILE_END.length),
      };
    }
  };

  const extractContentAndMetadata = (): void => {
    if (METADATA_START.test(text)) {
      splitTextWithMetadata();
      splitTextWithOnlyMetadata();
    }
  };

  const removeStartPatternFromMetadata = (): void => {
    result = {
      ...result,
      metadata: result.metadata.replace(METADATA_START, "").trim(),
    };
  };

  const parseMetadata = (): void => {
    if (result.metadata) {
      try {
        result.metadata = yaml.load(result.metadata);
      } catch (error) {
        throw error; // Rethrow to handle it in the calling context.
      }
    } else {
      result.metadata = {};
    }
  };

  const parse = (): void => {
    setMetadataPatterns();
    extractContentAndMetadata();
    removeStartPatternFromMetadata();
    parseMetadata();
  };

  parse();
  return result;
}
