type ResponseHeaders = Record<string, string | undefined>;

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

type MutateHeadersParams = {
  request: Request;
  headers: ResponseHeaders;
};

export class CDNCache {
  private cacheControlHeaders: string[];

  constructor(cacheControlHeaders: string[]) {
    this.cacheControlHeaders = cacheControlHeaders;
  }

  /**
   * Get the cache control headers from the request
   */
  getRequestCacheControlHeaders({
    request,
  }: {
    request: Request;
  }): (string | null)[] {
    return this.cacheControlHeaders.map((header) =>
      request.headers.get(header)
    );
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
  private getRequestCacheControlDirectives(
    request: Request
  ): Set<CacheControlDirective> {
    const allDirectives = new Set<CacheControlDirective>();
    const requestCacheControl = this.getRequestCacheControlHeaders({ request });

    for (const cacheControlValue of requestCacheControl) {
      if (cacheControlValue) {
        const directives = this.parseCacheControlDirectives(cacheControlValue);
        directives.forEach((directive) => allDirectives.add(directive));
      }
    }

    return allDirectives;
  }

  /**
   * Append a cache control directive to the response headers
   */
  appendToResponseHeaders({
    headers,
    key,
    value,
  }: {
    headers: ResponseHeaders;
    key: CacheControlDirective;
    value?: string;
  }): ResponseHeaders {
    const item = value ? `${key}=${value}` : key;
    for (const header of this.cacheControlHeaders) {
      headers[header] = headers[header] ? `${headers[header]}, ${item}` : item;
    }
    return headers;
  }

  /**
   * Set the max-age cache control directive
   */
  setMaxAge({
    request,
    headers,
    maxAge,
  }: MutateHeadersParams & { maxAge: number }): ResponseHeaders {
    const requestDirectives = this.getRequestCacheControlDirectives(request);

    // Don't set max-age if request has no-store (response shouldn't be cached)
    if (requestDirectives.has("no-store")) {
      return headers;
    }

    // max-age can be set with no-cache (just requires revalidation)
    return this.appendToResponseHeaders({
      headers,
      key: "max-age",
      value: `${maxAge}`,
    });
  }

  /**
   * Set the s-maxage cache control directive
   */
  setSMaxAge({
    request,
    headers,
    sMaxAge,
  }: MutateHeadersParams & { sMaxAge: number }): ResponseHeaders {
    const requestDirectives = this.getRequestCacheControlDirectives(request);

    // Don't set s-maxage if request has no-store (response shouldn't be cached)
    if (requestDirectives.has("no-store")) {
      return headers;
    }

    // Don't set s-maxage if request has private (not for shared caches)
    if (requestDirectives.has("private")) {
      return headers;
    }

    return this.appendToResponseHeaders({
      headers,
      key: "s-maxage",
      value: `${sMaxAge}`,
    });
  }

  /**
   * Set the no-cache cache control directive
   */
  setNoCache({ request, headers }: MutateHeadersParams): ResponseHeaders {
    const requestDirectives = this.getRequestCacheControlDirectives(request);

    // Don't set no-cache if request already has no-store (more restrictive)
    if (requestDirectives.has("no-store")) {
      return headers;
    }

    return this.appendToResponseHeaders({
      headers,
      key: "no-cache",
    });
  }

  /**
   * Set the no-store cache control directive
   */
  setNoStore({ request, headers }: MutateHeadersParams): ResponseHeaders {
    // no-store can always be set as it's the most restrictive directive
    return this.appendToResponseHeaders({
      headers,
      key: "no-store",
    });
  }

  /**
   * Set the no-transform cache control directive
   */
  setNoTransform({ request, headers }: MutateHeadersParams): ResponseHeaders {
    // no-transform can be set regardless of other directives
    // It's about content transformation, not caching behavior
    return this.appendToResponseHeaders({
      headers,
      key: "no-transform",
    });
  }

  /**
   * Set the must-revalidate cache control directive
   */
  setMustRevalidate({
    request,
    headers,
  }: MutateHeadersParams): ResponseHeaders {
    const requestDirectives = this.getRequestCacheControlDirectives(request);

    // Don't set must-revalidate if request has no-store (nothing to revalidate)
    if (requestDirectives.has("no-store")) {
      return headers;
    }

    return this.appendToResponseHeaders({
      headers,
      key: "must-revalidate",
    });
  }

  /**
   * Set the proxy-revalidate cache control directive
   */
  setProxyRevalidate({
    request,
    headers,
  }: MutateHeadersParams): ResponseHeaders {
    const requestDirectives = this.getRequestCacheControlDirectives(request);

    // Don't set proxy-revalidate if request has no-store
    if (requestDirectives.has("no-store")) {
      return headers;
    }

    // Don't set proxy-revalidate if request has private (not for shared caches)
    if (requestDirectives.has("private")) {
      return headers;
    }

    return this.appendToResponseHeaders({
      headers,
      key: "proxy-revalidate",
    });
  }

  /**
   * Set the must-understand cache control directive
   */
  setMustUnderstand({
    request,
    headers,
  }: MutateHeadersParams): ResponseHeaders {
    const requestDirectives = this.getRequestCacheControlDirectives(request);

    // Don't set must-understand if request has no-store
    if (requestDirectives.has("no-store")) {
      return headers;
    }

    return this.appendToResponseHeaders({
      headers,
      key: "must-understand",
    });
  }

  /**
   * Set the private cache control directive
   */
  setPrivate({ request, headers }: MutateHeadersParams): ResponseHeaders {
    const requestDirectives = this.getRequestCacheControlDirectives(request);

    // Don't set private if request has no-store
    if (requestDirectives.has("no-store")) {
      return headers;
    }

    // Don't set private if request already has public (conflicting directives)
    if (requestDirectives.has("public")) {
      return headers;
    }

    return this.appendToResponseHeaders({
      headers,
      key: "private",
    });
  }

  /**
   * Set the public cache control directive
   */
  setPublic({ request, headers }: MutateHeadersParams): ResponseHeaders {
    const requestDirectives = this.getRequestCacheControlDirectives(request);

    // Don't set public if request has no-store
    if (requestDirectives.has("no-store")) {
      return headers;
    }

    // Don't set public if request has private (conflicting directives)
    if (requestDirectives.has("private")) {
      return headers;
    }

    return this.appendToResponseHeaders({
      headers,
      key: "public",
    });
  }

  /**
   * Set the immutable cache control directive
   */
  setImmutable({ request, headers }: MutateHeadersParams): ResponseHeaders {
    const requestDirectives = this.getRequestCacheControlDirectives(request);

    // Don't set immutable if request has no-store (response shouldn't be cached)
    if (requestDirectives.has("no-store")) {
      return headers;
    }

    // immutable typically makes sense with max-age, but can be set independently
    return this.appendToResponseHeaders({
      headers,
      key: "immutable",
    });
  }

  /**
   * Set the stale-while-revalidate cache control directive
   */
  setStaleWhileRevalidate({
    request,
    headers,
    staleWhileRevalidateSeconds,
  }: MutateHeadersParams & {
    staleWhileRevalidateSeconds: number;
  }): ResponseHeaders {
    const requestDirectives = this.getRequestCacheControlDirectives(request);

    // Don't set stale-while-revalidate if request has no-store
    if (requestDirectives.has("no-store")) {
      return headers;
    }

    return this.appendToResponseHeaders({
      headers,
      key: "stale-while-revalidate",
      value: `${staleWhileRevalidateSeconds}`,
    });
  }

  /**
   * Set the stale-if-error cache control directive
   */
  setStaleIfError({
    request,
    headers,
    staleIfErrorSeconds,
  }: MutateHeadersParams & { staleIfErrorSeconds: number }): ResponseHeaders {
    const requestDirectives = this.getRequestCacheControlDirectives(request);

    // Don't set stale-if-error if request has no-store
    if (requestDirectives.has("no-store")) {
      return headers;
    }

    return this.appendToResponseHeaders({
      headers,
      key: "stale-if-error",
      value: `${staleIfErrorSeconds}`,
    });
  }
}
