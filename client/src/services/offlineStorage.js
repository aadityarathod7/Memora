// IndexedDB wrapper for offline storage

const DB_NAME = 'memora-offline';
const DB_VERSION = 1;
const ENTRIES_STORE = 'entries';
const PENDING_STORE = 'pending-sync';

let db = null;

// Initialize the database
export const initDB = () => {
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
      const database = event.target.result;

      // Store for cached entries
      if (!database.objectStoreNames.contains(ENTRIES_STORE)) {
        const entriesStore = database.createObjectStore(ENTRIES_STORE, { keyPath: '_id' });
        entriesStore.createIndex('createdAt', 'createdAt', { unique: false });
        entriesStore.createIndex('mood', 'mood', { unique: false });
      }

      // Store for entries created offline (pending sync)
      if (!database.objectStoreNames.contains(PENDING_STORE)) {
        database.createObjectStore(PENDING_STORE, { keyPath: 'tempId', autoIncrement: true });
      }
    };
  });
};

// Get all cached entries
export const getCachedEntries = async () => {
  await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([ENTRIES_STORE], 'readonly');
    const store = transaction.objectStore(ENTRIES_STORE);
    const request = store.getAll();

    request.onsuccess = () => {
      const entries = request.result || [];
      // Sort by createdAt descending
      entries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      resolve(entries);
    };
    request.onerror = () => reject(request.error);
  });
};

// Cache entries from server
export const cacheEntries = async (entries) => {
  await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([ENTRIES_STORE], 'readwrite');
    const store = transaction.objectStore(ENTRIES_STORE);

    entries.forEach(entry => {
      store.put(entry);
    });

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
};

// Cache a single entry
export const cacheEntry = async (entry) => {
  await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([ENTRIES_STORE], 'readwrite');
    const store = transaction.objectStore(ENTRIES_STORE);
    const request = store.put(entry);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

// Delete a cached entry
export const deleteCachedEntry = async (id) => {
  await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([ENTRIES_STORE], 'readwrite');
    const store = transaction.objectStore(ENTRIES_STORE);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

// Save entry for offline sync
export const savePendingEntry = async (entry) => {
  await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([PENDING_STORE], 'readwrite');
    const store = transaction.objectStore(PENDING_STORE);
    const request = store.add({
      ...entry,
      createdOffline: new Date().toISOString()
    });

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

// Get all pending entries
export const getPendingEntries = async () => {
  await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([PENDING_STORE], 'readonly');
    const store = transaction.objectStore(PENDING_STORE);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
};

// Delete a pending entry after successful sync
export const deletePendingEntry = async (tempId) => {
  await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([PENDING_STORE], 'readwrite');
    const store = transaction.objectStore(PENDING_STORE);
    const request = store.delete(tempId);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

// Check if we're offline
export const isOffline = () => {
  return !navigator.onLine;
};

// Sync pending entries when back online
export const syncPendingEntries = async (createEntryFn) => {
  const pending = await getPendingEntries();

  for (const entry of pending) {
    try {
      const { tempId, createdOffline, ...entryData } = entry;
      await createEntryFn(entryData);
      await deletePendingEntry(tempId);
    } catch (err) {
      console.error('Failed to sync entry:', err);
    }
  }
};

// Listen for online/offline events
export const setupOfflineListeners = (onOnline, onOffline) => {
  window.addEventListener('online', onOnline);
  window.addEventListener('offline', onOffline);

  return () => {
    window.removeEventListener('online', onOnline);
    window.removeEventListener('offline', onOffline);
  };
};
