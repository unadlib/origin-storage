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

const getOriginStorageClient = async () => {
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
  // mock
  (originStorage as any)._localforage = new MemoryStorage();
  return originStorageClient;
}

test('base', async () => {
  const originStorageClient = await getOriginStorageClient();
  expect(await originStorageClient.getItem('v')).toBeNull();

  const value = { a: 1 };
  await originStorageClient.setItem('v', value);
  const savedValue = await originStorageClient.getItem('v');
  expect(savedValue).toEqual(value);
  expect(savedValue === value).toBeFalsy();

  await originStorageClient.removeItem('v');
  expect(await originStorageClient.getItem('v')).toBeNull();

  await originStorageClient.setItem('v', [1]);
  expect(await originStorageClient.getItem('v')).toEqual([1]);

  await originStorageClient.clear();
  expect(await originStorageClient.getItem('v')).toBeNull();

  expect(await originStorageClient.keys()).toEqual([]);

  await originStorageClient.setItem('v', 1);
  await originStorageClient.setItem('x', '1');

  expect((await originStorageClient.keys()).length).toBe(2);

  const keys = await originStorageClient.keys();
  expect(await originStorageClient.key(1)).toBe(keys[1]);

  await originStorageClient.clear();
  expect(await originStorageClient.keys()).toEqual([]);
});
