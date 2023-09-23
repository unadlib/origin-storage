import {
  IFrameMainTransportOptions,
  IFrameTransportInternalOptions,
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

export interface IChangeData {
  key: string | null;
  value?: any;
}

export type StorageToClient = {
  connect(): Promise<void>;
  getConfig(): Promise<LocalForageOptions>;
  change(options: { key: string | null }): Promise<void>;
};

export interface StorageError {
  error: string;
}

export type ClientToStorage = {
  broadcastChanges(): Promise<{ broadcastChanges: boolean }>;
  getItem(options: {
    key: string;
  }): Promise<{ value: unknown } | StorageError | void>;
  setItem(options: {
    key: string;
    value: unknown;
  }): Promise<StorageError | void>;
  removeItem(options: { key: string }): Promise<StorageError | void>;
  clear(): Promise<StorageError | void>;
  length(): Promise<{ length: number } | StorageError | void>;
  key(options: {
    index: number;
  }): Promise<{ key: string } | StorageError | void>;
  keys(): Promise<{ keys: string[] } | StorageError | void>;
};

export interface IOriginStorageClient {
  getItem(key: string): Promise<any>;
  setItem(key: string, value: any): Promise<void>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
  length(): Promise<number>;
  key(index: number): Promise<string>;
  keys(): Promise<string[]>;
}
