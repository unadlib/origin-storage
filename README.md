# origin-storage

![Node CI](https://github.com/unadlib/origin-storage/workflows/Node%20CI/badge.svg)
[![npm version](https://badge.fury.io/js/origin-storage.svg)](http://badge.fury.io/js/origin-storage)

A same-origin storage for cross-domain access, it is based on localForage and supports IndexedDB, WebSQL and localStorage.

> `origin-storage` uses localStorage in browsers with no IndexedDB or WebSQL support. And Safari is not supported.

## Table of Contents

- [Motivation](#motivation)
- [Installation](#installation)
- [Usage and Example](#usage-and-example)
- [API](#api)
  - [OriginStorage](#originstorage)
  - [OriginStorageClient](#originstorageclient)

## Motivation

When different Website domains need a same-origin storage container, we have to use iframe's same-origin policy Web local storage solution. `localForage` is an excellent storage library, it supports IndexedDB, WebSQL and localStorage, but it can't solve this problem directly.

That's why we have this library for same-origin storage based on `localForage`.

## Installation

```sh
yarn add origin-storage
```

## Usage and Example

- Use `OriginStorage` on `http://localhost:9000/storage.js`:

```ts
import { OriginStorage } from 'origin-storage';

const originStorage = new OriginStorage();
```

> If you need to set up a more secure origin control, you can set `targetOrigin` like this.

```ts
const originStorage = new OriginStorage({
  targetOrigin: 'http://example.com',
});
```

- Create and host a Web page(`http://localhost:9000/storage.html`) containing JavaScript file `storage.js`.

- Use `OriginStorageClient` on a cross-domain page:

```ts
import { OriginStorageClient } from 'origin-storage';

const originStorageClient = new OriginStorageClient({
  uri: 'http://localhost:9000/storage.html',
});
```

## API

### `OriginStorage`

- `new OriginStorage(options)`

```ts
interface OriginStorageOptions extends IFrameTransportInternalOptions {
  /**
   * @description
   *
   * Enable read access to OriginStorage.
   */
  read?: boolean;
  /**
   * @description
   *
   * Enable write access to OriginStorage.
   */
  write?: boolean;
  /**
   * @description
   *
   * Enable broadcast data changes on OriginStorage.
   */
  broadcastChanges?: boolean;
  /**
   * @description
   *
   * Specify broadcastChannel name.
   */
  broadcastChannelName?: string;
}
```

### `OriginStorageClient`

- `new OriginStorageClient(options)`

```ts
interface OriginStorageClientOptions extends IFrameMainTransportOptions {
  /**
   * @description
   *
   * Specify the uri of an OriginStorage container.
   */
  uri: string;
  /**
   * @description
   *
   * Set storage options for localforage.
   */
  storageOptions?: LocalForageOptions;
}
```

- `OriginStorageClient` instance methods.

```ts
interface IOriginStorageClient {
  /**
   * The callback will be called when the iframe is connected.
   */
  onConnect(callback: () => void): void;
  /**
   * The callback will be called when the storage is changed.
   */
  onChange(callback: (data: IChangeData) => void): Promise<{
    off: () => void;
    broadcastChanges: boolean;
  }>;
  /**
   * Get the value of the specified key.
   */
  getItem(key: string): Promise<any>;
  /**
   * Set the value of the specified key.
   */
  setItem(key: string, value: any): Promise<void>;
  /**
   * Remove the value of the specified key.
   */
  removeItem(key: string): Promise<void>;
  /**
   * Clear all key/value pairs in the storage.
   */
  clear(): Promise<void>;
  /**
   * Get the number of key/value pairs in the storage.
   */
  length(): Promise<number>;
  /**
   * Get the name of the nth key in the storage.
   */
  key(index: number): Promise<string>;
  /**
   * Get all keys in the storage.
   */
  keys(): Promise<string[]>;
}
```
