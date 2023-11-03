jest.mock('broadcast-channel', () => ({
  BroadcastChannel: class {},
}));
import { OriginStorageClient, OriginStorage } from '../src';

class MemoryStorage {
  private _data: Record<string, any> = {};

  getItem(key: string) {
    return this._data[key] || null;
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

const getInstances = async ({
  read = true,
  write = true,
  broadcastChanges = false,
} = {}) => {
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
    skipConnectionCheck: true,
  });

  const fn = jest.fn();
  const fn1 = jest.fn();

  originStorageClient.onConnect(fn);
  const unsubscribe = originStorageClient.onConnect(fn1);

  unsubscribe();

  const originStorage = new OriginStorage({
    read,
    write,
    broadcastChanges,
    listener: (callback) => {
      mockExternalSend = callback;
    },
    sender: (message) => {
      mockInternalSend(JSON.parse(JSON.stringify(message)));
    },
    skipConnectionCheck: true,
  });
  await new Promise((r) => setTimeout(r));
  expect(fn.mock.calls.length).toBe(1);
  expect(fn1.mock.calls.length).toBe(0);
  // mock
  (originStorage as any)._localforage = new MemoryStorage();
  return {
    originStorageClient,
    originStorage,
  };
};

test('base', async () => {
  const { originStorageClient } = await getInstances();
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

test('only write', async () => {
  const { originStorageClient } = await getInstances({
    read: false,
    write: true,
  });
  const value = { a: 1 };
  await originStorageClient.setItem('v', value);
  for (const fn of [
    () => originStorageClient.getItem('v'),
    () => originStorageClient.keys(),
    () => originStorageClient.length(),
    () => originStorageClient.key(0),
  ]) {
    await expect(fn).rejects.toThrow(
      /The OriginStorage does not have any read access./
    );
  }
});

test('only read', async () => {
  const { originStorageClient } = await getInstances({
    read: true,
    write: false,
  });
  const value = { a: 1 };

  for (const fn of [
    () => originStorageClient.setItem('v', value),
    () => originStorageClient.removeItem('v'),
    () => originStorageClient.clear(),
  ]) {
    await expect(fn).rejects.toThrow(
      /The OriginStorage does not have any write access./
    );
  }
  expect(await originStorageClient.getItem('v')).toBeNull();
});

test('watch data change', async () => {
  const instances0 = await getInstances({
    broadcastChanges: true,
  });
  const instances1 = await getInstances({
    broadcastChanges: true,
  });

  (instances0.originStorage as any)._broadcastChannel = {
    postMessage: (message: any) =>
      (instances1.originStorage as any)._broadcastChannel.onmessage(message),
    onmessage: (message: any) => {
      (instances0.originStorage as any).emit('change', message, {
        respond: false,
      });
    },
  };
  (instances1.originStorage as any)._broadcastChannel = {
    postMessage: (message: any) =>
      (instances0.originStorage as any)._broadcastChannel.onmessage(message),

    onmessage: (message: any) => {
      (instances1.originStorage as any).emit('change', message, {
        respond: false,
      });
    },
  };
  (instances1.originStorage as any)._localforage = (
    instances0.originStorage as any
  )._localforage;

  const value = { a: 1 };
  let resultPromise: Promise<{
    off: () => void;
    broadcastChanges: boolean;
  }>;
  let result: {
    off: () => void;
    broadcastChanges: boolean;
  };
  let watch = new Promise((r) => {
    resultPromise = instances1.originStorageClient.onChange((data) => {
      expect(data).toEqual({
        key: 'v',
        value,
      });
      r(null);
    });
  });
  await instances0.originStorageClient.setItem('v', value);
  await watch;
  result = await resultPromise!;
  expect(result.broadcastChanges).toBeTruthy();
  result.off();

  watch = new Promise((r) => {
    resultPromise = instances1.originStorageClient.onChange((data) => {
      expect(data).toEqual({
        key: 'v',
        value: null,
      });
      r(null);
    });
  });
  await instances0.originStorageClient.removeItem('v');
  await watch;
  result = await resultPromise!;
  expect(result.broadcastChanges).toBeTruthy();
  result.off();

  await instances0.originStorageClient.setItem('x', 1);
  await instances0.originStorageClient.setItem('y', 1);
  await new Promise((r) => setTimeout(r));
  watch = new Promise((r) => {
    instances1.originStorageClient.onChange((data) => {
      expect(data).toEqual({
        key: null,
      });
      r(null);
    });
  });
  instances0.originStorageClient.clear();
  await watch;
});
