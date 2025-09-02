import { getCachedData, saveCacheData } from "./ram_caching_layer";
import { getToken } from "./tdx";

// load envs
const authkey = process.env.AUTH_KEY;
const tdxClientId = process.env.TDX_CLIENT_ID;
const tdxClientSecret = process.env.TDX_CLIENT_SECRET;

// checks envs
if (!authkey) {
  console.error("Missing AUTH_KEY env value.");
  process.exit(1);
}
if (!tdxClientId) {
  console.error("Missing TDX_CLIENT_ID env value.");
  process.exit(1);
}
if (!tdxClientSecret || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(tdxClientSecret)) {
  console.error("Missing or invalid TDX_CLIENT_SECRET env value (must be a valid UUID).");
  process.exit(1);
}

// Main logic
console.log(`Service started at port :${process.env.SERVICE_PORT || 4402} \n`);
const enableLogTraffic = process.env.LOG_TRAFFIC || true;
Bun.serve({
  port: process.env.SERVICE_PORT || 4402,
  fetch(req, server) {
    const url = new URL(req.url);
    if (enableLogTraffic) {
      console.log(
        `[${new Date().toISOString()}] ${server.requestIP(req).address} ${req.method} ${url.pathname}`,
      );
    }

    if (url.pathname === "/") {
      return new Response("This ktshia backend service works :)");
    }

    if (url.pathname.startsWith("/api/bus/")) {
        if (url.pathname.startsWith("/api/bus/stops/")) {
            return new Response(`Bus stops ${url.pathname}` );
        }
    }
    return new Response(
      JSON.stringify({
        error: `The endpoint ${url.pathname} was not found.`,
        status: 404,
      }),
      { status: 404, headers: { "Content-Type": "application/json" } },
    );
  },
});
