// this file is mostly vibe coded using the model Grok Code Fast 1.
interface cachingInterface {
  dataName: string;
  dataStore: any;
  created_at: string;
  recheck_interval: number;
}

interface returnGetCachedDataFormat {
  expired: boolean;
  data: any | null;
}

const cache = new Map<string, cachingInterface>();

// 快取條目上限。cache key 內含使用者可控的 city/bus，
// 沒有上限的話攻擊者可以用大量不重複的 key 把 RAM 灌爆。
const MAX_CACHE_ENTRIES = 1000;

function evictIfNeeded() {
  if (cache.size < MAX_CACHE_ENTRIES) {
    return;
  }
  const now = new Date();
  for (const [key, item] of cache) {
    const diff = now.getTime() - new Date(item.created_at).getTime();
    if (diff > item.recheck_interval * 1000) {
      cache.delete(key);
    }
  }
  while (cache.size >= MAX_CACHE_ENTRIES) {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;
    for (const [key, item] of cache) {
      const created = new Date(item.created_at).getTime();
      if (created < oldestTime) {
        oldestTime = created;
        oldestKey = key;
      }
    }
    if (oldestKey === null) {
      break;
    }
    cache.delete(oldestKey);
  }
}

export function getCachedData(itemName: string): returnGetCachedDataFormat {
  const item = cache.get(itemName);
  if (!item) {
    return { expired: true, data: null };
  }
  const now = new Date();
  const created = new Date(item.created_at);
  const diff = now.getTime() - created.getTime();
  const expired = diff > item.recheck_interval * 1000;
  return { expired, data: item.dataStore };
}

export function saveCacheData(
  itemName: string,
  dataStored: any,
  recheck_interval: number,
) {
  if (dataStored === undefined) {
    return;
  }
  evictIfNeeded();
  const item: cachingInterface = {
    dataName: itemName,
    dataStore: dataStored,
    created_at: new Date().toISOString(),
    recheck_interval,
  };
  cache.set(itemName, item);
}
