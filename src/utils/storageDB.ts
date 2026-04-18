import { set, get, del } from 'idb-keyval';

export const saveAttachment = async (id: string, file: File): Promise<void> => {
  try {
    await set(id, file);
  } catch (err) {
    console.error('Failed to save attachment to IndexedDB:', err);
  }
};

export const getAttachment = async (id: string): Promise<File | undefined> => {
  try {
    return await get<File>(id);
  } catch (err) {
    console.error('Failed to get attachment from IndexedDB:', err);
    return undefined;
  }
};

export const deleteAttachment = async (id: string): Promise<void> => {
  try {
    await del(id);
  } catch (err) {
    console.error('Failed to delete attachment from IndexedDB:', err);
  }
};
