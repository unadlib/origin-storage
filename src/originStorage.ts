import { IFrameTransport, Receiver, listen, Listen } from 'data-transport';
import localforage from 'localforage';
import {
  NoAccessError,
  NoReadAccessError,
  NoWriteAccessError,
} from './constant';
import {
  ClientToStorage,
  OriginStorageOptions,
  StorageToClient,
} from './interface';

export class OriginStorage
  extends IFrameTransport.IFrame<StorageToClient>
  implements Receiver<ClientToStorage> {
  protected _localforage!: ReturnType<typeof localforage.createInstance>;
  protected _read: boolean;
  protected _write: boolean;

  constructor({
    read = true,
    write = true,
    ...options
  }: OriginStorageOptions = {}) {
    super(options);
    this._read = read;
    this._write = write;
    this.connect();
  }

  async connect() {
    if (!this._read && !this._write) {
      throw new Error(NoAccessError);
    }
    const config = await this.emit('connect', undefined);
    this._localforage = localforage.createInstance(config);
  }

  @listen
  async getItem({ request, respond }: Listen<ClientToStorage['getItem']>) {
    if (!this._read) {
      if (__DEV__) {
        console.error(NoReadAccessError);
      }
      return;
    }
    try {
      const value = await this._localforage.getItem(request.key) as string;
      respond({ value });
    } catch (e: any) {
      if (typeof e?.toString === 'function') {
        respond({ error: e.toString() });
      }
      if (__DEV__) {
        throw e;
      }
    }
  }

  @listen
  async setItem({ request, respond }: Listen<ClientToStorage['setItem']>) {
    if (!this._write) {
      if (__DEV__) {
        console.error(NoWriteAccessError);
      }
      return;
    }
    try {
      await this._localforage.setItem(request.key, request.value);
      respond();
    } catch (e: any) {
      if (typeof e?.toString === 'function') {
        respond({ error: e.toString() });
      }
      if (__DEV__) {
        throw e;
      }
    }
  }

  @listen
  async removeItem({
    request,
    respond,
  }: Listen<ClientToStorage['removeItem']>) {
    if (!this._write) {
      if (__DEV__) {
        console.error(NoWriteAccessError);
      }
      return;
    }
    try {
      await this._localforage.removeItem(request.key);
      respond();
    } catch (e: any) {
      if (typeof e?.toString === 'function') {
        respond({ error: e.toString() });
      }
      if (__DEV__) {
        throw e;
      }
    }
  }

  @listen
  async clear({ respond }: Listen<ClientToStorage['clear']>) {
    if (!this._write) {
      if (__DEV__) {
        console.error(NoWriteAccessError);
      }
      return;
    }
    try {
      await this._localforage.clear();
      respond();
    } catch (e: any) {
      if (typeof e?.toString === 'function') {
        respond({ error: e.toString() });
      }
      if (__DEV__) {
        throw e;
      }
    }
  }

  @listen
  async length({ respond }: Listen<ClientToStorage['length']>) {
    if (!this._read) {
      if (__DEV__) {
        console.error(NoReadAccessError);
      }
      return;
    }
    try {
      const length = await this._localforage.length();
      respond({ length });
    } catch (e: any) {
      if (typeof e?.toString === 'function') {
        respond({ error: e.toString() });
      }
      if (__DEV__) {
        throw e;
      }
    }
  }

  @listen
  async key({ request, respond }: Listen<ClientToStorage['key']>) {
    if (!this._read) {
      if (__DEV__) {
        console.error(NoReadAccessError);
      }
      return;
    }
    try {
      const key = await this._localforage.key(request.index);
      respond({ key });
    } catch (e: any) {
      if (typeof e?.toString === 'function') {
        respond({ error: e.toString() });
      }
      if (__DEV__) {
        throw e;
      }
    }
  }

  @listen
  async keys({ respond }: Listen<ClientToStorage['keys']>) {
    if (!this._read) {
      if (__DEV__) {
        console.error(NoReadAccessError);
      }
      return;
    }
    try {
      const keys = await this._localforage.keys();
      respond({ keys });
    } catch (e: any) {
      if (typeof e?.toString === 'function') {
        respond({ error: e.toString() });
      }
      if (__DEV__) {
        throw e;
      }
    }
  }
}
