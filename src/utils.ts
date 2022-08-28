import type { DIDResolutionResult } from "did-resolver";

export function err(error: string, desc?: string): DIDResolutionResult {
  return {
    didDocument: null,
    didDocumentMetadata: {},
    didResolutionMetadata: {
      error,
      desc,
    },
  };
}
