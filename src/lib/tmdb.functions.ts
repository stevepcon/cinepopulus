import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// Allow-list of TMDB endpoints we proxy from the server. Path is appended after
// https://api.themoviedb.org/3/. The api_key is injected server-side.
const PathSchema = z.string().regex(/^[a-zA-Z0-9/_\-.]+$/).max(200);
const ParamsSchema = z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional();

export const tmdbFetch = createServerFn({ method: "GET" })
  .inputValidator(
    z.object({
      path: PathSchema,
      params: ParamsSchema,
    }),
  )
  .handler(async ({ data }) => {
    const apiKey = process.env.TMDB_API_KEY;
    if (!apiKey) {
      throw new Error("TMDB_API_KEY is not configured");
    }
    const url = new URL(`https://api.themoviedb.org/3/${data.path.replace(/^\/+/, "")}`);
    url.searchParams.set("api_key", apiKey);
    if (data.params) {
      for (const [k, v] of Object.entries(data.params)) {
        url.searchParams.set(k, String(v));
      }
    }
    const res = await fetch(url.toString(), {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`TMDB ${res.status}: ${text.slice(0, 200)}`);
    }
    // TMDB returns arbitrary JSON; callers cast to typed shapes via tmdb.ts.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const json = (await res.json()) as any;
    return json as { [key: string]: unknown } & { results?: unknown[] };
  });
