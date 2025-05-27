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

type CacheControlDirectiveMap<TDirective extends CacheControlDirective> = {
  "max-age": "number";
  "s-maxage": "number";
  "no-cache": "boolean";
  "no-store": "boolean";
  "must-revalidate": "boolean";
  "proxy-revalidate": "boolean";
  public: "boolean";
  private: "boolean";
  immutable: "boolean";
  "stale-while-revalidate": "number";
  "stale-if-error": "number";
  "no-transform": "boolean";
  "must-understand": "boolean";
}[TDirective];

type CacheControlDirectiveValueMap<TValue extends "boolean" | "number"> = {
  boolean: boolean;
  number: number;
}[TValue];

const cacheControlDirectiveMap = {
  "max-age": "number",
  "s-maxage": "number",
  "no-cache": "boolean",
  "no-store": "boolean",
  "must-revalidate": "boolean",
  "proxy-revalidate": "boolean",
  public: "boolean",
  private: "boolean",
  immutable: "boolean",
  "stale-while-revalidate": "number",
  "stale-if-error": "number",
  "no-transform": "boolean",
  "must-understand": "boolean",
} as const satisfies {
  [K in CacheControlDirective]: CacheControlDirectiveMap<K>;
};

const cacheControlDirectiveEntries = Object.entries(
  cacheControlDirectiveMap
) as [CacheControlDirective, CacheControlDirectiveMap<CacheControlDirective>][];

export class CacheControl {
  "max-age"?: CacheControlDirectiveValueMap<
    CacheControlDirectiveMap<"max-age">
  >;
  "s-maxage"?: CacheControlDirectiveValueMap<
    CacheControlDirectiveMap<"s-maxage">
  >;
  "no-cache"?: CacheControlDirectiveValueMap<
    CacheControlDirectiveMap<"no-cache">
  >;
  "no-store"?: CacheControlDirectiveValueMap<
    CacheControlDirectiveMap<"no-store">
  >;
  "must-revalidate"?: CacheControlDirectiveValueMap<
    CacheControlDirectiveMap<"must-revalidate">
  >;
  "proxy-revalidate"?: CacheControlDirectiveValueMap<
    CacheControlDirectiveMap<"proxy-revalidate">
  >;
  public?: CacheControlDirectiveValueMap<CacheControlDirectiveMap<"public">>;
  private?: CacheControlDirectiveValueMap<CacheControlDirectiveMap<"private">>;
  immutable?: CacheControlDirectiveValueMap<
    CacheControlDirectiveMap<"immutable">
  >;
  "stale-while-revalidate"?: CacheControlDirectiveValueMap<
    CacheControlDirectiveMap<"stale-while-revalidate">
  >;
  "stale-if-error"?: CacheControlDirectiveValueMap<
    CacheControlDirectiveMap<"stale-if-error">
  >;
  "no-transform"?: CacheControlDirectiveValueMap<
    CacheControlDirectiveMap<"no-transform">
  >;
  "must-understand"?: CacheControlDirectiveValueMap<
    CacheControlDirectiveMap<"must-understand">
  >;

  constructor(value?: string | null) {
    if (typeof value === "string") {
      this.parse(value);
    }
  }

  private parse(headerValue: string): void {
    const directives = headerValue.split(",").map((part) => part.trim());

    for (const directive of directives) {
      const [key, rawValue] = directive.toLowerCase().split("=") as [
        CacheControlDirective,
        string
      ];

      const type = cacheControlDirectiveMap[key];

      if (type === "boolean") {
        this[key] = true as never;
        continue;
      }

      if (type === "number" && rawValue !== undefined) {
        const num = parseInt(rawValue);
        if (!isNaN(num)) {
          this[key] = num as never;
        }
      }
    }
  }

  setMaxAge(value?: number): this {
    this["max-age"] = value;
    return this;
  }

  setSMaxage(value?: number): this {
    this["s-maxage"] = value;
    return this;
  }

  setNoCache(value?: boolean): this {
    this["no-cache"] = value;
    return this;
  }

  setNoStore(value?: boolean): this {
    this["no-store"] = value;
    return this;
  }

  setNoTransform(value?: boolean): this {
    this["no-transform"] = value;
    return this;
  }

  setMustUnderstand(value?: boolean): this {
    this["must-understand"] = value;
    return this;
  }

  setMustRevalidate(value?: boolean): this {
    this["must-revalidate"] = value;
    return this;
  }

  setProxyRevalidate(value?: boolean): this {
    this["proxy-revalidate"] = value;
    return this;
  }

  setPublic(value?: boolean): this {
    this.public = value;
    return this;
  }

  setPrivate(value?: boolean): this {
    this.private = value;
    return this;
  }

  setImmutable(value?: boolean): this {
    this.immutable = value;
    return this;
  }

  setStaleWhileRevalidate(value?: number): this {
    this["stale-while-revalidate"] = value;
    return this;
  }

  setStaleIfError(value?: number): this {
    this["stale-if-error"] = value;
    return this;
  }

  toString(): string {
    const parts: string[] = [];

    for (const [directive, type] of cacheControlDirectiveEntries) {
      const value = this[directive];

      if (type === "boolean" && value === true) {
        parts.push(directive);
        continue;
      }

      if (type === "number" && typeof value === "number") {
        parts.push(`${directive}=${value}`);
        continue;
      }
    }

    return parts.join(", ");
  }
}
