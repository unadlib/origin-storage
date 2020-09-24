# origin-storage

![Node CI](https://github.com/unadlib/origin-storage/workflows/Node%20CI/badge.svg)
[![npm version](https://badge.fury.io/js/origin-storage.svg)](http://badge.fury.io/js/origin-storage)

A same-origin storage container for cross-domain access, it is based on localForage and supports IndexedDB, WebSQL and localStorage.

## Installation

```sh
yarn add origin-storage
```

## Usage

- `storage.html`:

```html
<script src="storage.js"></script>
```

- `storage.js`:

```ts
import { OriginStorage } from 'origin-storage';

const originStorage = new OriginStorage();
```

- Cross domain page:

```ts
import { OriginStorageClient } from 'origin-storage';

const originStorageClient = new OriginStorageClient({
  uri: 'http://localhost:9000/storage.html',
});
```
