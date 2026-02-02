'use client';

import { useState, useEffect, useCallback } from 'react';

interface QueuedAction {
  id: string;
  type: 'recordBall' | 'undoBall';
  matchId: string;
  data: any;
  timestamp: number;
  retries: number;
}

const DB_NAME = 'scorerApp';
const DB_VERSION = 1;
const STORE_NAME = 'offlineQueue';

let db: IDBDatabase | null = null;

const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const store = database.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
        store.createIndex('matchId', 'matchId', { unique: false });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
};

export const useOfflineQueue = (matchId: string) => {
  const [isOnline, setIsOnline] = useState(true);
  const [queueLength, setQueueLength] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    // Check online status
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    updateOnlineStatus();
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    // Load queue length
    loadQueueLength();

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  const loadQueueLength = async () => {
    try {
      const database = await initDB();
      const transaction = database.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('matchId');
      const request = index.getAll(matchId);
      request.onsuccess = () => {
        setQueueLength(request.result.length);
      };
    } catch (error) {
      console.error('Failed to load queue length:', error);
    }
  };

  const addToQueue = useCallback(
    async (action: Omit<QueuedAction, 'id' | 'timestamp' | 'retries'>) => {
      try {
        const database = await initDB();
        const transaction = database.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);

        const queuedAction: QueuedAction = {
          ...action,
          id: `${action.type}-${Date.now()}-${Math.random()}`,
          timestamp: Date.now(),
          retries: 0,
        };

        await new Promise<void>((resolve, reject) => {
          const request = store.add(queuedAction);
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });

        setQueueLength((prev) => prev + 1);
        return queuedAction.id;
      } catch (error) {
        console.error('Failed to add to queue:', error);
        throw error;
      }
    },
    [matchId]
  );

  const removeFromQueue = useCallback(async (actionId: string) => {
    try {
      const database = await initDB();
      const transaction = database.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      await new Promise<void>((resolve, reject) => {
        const request = store.delete(actionId);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
      setQueueLength((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to remove from queue:', error);
    }
  }, []);

  const syncQueue = useCallback(
    async (syncFn: (action: QueuedAction) => Promise<void>) => {
      if (!isOnline || isSyncing) return;

      setIsSyncing(true);
      try {
        const database = await initDB();
        const transaction = database.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const index = store.index('matchId');
        const request = index.getAll(matchId);

        await new Promise<void>((resolve, reject) => {
          request.onsuccess = async () => {
            const actions: QueuedAction[] = request.result;
            const sortedActions = actions.sort((a, b) => a.timestamp - b.timestamp);

            for (const action of sortedActions) {
              try {
                await syncFn(action);
                await removeFromQueue(action.id);
              } catch (error) {
                console.error(`Failed to sync action ${action.id}:`, error);
                // Increment retries
                action.retries += 1;
                if (action.retries >= 3) {
                  // Remove after 3 retries
                  await removeFromQueue(action.id);
                }
              }
            }
            resolve();
          };
          request.onerror = () => reject(request.error);
        });
      } catch (error) {
        console.error('Failed to sync queue:', error);
      } finally {
        setIsSyncing(false);
        loadQueueLength();
      }
    },
    [isOnline, isSyncing, matchId, removeFromQueue]
  );

  return {
    isOnline,
    queueLength,
    isSyncing,
    addToQueue,
    syncQueue,
    loadQueueLength,
  };
};



