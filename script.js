const floatingHearts = document.querySelector(".floating-hearts");
const year = document.querySelector("#year");
const letterScroll = document.querySelector(".letter-scroll");
const eyeWhispers = Array.from(document.querySelectorAll(".eye-whisper"));
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let eyeFrame = 0;

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

function updateEyeWhispers() {
  eyeFrame = 0;

  if (!letterScroll || !eyeWhispers.length) return;

  const viewportCenter = letterScroll.scrollTop + letterScroll.clientHeight / 2;
  const viewportSize = letterScroll.clientHeight;

  eyeWhispers.forEach((eye) => {
    const eyeCenter = eye.offsetTop + eye.offsetHeight / 2;
    const distance = Math.abs(viewportCenter - eyeCenter);
    const visibility = Math.max(0, 1 - distance / (viewportSize * 0.9));
    const direction = eye.classList.contains("eye-whisper-right")
      ? -1
      : eye.classList.contains("eye-whisper-center")
        ? 0
        : 1;
    const opacity = reducedMotion.matches
      ? 0.75
      : 0.24 + visibility * 0.51;
    const shiftY = reducedMotion.matches ? 0 : (0.5 - visibility) * 28;
    const shiftX = reducedMotion.matches ? 0 : (1 - visibility) * 12 * direction;
    const scale = reducedMotion.matches ? 1 : 0.98 + visibility * 0.08;

    eye.style.setProperty("--eye-opacity", opacity.toFixed(2));
    eye.style.setProperty("--eye-shift-x", `${shiftX.toFixed(2)}px`);
    eye.style.setProperty("--eye-shift-y", `${shiftY.toFixed(2)}px`);
    eye.style.setProperty("--eye-scale", scale.toFixed(3));
  });
}

function requestEyeUpdate() {
  if (eyeFrame) return;

  eyeFrame = window.requestAnimationFrame(updateEyeWhispers);
}

if (!reducedMotion.matches) {
  for (let index = 0; index < 16; index += 1) {
    window.setTimeout(createHeart, index * 280);
  }

  window.setInterval(createHeart, 520);
}

if (letterScroll && eyeWhispers.length) {
  updateEyeWhispers();

  if (!reducedMotion.matches) {
    letterScroll.addEventListener("scroll", requestEyeUpdate, { passive: true });
    window.addEventListener("resize", requestEyeUpdate);
  }
}
