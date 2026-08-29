// main.js — page glue: frame sequences, nav, contact form stub
import { initNav } from "./nav.js";
import { initFrameSequence } from "./frameSequence.js";

initNav();

const WARRIOR_CONFIG = {
  basePath: "assets/warrior/",
  prefix: "",
  ext: ".png",
  pad: 2,
  startIndex: 2,
  endIndex: 30,
};

const PHILOSOPHER_CONFIG = {
  basePath: "assets/philosopher/",
  prefix: "",
  ext: ".png",
  pad: 2,
  startIndex: 2,
  endIndex: 30,
};

const heroContainer = document.querySelector("#hero-frames");
if (heroContainer) {
  initFrameSequence({
    ...WARRIOR_CONFIG,
    container: heroContainer,
    pinHeight: "300vh",
    sceneDescription: "Illustrated Spartan warrior, standing still, camera slowly pushing in.",
  });
}

const introContainer = document.querySelector("#intro-frames");
if (introContainer) {
  initFrameSequence({
    ...PHILOSOPHER_CONFIG,
    container: introContainer,
    pinHeight: "200vh",
    sceneDescription: "Illustrated Greek philosopher in quiet contemplation, camera slowly pushing in.",
  });
}

// Contact form stub — replace with a real backend (Formspree, serverless
// function, or a mailto: fallback) when one is ready.
const contactForm = document.querySelector("#contact-form");
if (contactForm) {
  const statusEl = contactForm.querySelector("[data-form-status]");
  const submitBtn = contactForm.querySelector("[data-form-submit]");

  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!contactForm.reportValidity()) return;

    if (submitBtn) submitBtn.disabled = true;
    if (statusEl) {
      statusEl.textContent = "Sending…";
      statusEl.dataset.state = "sending";
    }

    // TODO: wire a real backend here (Formspree endpoint, serverless
    // function, or mailto: fallback). This timeout only simulates a request.
    setTimeout(() => {
      if (statusEl) {
        statusEl.textContent = "Thanks — we'll get back to you within one business day.";
        statusEl.dataset.state = "success";
      }
      contactForm.reset();
      if (submitBtn) submitBtn.disabled = false;
    }, 900);
  });
}
