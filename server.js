require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");

const basicAuth = require("./src/middleware/basicAuth");
const { validateContactForm } = require("./src/validation/contactValidation");
const { getProjects, saveContactMessage } = require("./src/db");
const { getAllPosts, getPostBySlug } = require("./src/data/blogs");

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const siteUrl = process.env.SITE_URL || `http://localhost:${PORT}`;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(helmet());
app.use(morgan(":method :url :status :response-time ms"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  res.locals.site = {
    title: "Navin Nepal | Portfolio",
    description: "DevOps and backend portfolio focused on AWS, Kubernetes, CI/CD, and scalable backend systems.",
    url: siteUrl
  };
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
      latestPosts: getAllPosts().slice(0, 3),
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

app.get("/resume", async (req, res, next) => {
  return res.redirect("/Navin_Nepal_Resume.pdf");
});

app.get("/blog", (req, res) => {
  const posts = getAllPosts();
  return res.render("blog", {
    page: {
      title: "Blog",
      description: "Articles on DevOps, SRE, cloud engineering, and backend development."
    },
    posts
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
    post
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
      projectCount: projects.length
    });
  } catch (error) {
    return next(error);
  }
});

app.get("/sitemap.xml", async (req, res) => {
  const routes = ["/", "/projects", "/blog", "/contact", "/resume"];
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

app.listen(PORT, () => {
  console.log(`Portfolio server running on ${siteUrl}`);
});
