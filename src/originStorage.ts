import { IFrameTransport, listen } from 'data-transport';
import { BroadcastChannel } from 'broadcast-channel';
import localforage from 'localforage';
import {
  DefaultBroadcastChannelName,
  NoAccessError,
  NoReadAccessError,
  NoWriteAccessError,
} from './constant';
import {
  ClientToStorage,
  IChangeData,
  OriginStorageOptions,
  StorageToClient,
} from './interface';

export class OriginStorage
  extends IFrameTransport.IFrame<{ emit: StorageToClient }>
  implements ClientToStorage
{
  protected _localforage!: ReturnType<typeof localforage.createInstance>;
  protected _read: boolean;
  protected _write: boolean;
  protected _broadcastChanges: boolean;
  protected _broadcastChannel?: BroadcastChannel;

  constructor({
    read = true,
    write = true,
    broadcastChanges = false,
    broadcastChannelName = DefaultBroadcastChannelName,
    ...options
  }: OriginStorageOptions = {}) {
    super(options);
    this._read = read;
    this._write = write;
    this._broadcastChanges = broadcastChanges;
    if (this._broadcastChanges) {
      this._broadcastChannel = new BroadcastChannel(broadcastChannelName);
      this._broadcastChannel.onmessage = (message) => {
        this.emit({ name: 'change', respond: false }, message);
      };
    }
    this.connect();
  }

  async connect() {
    if (!this._read && !this._write) {
      throw new Error(NoAccessError);
    }
    const config = await this.emit('getConfig');
    this._localforage = localforage.createInstance(config);
    await this.emit('connect');
  }

  @listen
  async broadcastChanges() {
    return { broadcastChanges: this._broadcastChanges };
  }

  @listen
  async getItem(options: { key: string }) {
    if (!this._read) {
      if (__DEV__) {
        console.error(NoReadAccessError);
      }
      return { error: NoReadAccessError };
    }
    try {
      const value = (await this._localforage.getItem(options.key)) as unknown;
      return { value };
    } catch (e: any) {
      if (typeof e?.toString === 'function') {
        return { error: e.toString() };
      }
      if (__DEV__) {
        throw e;
      }
    }
  }

  @listen
  async setItem(options: { key: string; value: unknown }) {
    if (!this._write) {
      if (__DEV__) {
        console.error(NoWriteAccessError);
      }
      return { error: NoWriteAccessError };
    }
    try {
      await this._localforage.setItem(options.key, options.value);
      this._broadcastChannel?.postMessage({
        key: options.key,
      } as IChangeData);
    } catch (e: any) {
      if (typeof e?.toString === 'function') {
        return { error: e.toString() };
      }
      if (__DEV__) {
        throw e;
      }
    }
  }

  @listen
  async removeItem(options: { key: string }) {
    if (!this._write) {
      if (__DEV__) {
        console.error(NoWriteAccessError);
      }
      return { error: NoWriteAccessError };
    }
    try {
      await this._localforage.removeItem(options.key);
      this._broadcastChannel?.postMessage({
        key: options.key,
      } as IChangeData);
    } catch (e: any) {
      if (typeof e?.toString === 'function') {
        return { error: e.toString() };
      }
      if (__DEV__) {
        throw e;
      }
    }
  }

  @listen
  async clear() {
    if (!this._write) {
      if (__DEV__) {
        console.error(NoWriteAccessError);
      }
      return { error: NoWriteAccessError };
    }
    try {
      await this._localforage.clear();
      this._broadcastChannel?.postMessage({
        key: null,
      } as IChangeData);
    } catch (e: any) {
      if (typeof e?.toString === 'function') {
        return { error: e.toString() };
      }
      if (__DEV__) {
        throw e;
      }
    }
  }

  @listen
  async length() {
    if (!this._read) {
      if (__DEV__) {
        console.error(NoReadAccessError);
      }
      return { error: NoReadAccessError };
    }
    try {
      const length = await this._localforage.length();
      return { length };
    } catch (e: any) {
      if (typeof e?.toString === 'function') {
        return { error: e.toString() };
      }
      if (__DEV__) {
        throw e;
      }
    }
  }

  @listen
  async key(options: { index: number }) {
    if (!this._read) {
      if (__DEV__) {
        console.error(NoReadAccessError);
      }
      return { error: NoReadAccessError };
    }
    try {
      const key = await this._localforage.key(options.index);
      return { key };
    } catch (e: any) {
      if (typeof e?.toString === 'function') {
        return { error: e.toString() };
      }
      if (__DEV__) {
        throw e;
      }
    }
  }

  @listen
  async keys() {
    if (!this._read) {
      if (__DEV__) {
        console.error(NoReadAccessError);
      }
      return { error: NoReadAccessError };
    }
    try {
      const keys = await this._localforage.keys();
      return { keys };
    } catch (e: any) {
      if (typeof e?.toString === 'function') {
        return { error: e.toString() };
      }
      if (__DEV__) {
        throw e;
      }
    }
  }
}
