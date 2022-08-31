# ipns-did-resolver

**NOTE:** The [DID-IPNS spec](https://misterupkeep.github.io/did-ipns-spec/) is unstable.

A resolver library for the IPNS method, to be used with the
[`did-resolver`](https://www.npmjs.com/package/did-resolver) library.

IPNS method resolution works with both IPNS (Peer ID hash) CIDs and DNSLink
domains. Paths will be resolved across both UnixFS blocks and other IPLD blocks,
using
[`ipfs-uniform-resolve`](https://www.npmjs.com/package/ipfs-uniform-resolve).

Fragments and queries are currently ignored and will resolve the entire document
instead.

Documents that resolve but have an ID that doesn't match the DID used to resolve
it will throw an error.

## Usage

```ts
import { Resolver } from "did-resolver";
import * as IPNSMethod from "ipns-did-resolver";

import * as IPFS from 'ipfs-core'

const ipfs = await IPFS.create()

const ipns = IPNSMethod.getResolver(
  ipfs.block,
  ipfs.name
);
const resolver = new Resolver({ ipns });

await resolver.resolve("did:ipns:did.ipfs.io");
```

## API

The library exports a function `getResolver(block, name, multidecoder?)`. The
first two parameters are the Block and Name APIs of the IPFS API.

`multidecoder` is a either a `Multidecoder` instance, or a `{decoders, hashers}`
object, to let you provide whatever decoder/hasher you need.

Learn more about `Multidecoder`
[here](https://www.npmjs.com/package/multiformat-multicodec).
