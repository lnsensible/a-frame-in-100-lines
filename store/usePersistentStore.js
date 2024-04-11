import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

const usePersistentStore = create(
  persist(
    (set, get) => ({
      waves: 0
    }),
    {
      name: 'persistence-storage', // name of item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage) // (optional) by default the 'localStorage' is used
    }
  )
);

export default usePersistentStore;
