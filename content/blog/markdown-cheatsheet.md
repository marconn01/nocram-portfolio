---
title: "Markdown Cheat Sheet (draft, never published)"
date: 2026-11-05
excerpt: "Reference post for writing. It stays a draft so it never shows on the site."
tags: ["Reference"]
scripts: ["/blog-assets/demos/backoff.js"]
draft: true
---

Open this in the blog manager to see the source next to the preview.

## Headings

Use `##` for sections and `###` for sub-sections. The post title is already the top heading, and every `##`/`###` shows up in the "On this page" sidebar.

## Text

**Bold**, _italic_, `inline code`, and [a link](https://navinnepal.com.np).

> Quotes look like this.

- Bullet one
- Bullet two

1. Step one
2. Step two

## Code blocks

Put the language after the backticks. Readers get a copy button automatically.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
```

## Interactive

### Terminal replay

Use a `terminal` code block. Lines starting with `$ ` are commands, everything else is output. It types itself out when scrolled into view and has replay and copy buttons (copy grabs only the commands).

```terminal rolling out a deployment
$ kubectl rollout status deploy/api -n prod
Waiting for deployment "api" rollout to finish: 2 of 3 updated replicas are available...
deployment "api" successfully rolled out
$ kubectl get pods -n prod -l app=api
NAME                   READY   STATUS    RESTARTS   AGE
api-7d9c6b5f4d-8xkqz   1/1     Running   0          42s
api-7d9c6b5f4d-mn2lp   1/1     Running   0          38s
```

### Custom widgets

For anything bespoke, write a small script in `public/blog-assets/<post-slug>/`, list it under `scripts:` in the front matter (or the "Interactive scripts" field in the editor), and drop a placeholder element into the Markdown:

```html
<div class="widget" data-backoff></div>
```

Which renders as:

<div class="widget" data-backoff></div>

### Collapsible sections

<details>
<summary>Click to expand</summary>

Hidden content works with normal **Markdown** inside it.

</details>

## Series

Give related posts the same `series:` name and a `part:` number. They get a "part 2 of 4" box and show up grouped on the writing page.

## Images

Paste or drop a screenshot in the editor, or upload with the Image button.
Files are saved in `public/blog-images/` and inserted like this:

`![Grafana latency dashboard](/blog-images/example.png)`

## Tables

| Provider  | Latency | Cost   |
|-----------|---------|--------|
| WorldLink | 8 ms    | Low    |
| AWS       | 60 ms   | Higher |

---

Set **Draft** off and push when a post is ready to go live.
