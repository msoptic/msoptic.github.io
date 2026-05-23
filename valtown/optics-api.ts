// Optics Lab — Notion API proxy for Val Town
// ---------------------------------------------------------------------------
// Deploy this as an HTTP val on https://val.town
//
// Required environment variable (Val Town → Settings → Environment Variables):
//   NOTION_TOKEN   = secret_xxx   (an Internal Integration token from notion.so/my-integrations)
// Optional:
//   WEBHOOK_SECRET = any string   (protects the /webhook cache-bust endpoint)
//
// The four databases below must be shared with the integration
// (open each DB in Notion → ••• → Connections → add your integration).
//
// Endpoints (all return JSON, CORS open):
//   GET  /              -> { site, members, publications, projects }  (everything, cached)
//   GET  /site          -> { key: value, ... }
//   GET  /members       -> [ ...members ]
//   GET  /publications  -> [ ...publications ]
//   GET  /projects      -> [ ...projects ]
//   POST /webhook       -> clears the cache (call from a Notion automation; ?secret=...)
// ---------------------------------------------------------------------------

const NOTION_TOKEN = Deno.env.get("NOTION_TOKEN");
const WEBHOOK_SECRET = Deno.env.get("WEBHOOK_SECRET") ?? "";
const NOTION_VERSION = "2022-06-28";

const DB = {
  members: "a295aa65327948c1a2f6e705cc85ca14",
  publications: "ad2dda8078a64b1ebb8cd2b3fbe4493b",
  projects: "8c8b704ddc394dc7b37d77f99c74c264",
  site: "cbe6f080d2434565a9e2390fb6a89dba",
};

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 min — short enough that Notion file URLs stay fresh
let cache: { data: any; at: number } | null = null;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...CORS },
  });
}

// --- Notion property extraction --------------------------------------------
function plain(rt: any[] = []): string {
  return (rt ?? []).map((t) => t.plain_text).join("").trim();
}

function readProp(prop: any): any {
  if (!prop) return null;
  switch (prop.type) {
    case "title": return plain(prop.title);
    case "rich_text": return plain(prop.rich_text);
    case "number": return prop.number;
    case "select": return prop.select?.name ?? null;
    case "multi_select": return (prop.multi_select ?? []).map((o: any) => o.name);
    case "status": return prop.status?.name ?? null;
    case "checkbox": return prop.checkbox;
    case "email": return prop.email;
    case "url": return prop.url;
    case "phone_number": return prop.phone_number;
    case "date": return prop.date ? { start: prop.date.start, end: prop.date.end } : null;
    case "files":
      return (prop.files ?? [])
        .map((f: any) => f.file?.url ?? f.external?.url)
        .filter(Boolean);
    case "created_time": return prop.created_time;
    case "last_edited_time": return prop.last_edited_time;
    default: return null;
  }
}

function rowToObject(page: any) {
  const out: Record<string, any> = { id: page.id };
  for (const [name, prop] of Object.entries(page.properties ?? {})) {
    out[name] = readProp(prop);
  }
  return out;
}

async function queryDb(databaseId: string): Promise<any[]> {
  const results: any[] = [];
  let cursor: string | undefined;
  do {
    const res = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${NOTION_TOKEN}`,
        "Notion-Version": NOTION_VERSION,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(cursor ? { start_cursor: cursor, page_size: 100 } : { page_size: 100 }),
    });
    if (!res.ok) {
      throw new Error(`Notion ${databaseId} -> ${res.status}: ${await res.text()}`);
    }
    const data = await res.json();
    results.push(...data.results);
    cursor = data.has_more ? data.next_cursor : undefined;
  } while (cursor);
  return results.map(rowToObject);
}

function isPublished(r: any) {
  return r.Published === true;
}

async function loadAll() {
  const [members, publications, projects, siteRows] = await Promise.all([
    queryDb(DB.members),
    queryDb(DB.publications),
    queryDb(DB.projects),
    queryDb(DB.site),
  ]);

  // site settings -> flat key/value map
  const site: Record<string, string> = {};
  for (const r of siteRows) {
    if (r.Key) site[r.Key] = r.Value ?? "";
  }

  const byOrder = (a: any, b: any) =>
    (a["Sort Order"] ?? 9999) - (b["Sort Order"] ?? 9999);

  return {
    site,
    members: members.filter(isPublished).sort(byOrder),
    publications: publications
      .filter(isPublished)
      .sort((a, b) => (b.Year ?? 0) - (a.Year ?? 0)),
    projects: projects.filter(isPublished).sort(byOrder),
    generatedAt: new Date().toISOString(),
  };
}

async function getData(force = false) {
  if (!force && cache && Date.now() - cache.at < CACHE_TTL_MS) return cache.data;
  const data = await loadAll();
  cache = { data, at: Date.now() };
  return data;
}

export default async function (req: Request): Promise<Response> {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });

  const url = new URL(req.url);
  const path = url.pathname.replace(/\/+$/, "") || "/";

  if (!NOTION_TOKEN) {
    return json({ error: "NOTION_TOKEN env var is not set on the Val Town val." }, 500);
  }

  // Cache-bust webhook (point a Notion automation here)
  if (path === "/webhook" && req.method === "POST") {
    if (WEBHOOK_SECRET && url.searchParams.get("secret") !== WEBHOOK_SECRET) {
      return json({ error: "bad secret" }, 401);
    }
    cache = null;
    return json({ ok: true, cleared: true });
  }

  try {
    const data = await getData();
    switch (path) {
      case "/": return json(data);
      case "/site": return json(data.site);
      case "/members": return json(data.members);
      case "/publications": return json(data.publications);
      case "/projects": return json(data.projects);
      default: return json({ error: "not found", path }, 404);
    }
  } catch (e) {
    return json({ error: String(e) }, 502);
  }
}
