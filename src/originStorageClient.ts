import { IFrameTransport, listen } from 'data-transport';
import { NoConnectError } from './constant';
import {
  ClientToStorage,
  IChangeData,
  IOriginStorageClient,
  OriginStorageClientOptions,
  StorageError,
  StorageToClient,
} from './interface';

export class OriginStorageClient
  extends IFrameTransport.Main<{ emit: ClientToStorage }>
  implements StorageToClient, IOriginStorageClient
{
  protected _connect?: () => void;
  protected _isConnect: boolean;
  protected _storageOptions?: LocalForageOptions;
  protected _change?: (data: IChangeData) => void;
  protected _uri: string;

  constructor({ storageOptions, uri, ...options }: OriginStorageClientOptions) {
    const iframe = document.createElement('iframe');
    iframe.setAttribute('style', 'display:none');
    iframe.src = uri;
    document.body.appendChild(iframe);
    super({
      iframe,
      ...options,
    });
    this._uri = uri;
    this._isConnect = false;
    this._storageOptions = storageOptions;
  }

  onConnect(callback: () => void) {
    this._connect = callback;
  }

  async onChange(callback: (data: IChangeData) => void) {
    this._change = callback;
    const result = await this.emit('broadcastChanges');
    if (!result.broadcastChanges) {
      if (__DEV__) {
        console.error(
          `The 'broadcastChanges' in 'OriginStorage' has not been enabled, Please check ${this._uri}.`
        );
      }
    }
    return result;
  }

  @listen
  async change(options: { key: string | null }) {
    this._change?.({
      ...options,
      ...(typeof options.key === 'string'
        ? { value: await this.getItem(options.key) }
        : {}),
    });
  }

  @listen
  async connect() {
    if (typeof this._connect !== 'function') {
      if (__DEV__) {
        throw new Error(`'onConnect' has not been called.`);
      }
    }
    this._connect?.();
    this._isConnect = true;
    return this._storageOptions!;
  }

  async getItem(key: string) {
    if (!this._isConnect) {
      throw new Error(NoConnectError);
    }
    const result = await this.emit('getItem', { key });
    if ((result as StorageError)?.error) {
      throw new Error(`'getItem' error: ${(result as StorageError).error}`);
    }
    let parsedValue: unknown;
    const { value } = result as { value?: string };
    if (value === null || typeof value === 'undefined') return null;
    try {
      parsedValue = JSON.parse(value as string);
    } catch (e) {
      console.error(`'getItem' JSON.parse Error`);
      throw e;
    }
    return parsedValue;
  }

  async setItem<T>(key: string, value: unknown) {
    if (!this._isConnect) {
      throw new Error(NoConnectError);
    }
    let stringifiedValue: string;
    try {
      stringifiedValue = JSON.stringify(value);
    } catch (e) {
      console.error(`'setItem' JSON.stringify Error`);
      throw e;
    }
    const result = await this.emit('setItem', { key, value: stringifiedValue });
    if ((result as StorageError)?.error) {
      throw new Error(`'setItem' error: ${(result as StorageError).error}`);
    }
    return result as Exclude<typeof result, StorageError>;
  }

  async removeItem(key: string) {
    if (!this._isConnect) {
      throw new Error(NoConnectError);
    }
    const result = await this.emit('removeItem', { key });
    if ((result as StorageError)?.error) {
      throw new Error(`'removeItem' error: ${(result as StorageError).error}`);
    }
    return result as Exclude<typeof result, StorageError>;
  }

  async clear() {
    if (!this._isConnect) {
      throw new Error(NoConnectError);
    }
    const result = await this.emit('clear');
    if ((result as StorageError)?.error) {
      throw new Error(`'clear' error: ${(result as StorageError).error}`);
    }
    return result as Exclude<typeof result, StorageError>;
  }

  async length() {
    if (!this._isConnect) {
      throw new Error(NoConnectError);
    }
    const result = await this.emit('length');
    if ((result as StorageError)?.error) {
      throw new Error(`'length' error: ${(result as StorageError).error}`);
    }
    return (result as Exclude<typeof result, StorageError | void>)?.length;
  }

  async key(index: number) {
    if (!this._isConnect) {
      throw new Error(NoConnectError);
    }
    const result = await this.emit('key', { index });
    if ((result as StorageError)?.error) {
      throw new Error(`'key' error: ${(result as StorageError).error}`);
    }
    return (result as Exclude<typeof result, StorageError | void>)?.key;
  }

  async keys() {
    if (!this._isConnect) {
      throw new Error(NoConnectError);
    }
    const result = await this.emit('keys');
    if ((result as StorageError)?.error) {
      throw new Error(`'keys' error: ${(result as StorageError).error}`);
    }
    return (result as Exclude<typeof result, StorageError | void>)?.keys;
  }
}
