import { IFrameTransport, Receiver, listen, Listen } from 'data-transport';
import localforage from 'localforage';
import { NoAccessError } from './constant';
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

  constructor({ read = true, write = true, ...options }: OriginStorageOptions = {}) {
    super(options);
    this._read = read;
    this._write = write;
    this.connect();
  }

  async connect() {
    if (!this._read && !this._write) {
      throw new Error(NoAccessError);
    }
    console.log('======connect');
    const config = await this.emit('connect', undefined);
    console.log('======config', config);
    this._localforage = localforage.createInstance(config);
  }

  @listen
  async getItem({ request, respond }: Listen<ClientToStorage['getItem']>) {
    if (!this._read) return;
    const value = await this._localforage.getItem(request.key);
    respond({ value });
  }

  @listen
  async setItem({ request, respond }: Listen<ClientToStorage['setItem']>) {
    if (!this._write) return;
    await this._localforage.setItem(request.key, request.value);
    respond();
  }

  @listen
  async removeItem({
    request,
    respond,
  }: Listen<ClientToStorage['removeItem']>) {
    if (!this._write) return;
    await this._localforage.removeItem(request.key);
    respond();
  }

  @listen
  async clear({ respond }: Listen<ClientToStorage['clear']>) {
    if (!this._write) return;
    await this._localforage.clear();
    respond();
  }

  @listen
  async length({ respond }: Listen<ClientToStorage['length']>) {
    if (!this._read) return;
    const length = await this._localforage.length();
    respond({ length });
  }

  @listen
  async key({ request, respond }: Listen<ClientToStorage['key']>) {
    if (!this._read) return;
    const key = await this._localforage.key(request.index);
    respond({ key });
  }

  @listen
  async keys({ respond }: Listen<ClientToStorage['keys']>) {
    if (!this._read) return;
    const keys = await this._localforage.keys();
    respond({ keys });
  }
}
