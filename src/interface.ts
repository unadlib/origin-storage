import {
  IFrameMainTransportOptions,
  IFrameTransportInternalOptions,
  TransportData,
} from 'data-transport';
import localforage from 'localforage';

export type LocalForageOptions = Parameters<
  typeof localforage.createInstance
>[0];

export interface OriginStorageClientOptions extends IFrameMainTransportOptions {
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

export interface OriginStorageOptions extends IFrameTransportInternalOptions {
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
}

export type StorageToClient = {
  connect: TransportData<void, LocalForageOptions>;
};

export interface StorageError {
  error: string;
}

export type ClientToStorage = {
  getItem: TransportData<{ key: string }, { value: unknown } | StorageError>;
  setItem: TransportData<{ key: string; value: unknown }, StorageError | void>;
  removeItem: TransportData<{ key: string }, StorageError | void>;
  clear: TransportData<void, StorageError | void>;
  length: TransportData<void, { length: number } | StorageError>;
  key: TransportData<{ index: number }, { key: string } | StorageError>;
  keys: TransportData<void, { keys: string[] } | StorageError>;
};
