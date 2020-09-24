import {
  IFrameMainTransportOptions,
  IFrameTransportInternalOptions,
  TransportData,
} from 'data-transport';
import localforage from 'localforage';

export type LocalForageOptions = Parameters<typeof localforage.createInstance>[0];

export interface OriginStorageClientOptions extends IFrameMainTransportOptions {
  uri: string;
  storageOptions?: LocalForageOptions;
}

export interface OriginStorageOptions extends IFrameTransportInternalOptions {
  read?: boolean;
  write?: boolean;
}

export type StorageToClient = {
  connect: TransportData<void, LocalForageOptions>;
};

export type ClientToStorage = {
  getItem: TransportData<{ key: string }, { value: any }>;
  setItem: TransportData<{ key: string; value: any }, void>;
  removeItem: TransportData<{ key: string }, void>;
  clear: TransportData<void, void>;
  length: TransportData<void, { length: number }>;
  key: TransportData<{ index: number }, { key: string }>;
  keys: TransportData<void, { keys: string[] }>;
};
