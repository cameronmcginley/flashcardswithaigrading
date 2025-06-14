export interface LogActionParams {
  event: string;
  user_id?: string;
  tags?: Record<string, string | number | boolean>;
}

export type RingLog = (LogActionParams & { ts: number })[];

const MAX_BUFFER = 300;
const buffer: RingLog = (globalThis.__APP_LOGS__ as RingLog | undefined) ?? [];
globalThis.__APP_LOGS__ = buffer; // make accessible in dev tools

export const logAction = async ({
  event,
  user_id,
  tags = {},
}: LogActionParams) => {
  const ts = new Date();
  const parts = [event, user_id ? `(${user_id})` : ""].filter(Boolean);

  if (typeof window === "undefined") {
    // Node / SSR
    console.log(
      ts.toISOString(),
      parts.join(" "),
      Object.keys(tags).length ? "\n   tags:" : "",
      Object.keys(tags).length ? tags : ""
    );
  } else {
    // Browser
    console.log(
      ts.toISOString(),
      parts.join(" "),
      Object.keys(tags).length ? "\n   tags:" : "",
      Object.keys(tags).length ? tags : ""
    );
  }

  buffer.push({
    event,
    user_id,
    tags,
    ts: ts.getTime(),
  });
  if (buffer.length > MAX_BUFFER) buffer.splice(0, buffer.length - MAX_BUFFER);

  return Promise.resolve();
};
