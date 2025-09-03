import { getCachedData, saveCacheData } from "./ram_caching_layer";

const authkey = process.env.AUTH_KEY || "";
const tdxClientId = process.env.TDX_CLIENT_ID || "";
const tdxClientSecret = process.env.TDX_CLIENT_SECRET || "";

async function getNewToken(
  clientId: string,
  clientSecret: string,
): Promise<string> {
  const response = await fetch(
    "https://tdx.transportdata.tw/auth/realms/TDXConnect/protocol/openid-connect/token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`,
    },
  );
  const data = await response.json();
  return data.access_token;
}

export async function getToken(
  clientId: string,
  clientSecret: string,
): Promise<string> {
  const cachedToken = getCachedData("tdx_token");
  if (!cachedToken.expired) {
    return cachedToken.data;
  }

  const newToken = await getNewToken(clientId, clientSecret);
  saveCacheData("tdx_token", newToken, 3600 * 24); // 一天
  return newToken;
}

export async function getBusRouteData(city: string, bus: string) {
  const cacheBusRouteData = getCachedData(`tdx_bus_route_data_${city}_${bus}`);
  const token = await getToken(tdxClientId, tdxClientSecret);
  const response = await fetch(
    `https://tdx.transportdata.tw/api/basic/v2/Bus/Route/City/${city}?$filter=RouteName/En eq '${bus}'&%24format=JSON`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  const data = await response.json();
  saveCacheData(`tdx_bus_route_data_${city}_${bus}`, data, 3600 * 24); // 一天
  return data;
}

export async function getAlerts() {
  const cachedAlerts = getCachedData("tdx_bus_alerts");
  if (!cachedAlerts.expired) {
    return cachedAlerts.data;
  }
  const token = await getToken(tdxClientId, tdxClientSecret);
  const req = await fetch(
    "https://tdx.transportdata.tw/webapi/alertInfo/count/bus",
  );
  const res = await req.json();
  saveCacheData("tdx_bus_alerts", res, 3600); // 一小時
  return res;
}

export async function getNewsInfo(city: string) {
    const cachedNews = getCachedData(`tdx_news_${city}`);
    if (!cachedNews.expired) {
        return cachedNews.data;
    }
    const token = await getToken(tdxClientId, tdxClientSecret);
    const req = await fetch(`https://tdx.transportdata.tw/api/basic/v2/Bus/News/City/${city}?%24format=JSON`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    const res = await req.json();
    saveCacheData(`tdx_news_${city}`, res, 3600);
    return res;
}

export async function getFareData(city: string, bus: string) {
    const cachedFare = getCachedData(`tdx_fare_${city}_${bus}`);
    if (!cachedFare.expired) {
        return cachedFare.data;
    }
    const token = await getToken(tdxClientId, tdxClientSecret);
    const req = await fetch(`https://tdx.transportdata.tw/api/basic/v2/Bus/RouteFare/City/${city}?$filter=RouteName/En eq '${bus}'&%24format=JSON`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    const res = await req.json();
    saveCacheData(`tdx_fare_${city}_${bus}`, res, 3600 * 24 * 30); // 一個月
    return res;
}

export async function getBlockages(city: string) {}

export async function getStops(city: string, bus: string) {
    const cachedStops = getCachedData(`tdx_stops_${city}_${bus}`);
    if (!cachedStops.expired) {
        return cachedStops.data;
    }
    const token = await getToken(tdxClientId, tdxClientSecret);
    const req = await fetch(`https://tdx.transportdata.tw/api/basic/v2/Bus/DisplayStopOfRoute/City/${city}?$filter=RouteName/En eq '${bus}'&%24format=JSON`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    const res = await req.json();
    saveCacheData(`tdx_stops_${city}_${bus}`, res, 3600 * 24 * 7); // 一周
    return res;
}