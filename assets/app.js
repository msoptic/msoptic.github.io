/* Optics Lab — frontend. Fetches normalized JSON from the Val Town API and
   renders a small hash-routed single-page app. Falls back to sample content
   when the API is not yet configured so the layout is always previewable. */

const CONFIG = window.OPTICS_CONFIG || { API_BASE: "" };

// ---------- Fallback content (used until API_BASE is set / reachable) -------
const FALLBACK = {
  site: {
    lab_name: "Optics Lab",
    lab_short_name: "Optics",
    university: "Tech University of Korea (TUKOREA)",
    department: "Department of Compound Semiconductor Engineering",
    hero_title: "Optics Lab",
    tagline: "Optical Design & Analysis · Optical Evaluation",
    about:
      "The Optics Lab at TUKOREA specializes in optical design & analysis and optical evaluation. We develop optical systems for imaging, illumination, automotive, medical, and sensing applications, and build measurement systems to test and evaluate them.",
    specialty: "Optical Design & Analysis, Optical Evaluation",
    pi_name: "Prof. Misook Jeong",
    email: "msoptic@tukorea.ac.kr",
    phone: "031-8041-0716",
    office: "Engineering Building P, Room 512",
    address:
      "Tech University of Korea, 237 Sangidaehak-ro, Siheung-si, Gyeonggi-do 15073, Republic of Korea",
    map_query: "한국공학대학교",
  },
  members: [
    {
      id: "pi",
      Name: "Misook Jeong",
      Role: "Professor",
      Position: "Principal Investigator",
      Email: "msoptic@tukorea.ac.kr",
      "Research Interests":
        "Optical Design & Analysis, Optical Evaluation, Imaging Optics, Illumination Optics, Automotive Optics, Sensor Optics",
      Education:
        "Ph.D. in Applied Optics, ITMO University, Russia\nM.S. in Physics, Yonsei University\nB.S. in Physics, Kyonggi University",
      Bio:
        "Prof. Misook Jeong leads the Optics Lab in the Department of Compound Semiconductor Engineering at Tech University of Korea (TUKOREA). Her research focuses on optical design & analysis and optical evaluation across imaging, illumination, automotive, medical, and sensor optics. Before joining TUKOREA she worked at the Samsung Advanced Institute of Technology and the Korea Electrotechnology Research Institute (KERI), and was a Visiting Scholar at the University of Arizona.",
      Photo: [],
    },
    { id: "phd1", Name: "Jiwon Park", Role: "Ph.D Candidate", Position: "Ph.D Student", Email: "jiwon.park@tukorea.ac.kr", "Research Interests": "Imaging optics, lens design, optical aberration analysis", Education: "M.S. in Physics, TUKOREA\nB.S. in Physics, TUKOREA", Bio: "Jiwon Park is a Ph.D candidate working on imaging optical system design and aberration analysis for high-resolution camera modules.", Photo: [] },
    { id: "phd2", Name: "Donghyun Lee", Role: "Ph.D Candidate", Position: "Ph.D Student", Email: "donghyun.lee@tukorea.ac.kr", "Research Interests": "Automotive optics, headlamp and HUD optical design", Education: "M.S. in Optical Engineering, TUKOREA", Bio: "Donghyun Lee researches automotive optical systems, focusing on headlamp and head-up display (HUD) design and evaluation.", Photo: [] },
    { id: "ms1", Name: "Seoyeon Kim", Role: "M.S Candidate", Position: "M.S Student", Email: "seoyeon.kim@tukorea.ac.kr", "Research Interests": "Illumination optics, LED light distribution", Education: "B.S. in Compound Semiconductor Engineering, TUKOREA", Bio: "Seoyeon Kim works on illumination optics and LED light-distribution design for lighting applications.", Photo: [] },
    { id: "ms2", Name: "Minjun Choi", Role: "M.S Candidate", Position: "M.S Student", Email: "minjun.choi@tukorea.ac.kr", "Research Interests": "Optical sensors, measurement systems", Education: "B.S. in Physics, TUKOREA", Bio: "Minjun Choi develops optical sensor systems and optical measurement setups for evaluation.", Photo: [] },
    { id: "al1", Name: "Hyemin Kang", Role: "Alumni", Position: "M.S (2023)", "Research Interests": "Semiconductor inspection optics", "Current Position": "Optical Engineer, Samsung Electronics", Bio: "Hyemin Kang completed her M.S. on semiconductor inspection optics and now works as an optical engineer in industry.", Photo: [] },
    { id: "al2", Name: "Junseo Yoon", Role: "Alumni", Position: "M.S (2022)", "Research Interests": "Imaging optics, projector optical systems", "Current Position": "Optical Designer, LG Innotek", Bio: "Junseo Yoon worked on projector optical systems during his M.S. and now designs optical modules in industry.", Photo: [] },
  ],
  publications: [
    { id: "p1", Title: "High-resolution imaging lens design with reduced chromatic aberration", Authors: "J. Park, M. Jeong", Venue: "Optics Express", Year: 2025, Type: "Journal", DOI: "https://doi.org/10.1364/OE.000000", Abstract: "We present an imaging lens design approach that minimizes chromatic aberration for compact high-resolution camera modules." },
    { id: "p2", Title: "Optical design of an automotive head-up display with a wide eyebox", Authors: "D. Lee, M. Jeong", Venue: "Applied Optics", Year: 2024, Type: "Journal", Abstract: "An automotive HUD optical system is designed to achieve a wide eyebox while maintaining image quality." },
    { id: "p3", Title: "Illumination optics for uniform LED street lighting", Authors: "S. Kim, M. Jeong", Venue: "International Conference on Optics and Photonics (ICOP)", Year: 2025, Type: "Conference", Abstract: "A freeform illumination optic is proposed to achieve uniform road illuminance for LED street lighting." },
    { id: "p4", Title: "Optical measurement system for endoscope lens evaluation", Authors: "M. Choi, M. Jeong", Venue: "SPIE Photonics Asia", Year: 2024, Type: "Conference", Abstract: "We build an optical measurement system to evaluate the imaging performance of endoscope lenses." },
  ],
  projects: [
    { id: "j1", Title: "Imaging Optics", Description: "Cameras, inspection optics, lithography optics, projectors.", Category: ["Imaging"], Status: "Ongoing" },
    { id: "j2", Title: "Illumination Optics", Description: "Fishing lamps, searchlights, streetlights.", Category: ["Illumination"], Status: "Ongoing" },
    { id: "j3", Title: "Automotive Optics", Description: "Headlamps, puddle lamps, head-up displays (HUD).", Category: ["Automotive"], Status: "Ongoing" },
    { id: "j4", Title: "Medical Optics", Description: "Endoscopes, cervical diagnostic devices.", Category: ["Medical"], Status: "Ongoing" },
    { id: "j5", Title: "Sensor Optics", Description: "Distance, displacement, rain, safety, gas sensors.", Category: ["Sensor"], Status: "Ongoing" },
    { id: "j6", Title: "Semiconductor Inspection Optics", Description: "Inspection optical systems for semiconductors.", Category: ["Semiconductor"], Status: "Ongoing" },
    { id: "j7", Title: "3D Display Development", Description: "Three-dimensional displays.", Category: ["Display"], Status: "Ongoing" },
  ],
};

