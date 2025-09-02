import { getCachedData, saveCacheData } from "./ram_caching_layer";

if (!process.env.AUTH_KEY) {
  console.error("Missing AUTH_KEY env value.");
  process.exit(1);
}
if (!process.env.TDX_API) {
  console.error("Missing TDX_API env value.");
  process.exit(1);
}
console.log(`Service started at port :${process.env.SERVICE_PORT || 4402} \n`);
const enableLogTraffic = process.env.LOG_TRAFFIC || true;
Bun.serve({
  port: process.env.SERVICE_PORT || 4402,
  fetch(req, server) {
    const url = new URL(req.url);
    if (enableLogTraffic) {
      console.log(
        `[${new Date().toISOString()}] IP: ${server.requestIP(req)?.address || "IP_NOT_FOUND"} ${req.method} ${url.pathname}`,
      );
    }

    if (url.pathname === "/") {
      return new Response("This ktshia backend service works :)");
    }

    if (url.pathname.startsWith("/api/bus/")) {
      return new Response("Hi");
    }

    return new Response(
      JSON.stringify({
        error: "Not Found",
        status: 404,
      }),
      { status: 404, headers: { "Content-Type": "application/json" } },
    );
  },
});
