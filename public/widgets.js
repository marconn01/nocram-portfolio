// Enhancements for blog posts. Everything here is progressive: without JS the
// post still reads fine, these just add interaction on top.

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Copy buttons on code blocks and terminals
function initCopyButtons() {
  document.querySelectorAll('[data-widget="code"], [data-widget="terminal"]').forEach((block) => {
    const bar = block.querySelector("figcaption");
    const pre = block.querySelector("pre");
    if (!bar || !pre) return;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "widget-btn";
    button.textContent = "copy";
    button.addEventListener("click", async () => {
      // For terminals, copy only the commands (without the "$ " prompt).
      const text =
        block.dataset.widget === "terminal"
          ? [...pre.querySelectorAll(".term-cmd")].map((line) => line.textContent.replace(/^\$\s?/, "")).join("\n")
          : pre.innerText;
      try {
        await navigator.clipboard.writeText(text);
        button.textContent = "copied";
      } catch (error) {
        button.textContent = "failed";
      }
      setTimeout(() => {
        button.textContent = "copy";
      }, 1500);
    });
    bar.appendChild(button);
  });
}

// ```terminal blocks: replay the session, typing each command and revealing output
function initTerminals() {
  document.querySelectorAll('[data-widget="terminal"]').forEach((term) => {
    const lines = [...term.querySelectorAll(".term-line")];
    const bar = term.querySelector("figcaption");
    if (!lines.length || !bar || prefersReducedMotion) return;

    const commands = new Map(lines.map((line) => [line, line.innerHTML]));
    let running = 0;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "widget-btn";
    button.textContent = "▶ replay";
    bar.appendChild(button);

    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    async function play() {
      const run = ++running;
      term.classList.add("is-playing");
      lines.forEach((line) => (line.hidden = true));

      for (const line of lines) {
        if (run !== running) return;
        line.hidden = false;
        if (line.classList.contains("term-cmd")) {
          const text = line.textContent.replace(/^\$\s?/, "");
          line.innerHTML = '<span class="term-prompt">$</span> <span class="term-typing"></span>';
          const target = line.querySelector(".term-typing");
          for (const char of text) {
            if (run !== running) return;
            target.textContent += char;
            await sleep(18 + Math.random() * 30);
          }
          await sleep(280);
          line.innerHTML = commands.get(line);
        } else {
          await sleep(45);
        }
      }
      term.classList.remove("is-playing");
    }

    button.addEventListener("click", play);

    // Play once the first time the terminal scrolls into view.
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect();
          play();
        }
      },
      { threshold: 0.6 }
    );
    observer.observe(term);
  });
}

// Thin progress line at the top of the page
function initReadingProgress() {
  const bar = document.querySelector("#readProgress");
  const article = document.querySelector("#articleBody");
  if (!bar || !article) return;

  function update() {
    const rect = article.getBoundingClientRect();
    const total = rect.height - window.innerHeight;
    const progress = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 1;
    bar.style.transform = `scaleX(${progress})`;
  }

  document.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  update();
}

// Highlight the heading currently being read in the table of contents
function initTocHighlight() {
  const links = [...document.querySelectorAll(".toc a")];
  if (!links.length) return;

  const headings = links.map((link) => document.getElementById(decodeURIComponent(link.hash.slice(1)))).filter(Boolean);

  function update() {
    let active = headings[0];
    headings.forEach((heading) => {
      if (heading.getBoundingClientRect().top < 120) active = heading;
    });
    links.forEach((link) => link.classList.toggle("is-active", link.hash === `#${active.id}`));
  }

  document.addEventListener("scroll", update, { passive: true });
  update();
}

initCopyButtons();
initTerminals();
initReadingProgress();
initTocHighlight();