const ROLE_ORDER = ["Professor", "Ph.D Candidate", "M.S Candidate", "Alumni"];

let DATA = null;
let usingFallback = false;

// ---------- Helpers ---------------------------------------------------------
const $ = (sel, el = document) => el.querySelector(sel);
const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );
// Ensure an external URL has a protocol so it isn't treated as a relative path.
const ext = (u) => {
  const s = String(u ?? "").trim();
  if (!s) return "";
  return /^[a-z][a-z0-9+.-]*:\/\//i.test(s) || s.startsWith("mailto:") ? s : "https://" + s;
};
const s = () => DATA.site || {};
const initials = (name) =>
  String(name || "?").trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
const firstFile = (v) => (Array.isArray(v) && v.length ? v[0] : typeof v === "string" ? v : null);

async function loadData() {
  if (CONFIG.API_BASE) {
    try {
      const res = await fetch(CONFIG.API_BASE.replace(/\/+$/, "") + "/");
      if (!res.ok) throw new Error(res.status);
      const d = await res.json();
      if (d && d.site) {
        usingFallback = false;
        return d;
      }
    } catch (e) {
      console.warn("API fetch failed, using fallback:", e);
    }
  }
  usingFallback = true;
  return FALLBACK;
}

// ---------- Layout ----------------------------------------------------------
function renderChrome() {
  const site = s();
  $("#brand-name").textContent = site.lab_name || "Optics Lab";
  $("#brand-uni").textContent = site.university || "";
  document.title = (site.lab_name || "Optics Lab") + " — " + (site.university || "TUKOREA");
  $("#year").textContent = new Date().getFullYear();
  $("#footer-lab").textContent = site.lab_name || "Optics Lab";
  $("#footer-dept").textContent = [site.department, site.university].filter(Boolean).join(", ");
}

