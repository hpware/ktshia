import { getCachedData, saveCacheData } from "./ram_caching_layer";
import * as tdx from "./tdx";
import citiesData from "../data/cities";
import openai from "openai";
import { startServiceLogService } from "./logging_service";
import log from "./logging_service";
import { dir } from "node:console";

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
startServiceLogService();

// Main logic
log("info", `Service started at port :${process.env.SERVICE_PORT || 4402}`);
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
          message: "你已登入～",
        }),
        { headers: { "Content-Type": "application/json" } },
      );
    }

    // bus paths
    if (url.pathname.startsWith("/api/bus/")) {
      if (url.pathname.startsWith("/api/bus/info/")) {
        const parts = url.pathname.split("/");
        if (parts.length !== 6) {
          return new Response(
            JSON.stringify({
              error: "錯誤！請使用 /api/bus/info/{city}/{bus}",
            }),
            { status: 400, headers: { "Content-Type": "application/json" } },
          );
        }

        const [, , , , city, bus] = parts;
        if (!(city && bus)) {
          return new Response(
            JSON.stringify({
              error: "錯誤！請使用 /api/bus/info/{city}/{bus}",
            }),
            { status: 400, headers: { "Content-Type": "application/json" } },
          );
        }
        const routes = await tdx.getBusRouteData(city, bus);

        return Response.json(routes);
      }
      if (url.pathname.startsWith("/api/bus/fare/")) {
        const parts = url.pathname.split("/");
        if (parts.length !== 6) {
          return new Response(
            JSON.stringify({
              error: "Invalid route format. Use /api/bus/fare/{city}/{bus}",
            }),
            { status: 400, headers: { "Content-Type": "application/json" } },
          );
        }

        const [, , , , city, bus] = parts;
        if (!(city && bus)) {
          return Response.json(
            {
              error: "Invalid route format. Use /api/bus/fare/{city}/{bus}",
            },
            { status: 400 },
          );
        }
        const routes = await tdx.getFareData(city, bus);

        return Response.json(routes);
      }

      if (url.pathname.startsWith("/api/bus/stops/")) {
        const parts = url.pathname.split("/");
        if (parts.length !== 6) {
          return new Response(
            JSON.stringify({
              error: "Invalid route format. Use /api/bus/stops/{city}/{bus}",
            }),
            { status: 400, headers: { "Content-Type": "application/json" } },
          );
        }
        const direction = url.searchParams.get("direction");
        const [, , , , city, bus] = parts;
        if (!(city && bus)) {
          return Response.json(
            {
              error: "Invalid route format. Use /api/bus/stops/{city}/{bus}",
            },
            { status: 400 },
          );
        }
        if (!direction) {
          return Response.json(
            {
              error: "Invalid direction. Use 0 or 1",
            },
            { status: 400 },
          );
        }
        if (Number(direction) !== 0 && Number(direction) !== 1) {
          return Response.json(
            {
              error: "Invalid direction. Use 0 or 1",
            },
            { status: 400 },
          );
        }
        const routes = await tdx.getStops(city, bus, Number(direction));

        return Response.json(routes);
      }

      if (url.pathname === "/api/bus/alerts") {
        const alerts = await tdx.getAlerts();
        return Response.json(alerts, {
          headers: { "Content-Type": "application/json" },
        });
      }
      if (url.pathname === "/api/bus/search/") {
        return Response.json({
          error: "Invalid route format. Use /api/bus/search/{city}",
        });
      }
      if (url.pathname.startsWith("/api/bus/search/")) {
        const query = url.searchParams.get("q");
        const parts = url.pathname.split("/");
        const [, , , , city] = parts;
        if (!query || query.length === 0) {
          return Response.json(
            {
              error: "Search query is required",
            },
            { status: 400 },
          );
        }

        const results = await tdx.searchBuses(query, String(city));
        return Response.json(results);
      }
    }
    return Response.json(
      {
        error: `The endpoint ${url.pathname} was not found. @ ~ @`,
      },
      { status: 404 },
    );
  },
});
