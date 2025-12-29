import * as FileSystem from 'expo-file-system/legacy';

const baseDirectory = FileSystem.documentDirectory ?? FileSystem.cacheDirectory;

if (!baseDirectory) {
  throw new Error('No file system directory available for async storage');
}

const STORAGE_FILE = `${baseDirectory}async-storage.json`;

type StorageState = Record<string, string>;

let cache: StorageState | null = null;

async function ensureCache(): Promise<StorageState> {
  if (cache) return cache;

  try {
    const contents = await FileSystem.readAsStringAsync(STORAGE_FILE, { encoding: 'utf8' });
    cache = JSON.parse(contents) as StorageState;
  } catch {
    cache = {};
  }

  return cache as StorageState;
}

async function persist(nextState: StorageState) {
  cache = nextState;
  const serialized = JSON.stringify(nextState);
  await FileSystem.writeAsStringAsync(STORAGE_FILE, serialized, { encoding: 'utf8' });
}

async function getItem(key: string): Promise<string | null> {
  const state = await ensureCache();
  return key in state ? state[key] : null;
}

async function setItem(key: string, value: string): Promise<void> {
  const state = await ensureCache();
  await persist({ ...state, [key]: value });
}

async function removeItem(key: string): Promise<void> {
  const state = await ensureCache();
  if (!(key in state)) return;

  const nextState = { ...state };
  delete nextState[key];
  await persist(nextState);
}

export default {
  getItem,
  setItem,
  removeItem,
};
