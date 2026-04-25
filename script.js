const floatingHearts = document.querySelector(".floating-hearts");
const year = document.querySelector("#year");
const letterScroll = document.querySelector(".letter-scroll");
const eyeWhispers = Array.from(document.querySelectorAll(".eye-whisper"));
const trailText = ["G", "\u2665", "A", "\u2665", "E", "\u2665", "L"];
const finePointer = window.matchMedia("(pointer: fine)");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const pointerTarget = {
  x: window.innerWidth / 2,
  y: window.innerHeight / 2,
};

let cursorTrail = null;
let trailLetters = [];
let trailHistory = [];
let trailHead = { ...pointerTarget };
let trailFrame = 0;
let trailRunning = false;
let trailIdleFrames = 0;
let pointerActive = false;
let eyeFrame = 0;
let heartIntervalId = 0;
let heartBurstTimeouts = [];
let effectsInitialized = false;

const trailSampleStep = 8;
const trailHistorySize = trailText.length * trailSampleStep + 18;

if (year) {
  year.textContent = new Date().getFullYear();
}

function createHeart() {
  if (!floatingHearts) return;

  const heart = document.createElement("span");
  heart.className = "floating-heart";

  const size = 10 + Math.random() * 20;
  const duration = 7.5 + Math.random() * 4.5;
  const left = Math.random() * 100;
  const drift = `${-56 + Math.random() * 112}px`;
  const opacity = (0.2 + Math.random() * 0.38).toFixed(2);

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

function clearHeartBurst() {
  heartBurstTimeouts.forEach((timeoutId) => {
    window.clearTimeout(timeoutId);
  });

  heartBurstTimeouts = [];
}

function queueHeartBurst() {
  clearHeartBurst();

  for (let index = 0; index < 10; index += 1) {
    const timeoutId = window.setTimeout(createHeart, index * 360);
    heartBurstTimeouts.push(timeoutId);
  }
}

function startFloatingHearts() {
  if (reducedMotion.matches || !floatingHearts || document.hidden || heartIntervalId) {
    return;
  }

  queueHeartBurst();
  heartIntervalId = window.setInterval(createHeart, 680);
}

function stopFloatingHearts() {
  if (heartIntervalId) {
    window.clearInterval(heartIntervalId);
    heartIntervalId = 0;
  }

  clearHeartBurst();
}

function initCursorTrail() {
  if (reducedMotion.matches || !finePointer.matches || cursorTrail) return;

  cursorTrail = document.createElement("div");
  cursorTrail.className = "cursor-name-trail";

  trailLetters = trailText.map((character, index) => {
    const node = document.createElement("span");
    node.className = "cursor-name-letter";
    node.textContent = character;

    if (character === "\u2665") {
      node.classList.add("cursor-name-heart");
    }

    node.style.opacity = String(Math.max(0.2, 0.94 - index * 0.09));
    cursorTrail.appendChild(node);
    return node;
  });

  trailHistory = Array.from({ length: trailHistorySize }, () => ({ ...pointerTarget }));
  trailHead = { ...pointerTarget };

  document.body.appendChild(cursorTrail);

  window.addEventListener("pointermove", handlePointerMove, { passive: true });
  window.addEventListener("mouseleave", deactivateTrail);
  window.addEventListener("blur", deactivateTrail);
}

function startCursorTrailAnimation() {
  if (trailRunning || !trailLetters.length || document.hidden) return;

  trailRunning = true;
  trailFrame = window.requestAnimationFrame(animateCursorTrail);
}

function handlePointerMove(event) {
  if (event.pointerType && event.pointerType !== "mouse") return;

  pointerTarget.x = event.clientX + 10;
  pointerTarget.y = event.clientY - 8;
  pointerActive = true;
  trailIdleFrames = 22;

  if (cursorTrail) {
    cursorTrail.classList.add("is-active");
  }

  startCursorTrailAnimation();
}

function deactivateTrail() {
  pointerActive = false;
  trailIdleFrames = Math.max(trailIdleFrames, 14);

  if (cursorTrail) {
    cursorTrail.classList.remove("is-active");
  }

  startCursorTrailAnimation();
}

function animateCursorTrail() {
  if (document.hidden || !trailLetters.length) {
    trailRunning = false;
    trailFrame = 0;
    return;
  }

  trailHead.x += (pointerTarget.x - trailHead.x) * 0.24;
  trailHead.y += (pointerTarget.y - trailHead.y) * 0.24;

  trailHistory.unshift({ x: trailHead.x, y: trailHead.y });
  trailHistory.length = Math.min(trailHistory.length, trailHistorySize);

  trailLetters.forEach((node, index) => {
    const historyIndex = Math.min(index * trailSampleStep, trailHistory.length - 1);
    const point = trailHistory[historyIndex] || trailHead;
    const scale = 1 - index * 0.048;
    const waveX = Math.cos(performance.now() / 260 + index * 0.42) * 0.9;
    const waveY = Math.sin(performance.now() / 220 + index * 0.48) * 1.45;

    node.style.transform =
      `translate3d(${(point.x + waveX).toFixed(2)}px, ${(point.y + waveY).toFixed(2)}px, 0) translate(-50%, -50%) scale(${scale.toFixed(3)})`;
  });

  if (pointerActive) {
    trailIdleFrames = 22;
  } else {
    trailIdleFrames = Math.max(0, trailIdleFrames - 1);
  }

  if (pointerActive || trailIdleFrames > 0) {
    trailFrame = window.requestAnimationFrame(animateCursorTrail);
    return;
  }

  trailRunning = false;
  trailFrame = 0;
}

function createTouchWave(x, y) {
  if (reducedMotion.matches) return;

  const wave = document.createElement("div");
  wave.className = "touch-gael-wave";
  wave.style.left = `${x}px`;
  wave.style.top = `${y}px`;
  wave.style.setProperty(
    "--wave-size",
    `${Math.min(220, Math.max(132, window.innerWidth * 0.28))}px`
  );

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
    const opacity = reducedMotion.matches ? 0.75 : 0.24 + visibility * 0.51;
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

function handleVisibilityChange() {
  if (document.hidden) {
    stopFloatingHearts();

    if (trailFrame) {
      window.cancelAnimationFrame(trailFrame);
      trailFrame = 0;
    }

    trailRunning = false;
    return;
  }

  startFloatingHearts();
  requestEyeUpdate();

  if (pointerActive) {
    startCursorTrailAnimation();
  }
}

function initEffects() {
  if (effectsInitialized) return;

  effectsInitialized = true;

  startFloatingHearts();
  initCursorTrail();
  window.addEventListener("pointerdown", handlePointerDown, { passive: true });
  document.addEventListener("visibilitychange", handleVisibilityChange);

  if (letterScroll && eyeWhispers.length) {
    updateEyeWhispers();

    if (!reducedMotion.matches) {
      letterScroll.addEventListener("scroll", requestEyeUpdate, { passive: true });
      window.addEventListener("resize", requestEyeUpdate);
    }
  }
}

if (document.readyState === "complete") {
  initEffects();
} else {
  window.addEventListener("load", initEffects, { once: true });
}
