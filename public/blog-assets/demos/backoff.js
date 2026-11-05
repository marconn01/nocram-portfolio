// Example interactive widget: exponential backoff with optional jitter.
// Use in a post with <div class="widget" data-backoff></div> and
// `scripts: ["/blog-assets/demos/backoff.js"]` in the front matter.
document.querySelectorAll("[data-backoff]").forEach((root) => {
  root.innerHTML = `
    <div class="bo-controls">
      <label>base <input type="range" min="50" max="1000" step="50" value="200" data-k="base"><output></output></label>
      <label>retries <input type="range" min="1" max="8" value="5" data-k="retries"><output></output></label>
      <label>cap <input type="range" min="1000" max="20000" step="1000" value="8000" data-k="cap"><output></output></label>
      <label class="bo-check"><input type="checkbox" data-k="jitter" checked> full jitter</label>
      <button type="button" class="widget-btn" data-k="reroll">re-roll</button>
    </div>
    <svg class="bo-chart" viewBox="0 0 600 160" role="img" aria-label="Retry delays per attempt"></svg>
    <p class="widget-caption"></p>`;

  const input = (key) => root.querySelector(`[data-k="${key}"]`);
  const svg = root.querySelector("svg");
  const caption = root.querySelector(".widget-caption");

  function render() {
    const base = Number(input("base").value);
    const retries = Number(input("retries").value);
    const cap = Number(input("cap").value);
    const jitter = input("jitter").checked;

    root.querySelectorAll("input[type=range]").forEach((range) => {
      range.nextElementSibling.textContent = range.dataset.k === "retries" ? range.value : `${range.value}ms`;
    });

    const delays = Array.from({ length: retries }, (_, attempt) => {
      const ceiling = Math.min(cap, base * 2 ** attempt);
      return { ceiling, actual: jitter ? Math.round(Math.random() * ceiling) : ceiling };
    });

    const max = Math.max(...delays.map((d) => d.ceiling));
    const barWidth = 560 / retries;
    svg.innerHTML = delays
      .map((d, i) => {
        const x = 20 + i * barWidth;
        const hCeil = (d.ceiling / max) * 120;
        const hAct = (d.actual / max) * 120;
        return `
          <rect x="${x + 6}" y="${140 - hCeil}" width="${barWidth - 12}" height="${hCeil}" class="bo-ceil"/>
          <rect x="${x + 6}" y="${140 - hAct}" width="${barWidth - 12}" height="${hAct}" class="bo-act"/>
          <text x="${x + barWidth / 2}" y="156" text-anchor="middle">#${i + 1}</text>`;
      })
      .join("") + `<line x1="20" y1="140" x2="580" y2="140" class="bo-axis"/>`;

    const total = delays.reduce((sum, d) => sum + d.actual, 0);
    caption.textContent = `Worst-case wait before giving up: ${(total / 1000).toFixed(2)}s across ${retries} retries.` +
      (jitter ? " Jitter spreads clients out so they don't retry in lockstep." : " Without jitter every client retries at the same moment.");
  }

  root.addEventListener("input", render);
  input("reroll").addEventListener("click", render);
  render();
});
