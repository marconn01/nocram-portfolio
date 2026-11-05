const fs = require("fs");
const path = require("path");
const { Marked } = require("marked");

const CONTENT_DIR = path.join(__dirname, "..", "..", "content", "blog");
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const WORDS_PER_MINUTE = 200;

// Front matter is a small YAML subset: one `key: value` per line.
// Strings may be bare or double-quoted, lists are `[a, b]` or `["a", "b"]`.
function parseValue(raw) {
  const value = raw.trim();
  if (value === "true") return true;
  if (value === "false") return false;
  if (value.startsWith("[") && value.endsWith("]")) {
    try {
      return JSON.parse(value);
    } catch (error) {
      return value
        .slice(1, -1)
        .split(",")
        .map((item) => item.trim().replace(/^["']|["']$/g, ""))
        .filter(Boolean);
    }
  }
  if (value.startsWith('"') && value.endsWith('"')) {
    try {
      return JSON.parse(value);
    } catch (error) {
      return value.slice(1, -1);
    }
  }
  return value;
}

function parseFile(source) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { meta: {}, body: source };

  const meta = {};
  match[1].split(/\r?\n/).forEach((line) => {
    const index = line.indexOf(":");
    if (index === -1 || line.trim().startsWith("#")) return;
    meta[line.slice(0, index).trim()] = parseValue(line.slice(index + 1));
  });

  return { meta, body: match[2] };
}

function serializeFile(meta, body) {
  const lines = Object.entries(meta)
    .filter(([, value]) => value !== "" && value !== undefined && value !== null)
    .filter(([key, value]) => !(Array.isArray(value) && !value.length && key !== "tags"))
    .map(([key, value]) => {
      if (typeof value === "boolean") return `${key}: ${value}`;
      if (key === "date") return `${key}: ${value}`;
      return `${key}: ${JSON.stringify(value)}`;
    });
  return `---\n${lines.join("\n")}\n---\n\n${String(body || "").trim()}\n`;
}

function toPlainText(markdown) {
  return String(markdown || "")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_`~|-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function slugifyHeading(text) {
  return (
    String(text)
      .toLowerCase()
      .replace(/<[^>]+>/g, "")
      .replace(/&[a-z]+;/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "section"
  );
}

// ```terminal [title]: lines starting with "$ " are commands, the rest is output.
function renderTerminal(code, title) {
  const lines = code.split("\n").map((line) => {
    if (line.startsWith("$ ")) {
      return `<span class="term-line term-cmd"><span class="term-prompt">$</span> ${escapeHtml(line.slice(2))}</span>`;
    }
    return `<span class="term-line term-out">${escapeHtml(line) || " "}</span>`;
  });
  return (
    `<figure class="term" data-widget="terminal">` +
    `<figcaption class="term-bar"><span class="term-dots" aria-hidden="true"></span>` +
    `<span class="term-title">${escapeHtml(title || "terminal")}</span></figcaption>` +
    `<pre class="term-body">${lines.join("")}</pre></figure>\n`
  );
}

// Returns rendered HTML plus a table of contents built from h2/h3 headings.
function renderMarkdown(markdown) {
  const toc = [];
  const usedIds = new Map();

  const renderer = {
    heading(text, depth, raw) {
      const base = slugifyHeading(raw);
      const count = usedIds.get(base) || 0;
      usedIds.set(base, count + 1);
      const id = count ? `${base}-${count}` : base;
      if (depth === 2 || depth === 3) toc.push({ id, depth, text: raw });
      return `<h${depth} id="${id}"><a class="anchor" href="#${id}" aria-hidden="true">#</a>${text}</h${depth}>\n`;
    },
    code(code, infostring) {
      const [lang, ...rest] = String(infostring || "").trim().split(/\s+/);
      if (lang === "terminal") return renderTerminal(code, rest.join(" "));
      const label = lang ? `<span class="code-lang">${escapeHtml(lang)}</span>` : "";
      const cls = lang ? ` class="language-${escapeHtml(lang)}"` : "";
      return `<figure class="code-block" data-widget="code"><figcaption class="code-bar">${label}</figcaption><pre><code${cls}>${escapeHtml(code)}</code></pre></figure>\n`;
    }
  };

  const html = new Marked({ renderer }).parse(String(markdown || ""));
  return { html, toc };
}

function buildPost(slug, source) {
  const { meta, body } = parseFile(source);
  const text = toPlainText(body);
  const words = text ? text.split(" ").length : 0;
  const tags = Array.isArray(meta.tags) ? meta.tags.map(String) : meta.tags ? [String(meta.tags)] : [];

  return {
    slug,
    title: String(meta.title || slug),
    date: String(meta.date || ""),
    excerpt: String(meta.excerpt || text.slice(0, 180)),
    tags,
    cover: meta.cover ? String(meta.cover) : "",
    pdfUrl: meta.pdf ? String(meta.pdf) : "",
    draft: meta.draft === true,
    series: meta.series ? String(meta.series) : "",
    part: Number(meta.part) || 0,
    scripts: (Array.isArray(meta.scripts) ? meta.scripts : meta.scripts ? [meta.scripts] : [])
      .map(String)
      .filter((src) => src.startsWith("/")),
    readTime: meta.pdf ? "PDF" : `${Math.max(1, Math.round(words / WORDS_PER_MINUTE))} min read`,
    body,
    searchText: [meta.title, meta.excerpt, tags.join(" "), text.slice(0, 4000)].join(" ").toLowerCase()
  };
}

function readPost(slug) {
  if (!SLUG_PATTERN.test(slug)) return null;
  const file = path.join(CONTENT_DIR, `${slug}.md`);
  if (!fs.existsSync(file)) return null;
  return buildPost(slug, fs.readFileSync(file, "utf8"));
}

function getAllPosts({ includeDrafts = false } = {}) {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  return fs
    .readdirSync(CONTENT_DIR)
    .filter((name) => name.endsWith(".md"))
    .map((name) => readPost(name.slice(0, -3)))
    .filter((post) => post && (includeDrafts || !post.draft))
    .sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title));
}

function getPostBySlug(slug, { includeDrafts = false } = {}) {
  const post = readPost(String(slug));
  if (!post || (post.draft && !includeDrafts)) return null;
  const rendered = post.pdfUrl ? { html: "", toc: [] } : renderMarkdown(post.body);
  return { ...post, ...rendered };
}

// Groups published posts that share a `series` value, ordered by `part`, then date.
function getSeries() {
  const groups = new Map();
  getAllPosts()
    .filter((post) => post.series)
    .forEach((post) => {
      if (!groups.has(post.series)) groups.set(post.series, []);
      groups.get(post.series).push(post);
    });

  return [...groups.entries()].map(([name, posts]) => ({
    name,
    posts: posts.sort((a, b) => a.part - b.part || a.date.localeCompare(b.date))
  }));
}

function getNeighbours(slug) {
  const posts = getAllPosts();
  const index = posts.findIndex((post) => post.slug === slug);
  if (index === -1) return { newer: null, older: null };
  return { newer: posts[index - 1] || null, older: posts[index + 1] || null };
}

function validatePost(input) {
  const errors = [];
  const slug = String(input.slug || "").trim();
  const title = String(input.title || "").trim();
  const date = String(input.date || "").trim();

  if (!SLUG_PATTERN.test(slug)) errors.push("Slug must be lowercase letters, numbers, and single dashes.");
  if (!title) errors.push("Title is required.");
  if (!DATE_PATTERN.test(date) || Number.isNaN(Date.parse(date))) errors.push("Date must be YYYY-MM-DD.");

  return errors;
}

function savePost(input, originalSlug) {
  const errors = validatePost(input);
  if (errors.length) return { ok: false, errors };

  const slug = String(input.slug).trim();
  const previous = originalSlug && SLUG_PATTERN.test(originalSlug) ? originalSlug : "";
  const target = path.join(CONTENT_DIR, `${slug}.md`);

  if (slug !== previous && fs.existsSync(target)) {
    return { ok: false, errors: [`A post with slug "${slug}" already exists.`] };
  }

  const tags = (Array.isArray(input.tags) ? input.tags : String(input.tags || "").split(","))
    .map((tag) => String(tag).trim())
    .filter(Boolean);

  const meta = {
    title: String(input.title).trim(),
    date: String(input.date).trim(),
    excerpt: String(input.excerpt || "").trim(),
    tags,
    cover: String(input.cover || "").trim(),
    pdf: String(input.pdf || "").trim(),
    series: String(input.series || "").trim(),
    part: Number(input.part) || "",
    scripts: (Array.isArray(input.scripts) ? input.scripts : String(input.scripts || "").split(","))
      .map((src) => String(src).trim())
      .filter(Boolean),
    draft: Boolean(input.draft)
  };

  fs.mkdirSync(CONTENT_DIR, { recursive: true });
  fs.writeFileSync(target, serializeFile(meta, input.body));

  if (previous && previous !== slug) {
    const oldFile = path.join(CONTENT_DIR, `${previous}.md`);
    if (fs.existsSync(oldFile)) fs.unlinkSync(oldFile);
  }

  return { ok: true, slug, file: path.relative(process.cwd(), target) };
}

function deletePost(slug) {
  if (!SLUG_PATTERN.test(String(slug))) return false;
  const file = path.join(CONTENT_DIR, `${slug}.md`);
  if (!fs.existsSync(file)) return false;
  fs.unlinkSync(file);
  return true;
}

module.exports = {
  getAllPosts,
  getPostBySlug,
  getSeries,
  getNeighbours,
  renderMarkdown,
  savePost,
  deletePost
};
