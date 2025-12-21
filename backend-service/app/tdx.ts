import { getCachedData, saveCacheData } from "./ram_caching_layer";
import log from "./logging_service";

const authkey = process.env.AUTH_KEY || "";
const tdxClientId = process.env.TDX_CLIENT_ID || "";
const tdxClientSecret = process.env.TDX_CLIENT_SECRET || "";

// if they change it im screwed
interface TokenRes {
  access_token: string;
  expires_in: number;
  refresh_expires_in: number;
  token_type: string;
  "not-before-policy": number;
  scope: string;
}

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
  const data = (await response.json()) as TokenRes;
  return data.access_token;
}

export async function getToken(
  clientId: string,
  clientSecret: string,
): Promise<string> {
  try {
    const cachedToken = getCachedData("tdx_token");
    if (!cachedToken.expired) {
      return cachedToken.data;
    }

    const newToken = await getNewToken(clientId, clientSecret);
    saveCacheData("tdx_token", newToken, 3600 * 24); // 一天
    return newToken;
  } catch (e) {
    log("error", `getToken error: ${e}`);
    throw e;
  }
}

export async function getBusRouteData(city: string, bus: string) {
  try {
    const cacheBusRouteData = getCachedData(
      `tdx_bus_route_data_${city}_${bus}`,
    );
    const token = await getToken(tdxClientId, tdxClientSecret);
    const response = await fetch(
      `https://tdx.transportdata.tw/api/basic/v2/Bus/Route/City/${city}?%24filter=RouteName/En eq '${bus}'&%24format=JSON`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    const data = await response.json();
    saveCacheData(`tdx_bus_route_data_${city}_${bus}`, data, 3600 * 24); // 一天
    return data;
  } catch (e) {
    log("error", `getBusRouteData error: ${e}`);
    throw e;
  }
}

export async function getAlerts() {
  try {
    const cachedAlerts = getCachedData("tdx_bus_alerts");
    if (!cachedAlerts.expired) {
      return cachedAlerts.data;
    }
    const token = await getToken(tdxClientId, tdxClientSecret);
    const req = await fetch(
      "https://tdx.transportdata.tw/webapi/alertInfo/count/bus",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    const res = await req.json();
    saveCacheData("tdx_bus_alerts", res, 3600); // 一小時
    return res;
  } catch (e) {
    log("error", `getAlerts error: ${e}`);
    throw e;
  }
}

export async function getNewsInfo(city: string) {
  const cachedNews = getCachedData(`tdx_news_${city}`);
  if (!cachedNews.expired) {
    return cachedNews.data;
  }
  const token = await getToken(tdxClientId, tdxClientSecret);
  const req = await fetch(
    `https://tdx.transportdata.tw/api/basic/v2/Bus/News/City/${city}?%24format=JSON`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  const res = await req.json();
  saveCacheData(`tdx_news_${city}`, res, 3600);
  return res;
}

export async function getFareData(city: string, bus: string) {
  try {
    const cachedFare = getCachedData(`tdx_fare_${city}_${bus}`);
    if (!cachedFare.expired) {
      return cachedFare.data;
    }
    const token = await getToken(tdxClientId, tdxClientSecret);
    const req = await fetch(
      `https://tdx.transportdata.tw/api/basic/v2/Bus/RouteFare/City/${city}?%24filter=RouteID eq '${bus}'&%24format=JSON`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    const res = await req.json();
    saveCacheData(`tdx_fare_${city}_${bus}`, res, 3600 * 24 * 30); // 一個月
    return res;
  } catch (e) {
    log("error", `getFareData error: ${e}`);
  }
}

export async function getBlockages(city: string) {}

export async function getStops(city: string, bus: string, direction: number) {
  try {
    const cachedStops = getCachedData(`tdx_stops_${city}_${bus}_${direction}`);
    if (!cachedStops.expired) {
      return cachedStops.data;
    }
    const token = await getToken(tdxClientId, tdxClientSecret);
    const req = await fetch(
      `https://tdx.transportdata.tw/api/basic/v2/Bus/DisplayStopOfRoute/City/${city}?%24filter=RouteName/En eq '${bus}' and Direction eq ${direction}&%24top=1&%24format=JSON`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    const res = (await req.json()) as any[];
    const buildData = {
      routeID: res[0].RouteID,
      zhName: res[0].RouteName.Zh_tw,
      enName: res[0].RouteName.En,
      timeUpdated: res[0].UpdateTime,
      versionId: res[0].VersionID,
      stops: res[0].Stops.map((stop: any) => ({
        stopUid: stop.StopUID,
        stationId: stop.StationID,
        stopBoarding: stop.xStopBoarding,
        stopSequence: stop.StopSequence,
        zhName: stop.StopName.Zh_tw,
        enName: stop.StopName.En || "",
        stopLat: stop.StopPosition.PositionLat,
        stopLong: stop.StopPosition.PositionLon,
      })),
    };
    saveCacheData(
      `tdx_stops_${city}_${bus}_${direction}`,
      buildData,
      3600 * 24 * 7,
    ); // 一周
    return buildData;
  } catch (e) {
    log("error", `getStops error: ${e}`);
    throw e;
  }
}

export async function searchBuses(
  query: string,
  city: string,
  nearestLocation?: string,
) {
  try {
    if (!(query && city)) {
      throw new Error("Invalid query or city");
    }
    const token = await getToken(tdxClientId, tdxClientSecret);
    const req = await fetch(
      `https://tdx.transportdata.tw/api/basic/v2/Bus/DisplayStopOfRoute/City/${city}?%24filter=contains(RouteName/En,'${encodeURIComponent(query)}') and Direction eq 0&%24select=RouteName,RouteID&%24format=JSON`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    const res = (await req.json()) as any[];
    return {
      routes: [
        ...res.map((item: any) => {
          return {
            zh: item.RouteName.Zh_tw,
            en: item.RouteName.En,
            id: item.RouteID,
          };
        }),
      ],
      versionId: res[0].VersionID,
      UpdateTime: res[0].UpdateTime,
    };
    return res;
  } catch (e) {
    log("error", `An error has occurred: ${e}`);
    throw e;
  }
}