function setActiveNav(route) {
  document.querySelectorAll(".nav-links a").forEach((a) => {
    a.classList.toggle("active", a.dataset.route === route);
  });
}

function banner() {
  return usingFallback && !CONFIG.API_BASE
    ? `<div class="banner">Preview mode — showing sample content. Set <code>API_BASE</code> in <code>assets/config.js</code> to load live data from Notion.</div>`
    : "";
}

// ---------- Views -----------------------------------------------------------
function viewHome() {
  const site = s();
  const featProjects = DATA.projects.slice(0, 6);
  return `
  ${banner()}
  <section class="hero">
    <div class="hero-text">
      <span class="section-eyebrow">${esc([site.university, site.department].filter(Boolean).join(" · "))}</span>
      <h1>${esc(site.hero_title || site.lab_name || "Optics Lab")}</h1>
      <p class="lead">${esc(site.tagline || site.specialty || "")}</p>
      <div class="cta">
        <a class="btn" href="#/projects">Explore Research</a>
        <a class="btn ghost" href="#/contact">Contact Us</a>
      </div>
    </div>
    <div class="hero-visual glass">${opticsSVG()}</div>
  </section>

  <section>
    <p style="max-width:760px;font-size:1.05rem">${esc(site.about || "")}</p>
  </section>

  <div class="stats">
    <div class="stat"><b class="gradient-text">${DATA.members.length}</b><span class="muted">Members</span></div>
    <div class="stat"><b class="gradient-text">${DATA.projects.length}</b><span class="muted">Research Areas</span></div>
    <div class="stat"><b class="gradient-text">${DATA.publications.length}</b><span class="muted">Publications</span></div>
  </div>

  <section style="margin-top:36px">
    <span class="section-eyebrow">Research</span>
    <h2 class="page-title" style="font-size:1.5rem">Selected Areas</h2>
    <div class="grid cols-2" style="margin-top:18px">
      ${featProjects.map(projectCard).join("")}
    </div>
    <p style="margin-top:18px"><a href="#/projects">See all research areas →</a></p>
  </section>`;
}

function opticsSVG() {
  return `<img src="assets/logo.png?v=4" alt="Optics Lab microscope logo" class="microscope-3d" />`;
}

