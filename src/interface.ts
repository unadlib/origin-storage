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
  connect: TransportData<void, LocalForageOptions>;
  change: TransportData<{ key: string | null }, void>;
};

export interface StorageError {
  error: string;
}

export type ClientToStorage = {
  broadcastChanges: TransportData<void, { broadcastChanges: boolean }>;
  getItem: TransportData<{ key: string }, { value: string } | StorageError>;
  setItem: TransportData<{ key: string; value: string }, StorageError | void>;
  removeItem: TransportData<{ key: string }, StorageError | void>;
  clear: TransportData<void, StorageError | void>;
  length: TransportData<void, { length: number } | StorageError>;
  key: TransportData<{ index: number }, { key: string } | StorageError>;
  keys: TransportData<void, { keys: string[] } | StorageError>;
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
