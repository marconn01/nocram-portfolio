(function initBlogEditor() {
  const form = document.querySelector("#postForm");
  if (!form) return;

  const body = document.querySelector("#bodyInput");
  const preview = document.querySelector("#preview");
  const status = document.querySelector("#editorStatus");
  const titleInput = document.querySelector("#titleInput");
  const slugInput = document.querySelector("#slugInput");
  const coverInput = document.querySelector("#coverInput");
  const fileInput = document.querySelector("#fileInput");
  const deleteBtn = document.querySelector("#deleteBtn");

  let originalSlug = form.dataset.originalSlug || "";
  let slugTouched = form.dataset.isNew !== "true";
  let dirty = false;
  let previewTimer = null;
  let uploadTarget = "body";

  function setStatus(text, tone) {
    status.textContent = text;
    status.dataset.tone = tone || "";
  }

  function slugify(text) {
    return String(text)
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80);
  }

  async function postJson(url, payload, method = "POST") {
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: payload ? JSON.stringify(payload) : undefined
    });
    const data = await response.json().catch(() => ({}));
    return { ok: response.ok && data.ok !== false, data };
  }

  // Live preview
  async function refreshPreview() {
    const { ok, data } = await postJson("/admin/api/blog/preview", { body: body.value });
    if (ok) preview.innerHTML = data.html || '<p class="editor-empty">Preview appears here.</p>';
  }

  function schedulePreview() {
    clearTimeout(previewTimer);
    previewTimer = setTimeout(refreshPreview, 250);
  }

  function markDirty() {
    if (!dirty) {
      dirty = true;
      setStatus("Unsaved changes", "warn");
    }
  }

  // Formatting helpers
  function replaceSelection(transform) {
    const start = body.selectionStart;
    const end = body.selectionEnd;
    const selected = body.value.slice(start, end);
    const { text, cursorStart, cursorEnd } = transform(selected);
    body.setRangeText(text, start, end, "end");
    if (cursorStart !== undefined) body.setSelectionRange(start + cursorStart, start + cursorEnd);
    body.focus();
    markDirty();
    schedulePreview();
  }

  function wrap(before, after, placeholder) {
    replaceSelection((selected) => {
      const inner = selected || placeholder;
      return { text: before + inner + after, cursorStart: before.length, cursorEnd: before.length + inner.length };
    });
  }

  function prefixLines(prefix, placeholder) {
    replaceSelection((selected) => {
      const text = (selected || placeholder)
        .split("\n")
        .map((line) => prefix + line)
        .join("\n");
      return { text, cursorStart: 0, cursorEnd: text.length };
    });
  }

  function insertAtCursor(text) {
    const start = body.selectionStart;
    const needsBreak = start > 0 && body.value[start - 1] !== "\n";
    body.setRangeText((needsBreak ? "\n" : "") + text + "\n", start, body.selectionEnd, "end");
    body.focus();
    markDirty();
    schedulePreview();
  }

  const actions = {
    bold: () => wrap("**", "**", "bold text"),
    italic: () => wrap("_", "_", "italic text"),
    h2: () => prefixLines("## ", "Heading"),
    h3: () => prefixLines("### ", "Heading"),
    link: () => wrap("[", "](https://)", "link text"),
    code: () => wrap("`", "`", "code"),
    codeblock: () => wrap("\n```bash\n", "\n```\n", "kubectl get pods -A"),
    quote: () => prefixLines("> ", "Quote"),
    list: () => prefixLines("- ", "Item"),
    terminal: () => wrap("\n```terminal my session\n$ ", "\noutput line\n```\n", "kubectl get pods")
  };

  document.querySelectorAll("[data-md]").forEach((button) => {
    button.addEventListener("click", () => actions[button.dataset.md]());
  });

  // Image uploads (button, paste, drag & drop)
  async function uploadImage(file) {
    if (!file || !file.type.startsWith("image/")) return null;
    setStatus(`Uploading ${file.name || "image"}...`);
    const response = await fetch("/admin/api/blog/image", {
      method: "POST",
      headers: { "Content-Type": file.type, "X-Filename": file.name || "pasted-image" },
      body: file
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.ok) {
      setStatus((data.errors || ["Image upload failed."]).join(" "), "error");
      return null;
    }
    const warning = data.sizeKb > 800 ? ` (${data.sizeKb} KB, consider compressing)` : "";
    setStatus(`Uploaded ${data.url}${warning}`, warning ? "warn" : "ok");
    return data.url;
  }

  async function handleFiles(files) {
    for (const file of files) {
      const url = await uploadImage(file);
      if (!url) continue;
      if (uploadTarget === "cover") {
        coverInput.value = url;
        markDirty();
      } else {
        const alt = (file.name || "image").replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ");
        insertAtCursor(`![${alt}](${url})`);
      }
    }
    uploadTarget = "body";
  }

  document.querySelector("#imageBtn").addEventListener("click", () => {
    uploadTarget = "body";
    fileInput.click();
  });

  document.querySelector("#coverUploadBtn").addEventListener("click", () => {
    uploadTarget = "cover";
    fileInput.click();
  });

  fileInput.addEventListener("change", async () => {
    await handleFiles([...fileInput.files]);
    fileInput.value = "";
  });

  body.addEventListener("paste", (event) => {
    const files = [...(event.clipboardData?.files || [])].filter((file) => file.type.startsWith("image/"));
    if (!files.length) return;
    event.preventDefault();
    handleFiles(files);
  });

  body.addEventListener("dragover", (event) => {
    event.preventDefault();
    body.classList.add("dragging");
  });

  body.addEventListener("dragleave", () => body.classList.remove("dragging"));

  body.addEventListener("drop", (event) => {
    event.preventDefault();
    body.classList.remove("dragging");
    handleFiles([...(event.dataTransfer?.files || [])]);
  });

  // Saving
  async function save() {
    const values = Object.fromEntries(new FormData(form).entries());
    values.draft = form.elements.draft.checked;
    values.originalSlug = originalSlug;

    setStatus("Saving...");
    const { ok, data } = await postJson("/admin/api/blog/save", values);
    if (!ok) {
      setStatus((data.errors || ["Save failed."]).join(" "), "error");
      return;
    }

    dirty = false;
    const wasNew = !originalSlug;
    const renamed = originalSlug && originalSlug !== data.slug;
    originalSlug = data.slug;
    form.dataset.originalSlug = data.slug;
    setStatus(`Saved ${data.file}. Commit & push to publish.`, "ok");

    if (wasNew || renamed) {
      history.replaceState(null, "", `/admin/blog/edit/${data.slug}`);
    }
    if (wasNew && !deleteBtn) {
      // Reload so the Delete button and file name show up for the new post.
      window.location.href = `/admin/blog/edit/${data.slug}`;
    }
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    save();
  });

  // Deleting needs two clicks so no browser dialog is involved.
  if (deleteBtn) {
    let armed = false;
    deleteBtn.addEventListener("click", async () => {
      if (!armed) {
        armed = true;
        deleteBtn.textContent = "Click again to delete";
        setTimeout(() => {
          armed = false;
          deleteBtn.textContent = "Delete";
        }, 4000);
        return;
      }
      const { ok } = await postJson(`/admin/api/blog/${encodeURIComponent(originalSlug)}`, null, "DELETE");
      if (!ok) {
        setStatus("Delete failed.", "error");
        return;
      }
      dirty = false;
      window.location.href = "/admin/blog";
    });
  }

  // Keyboard shortcuts
  document.addEventListener("keydown", (event) => {
    if (!(event.ctrlKey || event.metaKey)) return;
    const key = event.key.toLowerCase();
    if (key === "s") {
      event.preventDefault();
      save();
    } else if (event.target === body && actions[{ b: "bold", i: "italic", k: "link" }[key]]) {
      event.preventDefault();
      actions[{ b: "bold", i: "italic", k: "link" }[key]]();
    }
  });

  // Tab inserts spaces instead of leaving the textarea (handy for code blocks).
  body.addEventListener("keydown", (event) => {
    if (event.key !== "Tab" || event.shiftKey) return;
    event.preventDefault();
    body.setRangeText("  ", body.selectionStart, body.selectionEnd, "end");
    markDirty();
  });

  titleInput.addEventListener("input", () => {
    if (!slugTouched) slugInput.value = slugify(titleInput.value);
  });

  slugInput.addEventListener("input", () => {
    slugTouched = true;
  });

  form.addEventListener("input", (event) => {
    markDirty();
    if (event.target === body) schedulePreview();
  });

  document.querySelector("#previewToggle").addEventListener("click", () => {
    form.classList.toggle("show-preview");
  });

  window.addEventListener("beforeunload", (event) => {
    if (!dirty) return;
    event.preventDefault();
    event.returnValue = "";
  });

  refreshPreview();
})();
