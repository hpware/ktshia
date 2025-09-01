if (!process.env.AUTH_KEY) {
  console.error("Missing AUTH_KEY env value.");
  process.exit(1);
}
if (!process.env.TDX_API) {
  console.error("Missing TDX_API env value.");
  process.exit(1);
}
console.log(`Service started at port :${process.env.SERVICE_PORT || 4402}`);
Bun.serve({
  port: process.env.SERVICE_PORT || 4402,
  routes: {
    "/": new Response("This ktshia backend service works :)"),
  },
  fetch(req) {
    return new Response(
      JSON.stringify({
        error: "Not Found",
        status: 404,
      }),
      { status: 404, headers: { "Content-Type": "application/json" } },
    );
  },
});
