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
  const item: cachingInterface = {
    dataName: itemName,
    dataStore: dataStored,
    created_at: new Date().toISOString(),
    recheck_interval,
  };
  cache.set(itemName, item);
}
