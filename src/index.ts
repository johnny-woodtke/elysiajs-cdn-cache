import { Elysia } from "elysia";

import { CacheControl } from "./CacheControl";

export function cacheControl<THeader extends string = "Cache-Control">(
  ...headers: THeader[]
) {
  return new Elysia().resolve({ as: "global" }, ({ set, headers }) => ({
    cacheControl: {
      /**
       * Gets the request's cache control header value converted
       * to a {@link CacheControl} instance.
       */
      get(header: THeader): CacheControl {
        return new CacheControl(headers[header.toLowerCase()]);
      },

      /**
       * Sets the response's cache control header value to the
       * string representation of the {@link CacheControl} instance.
       */
      set(header: THeader, value: CacheControl): void {
        set.headers[header.toLowerCase()] = value.toString();
      },
    },
  }));
}

export { CacheControl };
