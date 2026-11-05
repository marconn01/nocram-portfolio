require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");
const { execSync } = require("child_process");

const basicAuth = require("./src/middleware/basicAuth");
const { validateContactForm } = require("./src/validation/contactValidation");
const { getProjects, saveContactMessage } = require("./src/db");
const { getAllPosts, getPostBySlug, getSeries, getNeighbours } = require("./src/data/blogs");
const blogAdmin = require("./src/admin/blogAdmin");
const resume = require("./src/data/resume");

const app = express();
const PORT = Number(process.env.PORT) || 3000;
// Used for canonical links, the sitemap, and RSS. The Cloudflare build doesn't set
// SITE_URL, so default to the real domain rather than localhost.
const siteUrl = (process.env.SITE_URL || "https://navinnepal.com.np").replace(/\/$/, "");

// Shown in the footer status line. Cloudflare's builder exposes the commit SHA as an env var.
function readBuildSha() {
  const fromEnv = process.env.WORKERS_CI_COMMIT_SHA || process.env.CF_PAGES_COMMIT_SHA || "";
  if (fromEnv) return fromEnv.slice(0, 7);
  try {
    return execSync("git rev-parse --short HEAD", { stdio: ["ignore", "pipe", "ignore"] }).toString().trim();
  } catch (error) {
    return "dev";
  }
}

const build = {
  sha: readBuildSha(),
  date: new Date().toISOString().slice(0, 10)
};

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(helmet());
app.use(morgan(":method :url :status :response-time ms"));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  res.locals.site = {
    title: "Navin Nepal | Portfolio",
    description: "DevOps and backend portfolio focused on AWS, Kubernetes, CI/CD, and scalable backend systems.",
    url: siteUrl
  };
  res.locals.build = build;
  res.locals.currentUrl = req.path;
  next();
});

app.get("/", async (req, res, next) => {
  try {
    const projects = await getProjects();
    const featured = projects.filter((item) => item.featured).slice(0, 3);
    return res.render("index", {
      page: {
        title: "Portfolio",
        description: "Portfolio website of Navin Nepal with DevOps, backend engineering, and cloud-native projects."
      },
      featured,
      latestPosts: getAllPosts().slice(0, 4),
      now: new Date().getFullYear()
    });
  } catch (error) {
    return next(error);
  }
});

app.get("/projects", async (req, res, next) => {
  try {
    const type = req.query.type ? String(req.query.type) : "";
    const projects = await getProjects({ type });
    return res.render("projects", {
      page: {
        title: "Projects",
        description: "Dynamic project gallery rendered from backend data source."
      },
      projects,
      activeType: type
    });
  } catch (error) {
    return next(error);
  }
});

app.get("/cv", (req, res) => {
  return res.render("cv", {
    page: {
      title: "CV",
      description: "CV of Navin Nepal: DevOps and backend engineer. Experience, projects, skills, and education."
    },
    resume
  });
});

app.get("/resume", (req, res) => res.redirect(301, "/cv"));

app.get("/blog", (req, res) => {
  const posts = getAllPosts();
  return res.render("blog", {
    page: {
      title: "Writing",
      description: "Articles on DevOps, SRE, cloud engineering, and backend development."
    },
    posts,
    series: getSeries(),
    tags: [...new Set(posts.flatMap((post) => post.tags))].sort((a, b) => a.localeCompare(b))
  });
});

app.get("/blog/:slug", (req, res) => {
  const post = getPostBySlug(req.params.slug);
  if (!post) {
    return res.status(404).render("not-found", {
      page: {
        title: "Post Not Found",
        description: "The requested blog post does not exist."
      }
    });
  }

  return res.render("blog-post", {
    page: {
      title: post.title,
      description: post.excerpt
    },
    post,
    series: post.series ? getSeries().find((group) => group.name === post.series) : null,
    ...getNeighbours(post.slug)
  });
});

app.get("/hello", (req, res) => {
  const name = String(req.query.name || "Guest").slice(0, 40);
  res.json({
    message: `Hello ${name}, welcome to my dynamic portfolio.`
  });
});

app.get("/contact", (req, res) => {
  res.render("contact", {
    page: {
      title: "Contact",
      description: "Send a message through validated form and asynchronous AJAX call."
    }
  });
});

app.post("/api/contact", async (req, res, next) => {
  try {
    const validation = validateContactForm(req.body);

    if (!validation.isValid) {
      return res.status(400).json({
        ok: false,
        errors: validation.errors
      });
    }

    const record = await saveContactMessage(validation.values);

    return res.status(201).json({
      ok: true,
      alert: `Thanks ${record.name}, your message has been received.`,
      saved: record.persisted
    });
  } catch (error) {
    return next(error);
  }
});

app.get("/api/projects", async (req, res, next) => {
  try {
    const type = req.query.type ? String(req.query.type) : "";
    const projects = await getProjects({ type });
    return res.json({ ok: true, projects });
  } catch (error) {
    return next(error);
  }
});

app.get("/admin", basicAuth, async (req, res, next) => {
  try {
    const projects = await getProjects();
    res.render("admin", {
      page: {
        title: "Admin",
        description: "Protected route demonstrating simple auth middleware."
      },
      projectCount: projects.length,
      postCount: getAllPosts({ includeDrafts: true }).length
    });
  } catch (error) {
    return next(error);
  }
});

// The blog manager writes Markdown files to disk, so it only runs locally.
// Production is a static build, and posts go live via git push.
if (process.env.NODE_ENV !== "production") {
  app.use("/admin", blogAdmin);
}

app.get("/feed", (req, res) => {
  return res.render("feed", {
    page: {
      title: "Subscribe",
      description: "Follow new posts by Navin Nepal with any RSS reader."
    },
    feedUrl: `${siteUrl}/rss.xml`,
    posts: getAllPosts().slice(0, 5)
  });
});

app.get("/rss.xml", (req, res) => {
  const escapeXml = (value) =>
    String(value).replace(/[<>&'"]/g, (char) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[char]);

  const items = getAllPosts()
    .slice(0, 30)
    .map(
      (post) => `<item>
  <title>${escapeXml(post.title)}</title>
  <link>${siteUrl}/blog/${post.slug}</link>
  <guid>${siteUrl}/blog/${post.slug}</guid>
  <pubDate>${new Date(post.date).toUTCString()}</pubDate>
  <description>${escapeXml(post.excerpt)}</description>
</item>`
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>Navin Nepal: Writing</title>
  <link>${siteUrl}/blog</link>
  <description>Notes on DevOps, SRE, cloud, and backend engineering.</description>
  <language>en</language>
  <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml" />
${items}
</channel>
</rss>`;

  res.header("Content-Type", "application/rss+xml; charset=utf-8").send(xml);
});

app.get("/sitemap.xml", async (req, res) => {
  const routes = ["/", "/projects", "/blog", "/cv", "/contact", "/feed"];
  const postRoutes = getAllPosts().map((post) => `/blog/${post.slug}`);
  const urls = routes
    .concat(postRoutes)
    .map((route) => `<url><loc>${siteUrl}${route}</loc></url>`)
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;

  res.header("Content-Type", "application/xml").send(xml);
});

app.use((req, res) => {
  res.status(404).render("not-found", {
    page: {
      title: "Not Found",
      description: "Requested page was not found."
    }
  });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    ok: false,
    error: "Something went wrong on the server."
  });
});

if (require.main === module) {
  app.listen(PORT, () => console.log(`Portfolio running at http://localhost:${PORT}`));
}

module.exports = app;
