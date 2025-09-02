import fs from "fs";
import path from "path";
import { getNewToken } from "./tdx";
import { sleep } from "bun";

// Ensure directory exists
function ensureDirectoryExists(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

if (!process.env.TDX_CLIENT_ID || !process.env.TDX_CLIENT_SECRET) {
  console.error(
    "TDX_CLIENT_ID and TDX_CLIENT_SECRET must be set in environment variables",
  );
  process.exit(1);
}

const tdxClientId = process.env.TDX_CLIENT_ID;
const tdxClientSecret = process.env.TDX_CLIENT_SECRET;
let token = await getNewToken(tdxClientId, tdxClientSecret);

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

interface VersionResponse {
  VersionID: number;
  UpdateTime: string;
  UpdateCheckTime: string;
}

interface VersionData {
  version: Array<{
    city: string;
    version: number;
    UpdateTime: string;
    RemoteServerUpdateTime: string;
    RemoteServerCheckUpdateTime: string;
  }>;
}

interface BusResponse {
  VersionID: number;
  UpdateTime: string;
  UpdateCheckTime: string;
  Data: any[];
}

async function pullVersion(
  city: string,
  token: string,
): Promise<number | null> {
  try {
    const req = await fetch(
      `https://tdx.transportdata.tw/api/basic/v2/Bus/DataVersion/City/${city}?%24format=JSON`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!req.ok) {
      const errorMsg = `Error fetching version for ${city}: ${req.status} ${req.statusText}`;
      console.error(errorMsg);

      // Log response details for debugging
      const responseText = await req.text();
      console.error(`Response body: ${responseText}`);

      if (req.status === 401 || req.status === 403) {
        console.error(
          "Token might be invalid or expired. Getting new token...",
        );
        const newToken = await getNewToken(tdxClientId, tdxClientSecret);
        return pullVersion(city, newToken);
      }

      if (req.status === 429) {
        console.log("Rate limit hit. Waiting 1 minute before retrying...");
        await sleep(60 * 1000); // Wait 1 minute
        return pullVersion(city, token); // Retry the request
      }

      return null;
    }

    const res = (await req.json()) as VersionResponse;

    // Load existing version file
    const versionFilePath = path.join(
      __dirname,
      "../../city_bus_data/version.json",
    );
    let versionData = { version: [] };

    try {
      if (fs.existsSync(versionFilePath)) {
        const fileContent = fs.readFileSync(versionFilePath, "utf-8");
        versionData = JSON.parse(fileContent);
      }
    } catch (error) {
      console.error("Error reading version file:", error);
    }

    // Create new version entry
    const versionEntry = {
      city: city,
      version: res.VersionID,
      UpdateTime: res.UpdateTime,
      RemoteServerUpdateTime: res.UpdateTime,
      RemoteServerCheckUpdateTime: res.UpdateCheckTime,
    };

    // Update or add entry
    const existingIndex = versionData.version.findIndex((v) => v.city === city);
    if (existingIndex >= 0) {
      versionData.version[existingIndex] = versionEntry;
    } else {
      versionData.version.push(versionEntry);
    }

    // Save updated version file
    try {
      fs.writeFileSync(
        versionFilePath,
        JSON.stringify(versionData, null, 4),
        "utf8",
      );
    } catch (error) {
      console.error("Error writing version file:", error);
    }
  } catch (error) {
    console.error(`Error in pullVersion for ${city}:`, error);
  }
}

async function pullCityBusData(city: string, token: string): Promise<boolean> {
  try {
    console.log(
      `Fetching bus data for ${city} with token: ${token.substring(0, 10)}...`,
    );
    const req = await fetch(
      `https://tdx.transportdata.tw/api/basic/v2/Bus/RealTimeByFrequency/City/${city}?%24format=JSON`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!req.ok) {
      const errorMsg = `Error fetching bus data for ${city}: ${req.status} ${req.statusText}`;
      console.error(errorMsg);

      // Log response details for debugging
      const responseText = await req.text();
      console.error(`Response body: ${responseText}`);

      if (req.status === 401 || req.status === 403) {
        console.error(
          "Token might be invalid or expired. Getting new token...",
        );
        const newToken = await getNewToken(tdxClientId, tdxClientSecret);
        return pullCityBusData(city, newToken);
      }

      if (req.status === 429) {
        console.log("Rate limit hit. Waiting 1 minute before retrying...");
        await sleep(60 * 1000); // Wait 1 minute
        return pullCityBusData(city, token); // Retry the request
      }

      return false;
    }

    const res = (await req.json()) as BusResponse;

    // Create city_bus_data directory if it doesn't exist
    const cityBusDataDir = path.join(__dirname, "../../city_bus_data");
    ensureDirectoryExists(cityBusDataDir);

    // Save city bus data with proper case in filename
    const dataFilePath = path.join(cityBusDataDir, `${city}.json`);
    try {
      fs.writeFileSync(dataFilePath, JSON.stringify(res, null, 4), "utf8");
      console.log(`Successfully updated ${city}.json`);
      return true;
    } catch (error) {
      console.error(`Error writing city bus data for ${city}:`, error);
      return false;
    }
  } catch (error) {
    console.error(`Error in pullCityBusData for ${city}:`, error);
    return false;
  }
}

// Main execution loop
for (const city of cities) {
  try {
    console.log(`Processing ${city}...`);

    // Load existing version file to check current version
    const versionFilePath = path.join(
      __dirname,
      "../../city_bus_data/version.json",
    );
    let currentVersion = null;

    if (fs.existsSync(versionFilePath)) {
      try {
        const versionData = JSON.parse(
          fs.readFileSync(versionFilePath, "utf-8"),
        );
        const cityEntry = versionData.version.find((v: any) => v.city === city);
        if (cityEntry) {
          currentVersion = cityEntry.version;
        }
      } catch (error) {
        console.error(`Error reading version file for ${city}:`, error);
      }
    }

    // Get new version from API
    const versionResponse = await pullVersion(city, token);

    if (!versionResponse) {
      console.log(`Skipping ${city} due to version fetch error`);
      await sleep(1000);
      continue;
    }

    // Skip if version matches
    if (currentVersion === versionResponse) {
      console.log(
        `Skipping ${city} - version ${versionResponse} already up to date`,
      );
      await sleep(1000);
      continue;
    }

    console.log(
      `Updating ${city} from version ${currentVersion || "none"} to ${versionResponse}`,
    );

    // Pull and save new data
    const success = await pullCityBusData(city, token);
    if (!success) {
      console.error(`Failed to update data for ${city}`);
    }

    await sleep(1000); // 1 second delay before next city
  } catch (error) {
    console.error(`Error processing ${city}:`, error);
  }
}
