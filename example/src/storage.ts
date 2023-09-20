import { OriginStorage } from 'origin-storage';

(window as any).originStorage = new OriginStorage({
  broadcastChanges: true,
  targetOrigin: 'http://localhost:9000',
});
