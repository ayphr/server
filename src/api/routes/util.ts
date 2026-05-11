export function handleStatusRoute() {
  return new Response("OK");
}

export function handleApiNotFoundRoute() {
  return Response.json({ message: "Not found" }, { status: 404 });
}

export function handleNotFoundRoute() {
  return new Response("Not Found", { status: 404 });
}
