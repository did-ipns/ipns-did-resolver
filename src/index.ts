import type {
  ParsedDID,
  DIDDocument as DIDDocumentType,
  DIDResolutionResult,
} from "did-resolver";
import type { CID as CIDType } from "multiformats";

import { DIDDocument } from "did-doc";

import { CID } from "multiformats";
import type { HeliaLibp2p } from "helia";
import { unixfs } from "@helia/unixfs";
import { ipns } from "@helia/ipns";
import { peerIdFromString } from "@libp2p/peer-id";
import isFQDN from "validator/lib/isFQDN.js";

import { err } from "./utils";

export function getResolver(helia: HeliaLibp2p) {
  const heliaFs = unixfs(helia),
    heliaName = ipns(helia);

  async function resolve(
    did: string,
    parsed: ParsedDID,
  ): Promise<DIDResolutionResult> {
    let cid: CIDType, didDocument: DIDDocumentType, finalCid: CIDType;
    try {
      const queryParams = new Map();
      const didPath = parsed.path || ".well-known/did.json";
      if (typeof parsed.query !== "undefined") {
        const splitQueries = parsed.query.split("&");
        for (const splitQuery of splitQueries) {
          const queryParam = splitQuery.split("=");
          queryParams.set(queryParam[0], queryParam[1]);
        }
      }
      if (queryParams.has("versionId")) {
        cid = CID.parse(queryParams.get("versionId"));
      } else {
        if (isFQDN(parsed.id)) {
          cid = (await heliaName.resolveDNSLink(parsed.id)).cid;
        } else {
          const peer = peerIdFromString(parsed.id);
          cid = (await heliaName.resolve(peer)).cid;
        }
      }
      let resultBuffers = [];
      for await (const buf of heliaFs.cat(cid, { path: didPath })) {
        resultBuffers.push(buf);
      }
      didDocument = JSON.parse(Buffer.concat(resultBuffers).toString());
      finalCid = (await heliaFs.stat(cid, { path: didPath })).cid;
    } catch (e) {
      return err("notFound", e);
    }

    if (!DIDDocument.isDoc(didDocument)) {
      return err("invalidDoc");
    }

    if (didDocument.id !== parsed.id) {
      return err("invalidDoc", "DID in document doesn't match");
    }

    return {
      didDocument,
      didDocumentMetadata: {
        versionId: finalCid.toString(),
      },
      didResolutionMetadata: {},
    };
  }

  return { ipns: resolve };
}
