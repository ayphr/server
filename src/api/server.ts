import type { Server } from "bun";
import { routeRequest } from "./router";
import { addCorsHeaders } from "./routes/util";

export function setupServer(port: number, callback: Function): Server<undefined> {
  const server = Bun.serve({
    port,

    fetch(request) {
      return addCorsHeaders(routeRequest(request));
    },
  });

  callback();

  return server;
}
