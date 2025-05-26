import { Elysia, t } from "elysia";
import { CDNCache } from "elysiajs-cdn-cache";

const app = new Elysia({ prefix: "/api" })
  .resolve(({ headers, set }) => ({
    CDNCache: new CDNCache({
      cacheControlHeaders: ["Cache-Control", "Vercel-CDN-Cache-Control"],
      headers,
      set,
    }),
  }))

  .get("/", ({ CDNCache }) => {
    const message = "Hello World";
    const timestamp = new Date().toISOString();

    CDNCache.setPublic({});
    CDNCache.setSMaxAge({
      sMaxAge: 120,
    });

    return { message, timestamp };
  })

  .get(
    "/:id",
    ({ CDNCache, params: { id } }) => {
      const timestamp = new Date().toISOString();

      CDNCache.setPublic({
        target: "Cache-Control",
      });
      CDNCache.setSMaxAge({
        target: "Cache-Control",
        sMaxAge: 60,
      });

      return { id, timestamp };
    },
    {
      params: t.Object({
        id: t.String(),
      }),
    }
  )

  .get("/all", ({ CDNCache }) => {
    const message = "Got All";
    const timestamp = new Date().toISOString();

    CDNCache.setPublic({
      target: ["Cache-Control", "Vercel-CDN-Cache-Control"],
    });
    CDNCache.setSMaxAge({
      target: ["Cache-Control", "Vercel-CDN-Cache-Control"],
      sMaxAge: 120,
    });

    return { message, timestamp };
  });

if (Bun.env.NODE_ENV !== "production") {
  app.listen(3000);
  console.log(
    `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
  );
}

export default app.handle;
