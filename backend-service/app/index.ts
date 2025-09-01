if (!process.env.AUTH_KEY) {
    throw new Error("Missing AUTH_KEY");
    process.exit(1);
}
Bun.serve({
    port: 4402,
    routes: {
        "/": new Response("This ktshia backend service works :)"),
    },
    fetch(req) {
        return new Response(JSON.stringify({
            error: "Not Found",
            status: 404
        }), { status: 404, headers: { "Content-Type": "application/json" } });
    },
})