function projectCard(p) {
  const cats = (p.Category || []).map((c) => `<span class="tag">${esc(c)}</span>`).join("");
  const status = p.Status ? `<span class="tag gray">${esc(p.Status)}</span>` : "";
  return `
  <div class="card project-card link" onclick="location.hash='#/projects/${esc(p.id)}'">
    <div>${cats}${status}</div>
    <h3>${esc(p.Title)}</h3>
    <p class="muted" style="margin:0">${esc(p.Description || "")}</p>
    ${p.Funding ? `<p class="muted" style="font-size:.85rem;margin-top:10px">Funding: ${esc(p.Funding)}</p>` : ""}
  </div>`;
}

function viewProjects() {
  return `
  ${banner()}
  <h1 class="page-title">Projects</h1>
  <p class="page-sub">Research areas and projects of the ${esc(s().lab_name || "Optics Lab")}.</p>
  ${DATA.projects.length
      ? `<div class="grid cols-2">${DATA.projects.map(projectCard).join("")}</div>`
      : `<p class="empty">No projects yet.</p>`}`;
}

function fmtDateRange(start, end) {
  const a = start && start.start ? start.start : "";
  const b = end && end.start ? end.start : "";
  if (!a && !b) return "";
  return [a, b].filter(Boolean).join(" – ");
}

function viewProjectDetail(id) {
  const p = DATA.projects.find((x) => x.id === id);
  if (!p) return `<p class="empty">Project not found. <a href="#/projects">Back to projects</a></p>`;
  const cats = (p.Category || []).map((c) => `<span class="tag">${esc(c)}</span>`).join("");
  const img = firstFile(p.Image);
  const rows = [
    ["Status", p.Status],
    ["Period", fmtDateRange(p["Start Date"], p["End Date"])],
    ["Funding", p.Funding],
  ].filter(([, v]) => v);
  return `
  <p style="margin-bottom:18px"><a href="#/projects">← Projects</a></p>
  <h1 class="page-title">${esc(p.Title)}</h1>
  ${cats ? `<div style="margin:10px 0 18px">${cats}</div>` : ""}
  ${img ? `<img class="detail-img" src="${esc(img)}" alt="${esc(p.Title)}">` : ""}
  ${rows.length ? `<div class="kv">${rows.map(([k, v]) => `<div><span class="k">${esc(k)}</span><span>${esc(v)}</span></div>`).join("")}</div>` : ""}
  ${p.Description ? `<h3>About this project</h3><p class="prose">${esc(p.Description)}</p>` : ""}`;
}

function viewPublicationDetail(id) {
  const p = DATA.publications.find((x) => x.id === id);
  if (!p) return `<p class="empty">Publication not found. <a href="#/publications">Back to publications</a></p>`;
  const links = [];
  if (p.DOI) links.push(`<a class="btn" href="${esc(ext(p.DOI))}" target="_blank" rel="noopener">DOI ↗</a>`);
  if (p.Link) links.push(`<a class="btn ghost" href="${esc(ext(p.Link))}" target="_blank" rel="noopener">View ↗</a>`);
  return `
  <p style="margin-bottom:18px"><a href="#/publications">← Publications</a></p>
  ${p.Type ? `<span class="tag">${esc(p.Type)}</span>` : ""}
  <h1 class="page-title" style="margin-top:10px">${esc(p.Title)}</h1>
  <p class="authors" style="font-size:1.05rem;margin:6px 0">${esc(p.Authors || "")}</p>
  <p class="muted" style="margin:0">${[p.Venue, p.Year].filter(Boolean).map(esc).join(" · ")}</p>
  ${links.length ? `<div style="display:flex;gap:10px;flex-wrap:wrap;margin:20px 0">${links.join("")}</div>` : ""}
  ${p.Abstract ? `<h3>Abstract</h3><p class="prose">${esc(p.Abstract)}</p>` : ""}`;
}

const PUB_LABELS = {
  Journal: "Journal Papers",
  Conference: "Conference Proceedings",
  Patent: "Patents",
  Thesis: "Theses",
};

