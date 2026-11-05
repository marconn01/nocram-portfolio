const contactForm = document.querySelector("#contactForm");
const statusBox = document.querySelector("#formStatus");

function initThemeToggle() {
  const button = document.querySelector("#themeToggle");
  if (!button) return;

  const root = document.documentElement;
  const systemDark = window.matchMedia("(prefers-color-scheme: dark)");

  // With no saved choice the theme follows the OS; once clicked, the choice sticks.
  function current() {
    return root.dataset.theme || (systemDark.matches ? "dark" : "light");
  }

  function sync() {
    const mode = current();
    button.dataset.mode = mode;
    button.setAttribute("aria-label", mode === "dark" ? "Switch to light mode" : "Switch to dark mode");
    button.title = button.getAttribute("aria-label");
  }

  button.addEventListener("click", () => {
    const next = current() === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch (error) {
      // Storage blocked: the choice lasts for this page view only.
    }
    sync();
  });

  systemDark.addEventListener("change", sync);
  sync();
}

function initProjectFilter() {
  const list = document.querySelector("#projectList");
  const chips = [...document.querySelectorAll("[data-filter]")];
  if (!list || !chips.length) return;

  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const type = chip.dataset.filter;
      chips.forEach((item) => item.classList.toggle("is-active", item === chip));
      list.querySelectorAll("[data-type]").forEach((row) => {
        row.hidden = Boolean(type) && row.dataset.type !== type;
      });
    });
  });
}

initThemeToggle();
initProjectFilter();

if (contactForm && statusBox) {
  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const payload = Object.fromEntries(new FormData(contactForm).entries());
    statusBox.textContent = "Sending...";

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        const errors = Array.isArray(data.errors) ? data.errors.join(" ") : "Validation failed.";
        statusBox.textContent = errors;
        alert(errors);
        return;
      }

      statusBox.textContent = "Message sent successfully.";
      alert(data.alert || "Your message has been submitted.");
      contactForm.reset();
    } catch (error) {
      statusBox.textContent = "Network error. Please try again.";
      alert("Network error. Please try again.");
    }
  });
}

function initBlogSearch() {
  const input = document.querySelector("#blogSearch");
  const list = document.querySelector("#blogList");
  if (!input || !list) return;

  const rows = [...list.querySelectorAll("[data-search]")];
  const groups = [...list.querySelectorAll("[data-year-group]")];
  const tagChips = [...document.querySelectorAll("[data-tag]")];
  const empty = document.querySelector("#blogEmpty");
  const statusLine = document.querySelector("#blogSearchStatus");

  function applyFilter() {
    const terms = input.value.toLowerCase().trim().split(/\s+/).filter(Boolean);
    let visible = 0;

    rows.forEach((row) => {
      const text = `${row.dataset.search || ""} ${row.dataset.tags || ""}`;
      const match = terms.every((term) => text.includes(term.replace(/^#/, "")));
      row.hidden = !match;
      if (match) visible += 1;
    });

    groups.forEach((group) => {
      group.hidden = !group.querySelector("[data-search]:not([hidden])");
    });

    tagChips.forEach((chip) => {
      chip.classList.toggle("is-active", terms.includes(chip.dataset.tag) || terms.includes(`#${chip.dataset.tag}`));
    });

    if (empty && rows.length) empty.hidden = visible > 0;
    if (statusLine) statusLine.textContent = terms.length ? `${visible}/${rows.length}` : "";

    const url = new URL(window.location.href);
    if (input.value.trim()) url.searchParams.set("q", input.value.trim());
    else url.searchParams.delete("q");
    window.history.replaceState(null, "", url);
  }

  tagChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      input.value = chip.classList.contains("is-active") ? "" : chip.dataset.tag;
      applyFilter();
    });
  });

  const initial = new URLSearchParams(window.location.search).get("q");
  if (initial) input.value = initial;

  input.addEventListener("input", applyFilter);
  input.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      input.value = "";
      applyFilter();
      input.blur();
    }
  });

  // Press "/" anywhere to jump to search.
  document.addEventListener("keydown", (event) => {
    const target = event.target instanceof Element ? event.target : null;
    if (event.key !== "/" || target?.closest("input, textarea, select, [contenteditable]")) return;
    event.preventDefault();
    input.focus();
  });

  if (initial) applyFilter();
}

initBlogSearch();

const printCv = document.querySelector("#printCv");
if (printCv) printCv.addEventListener("click", () => window.print());

const copyFeed = document.querySelector("#copyFeed");
if (copyFeed) {
  copyFeed.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(copyFeed.dataset.url);
      copyFeed.textContent = "Copied";
    } catch (error) {
      copyFeed.textContent = "Select & copy";
    }
    setTimeout(() => {
      copyFeed.textContent = "Copy";
    }, 1600);
  });
}
