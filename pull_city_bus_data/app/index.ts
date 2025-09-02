import fs from "fs";
import { getNewToken } from "./tdx";

const tdxClientId = process.env.TDX_CLIENT_ID || "";
const tdxClientSecret = process.env.TDX_CLIENT_SECRET || "";
const token = await getNewToken(tdxClientId, tdxClientSecret);

const cities = [
  "Taipei",
  "NewTaipei",
  "Taoyuan",
  "Taichung",
  "Tainan",
  "Kaohsiung",
  "Keelung",
  "Hsinchu",
  "HsinchuCounty",
  "MiaoliCounty",
  "ChanghuaCounty",
  "NantouCounty",
  "YunlinCounty",
  "ChiayiCounty",
  "Chiayi",
  "PingtungCounty",
  "YilanCounty",
  "HualienCounty",
  "TaitungCounty",
  "KinmenCounty",
  "PenghuCounty",
  "LienchiangCounty",
];

async function pullVersion(city: string) {
  const req = await fetch(
    `https://tdx.transportdata.tw/api/basic/v2/Bus/DataVersion/City/${city}?%24format=JSON`,
  );
  const res = await req.json();
}

async function pullCityBusData(city: string, tokenA: string) {
  const req = await fetch(
    `https://tdx.transportdata.tw/api/basic/v2/Bus/RealTimeByFrequency/City/${city}?%24format=JSON`,
    {
      headers: {
        Authorization: `Bearer ${tokenA}`,
      },
    },
  );
  const res = await req.json();
}

for (const i in cities) {
  await pullVersion(i);
  await pullCityBusData(i, token);
}
