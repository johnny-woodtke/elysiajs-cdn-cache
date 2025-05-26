import type { Context } from "elysia";

type CacheControlDirective =
  | "max-age"
  | "s-maxage"
  | "no-cache"
  | "no-store"
  | "no-transform"
  | "must-revalidate"
  | "proxy-revalidate"
  | "must-understand"
  | "private"
  | "public"
  | "immutable"
  | "stale-while-revalidate"
  | "stale-if-error";

type MutateHeadersParams<TTarget extends string> = {
  target?: TTarget | TTarget[];
};

export class CDNCache<TCacheControlHeader extends string> {
  private headers: Context["headers"];
  private set: Context["set"];

  private cacheControlHeaders: TCacheControlHeader[];
  private requestDirectives: Record<
    TCacheControlHeader,
    Set<CacheControlDirective> | undefined
  >;

  constructor({
    cacheControlHeaders,
    headers,
    set,
  }: {
    cacheControlHeaders: TCacheControlHeader[];
    headers: Record<string, string | undefined>;
    set: Context["set"];
  }) {
    this.cacheControlHeaders = cacheControlHeaders.map(
      (header) => header.toLowerCase() as TCacheControlHeader
    );
    this.headers = headers;
    this.set = set;
    this.requestDirectives = this.getRequestCacheControlDirectives({
      headers,
    });
  }

  /**
   * Get the cache control headers from the request
   */
  private getRequestCacheControlHeaders({
    headers,
  }: {
    headers: Record<string, string | undefined>;
  }): Record<TCacheControlHeader, string | undefined> {
    return this.cacheControlHeaders.reduce((acc, header) => {
      acc[header] = headers[header];
      return acc;
    }, {} as Record<TCacheControlHeader, string | undefined>);
  }

  /**
   * Parse cache control directives from a cache control header value
   */
  private parseCacheControlDirectives(
    cacheControlValue: string
  ): Set<CacheControlDirective> {
    const directives = new Set<CacheControlDirective>();
    const parts = cacheControlValue.split(",");

    for (const part of parts) {
      const directive = part.trim().split("=")[0].toLowerCase();
      directives.add(directive as CacheControlDirective);
    }

    return directives;
  }

  /**
   * Get all cache control directives from request headers
   */
  private getRequestCacheControlDirectives({
    headers,
  }: {
    headers: Record<string, string | undefined>;
  }): Record<TCacheControlHeader, Set<CacheControlDirective> | undefined> {
    const allDirectives = {} as Record<
      TCacheControlHeader,
      Set<CacheControlDirective> | undefined
    >;
    const requestCacheControl = this.getRequestCacheControlHeaders({ headers });

    for (const header of this.cacheControlHeaders) {
      if (requestCacheControl[header]) {
        allDirectives[header] = this.parseCacheControlDirectives(
          requestCacheControl[header]
        );
      }
    }

    return allDirectives;
  }

  /**
   * Get the target cache control headers for the set function
   */
  private getTargetCacheControlHeaders(
    target: undefined | TCacheControlHeader | TCacheControlHeader[]
  ): TCacheControlHeader[] {
    return !target
      ? this.cacheControlHeaders
      : Array.isArray(target)
      ? target.map((header) => header.toLowerCase() as TCacheControlHeader)
      : [target.toLowerCase() as TCacheControlHeader];
  }

  /**
   * Append a cache control directive to the target response header
   */
  private appendToResponseHeaders({
    target,
    directive,
    value,
  }: {
    target: TCacheControlHeader;
    directive: CacheControlDirective;
    value?: string;
  }): void {
    const item = value ? `${directive}=${value}` : directive;

    if (this.set.headers[target]) {
      this.set.headers[target] = `${this.set.headers[target]}, ${item}`;
      return;
    }

    this.set.headers[target] = item;
  }

  /**
   * Set the max-age cache control directive
   */
  setMaxAge({
    target,
    maxAge,
  }: MutateHeadersParams<TCacheControlHeader> & { maxAge: number }): void {
    for (const header of this.getTargetCacheControlHeaders(target)) {
      // Don't set max-age if request has no-store (response shouldn't be cached)
      if (this.requestDirectives[header]?.has("no-store")) {
        continue;
      }

      // max-age can be set with no-cache (just requires revalidation)
      this.appendToResponseHeaders({
        target: header,
        directive: "max-age",
        value: `${maxAge}`,
      });
    }
  }

  /**
   * Set the s-maxage cache control directive
   */
  setSMaxAge({
    target,
    sMaxAge,
  }: MutateHeadersParams<TCacheControlHeader> & { sMaxAge: number }): void {
    for (const header of this.getTargetCacheControlHeaders(target)) {
      // Don't set s-maxage if request has no-store (response shouldn't be cached)
      if (this.requestDirectives[header]?.has("no-store")) {
        continue;
      }

      // Don't set s-maxage if request has private (not for shared caches)
      if (this.requestDirectives[header]?.has("private")) {
        continue;
      }

      this.appendToResponseHeaders({
        target: header,
        directive: "s-maxage",
        value: `${sMaxAge}`,
      });
    }
  }

  /**
   * Set the no-cache cache control directive
   */
  setNoCache({ target }: MutateHeadersParams<TCacheControlHeader>): void {
    for (const header of this.getTargetCacheControlHeaders(target)) {
      // Don't set no-cache if request already has no-store (more restrictive)
      if (this.requestDirectives[header]?.has("no-store")) {
        continue;
      }

      this.appendToResponseHeaders({
        target: header,
        directive: "no-cache",
      });
    }
  }

