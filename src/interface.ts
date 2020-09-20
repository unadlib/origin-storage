import {
  IFrameMainTransportOptions,
  IFrameTransportInternalOptions,
} from 'data-transport';
import localforage from 'localforage';
import { databases } from './constant';

type LocalForageOptions = Parameters<typeof localforage.createInstance>;

export interface OriginStorageClientOptions extends IFrameMainTransportOptions {
  uri: string;
  type?: keyof typeof databases;
}

export interface OriginStorageOptions extends IFrameTransportInternalOptions {
  read?: boolean;
  write?: boolean;
}
