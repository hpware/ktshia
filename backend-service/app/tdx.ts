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

export async function getBusRouteData() {
  const token = await getToken(tdxClientId, tdxClientSecret);
  const response = await fetch(
    "https://tdx.transportdata.tw/api/basic/v2/Bus/Route",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  const data = await response.json();
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
