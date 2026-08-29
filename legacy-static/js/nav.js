// nav.js — mobile nav overlay + header scroll behavior
export function initNav() {
  const menuBtn = document.querySelector("[data-menu-open]");
  const closeBtn = document.querySelector("[data-menu-close]");
  const overlay = document.querySelector("[data-nav-overlay]");
  const header = document.querySelector(".site-header");

  if (menuBtn && overlay) {
    menuBtn.addEventListener("click", () => {
      overlay.classList.add("is-open");
      document.body.classList.add("nav-open");
      menuBtn.setAttribute("aria-expanded", "true");
    });
  }

  function closeOverlay() {
    overlay.classList.remove("is-open");
    document.body.classList.remove("nav-open");
    if (menuBtn) menuBtn.setAttribute("aria-expanded", "false");
  }

  if (closeBtn && overlay) {
    closeBtn.addEventListener("click", closeOverlay);
  }

  if (overlay) {
    overlay.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeOverlay));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && overlay.classList.contains("is-open")) closeOverlay();
    });
  }

  // Slight elevation/border change once scrolled
  if (header) {
    const onScroll = () => {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }
}
