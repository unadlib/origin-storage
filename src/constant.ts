export const databases = {
  LocalStorage: 'LOCALSTORAGE',
  WebSQL: 'WEBSQL',
  IndexedDB: 'INDEXEDDB',
} as const;

export const NoConnectError = 'The OriginStorage is not connected yet.';
export const NoAccessError =
  'The OriginStorage does not have any read/write access.';
