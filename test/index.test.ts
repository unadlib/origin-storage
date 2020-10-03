import { OriginStorageClient, OriginStorage } from '../src';

class MemoryStorage {
  private _data: Record<string, any> = {};

  getItem(key: string) {
    return this._data[key];
  }

  setItem(key: string, value: any) {
    this._data[key] = value;
  }

  clear() {
    this._data = {};
  }

  removeItem(key: string) {
    delete this._data[key];
  }

  length() {
    return Object.keys(this._data).length;
  }

  key(index: number) {
    return Object.keys(this._data)[index];
  }

  keys() {
    return Object.keys(this._data);
  }
}

test('base', async () => {
  let mockExternalSend: (...args: any) => void;
  let mockInternalSend: (...args: any) => void;

  const originStorageClient = new OriginStorageClient({
    uri: '',
    listener: (callback) => {
      mockInternalSend = callback;
    },
    sender: (message) => {
      mockExternalSend(JSON.parse(JSON.stringify(message)));
    },
  });

  const fn = jest.fn();

  originStorageClient.onConnect(fn);

  const originStorage = new OriginStorage({
    listener: (callback) => {
      mockExternalSend = callback;
    },
    sender: (message) => {
      mockInternalSend(JSON.parse(JSON.stringify(message)));
    },
  });

  expect(fn.mock.calls.length).toBe(1);
  await new Promise(r => setTimeout(r));
  (originStorage as any)._localforage = new MemoryStorage();
  expect(await originStorageClient.getItem('v')).toBeNull();

  const value = { a: 1 };
  await originStorageClient.setItem('v', value);
  const savedValue = await originStorageClient.getItem('v');
  expect(savedValue).toEqual(value);
  expect(savedValue === value).toBeFalsy();
});
