import type { RingLog } from "src/lib/log";

declare global {
  // eslint-disable-next-line no-var
  var __APP_LOGS__: RingLog | undefined;
}

export {};
