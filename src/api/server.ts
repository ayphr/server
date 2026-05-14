import type { Server } from "bun";
import { routeRequest } from "./router";

export function setupServer(port: number, callback: Function): Server<undefined> {
  const server = Bun.serve({
    port,

    fetch(request) {
      return routeRequest(request);
    },
  });

  callback();

  return server;
}
