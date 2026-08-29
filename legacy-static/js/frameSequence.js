// frameSequence.js — reusable scroll-scrub frame sequence engine
//
// Usage:
//   initFrameSequence({
//     container: document.querySelector('#hero-frames'),
//     basePath: '/assets/warrior/',
//     prefix: '',
//     ext: '.png',
//     pad: 2,            // zero-pad width, e.g. 2 -> "02"
//     startIndex: 2,
//     endIndex: 30,
//     pinHeight: '300vh',
//   });
//
// If your actual frame filenames differ, only the config object passed in
// by the caller needs to change — nothing below this file.

function frameUrl({ basePath, prefix, ext, pad }, index) {
  const num = String(index).padStart(pad, "0");
  return `${basePath}${prefix}${num}${ext}`;
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function initFrameSequence(config) {
  const {
    container,
    basePath,
    prefix = "",
    ext = ".jpg",
    pad = 2,
    startIndex,
    endIndex,
    pinHeight = "300vh",
    sceneDescription = "",
  } = config;

  if (!container) return;

  const frameCount = endIndex - startIndex + 1;
  const urls = [];
  for (let i = startIndex; i <= endIndex; i++) urls.push(frameUrl({ basePath, prefix, ext, pad }, i));

  // Build markup
  const wrapper = document.createElement("div");
  wrapper.className = "frame-wrapper";
  wrapper.style.height = pinHeight;

  const sticky = document.createElement("div");
  sticky.className = "frame-sticky";

  const loader = document.createElement("div");
  loader.className = "frame-loader";
  loader.innerHTML = '<div class="frame-loader__bar"></div>';
  const loaderBar = loader.querySelector(".frame-loader__bar");

  const srDesc = document.createElement("span");
  srDesc.className = "visually-hidden";
  srDesc.textContent = sceneDescription;

  sticky.appendChild(loader);
  sticky.appendChild(srDesc);

  wrapper.appendChild(sticky);

  // Move any existing overlay content (e.g. .frame-overlay) that was
  // authored inside the container into the sticky panel, on top of the frame.
  const overlayNodes = Array.from(container.children);
  overlayNodes.forEach((node) => sticky.appendChild(node));

  container.appendChild(wrapper);

  const reduced = prefersReducedMotion();

  if (reduced) {
    const img = document.createElement("img");
    img.className = "frame-static";
    img.src = urls[urls.length - 1];
    img.alt = "";
    img.setAttribute("aria-hidden", "true");
    sticky.insertBefore(img, sticky.firstChild);
    loader.remove();
    wrapper.style.height = "100vh";
    revealOverlay(sticky);
    return;
  }

  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  sticky.insertBefore(canvas, sticky.firstChild);
  const ctx = canvas.getContext("2d");

  const images = new Array(frameCount);
  let loadedCount = 0;
  let currentFrame = -1;

  function sizeCanvas() {
    const rect = sticky.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
  }

  function drawFrame(index) {
    const img = images[index];
    if (!img || !img.complete || img.naturalWidth === 0) return;
    const cw = canvas.width;
    const ch = canvas.height;
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    const scale = Math.max(cw / iw, ch / ih);
    const dw = iw * scale;
    const dh = ih * scale;
    const dx = (cw - dw) / 2;
    const dy = (ch - dh) / 2;
    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, dx, dy, dw, dh);
  }

  function frameForProgress(progress) {
    const idx = Math.round(progress * (frameCount - 1));
    return Math.min(frameCount - 1, Math.max(0, idx));
  }

  function currentProgress() {
    const wrapRect = wrapper.getBoundingClientRect();
    const wrapTop = wrapRect.top + window.scrollY;
    const wrapHeight = wrapper.offsetHeight;
    const viewportHeight = window.innerHeight;
    const scrollable = wrapHeight - viewportHeight;
    if (scrollable <= 0) return 0;
    const progress = (window.scrollY - wrapTop) / scrollable;
    return Math.min(1, Math.max(0, progress));
  }

  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const progress = currentProgress();
      const idx = frameForProgress(progress);
      if (idx !== currentFrame) {
        currentFrame = idx;
        drawFrame(idx);
      }
      ticking = false;
    });
  }

  const resizeObserver = new ResizeObserver(() => {
    sizeCanvas();
    if (currentFrame >= 0) drawFrame(currentFrame);
  });
  resizeObserver.observe(sticky);

  sizeCanvas();

  // Preload: draw frame 0 the instant it's ready, load the rest in background
  images[0] = new Image();
  images[0].onload = () => {
    loadedCount++;
    updateLoader();
    currentFrame = 0;
    drawFrame(0);
    revealOverlay(sticky);
  };
  images[0].src = urls[0];

  for (let i = 1; i < frameCount; i++) {
    const img = new Image();
    img.onload = () => {
      loadedCount++;
      updateLoader();
    };
    img.src = urls[i];
    images[i] = img;
  }

  function updateLoader() {
    const pct = Math.round((loadedCount / frameCount) * 100);
    if (loaderBar) loaderBar.style.width = `${pct}%`;
    if (loadedCount >= frameCount) {
      loader.classList.add("is-done");
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", () => {
    sizeCanvas();
    if (currentFrame >= 0) drawFrame(currentFrame);
  });

  // Initial paint in case the page loads mid-scroll (e.g. reload with scroll restoration)
  onScroll();
}

function revealOverlay(sticky) {
  const overlay = sticky.querySelector(".frame-overlay");
  if (overlay) requestAnimationFrame(() => overlay.classList.add("is-visible"));
}
