import { Elysia, t } from "elysia";
import { cacheControl, CacheControl } from "elysiajs-cdn-cache";

const app = new Elysia({ prefix: "/api" })
  .use(cacheControl("Cache-Control", "Vercel-CDN-Cache-Control"))

  .get(
    "/",
    ({
      "Cache-Control": cacheControl,
      "Vercel-CDN-Cache-Control": vercelCacheControl,
    }) => {
      const message = "Hello World";
      const timestamp = new Date().toISOString();

      console.log("cacheControl", cacheControl.get().toString());
      console.log("vercelCacheControl", vercelCacheControl.get().toString());

      cacheControl.set(new CacheControl().setPublic(true).setSMaxage(60));
      vercelCacheControl.set(new CacheControl().setPublic(true).setSMaxage(60));

      return { message, timestamp };
    }
  )

  .get(
    "/:id",
    ({
      "Cache-Control": cacheControl,
      "Vercel-CDN-Cache-Control": vercelCacheControl,
      params: { id },
    }) => {
      const timestamp = new Date().toISOString();

      cacheControl.set(new CacheControl().setPublic(true).setSMaxage(60));
      vercelCacheControl.set(new CacheControl().setPublic(true).setSMaxage(60));

      return { id, timestamp };
    },
    {
      params: t.Object({
        id: t.String(),
      }),
    }
  )

  .get(
    "/all",
    ({
      "Cache-Control": cacheControl,
      "Vercel-CDN-Cache-Control": vercelCacheControl,
    }) => {
      const message = "Got All";
      const timestamp = new Date().toISOString();

      cacheControl.set(new CacheControl().setPublic(true).setSMaxage(60));
      vercelCacheControl.set(new CacheControl().setPublic(true).setSMaxage(60));

      return { message, timestamp };
    }
  );

if (Bun.env.NODE_ENV !== "production") {
  app.listen(3000);
  console.log(
    `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
  );
}

export default app.handle;
