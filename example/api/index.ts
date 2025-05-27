import { Elysia, t } from "elysia";
import { cacheControl, CacheControl } from "elysiajs-cdn-cache";

const app = new Elysia({ prefix: "/api" })
  .use(
    cacheControl(
      "Cache-Control",
      "CDN-Cache-Control",
      "Vercel-CDN-Cache-Control"
    )
  )

  .get("/", ({ cacheControl }) => {
    const message = "Hello World";
    const timestamp = new Date().toISOString();

    console.log("Cache-Control", cacheControl.get("Cache-Control").toString());

    cacheControl.set(
      "Cache-Control",
      new CacheControl().setPublic(true).setSMaxage(120).setMaxAge(60)
    );

    return { message, timestamp };
  })

  .get(
    "/:id",
    ({ cacheControl, params: { id } }) => {
      const timestamp = new Date().toISOString();

      console.log(
        "Cache-Control",
        cacheControl.get("Cache-Control").toString()
      );

      cacheControl.set(
        "Cache-Control",
        new CacheControl().setPrivate(true).setMaxAge(60)
      );

      return { id, timestamp };
    },
    {
      params: t.Object({
        id: t.String(),
      }),
    }
  )

  .get("/all", ({ cacheControl }) => {
    const message = "Got All";
    const timestamp = new Date().toISOString();

    console.log("Cache-Control", cacheControl.get("Cache-Control").toString());

    cacheControl.set(
      "Cache-Control",
      new CacheControl().setPublic(true).setSMaxage(120).setMaxAge(60)
    );

    return { message, timestamp };
  });

if (Bun.env.NODE_ENV !== "production") {
  app.listen(3000);
  console.log(
    `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
  );
}

export default app.handle;