function viewPublications() {
  if (!DATA.publications.length)
    return `${banner()}<h1 class="page-title">Publications</h1><p class="empty">No publications yet.</p>`;

  const order = ["Journal", "Conference", "Patent", "Thesis"];
  const extra = Array.from(new Set(DATA.publications.map((p) => p.Type).filter((t) => t && !order.includes(t))));
  const sections = [...order, ...extra].filter((t) => DATA.publications.some((p) => p.Type === t));
  const untyped = DATA.publications.filter((p) => !p.Type);

  const renderSection = (label, items) => `
    <div class="pub-section">
      <h2>${esc(label)} <span class="count">${items.length}</span></h2>
      <div class="pub-list">${items.map(pubItem).join("")}</div>
    </div>`;

  return `
  ${banner()}
  <h1 class="page-title">Publications</h1>
  <p class="page-sub">Journal papers, conference proceedings, and patents.</p>
  ${sections.map((t) => renderSection(PUB_LABELS[t] || t, DATA.publications.filter((p) => p.Type === t))).join("")}
  ${untyped.length ? renderSection("Other", untyped) : ""}`;
}

function pubItem(p) {
  return `
  <div class="pub" onclick="location.hash='#/publications/${esc(p.id)}'">
    <div class="ptitle">${esc(p.Title)}</div>
    <div class="authors">${esc(p.Authors || "")}</div>
    <div class="pmeta">${[p.Venue, p.Year].filter(Boolean).map(esc).join(" · ")}</div>
  </div>`;
}

function viewMembers() {
  const groups = ROLE_ORDER.map((role) => ({
    role,
    people: DATA.members.filter((m) => m.Role === role),
  })).filter((g) => g.people.length);

  if (!groups.length) return `${banner()}<h1 class="page-title">Members</h1><p class="empty">No members yet.</p>`;

  return `
  ${banner()}
  <h1 class="page-title">Members</h1>
  <p class="page-sub">People of the ${esc(s().lab_name || "Optics Lab")}.</p>
  ${groups.map((g) => `
    <div class="role-group">
      <h2>${esc(g.role)}</h2>
      <div class="grid cols-2">
        ${g.people.map(memberCard).join("")}
      </div>
    </div>`).join("")}`;
}

function memberCard(m) {
  const photo = firstFile(m.Photo);
  const av = photo
    ? `<div class="avatar"><img src="${esc(photo)}" alt="${esc(m.Name)}"></div>`
    : `<div class="avatar">${esc(initials(m.Name))}</div>`;
  const sub = m.Role === "Alumni" && m["Current Position"]
    ? m["Current Position"]
    : (m.Position || m["Research Interests"] || "");
  return `
  <div class="card link member-card" onclick="location.hash='#/members/${esc(m.id)}'">
    ${av}
    <div class="meta">
      <div class="name">${esc(m.Name)}</div>
      <div class="pos">${esc(sub)}</div>
    </div>
  </div>`;
}

function viewMemberDetail(id) {
  const m = DATA.members.find((x) => x.id === id);
  if (!m) return `<p class="empty">Member not found. <a href="#/members">Back to members</a></p>`;
  const photo = firstFile(m.Photo);
  const av = photo
    ? `<div class="avatar"><img src="${esc(photo)}" alt="${esc(m.Name)}"></div>`
    : `<div class="avatar">${esc(initials(m.Name))}</div>`;
  const rows = [
    ["Role", m.Role],
    ["Position", m.Position],
    ["Email", m.Email ? `<a href="mailto:${esc(m.Email)}">${esc(m.Email)}</a>` : ""],
    ["Research Interests", m["Research Interests"]],
    ["Current Position", m["Current Position"]],
    ["Homepage", m.Homepage ? `<a href="${esc(ext(m.Homepage))}" target="_blank" rel="noopener">${esc(m.Homepage)}</a>` : ""],
    ["Google Scholar", m["Google Scholar"] ? `<a href="${esc(ext(m["Google Scholar"]))}" target="_blank" rel="noopener">Profile</a>` : ""],
  ].filter(([, v]) => v);

  return `
  <p style="margin-bottom:18px"><a href="#/members">← Members</a></p>
  <div class="detail-head">
    ${av}
    <div class="detail-info">
      <h1>${esc(m.Name)}</h1>
      <p class="muted" style="margin:0 0 4px">${esc(m.Position || m.Role || "")}</p>
      <div class="kv">
        ${rows.map(([k, v]) => `<div><span class="k">${esc(k)}</span><span>${k === "Email" || k === "Homepage" || k === "Google Scholar" ? v : esc(v)}</span></div>`).join("")}
      </div>
    </div>
  </div>
  ${m.Education ? `<h3>Education</h3><p class="prose">${esc(m.Education)}</p>` : ""}
  ${m.Bio ? `<h3>Biography</h3><p class="prose">${esc(m.Bio)}</p>` : ""}`;
}

