const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export function addCorsHeaders(response: Response) {
  const headers = new Headers(response.headers);

  for (const [key, value] of Object.entries(corsHeaders)) {
    headers.set(key, value);
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export function handleOptionsRoute() {
  return addCorsHeaders(new Response(null, { status: 204 }));
}

export function handleStatusRoute() {
  return addCorsHeaders(new Response("OK"));
}

export function handleApiNotFoundRoute() {
  return addCorsHeaders(Response.json({ message: "Not found" }, { status: 404 }));
}

export function handleNotFoundRoute() {
  return addCorsHeaders(new Response("Not Found", { status: 404 }));
}
