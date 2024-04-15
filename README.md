# ipns-did-resolver

**NOTE:** The [DID-IPNS spec](https://misterupkeep.github.io/did-ipns-spec/) is unstable.

A resolver library for the IPNS method, to be used with the
[`did-resolver`](https://www.npmjs.com/package/did-resolver) library.

IPNS method resolution works with both IPNS (Peer ID hash) CIDs and DNSLink
domains. Paths will be resolved as UnixFS blocks.  

Note: The default DID path is `.well-known/did.json` which is similar to `did:web`.

Documents that resolve but have an ID that doesn't match the DID used to resolve
it will throw an error.

## Usage

```ts
import { Resolver } from "did-resolver";
import { getResolver } from "ipns-did-resolver";

import { createHeliaHTTP } from '@helia/http'

const helia = await createHeliaHTTP()

const ipnsResolver = getResolver(
    helia
);
const resolver = new Resolver(ipnsResolver);

const result = await resolver.resolve("did:ipns:did.ipfs.io");

console.log(result);
```

## API

The library exports a function `getResolver(helia)`. The
first parameter is an instance of Helia.
