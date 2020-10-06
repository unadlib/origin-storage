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
  });

  const fn = jest.fn();

  originStorageClient.onConnect(fn);

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
  });

  expect(fn.mock.calls.length).toBe(1);
  await new Promise((r) => setTimeout(r));
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
  const timeoutError = new Error('timeout');
  let result = await Promise.race([
    originStorageClient.getItem('v'),
    new Promise((r) =>
      setTimeout(() => {
        r(timeoutError);
      }, 100)
    ),
  ]);
  expect(result === timeoutError).toBeTruthy();

  result = await Promise.race([
    originStorageClient.keys(),
    new Promise((r) =>
      setTimeout(() => {
        r(timeoutError);
      }, 100)
    ),
  ]);
  expect(result === timeoutError).toBeTruthy();

  result = await Promise.race([
    originStorageClient.length(),
    new Promise((r) =>
      setTimeout(() => {
        r(timeoutError);
      }, 100)
    ),
  ]);
  expect(result === timeoutError).toBeTruthy();

  result = await Promise.race([
    originStorageClient.key(0),
    new Promise((r) =>
      setTimeout(() => {
        r(timeoutError);
      }, 100)
    ),
  ]);
  expect(result === timeoutError).toBeTruthy();
});

test('only read', async () => {
  const { originStorageClient } = await getInstances({
    read: true,
    write: false,
  });
  const value = { a: 1 };
  const timeoutError = new Error('timeout');
  let result = await Promise.race([
    originStorageClient.setItem('v', value),
    new Promise((r) =>
      setTimeout(() => {
        r(timeoutError);
      }, 100)
    ),
  ]);
  expect(result === timeoutError).toBeTruthy();

  result = await Promise.race([
    originStorageClient.removeItem('v'),
    new Promise((r) =>
      setTimeout(() => {
        r(timeoutError);
      }, 100)
    ),
  ]);
  expect(result === timeoutError).toBeTruthy();

  result = await Promise.race([
    originStorageClient.clear(),
    new Promise((r) =>
      setTimeout(() => {
        r(timeoutError);
      }, 100)
    ),
  ]);
  expect(result === timeoutError).toBeTruthy();

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
  (instances1.originStorage as any)._localforage = (instances0.originStorage as any)._localforage;

  const value = { a: 1 };
  let watch = new Promise((r) => {
    instances1.originStorageClient.onChange((data) => {
      expect(data).toEqual({
        key: 'v',
        value,
      });
      r();
    });
  })
  await instances0.originStorageClient.setItem('v', value);
  await watch;

  watch = new Promise((r) => {
    instances1.originStorageClient.onChange((data) => {
      expect(data).toEqual({
        key: 'v',
        value: null,
      });
      r();
    });
  })
  await instances0.originStorageClient.removeItem('v');
  await watch;

  await instances1.originStorageClient.onChange(() => {});
  await instances0.originStorageClient.setItem('x', 1);
  await instances0.originStorageClient.setItem('y', 1);
  watch = new Promise((r) => {
    instances1.originStorageClient.onChange((data) => {
      expect(data).toEqual({
        key: null,
      });
      r();
    });
  })
  instances0.originStorageClient.clear();
  await watch;
});
