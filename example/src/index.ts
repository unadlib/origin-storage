import { OriginStorageClient } from 'origin-storage';

(window as any).originStorageClient = new OriginStorageClient({
  uri: 'http://localhost:9000/storage.html',
});