function viewContact() {
  const site = s();
  const items = [
    ["✉️", "Email", site.email ? `<a href="mailto:${esc(site.email)}">${esc(site.email)}</a>` : ""],
    ["📞", "Phone", site.phone],
    ["📍", "Lab", site.office],
    ["🏛️", "Address", site.address],
    ["👩‍🔬", "PI", site.pi_name],
  ].filter(([, , v]) => v);

  const mapQ = encodeURIComponent(site.map_query || site.address || "Tech University of Korea");
  return `
  ${banner()}
  <h1 class="page-title">Contact</h1>
  <p class="page-sub">Get in touch with the ${esc(site.lab_name || "Optics Lab")}.</p>
  <div class="contact-grid">
    <div class="card">
      ${items.map(([ic, k, v]) => `
        <div class="contact-item">
          <span class="ic">${ic}</span>
          <div><div class="muted" style="font-size:.8rem">${esc(k)}</div><div>${k === "Email" ? v : esc(v)}</div></div>
        </div>`).join("")}
    </div>
    <div class="card" style="padding:0;overflow:hidden;position:relative;min-height:280px">
      <iframe title="map" width="100%" height="100%" style="border:0;min-height:280px"
        loading="lazy" referrerpolicy="no-referrer-when-downgrade"
        src="https://www.google.com/maps?q=${mapQ}&output=embed"></iframe>
      <a class="btn" style="position:absolute;left:14px;bottom:14px"
         href="https://www.google.com/maps?q=${mapQ}" target="_blank" rel="noopener">Open in Google Maps</a>
    </div>
  </div>`;
}

// ---------- Router ----------------------------------------------------------
function router() {
  const hash = location.hash || "#/";
  const parts = hash.replace(/^#\//, "").split("/").filter(Boolean);
  const root = parts[0] || "home";
  const app = $("#app");

  let html, route = root;
  switch (root) {
    case "":
    case "home": html = viewHome(); route = "home"; break;
    case "projects":
      html = parts[1] ? viewProjectDetail(parts[1]) : viewProjects();
      route = "projects";
      break;
    case "publications":
      html = parts[1] ? viewPublicationDetail(parts[1]) : viewPublications();
      route = "publications";
      break;
    case "members":
      html = parts[1] ? viewMemberDetail(parts[1]) : viewMembers();
      route = "members";
      break;
    case "contact": html = viewContact(); break;
    default: html = viewHome(); route = "home";
  }
  app.innerHTML = `<div class="wrap">${html}</div>`;
  setActiveNav(route);
  $(".nav-links")?.classList.remove("open");
  window.scrollTo(0, 0);
}

// ---------- Boot ------------------------------------------------------------
async function boot() {
  DATA = await loadData();
  renderChrome();
  router();
  window.addEventListener("hashchange", router);
  $(".menu-btn")?.addEventListener("click", () => $(".nav-links")?.classList.toggle("open"));
}

boot();
