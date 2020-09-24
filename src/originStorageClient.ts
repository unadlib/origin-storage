import { IFrameTransport, Listen, listen, Receiver } from 'data-transport';
import { NoConnectError } from './constant';
import {
  ClientToStorage,
  OriginStorageClientOptions,
  StorageToClient,
} from './interface';

export class OriginStorageClient
  extends IFrameTransport.Main<ClientToStorage>
  implements Receiver<StorageToClient> {
  protected _connect?: () => void;
  protected _isConnect = false;
  protected _storageOptions?: LocalForageOptions;

  constructor({ storageOptions, ...options }: OriginStorageClientOptions) {
    super(options);
    this._storageOptions = storageOptions;
  }

  onConnect(callback: () => void) {
    this._connect = callback;
  }

  @listen
  connect({ respond }: Listen<StorageToClient['connect']>) {
    respond(this._storageOptions!);
    this._connect?.();
    this._isConnect = true;
  }

  async getItem(key: string) {
    if (!this._isConnect) {
      throw new Error(NoConnectError);
    }
    const { value } = await this.emit('getItem', { key });
    return value;
  }

  async setItem<T>(key: string, value: unknown) {
    if (!this._isConnect) {
      throw new Error(NoConnectError);
    }
    return await this.emit('setItem', { key, value });
  }

  async removeItem(key: string) {
    if (!this._isConnect) {
      throw new Error(NoConnectError);
    }
    return await this.emit('removeItem', { key });
  }

  async clear() {
    if (!this._isConnect) {
      throw new Error(NoConnectError);
    }
    return await this.emit('clear', undefined);
  }

  async length() {
    if (!this._isConnect) {
      throw new Error(NoConnectError);
    }
    return await this.emit('clear', undefined);
  }

  async key(index: number) {
    if (!this._isConnect) {
      throw new Error(NoConnectError);
    }
    return await this.emit('key', { index });
  }

  async keys() {
    if (!this._isConnect) {
      throw new Error(NoConnectError);
    }
    return await this.emit('keys', undefined);
  }
}
