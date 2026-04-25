const floatingHearts = document.querySelector(".floating-hearts");
const year = document.querySelector("#year");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

if (year) {
  year.textContent = new Date().getFullYear();
}

function createHeart() {
  if (!floatingHearts) return;

  const heart = document.createElement("span");
  heart.className = "floating-heart";

  const size = 10 + Math.random() * 22;
  const duration = 7 + Math.random() * 6;
  const left = Math.random() * 100;
  const drift = `${-60 + Math.random() * 120}px`;
  const opacity = (0.2 + Math.random() * 0.45).toFixed(2);

  heart.style.setProperty("--size", `${size}px`);
  heart.style.setProperty("--duration", `${duration}s`);
  heart.style.setProperty("--left", `${left}%`);
  heart.style.setProperty("--drift", drift);
  heart.style.setProperty("--opacity", opacity);

  floatingHearts.appendChild(heart);

  window.setTimeout(() => {
    heart.remove();
  }, duration * 1000);
}

if (!reducedMotion.matches) {
  for (let index = 0; index < 16; index += 1) {
    window.setTimeout(createHeart, index * 280);
  }

  window.setInterval(createHeart, 520);
}
