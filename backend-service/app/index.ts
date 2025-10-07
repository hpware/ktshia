import { getCachedData, saveCacheData } from "./ram_caching_layer";
import * as tdx from "./tdx";
import citiesData from "../data/cities";
import openai from "openai";

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
if (
  !tdxClientSecret ||
  !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    tdxClientSecret,
  )
) {
  console.error(
    "Missing or invalid TDX_CLIENT_SECRET env value (must be a valid UUID).",
  );
  process.exit(1);
}

// Main logic
console.log(`Service started at port :${process.env.SERVICE_PORT || 4402} \n`);
const enableLogTraffic = process.env.LOG_TRAFFIC || true;
Bun.serve({
  port: process.env.SERVICE_PORT || 4402, // default port is 4402
  async fetch(req, server) {
    const url = new URL(req.url);
    if (enableLogTraffic) {
      console.log(
        `[${new Date().toISOString()} ${server.requestIP(req)?.address || "IP_NOT_FOUND"} ${req.method} ${url.pathname}`,
      );
    }

    if (url.pathname === "/") {
      return new Response("This ktshia backend service works ^^");
    }

    if (req.headers.get("Authorization") !== `Bearer ${authkey}`) {
      return new Response(
        JSON.stringify({
          error: `The endpoint you are trying to access ${url.pathname} requires a bearer token. :(`,
          status: 401,
        }),
        { status: 401, headers: { "Content-Type": "application/json" } },
      );
    }

    // app verify path
    if (url.pathname === "/api/verify") {
      return new Response(
        JSON.stringify({
          message: "YAY you are logged in!",
          success: true,
        }),
        { headers: { "Content-Type": "application/json" } },
      );
    }
    // ai proxy
    if (url.pathname === "/api/ai/voice" && req.method === "POST") {
    }

    // bus paths
    if (url.pathname.startsWith("/api/bus/")) {
      if (url.pathname.startsWith("/api/bus/routes/")) {
        const parts = url.pathname.split("/");
        if (parts.length !== 6) {
          return new Response(
            JSON.stringify({
              error: "Invalid route format. Use /api/bus/routes/{city}/{bus}",
              status: 400,
            }),
            { status: 400, headers: { "Content-Type": "application/json" } },
          );
        }

        const [, , , , city, bus] = parts;
        if (!(city && bus)) {
          return new Response(
            JSON.stringify({
              error: "Invalid route format. Use /api/bus/routes/{city}/{bus}",
              status: 400,
            }),
            { status: 400, headers: { "Content-Type": "application/json" } },
          );
        }
        const routes = await tdx.getBusRouteData(city, bus);

        return new Response(JSON.stringify(routes), {
          headers: { "Content-Type": "application/json" },
        });
      }
      if (url.pathname.startsWith("/api/bus/fare/")) {
        const parts = url.pathname.split("/");
        if (parts.length !== 6) {
          return new Response(
            JSON.stringify({
              error: "Invalid route format. Use /api/bus/fare/{city}/{bus}",
              status: 400,
            }),
            { status: 400, headers: { "Content-Type": "application/json" } },
          );
        }

        const [, , , , city, bus] = parts;
        if (!(city && bus)) {
          return new Response(
            JSON.stringify({
              error: "Invalid route format. Use /api/bus/fare/{city}/{bus}",
              status: 400,
            }),
            { status: 400, headers: { "Content-Type": "application/json" } },
          );
        }
        const routes = await tdx.getFareData(city, bus);

        return new Response(JSON.stringify(routes), {
          headers: { "Content-Type": "application/json" },
        });
      }

      if (url.pathname.startsWith("/api/bus/stops/")) {
        const parts = url.pathname.split("/");
        if (parts.length !== 6) {
          return new Response(
            JSON.stringify({
              error: "Invalid route format. Use /api/bus/stops/{city}/{bus}",
              status: 400,
            }),
            { status: 400, headers: { "Content-Type": "application/json" } },
          );
        }

        const [, , , , city, bus] = parts;
        if (!(city && bus)) {
          return new Response(
            JSON.stringify({
              error: "Invalid route format. Use /api/bus/stops/{city}/{bus}",
              status: 400,
            }),
            { status: 400, headers: { "Content-Type": "application/json" } },
          );
        }
        const routes = await tdx.getStops(city, bus);

        return new Response(JSON.stringify(routes), {
          headers: { "Content-Type": "application/json" },
        });
      }

      if (url.pathname === "/api/bus/alerts") {
        const alerts = await tdx.getAlerts();
        return new Response(JSON.stringify(alerts), {
          headers: { "Content-Type": "application/json" },
        });
      }

      if (url.pathname === "/api/bus/search") {
        const query = url.searchParams.get("q");
        if (!query || query.length === 0) {
          return new Response(
            JSON.stringify({
              error: "Search query is required",
              status: 400,
            }),
            { status: 400, headers: { "Content-Type": "application/json" } },
          );
        }

        const results = await tdx.searchBuses(query);
        return new Response(results, {
          headers: { "Content-Type": "application/json" },
        });
      }
    }
    return new Response(
      JSON.stringify({
        error: `The endpoint ${url.pathname} was not found. @ ~ @`,
        status: 404,
      }),
      { status: 404, headers: { "Content-Type": "application/json" } },
    );
  },
});
