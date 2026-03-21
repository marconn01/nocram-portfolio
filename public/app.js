const contactForm = document.querySelector("#contactForm");
const statusBox = document.querySelector("#formStatus");

function initBackgroundTetris() {
  const canvas = document.querySelector("#bgTetris");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const palette = ["#7bffb4", "#67d8ff", "#c08bff", "#9aff6f", "#7ff5ff", "#ffd96f"];

  const shapes = [
    [[1, 1, 1, 1]],
    [[1, 1], [1, 1]],
    [[0, 1, 0], [1, 1, 1]],
    [[1, 1, 0], [0, 1, 1]],
    [[0, 1, 1], [1, 1, 0]],
    [[1, 0, 0], [1, 1, 1]],
    [[0, 0, 1], [1, 1, 1]]
  ];

  let cols = 0;
  let rows = 0;
  let cell = 20;
  let drops = [];
  let lastTick = 0;

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    cell = Math.max(16, Math.min(28, Math.floor(window.innerWidth / 64)));
    cols = Math.ceil(window.innerWidth / cell);
    rows = Math.ceil(window.innerHeight / cell);
  }

  function createDrop() {
    const shape = shapes[Math.floor(Math.random() * shapes.length)];
    return {
      shape,
      color: palette[Math.floor(Math.random() * palette.length)],
      x: Math.floor(Math.random() * Math.max(1, cols - shape[0].length)),
      y: -Math.floor(Math.random() * 8) - 2,
      speed: Math.random() * 0.18 + 0.06,
      drift: Math.random() * 0.08 - 0.04
    };
  }

  function drawDrop(drop) {
    for (let r = 0; r < drop.shape.length; r += 1) {
      for (let c = 0; c < drop.shape[r].length; c += 1) {
        if (!drop.shape[r][c]) continue;
        const px = (drop.x + c) * cell;
        const py = (drop.y + r) * cell;
        ctx.fillStyle = drop.color;
        ctx.fillRect(px, py, cell - 2, cell - 2);
      }
    }
  }

  function loop(ts) {
    const delta = ts - lastTick;
    lastTick = ts;

    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    if (drops.length < 14 && Math.random() < 0.08) {
      drops.push(createDrop());
    }

    drops = drops.filter((drop) => drop.y < rows + 4);
    drops.forEach((drop) => {
      drop.y += (delta / 16.6) * drop.speed;
      drop.x += drop.drift;
      drawDrop(drop);
    });

    requestAnimationFrame(loop);
  }

  resize();
  window.addEventListener("resize", resize);
  requestAnimationFrame(loop);
}

initBackgroundTetris();

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
