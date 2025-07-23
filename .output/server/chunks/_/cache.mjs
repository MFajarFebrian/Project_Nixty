import { o as defineDriver, p as createStorage } from './nitro.mjs';

const DRIVER_NAME = "memory";
const memoryDriver = defineDriver(() => {
  const data = /* @__PURE__ */ new Map();
  return {
    name: DRIVER_NAME,
    getInstance: () => data,
    hasItem(key) {
      return data.has(key);
    },
    getItem(key) {
      return data.get(key) ?? null;
    },
    getItemRaw(key) {
      return data.get(key) ?? null;
    },
    setItem(key, value) {
      data.set(key, value);
    },
    setItemRaw(key, value) {
      data.set(key, value);
    },
    removeItem(key) {
      data.delete(key);
    },
    getKeys() {
      return [...data.keys()];
    },
    clear() {
      data.clear();
    },
    dispose() {
      data.clear();
    }
  };
});

const storage = createStorage({
  driver: memoryDriver()
});
const CACHE_TTL = 5 * 60 * 1e3;
async function useCache(key, fetcher) {
  const cached = await storage.getItem(key);
  const now = Date.now();
  if (cached && now - cached.timestamp < CACHE_TTL) {
    console.log(`\u{1F680} Serving '${key}' from cache`);
    return cached.data;
  }
  console.log(`\u{1F4E1} Fetching fresh data for '${key}'`);
  const data = await fetcher();
  await storage.setItem(key, { data, timestamp: now });
  console.log(`\u{1F4BE} Cached '${key}' for 5 minutes`);
  return data;
}

export { useCache as u };
//# sourceMappingURL=cache.mjs.map
