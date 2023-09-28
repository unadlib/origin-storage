import { IFrameTransport, listen } from 'data-transport';
import {
  ClientToStorage,
  IChangeData,
  IOriginStorageClient,
  OriginStorageClientOptions,
  StorageError,
  StorageToClient,
} from './interface';

type OnChangeCallback = (data: IChangeData) => void;

export class OriginStorageClient
  extends IFrameTransport.Main<{ emit: ClientToStorage }>
  implements StorageToClient, IOriginStorageClient
{
  protected _onConnectCallbacks: Set<() => void> = new Set();
  protected _onChangeCallbacks: Set<OnChangeCallback> = new Set();
  protected _isConnect: boolean;
  protected _storageOptions?: LocalForageOptions;
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
    this._connectPromise = new Promise<void>((resolve) => {
      this._connectResolve = resolve;
    });
  }

  private _connectPromise: Promise<void>;

  private _connectResolve?: () => void;

  private _connect() {
    this._onConnectCallbacks.forEach((callback) => callback());
  }

  /**
   * The callback will be called when the iframe is connected.
   */
  onConnect(callback: () => void) {
    this._onConnectCallbacks.add(callback);
    if (this._isConnect) {
      callback();
    }
    return () => {
      this._onConnectCallbacks.delete(callback);
    };
  }

  /**
   * The callback will be called when the storage is changed.
   */
  async onChange(callback: OnChangeCallback) {
    this._onChangeCallbacks.add(callback);
    if (!this._isConnect) {
      await this._connectPromise;
    }
    const result = await this.emit('broadcastChanges');
    if (!result.broadcastChanges) {
      if (__DEV__) {
        console.error(
          `The 'broadcastChanges' in 'OriginStorage' has not been enabled, Please check ${this._uri}.`
        );
      }
    }
    return {
      ...result,
      off: () => {
        this._onChangeCallbacks.delete(callback);
      },
    };
  }

  private _change(data: IChangeData) {
    this._onChangeCallbacks.forEach((callback) => {
      try {
        callback(data);
      } catch (e) {
        console.error(e);
      }
    });
  }

  @listen
  async change(options: { key: string | null }) {
    this._change({
      ...options,
      ...(typeof options.key === 'string'
        ? { value: await this.getItem(options.key) }
        : {}),
    });
  }

  @listen
  async getConfig() {
    return this._storageOptions!;
  }

  @listen
  async connect() {
    if (typeof this._connect !== 'function') {
      if (__DEV__) {
        throw new Error(`'onConnect' has not been called.`);
      }
    }
    this._isConnect = true;
    this._connectResolve?.();
    this._connect?.();
  }

  /**
   * Get the value of the specified key.
   */
  async getItem(key: string) {
    if (!this._isConnect) {
      await this._connectPromise;
    }
    const result = await this.emit('getItem', { key });
    if ((result as StorageError)?.error) {
      throw new Error(`'getItem' error: ${(result as StorageError).error}`);
    }
    const { value } = result as { value: unknown };
    return value;
  }

  /**
   * Set the value of the specified key.
   */
  async setItem<T>(key: string, value: unknown) {
    if (!this._isConnect) {
      await this._connectPromise;
    }
    const result = await this.emit('setItem', { key, value });
    if ((result as StorageError)?.error) {
      throw new Error(`'setItem' error: ${(result as StorageError).error}`);
    }
    return result as Exclude<typeof result, StorageError>;
  }

  /**
   * Remove the value of the specified key.
   */
  async removeItem(key: string) {
    if (!this._isConnect) {
      await this._connectPromise;
    }
    const result = await this.emit('removeItem', { key });
    if ((result as StorageError)?.error) {
      throw new Error(`'removeItem' error: ${(result as StorageError).error}`);
    }
    return result as Exclude<typeof result, StorageError>;
  }

  /**
   * Clear all key/value pairs in the storage.
   */
  async clear() {
    if (!this._isConnect) {
      await this._connectPromise;
    }
    const result = await this.emit('clear');
    if ((result as StorageError)?.error) {
      throw new Error(`'clear' error: ${(result as StorageError).error}`);
    }
    return result as Exclude<typeof result, StorageError>;
  }

  /**
   * Get the number of key/value pairs in the storage.
   */
  async length() {
    if (!this._isConnect) {
      await this._connectPromise;
    }
    const result = await this.emit('length');
    if ((result as StorageError)?.error) {
      throw new Error(`'length' error: ${(result as StorageError).error}`);
    }
    return (result as Exclude<typeof result, StorageError | void>)?.length;
  }

  /**
   * Get the name of the nth key in the storage.
   */
  async key(index: number) {
    if (!this._isConnect) {
      await this._connectPromise;
    }
    const result = await this.emit('key', { index });
    if ((result as StorageError)?.error) {
      throw new Error(`'key' error: ${(result as StorageError).error}`);
    }
    return (result as Exclude<typeof result, StorageError | void>)?.key;
  }

  /**
   * Get all keys in the storage.
   */
  async keys() {
    if (!this._isConnect) {
      await this._connectPromise;
    }
    const result = await this.emit('keys');
    if ((result as StorageError)?.error) {
      throw new Error(`'keys' error: ${(result as StorageError).error}`);
    }
    return (result as Exclude<typeof result, StorageError | void>)?.keys;
  }
}
