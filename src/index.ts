import type {
  ParsedDID,
  Resolver,
  DIDResolutionOptions,
  DIDResolutionResult,
  DIDDocument,
} from "did-resolver";

import { DIDDocument as IPNSDoc } from "did-doc";

import type { API as BlockAPI } from "ipfs-core-types/block";
import type { API as NameAPI } from "ipfs-core-types/name";

import type { Multidecoder } from "multiformat-multicodec";
import type { BlockDecoder } from "multiformats/codecs/interface";
import type { Hasher } from "multiformats/hashes/hasher";

import Resolve from "ipfs-uniform-resolve";

import { err } from "./utils";

export function getResolver(
  blockApi: BlockAPI,
  nameApi: NameAPI,
  multidecoder?: Multidecoder<DIDDocument> & {
    decoders: [BlockDecoder<any, any>];
    hashers: [Hasher<any, any>];
  }
) {
  const resolver = Resolve(blockApi, nameApi, multidecoder);

  async function resolve(
    did: string,
    parsed: ParsedDID,
    didResolver: Resolver,
    options: DIDResolutionOptions
  ): Promise<DIDResolutionResult> {
    let cid;
    try {
      cid = await resolver.resolveIpns(parsed.id);
    } catch (e) {
      return err("notFound", e);
    }

    let result, finalCid;
    try {
      const r = await resolver.resolve(cid, parsed.path, { followIpld: false });
      result = r.value;
      finalCid = r.cid;
    } catch (e) {
      return err("notFound", e);
    }

    if (!IPNSDoc.isDoc(result)) {
      return err("invalidDoc");
    }

    if (result.id !== `did:ipns:${parsed.id}`) {
      return err("invalidDoc", "DID in document doesn't match");
    }

    const didDocument = {
      id: parsed.id,
      ...result,
    };

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
