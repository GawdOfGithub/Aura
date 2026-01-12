import { createMMKV } from 'react-native-mmkv';


export const mmkvStorage = createMMKV({
  id: '@video-chat-storage',
});


export const mmkvReduxStorage = {
  setItem: (key: string, value: string): Promise<boolean> => {
    mmkvStorage.set(key, value);
    return Promise.resolve(true);
  },
  getItem: (key: string): Promise<string | undefined> => {
    const value = mmkvStorage.getString(key);
    return Promise.resolve(value);
  },
  removeItem: (key: string): Promise<void> => {
    mmkvStorage.remove(key);
    return Promise.resolve();
  },
};