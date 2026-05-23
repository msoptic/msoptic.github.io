# Optics Lab — TUKOREA website

Website for the Optics Lab, Department of Compound Semiconductor Engineering,
Tech University of Korea (TUKOREA).

- **Content (DB):** Notion — four databases under the page *"Optics Lab — TUKOREA (Website CMS)"*
- **API:** a single Val Town function reads Notion and serves JSON
- **Frontend:** static site on GitHub Pages (`index.html` + `assets/`)

```
Notion (DB)  ──>  Val Town function  ──>  GitHub Pages site (this repo)
   edit rows        proxies + caches          fetches JSON, renders
```

The site works in **preview mode** with built-in sample content until the API
is connected, so you can see the layout immediately.

---

## Notion databases

| DB | Purpose |
|----|---------|
| **Members** | People; grouped on the site by `Role` = Professor / Ph.D Candidate / M.S Candidate / Alumni. Each member has a detail page. |
| **Publications** | Papers, conferences, patents. Filterable by `Type`. |
| **Projects** | Research areas / projects, tagged by `Category`. |
| **Site Settings** | Key/value text (lab name, contact info, home page copy). Add a row to expose new text. |

Only rows with **`Published` checked** appear on the site. `Sort Order`
controls ordering (lower first); publications sort by `Year` descending.

To add content, just add rows in Notion — no code changes needed.

---

## One-time setup

### 1. Create a Notion integration token
1. Go to <https://www.notion.so/my-integrations> → **New integration** (internal).
2. Copy the **Internal Integration Secret** (`secret_…` / `ntn_…`).
3. Open the page *"Optics Lab — TUKOREA (Website CMS)"* in Notion →
   **•••** → **Connections** → add your integration. (Sharing the parent page
   shares all four databases under it.)

### 2. Deploy the Val Town function
1. Create an account at <https://val.town>.
2. New **HTTP val**, paste the contents of [`valtown/optics-api.ts`](valtown/optics-api.ts).
3. In the val's **Environment Variables**, add:
   - `NOTION_TOKEN` = your integration secret
   - `WEBHOOK_SECRET` = any random string (optional, protects the webhook)
4. Copy the val's URL, e.g. `https://yourname-opticsapi.web.val.run`.
   Open it in a browser — you should see JSON with `site`, `members`, etc.

### 3. Point the site at the API
Edit [`assets/config.js`](assets/config.js):

```js
window.OPTICS_CONFIG = {
  API_BASE: "https://yourname-opticsapi.web.val.run",
};
```

Commit and push — GitHub Pages serves the live site. The preview banner
disappears once live data loads.

---

## Webhook (instant updates)

The API caches Notion responses for 5 minutes. To refresh immediately after an
edit, send a `POST` to clear the cache:

```
POST https://yourname-opticsapi.web.val.run/webhook?secret=YOUR_WEBHOOK_SECRET
```

Set this up as a **Notion automation** (Automations → When any property edited
→ Send webhook) on each database, or call it manually. Without it, changes
appear within 5 minutes anyway.

---

## API endpoints

| Endpoint | Returns |
|----------|---------|
| `GET /` | `{ site, members, publications, projects }` (everything) |
| `GET /site` | settings as a `{ key: value }` map |
| `GET /members` | array of members |
| `GET /publications` | array of publications |
| `GET /projects` | array of projects |
| `POST /webhook` | clears the cache |

---

## Local preview

```sh
python3 -m http.server 4180
# open http://localhost:4180
```

## Extending

- **New text on a page** → add a row in *Site Settings* and read
  `site.your_key` in `assets/app.js`.
- **New member field** → add a column in *Members*; it flows through the API
  automatically (the proxy serializes every property). Render it in
  `viewMemberDetail()`.
- **New section/page** → add a view function and a route in `assets/app.js`
  and a nav link in `index.html`.