  /**
   * Set the no-store cache control directive
   */
  setNoStore({ target }: MutateHeadersParams<TCacheControlHeader>): void {
    for (const header of this.getTargetCacheControlHeaders(target)) {
      // no-store can always be set as it's the most restrictive directive
      this.appendToResponseHeaders({
        target: header,
        directive: "no-store",
      });
    }
  }

  /**
   * Set the no-transform cache control directive
   */
  setNoTransform({ target }: MutateHeadersParams<TCacheControlHeader>): void {
    for (const header of this.getTargetCacheControlHeaders(target)) {
      // no-transform can be set regardless of other directives
      // It's about content transformation, not caching behavior
      this.appendToResponseHeaders({
        target: header,
        directive: "no-transform",
      });
    }
  }

  /**
   * Set the must-revalidate cache control directive
   */
  setMustRevalidate({
    target,
  }: MutateHeadersParams<TCacheControlHeader>): void {
    for (const header of this.getTargetCacheControlHeaders(target)) {
      // Don't set must-revalidate if request has no-store (nothing to revalidate)
      if (this.requestDirectives[header]?.has("no-store")) {
        continue;
      }

      this.appendToResponseHeaders({
        target: header,
        directive: "must-revalidate",
      });
    }
  }

  /**
   * Set the proxy-revalidate cache control directive
   */
  setProxyRevalidate({
    target,
  }: MutateHeadersParams<TCacheControlHeader>): void {
    for (const header of this.getTargetCacheControlHeaders(target)) {
      // Don't set proxy-revalidate if request has no-store
      if (this.requestDirectives[header]?.has("no-store")) {
        continue;
      }

      // Don't set proxy-revalidate if request has private (not for shared caches)
      if (this.requestDirectives[header]?.has("private")) {
        continue;
      }

      this.appendToResponseHeaders({
        target: header,
        directive: "proxy-revalidate",
      });
    }
  }

  /**
   * Set the must-understand cache control directive
   */
  setMustUnderstand({
    target,
  }: MutateHeadersParams<TCacheControlHeader>): void {
    for (const header of this.getTargetCacheControlHeaders(target)) {
      // Don't set must-understand if request has no-store
      if (this.requestDirectives[header]?.has("no-store")) {
        continue;
      }

      this.appendToResponseHeaders({
        target: header,
        directive: "must-understand",
      });
    }
  }

  /**
   * Set the private cache control directive
   */
  setPrivate({ target }: MutateHeadersParams<TCacheControlHeader>): void {
    for (const header of this.getTargetCacheControlHeaders(target)) {
      // Don't set private if request has no-store
      if (this.requestDirectives[header]?.has("no-store")) {
        continue;
      }

      // Don't set private if request already has public (conflicting directives)
      if (this.requestDirectives[header]?.has("public")) {
        continue;
      }

      this.appendToResponseHeaders({
        target: header,
        directive: "private",
      });
    }
  }

  /**
   * Set the public cache control directive
   */
  setPublic({ target }: MutateHeadersParams<TCacheControlHeader>): void {
    for (const header of this.getTargetCacheControlHeaders(target)) {
      // Don't set public if request has no-store
      if (this.requestDirectives[header]?.has("no-store")) {
        continue;
      }

      // Don't set public if request has private (conflicting directives)
      if (this.requestDirectives[header]?.has("private")) {
        continue;
      }

      this.appendToResponseHeaders({
        target: header,
        directive: "public",
      });
    }
  }

  /**
   * Set the immutable cache control directive
   */
  setImmutable({ target }: MutateHeadersParams<TCacheControlHeader>): void {
    for (const header of this.getTargetCacheControlHeaders(target)) {
      // Don't set immutable if request has no-store (response shouldn't be cached)
      if (this.requestDirectives[header]?.has("no-store")) {
        continue;
      }

      // immutable typically makes sense with max-age, but can be set independently
      this.appendToResponseHeaders({
        target: header,
        directive: "immutable",
      });
    }
  }

  /**
   * Set the stale-while-revalidate cache control directive
   */
  setStaleWhileRevalidate({
    target,
    staleWhileRevalidateSeconds,
  }: MutateHeadersParams<TCacheControlHeader> & {
    staleWhileRevalidateSeconds: number;
  }): void {
    for (const header of this.getTargetCacheControlHeaders(target)) {
      // Don't set stale-while-revalidate if request has no-store
      if (this.requestDirectives[header]?.has("no-store")) {
        continue;
      }

      this.appendToResponseHeaders({
        target: header,
        directive: "stale-while-revalidate",
        value: `${staleWhileRevalidateSeconds}`,
      });
    }
  }

  /**
   * Set the stale-if-error cache control directive
   */
  setStaleIfError({
    target,
    staleIfErrorSeconds,
  }: MutateHeadersParams<TCacheControlHeader> & {
    staleIfErrorSeconds: number;
  }): void {
    for (const header of this.getTargetCacheControlHeaders(target)) {
      // Don't set stale-if-error if request has no-store
      if (this.requestDirectives[header]?.has("no-store")) {
        continue;
      }

      this.appendToResponseHeaders({
        target: header,
        directive: "stale-if-error",
        value: `${staleIfErrorSeconds}`,
      });
    }
  }
}
