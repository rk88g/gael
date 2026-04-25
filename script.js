const floatingHearts = document.querySelector(".floating-hearts");
const year = document.querySelector("#year");
const letterScroll = document.querySelector(".letter-scroll");
const eyeWhispers = Array.from(document.querySelectorAll(".eye-whisper"));
const trailText = ["G", "A", "E", "L", "G", "A", "E", "L", "G", "A", "E", "L"];
const finePointer = window.matchMedia("(pointer: fine)");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let cursorTrail = null;
let trailLetters = [];
let trailState = [];
let pointerTarget = {
  x: window.innerWidth / 2,
  y: window.innerHeight / 2,
  active: false,
};
let trailFrame = 0;
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

function initCursorTrail() {
  if (reducedMotion.matches || !finePointer.matches) return;

  cursorTrail = document.createElement("div");
  cursorTrail.className = "cursor-name-trail";

  trailLetters = trailText.map((letter, index) => {
    const node = document.createElement("span");
    node.className = "cursor-name-letter";
    node.textContent = letter;
    node.style.opacity = String(Math.max(0.16, 0.9 - index * 0.06));
    cursorTrail.appendChild(node);
    return node;
  });

  trailState = trailLetters.map(() => ({
    x: pointerTarget.x,
    y: pointerTarget.y,
  }));

  document.body.appendChild(cursorTrail);

  window.addEventListener("pointermove", handlePointerMove, { passive: true });
  window.addEventListener("pointerleave", deactivateTrail);
  window.addEventListener("blur", deactivateTrail);

  animateCursorTrail();
}

function handlePointerMove(event) {
  if (event.pointerType && event.pointerType !== "mouse") return;

  pointerTarget.x = event.clientX + 18;
  pointerTarget.y = event.clientY - 10;
  pointerTarget.active = true;

  if (cursorTrail) {
    cursorTrail.classList.add("is-active");
  }
}

function deactivateTrail() {
  pointerTarget.active = false;

  if (cursorTrail) {
    cursorTrail.classList.remove("is-active");
  }
}

function animateCursorTrail() {
  trailFrame = window.requestAnimationFrame(animateCursorTrail);

  if (!trailLetters.length) return;

  trailState.forEach((point, index) => {
    const source = index === 0 ? pointerTarget : trailState[index - 1];
    const ease = index === 0 ? 0.22 : 0.28;

    point.x += (source.x - point.x) * ease;
    point.y += (source.y - point.y) * ease;

    const scale = 1 - index * 0.035;
    const lift = Math.sin((performance.now() / 220) + index * 0.45) * 1.6;

    trailLetters[index].style.transform =
      `translate3d(${point.x.toFixed(2)}px, ${(point.y + lift).toFixed(2)}px, 0) translate(-50%, -50%) scale(${scale.toFixed(3)})`;
  });
}

function createTouchWave(x, y) {
  if (reducedMotion.matches) return;

  const wave = document.createElement("div");
  wave.className = "touch-gael-wave";
  wave.style.left = `${x}px`;
  wave.style.top = `${y}px`;
  wave.style.setProperty("--wave-size", `${Math.min(220, Math.max(130, window.innerWidth * 0.28))}px`);

  const ringPrimary = document.createElement("span");
  ringPrimary.className = "touch-gael-ring";

  const ringSecondary = document.createElement("span");
  ringSecondary.className = "touch-gael-ring touch-gael-ring-secondary";

  const text = document.createElement("span");
  text.className = "touch-gael-text";
  text.textContent = "G A E L";

  wave.append(ringPrimary, ringSecondary, text);
  document.body.appendChild(wave);

  window.setTimeout(() => {
    wave.remove();
  }, 1300);
}

function handlePointerDown(event) {
  if (event.pointerType === "mouse") return;

  createTouchWave(event.clientX, event.clientY);
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
  window.addEventListener("pointerdown", handlePointerDown, { passive: true });
}

initCursorTrail();

if (letterScroll && eyeWhispers.length) {
  updateEyeWhispers();

  if (!reducedMotion.matches) {
    letterScroll.addEventListener("scroll", requestEyeUpdate, { passive: true });
    window.addEventListener("resize", requestEyeUpdate);
  }
}
