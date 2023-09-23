import { OriginStorage } from 'origin-storage';

(window as any).originStorage = new OriginStorage({
  broadcastChanges: true,
  targetOrigin: 'http://127.0.0.1:8080/',
});
