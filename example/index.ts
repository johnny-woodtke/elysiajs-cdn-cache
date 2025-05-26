import { Elysia, t } from "elysia";

import { cdnCache } from "../src";

const app = new Elysia()
  .use(cdnCache())
  .get("/", ({ CDNCache, request, headers }) => {
    const message = "Hello World";
    const timestamp = new Date().toISOString();

    CDNCache.setPublic({ request, headers });
    CDNCache.setSMaxAge({ request, headers, sMaxAge: 120 });

    return { message, timestamp };
  })
  .get(
    "/:id",
    ({ CDNCache, params: { id }, request, headers }) => {
      const timestamp = new Date().toISOString();

      CDNCache.setPublic({ request, headers });
      CDNCache.setSMaxAge({ request, headers, sMaxAge: 60 });

      return { id, timestamp };
    },
    {
      params: t.Object({
        id: t.String(),
      }),
    }
  )
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
