import { Elysia } from "elysia";

import { CDNCache } from "./CDNCache";

export function cdnCache(...cacheControlHeaders: string[]) {
  return new Elysia().decorate(
    "CDNCache",
    new CDNCache(
      cacheControlHeaders.length ? cacheControlHeaders : ["Cache-Control"]
    )
  );
}
