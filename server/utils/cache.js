import { createStorage } from 'unstorage';
import memoryDriver from 'unstorage/drivers/memory';

const storage = createStorage({
  driver: memoryDriver(),
});

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function useCache(key, fetcher) {
  const cached = await storage.getItem(key);
  const now = Date.now();

  if (cached && (now - cached.timestamp) < CACHE_TTL) {
    console.log(`🚀 Serving '${key}' from cache`);
    return cached.data;
  }

  console.log(`📡 Fetching fresh data for '${key}'`);
  const data = await fetcher();

  await storage.setItem(key, { data, timestamp: now });
  console.log(`💾 Cached '${key}' for 5 minutes`);

  return data;
}
