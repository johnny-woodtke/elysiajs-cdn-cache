import { Elysia } from "elysia";

import { CacheControl } from "./CacheControl";

type CacheControlMethods = {
  get: () => CacheControl;
  set: (value: CacheControl) => void;
};

export function cacheControl<THeader extends string = "Cache-Control">(
  ...cacheControlHeaders: THeader[]
) {
  return new Elysia().derive({ as: "global" }, ({ set, headers }) =>
    (cacheControlHeaders.length
      ? cacheControlHeaders
      : ["Cache-Control" as THeader]
    ).reduce<Record<THeader, CacheControlMethods>>((acc, header) => {
      const key = header.toLowerCase();
      acc[header] = {
        get() {
          return new CacheControl(headers[key]);
        },
        set(value) {
          set.headers[key] = value.toString();
        },
      };
      return acc;
    }, {} as Record<THeader, CacheControlMethods>)
  );
}

export { CacheControl };
