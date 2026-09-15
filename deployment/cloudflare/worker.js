const ORIGIN = "http://vmi3535381.contaboserver.net";

addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return new Response("Method Not Allowed", {
      status: 405,
      headers: { Allow: "GET, HEAD" },
    });
  }

  const upstreamUrl = new URL(request.url);
  const originUrl = new URL(ORIGIN);

  upstreamUrl.protocol = originUrl.protocol;
  upstreamUrl.hostname = originUrl.hostname;
  upstreamUrl.port = originUrl.port;

  try {
    const upstreamResponse = await fetch(
      new Request(upstreamUrl.toString(), request),
    );
    const headers = new Headers(upstreamResponse.headers);

    headers.set("Strict-Transport-Security", "max-age=31536000");
    headers.set("X-Content-Type-Options", "nosniff");
    headers.set("X-Frame-Options", "DENY");
    headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

    return new Response(upstreamResponse.body, {
      status: upstreamResponse.status,
      statusText: upstreamResponse.statusText,
      headers,
    });
  } catch {
    return new Response("Portfolio origin is temporarily unavailable.", {
      status: 502,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  }
}
