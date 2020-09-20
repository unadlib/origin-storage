import localforage from 'localforage';

export class OriginStorage {
  protected _localforage: ReturnType<typeof localforage.createInstance>;

  constructor() {
    this._localforage = localforage.createInstance({
      //
    });
  }
}
