const express = require("express");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const basicAuth = require("../middleware/basicAuth");
const { getAllPosts, getPostBySlug, renderMarkdown, savePost, deletePost } = require("../data/blogs");

const IMAGE_DIR = path.join(__dirname, "..", "..", "public", "blog-images");
const IMAGE_TYPES = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/gif": "gif",
  "image/webp": "webp",
  "image/svg+xml": "svg",
  "image/avif": "avif"
};

const router = express.Router();
router.use(basicAuth);

function today() {
  return new Date().toISOString().slice(0, 10);
}

function renderEditor(res, post, isNew) {
  return res.render("admin-blog-editor", {
    page: {
      title: isNew ? "New Post" : `Edit: ${post.title}`,
      description: "Local blog editor."
    },
    post,
    isNew
  });
}

router.get("/blog", (req, res) => {
  res.render("admin-blog", {
    page: {
      title: "Blog Manager",
      description: "Local blog manager."
    },
    posts: getAllPosts({ includeDrafts: true })
  });
});

router.get("/blog/new", (req, res) => {
  return renderEditor(
    res,
    { slug: "", title: "", date: today(), excerpt: "", tags: [], cover: "", pdfUrl: "", series: "", part: 0, scripts: [], draft: true, body: "" },
    true
  );
});

router.get("/blog/edit/:slug", (req, res) => {
  const post = getPostBySlug(req.params.slug, { includeDrafts: true });
  if (!post) return res.redirect("/admin/blog");
  return renderEditor(res, post, false);
});

// Full-page preview (runs widgets and post scripts), works for drafts too.
router.get("/blog/preview/:slug", (req, res) => {
  const post = getPostBySlug(req.params.slug, { includeDrafts: true });
  if (!post) return res.redirect("/admin/blog");
  return res.render("blog-post", {
    page: { title: `Preview: ${post.title}`, description: post.excerpt, noindex: true },
    post,
    series: null,
    newer: null,
    older: null
  });
});

router.get("/assets/blog-editor.js", (req, res) => {
  res.type("application/javascript").sendFile(path.join(__dirname, "blog-editor.js"));
});

router.post("/api/blog/preview", (req, res) => {
  res.json({ ok: true, html: renderMarkdown(req.body.body).html });
});

router.post("/api/blog/save", (req, res) => {
  const result = savePost(req.body, req.body.originalSlug);
  return res.status(result.ok ? 200 : 400).json(result);
});

router.delete("/api/blog/:slug", (req, res) => {
  const ok = deletePost(req.params.slug);
  return res.status(ok ? 200 : 404).json({ ok });
});

router.post(
  "/api/blog/image",
  express.raw({ type: Object.keys(IMAGE_TYPES), limit: "15mb" }),
  (req, res) => {
    const ext = IMAGE_TYPES[req.headers["content-type"]];
    if (!ext || !Buffer.isBuffer(req.body) || !req.body.length) {
      return res.status(400).json({ ok: false, errors: ["Unsupported or empty image."] });
    }

    const baseName =
      String(req.headers["x-filename"] || "image")
        .replace(/\.[^.]+$/, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 50) || "image";
    const fileName = `${baseName}-${crypto.randomBytes(3).toString("hex")}.${ext}`;

    fs.mkdirSync(IMAGE_DIR, { recursive: true });
    fs.writeFileSync(path.join(IMAGE_DIR, fileName), req.body);

    const sizeKb = Math.round(req.body.length / 1024);
    return res.status(201).json({ ok: true, url: `/blog-images/${fileName}`, sizeKb });
  }
);

module.exports = router;
