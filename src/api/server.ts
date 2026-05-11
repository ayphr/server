import type { Server } from "bun";
import { createLogger } from "../lib/logger";
import { routeRequest } from "./router";

const log = createLogger('db-worker-entry');

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
