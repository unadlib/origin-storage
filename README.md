# origin-storage

![Node CI](https://github.com/unadlib/origin-storage/workflows/Node%20CI/badge.svg)
[![npm version](https://badge.fury.io/js/origin-storage.svg)](http://badge.fury.io/js/origin-storage)

A same-origin storage container for cross-domain access

## Installation

```sh
yarn add origin-storage
```

## Usage

1. `storage.html`:

```html
<script src="storage.js"></script>
```


2. `storage.js`:

```ts
import { OriginStorage } from 'origin-storage';

const originStorage = new OriginStorage();
```

3. Cross domain page:

```ts
import { OriginStorageClient } from 'origin-storage';

const originStorageClient = new OriginStorageClient({
  uri: 'http://localhost:9000/storage.html',
});
```
