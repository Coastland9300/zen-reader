const DB_NAME = 'ZenReaderDB';
const STORE_NAME = 'pdf_files';
const DB_VERSION = 1;

export const initDB = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject('Error opening database');

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve();
  });
};

export const savePDFBlob = async (id: string, blob: Blob): Promise<void> => {
  const dbRequest = indexedDB.open(DB_NAME, DB_VERSION);
  return new Promise((resolve, reject) => {
    dbRequest.onsuccess = () => {
      const db = dbRequest.result;
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put(blob, id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject('Error saving blob');
    };
  });
};

export const getPDFBlob = async (id: string): Promise<Blob | null> => {
  const dbRequest = indexedDB.open(DB_NAME, DB_VERSION);
  return new Promise((resolve, reject) => {
    dbRequest.onsuccess = () => {
      const db = dbRequest.result;
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject('Error fetching blob');
    };
  });
};

export const deletePDFBlob = async (id: string): Promise<void> => {
  const dbRequest = indexedDB.open(DB_NAME, DB_VERSION);
  return new Promise((resolve, reject) => {
    dbRequest.onsuccess = () => {
      const db = dbRequest.result;
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.delete(id);
      tx.oncomplete = () => resolve();
    };
  });
};
