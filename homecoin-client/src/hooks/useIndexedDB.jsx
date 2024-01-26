import { useEffect, useState } from 'react';
import { reconstructChain, serializeChain, reconstructUnminedBlocks, serializeUnminedBlocks } from '../chain/blockchain';

const useIndexedDB = (key, storeName, initialValue) => {
  const [value, setValue] = useState(initialValue);
  const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(false);

  // Open the database and create the store if it doesn't exist
  const openDB = () => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('homecoin');

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName);
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  };

  // Read value from the store
  const readValue = async (db) => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const getRequest = store.get(key);

      if (key === "chain"){
        getRequest.onsuccess = () => resolve((getRequest.result === undefined) ? undefined : reconstructChain(getRequest.result));
        getRequest.onerror = () => reject(getRequest.error);
      }
      else if (key === "unmined"){
        getRequest.onsuccess = () => resolve((getRequest.result === undefined) ? undefined : reconstructUnminedBlocks(getRequest.result));
        getRequest.onerror = () => reject(getRequest.error);
      }
      else{
        getRequest.onsuccess = () => resolve(getRequest.result);
        getRequest.onerror = () => reject(getRequest.error);
      }
    });
  };

  // Write value to the store
  const writeValueSafe = async (db, value) => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);

      if (key === "chain"){
        const putRequest = store.put(serializeChain(value), key)
        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(putRequest.error);
      }
      else if (key === "unmined"){
        const putRequest = store.put(serializeUnminedBlocks(value), key)
        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(putRequest.error);
      }
      else {
        const putRequest = store.put(value, key);
        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(putRequest.error);
      }
      
    });
  };

  // Initialize and load value from IndexedDB
  useEffect(() => {
    let db;
    openDB()
      .then((openedDB) => {
        db = openedDB;
        return readValue(db);
      })
      .then((storedValue) => {
        if (storedValue !== undefined) {
          setValue(storedValue);
        } else {
          writeValueSafe(db, initialValue);
        }
        setIsInitialLoadComplete(true)
      })
      .catch((error) => console.error('IndexedDB error:', error));
  }, []);

  // Update IndexedDB when value changes
  useEffect(() => {
    if (isInitialLoadComplete){
      openDB()
      .then((db) => {
        writeValueSafe(db, value)
      })
      .catch((error) => console.error('IndexedDB error:', error));
    }

  }, [value, isInitialLoadComplete]);

  return [value, setValue, isInitialLoadComplete];
};

export default useIndexedDB;