document.documentElement.classList.add("js");

const HERO_INTERVAL_MS = 3200;

function clampIndex(index, length) {
  if (length <= 0) return 0;
  return ((index % length) + length) % length;
}

function svgDataUri(svg) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function fallbackHeroImages() {
  const make = (accentX, accentY) => `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#ffffff"/>
      <stop offset="0.55" stop-color="#fff5fa"/>
      <stop offset="1" stop-color="#ffe7f1"/>
    </linearGradient>
    <radialGradient id="glow" cx="${accentX}%" cy="${accentY}%" r="70%">
      <stop offset="0" stop-color="#d85a82" stop-opacity="0.18"/>
      <stop offset="0.55" stop-color="#d85a82" stop-opacity="0.07"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1600" height="900" fill="url(#bg)"/>
  <rect width="1600" height="900" fill="url(#glow)"/>
  <g opacity="0.5">
    <circle cx="1230" cy="170" r="190" fill="#d85a82" opacity="0.07"/>
    <circle cx="360" cy="740" r="260" fill="#000000" opacity="0.03"/>
  </g>
  <g fill="none" stroke="#d85a82" stroke-opacity="0.16">
    <path d="M180 520 C 380 380, 560 380, 760 520" stroke-width="2"/>
    <path d="M860 440 C 1060 300, 1240 300, 1440 440" stroke-width="2"/>
  </g>
</svg>`;

  return [
    svgDataUri(make(30, 25)),
    svgDataUri(make(75, 30)),
    svgDataUri(make(40, 75)),
  ];
}

const FALLBACK_IMAGE_SRC = svgDataUri(`<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#ffffff"/>
      <stop offset="0.55" stop-color="#fff5fa"/>
      <stop offset="1" stop-color="#ffe7f1"/>
    </linearGradient>
    <radialGradient id="glow" cx="35%" cy="25%" r="70%">
      <stop offset="0" stop-color="#d85a82" stop-opacity="0.18"/>
      <stop offset="0.6" stop-color="#d85a82" stop-opacity="0.06"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="800" fill="url(#bg)"/>
  <rect width="1200" height="800" fill="url(#glow)"/>
  <g fill="none" stroke="#d85a82" stroke-opacity="0.18">
    <path d="M120 520 C 330 360, 520 360, 740 520" stroke-width="2"/>
    <path d="M820 460 C 940 360, 1040 360, 1140 460" stroke-width="2"/>
  </g>
  <g font-family="Georgia, serif" fill="#d85a82" opacity="0.9">
    <text x="86" y="120" font-size="44" font-weight="700">Veda's Studio</text>
    <text x="86" y="164" font-size="20" opacity="0.75">Luxury Nails • Sama, Vadodara</text>
  </g>
</svg>`);

function initImageFallback() {
  const imgs = Array.from(document.querySelectorAll("img[data-fallback]"));
  if (imgs.length === 0) return;

  for (const img of imgs) {
    if (!(img instanceof HTMLImageElement)) continue;
    img.addEventListener(
      "error",
      () => {
        if (img.src === FALLBACK_IMAGE_SRC) return;
        img.src = FALLBACK_IMAGE_SRC;
      },
      { once: true }
    );
  }
}

function initLoading() {
  const loading = document.getElementById("loading");
  if (!loading) return;
  window.addEventListener("load", () => window.setTimeout(() => loading.classList.add("loading--hide"), 150));
}

function initHeaderScroll() {
  const header = document.querySelector(".header");
  if (!(header instanceof HTMLElement)) return;

  const onScroll = () => header.classList.toggle("header--scrolled", window.scrollY > 8);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

function initScrollProgress() {
  const bar = document.getElementById("scrollProgressBar");
  if (!(bar instanceof HTMLElement)) return;

  let ticking = false;

  const update = () => {
    ticking = false;
    const doc = document.documentElement;
    const scrollTop = doc.scrollTop || document.body.scrollTop;
    const max = Math.max(1, doc.scrollHeight - doc.clientHeight);
    const progress = Math.min(1, Math.max(0, scrollTop / max));
    bar.style.transform = `scaleX(${progress})`;
  };

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(update);
  };

  update();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
}

function initMobileNav() {
  const toggle = document.getElementById("navToggle");
  const nav = document.getElementById("nav");
  if (!toggle || !nav) return;

  const setOpen = (open) => {
    nav.classList.toggle("nav--open", open);
    toggle.setAttribute("aria-expanded", String(open));
  };

  toggle.addEventListener("click", () => setOpen(!nav.classList.contains("nav--open")));

  document.addEventListener("click", (e) => {
    const target = e.target;
    if (!(target instanceof HTMLElement)) return;
    const clickedInside = nav.contains(target) || toggle.contains(target);
    if (!clickedInside) setOpen(false);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setOpen(false);
  });

  nav.addEventListener("click", (e) => {
    const target = e.target;
    if (target instanceof HTMLAnchorElement) setOpen(false);
  });
}

function initSmoothAnchors() {
  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    const link = target.closest("a");
    if (!(link instanceof HTMLAnchorElement)) return;

    const href = link.getAttribute("href") || "";
    if (!href.startsWith("#") || href === "#") return;

    const el = document.querySelector(href);
    if (!el) return;

    event.preventDefault();
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    history.pushState(null, "", href);
  });
}

function initReveal() {
  const elements = Array.from(document.querySelectorAll(".reveal"));
  if (elements.length === 0) return;

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("reveal--in");
        observer.unobserve(entry.target);
      }
    },
    { threshold: 0.12 }
  );

  for (const el of elements) observer.observe(el);
}

function initActiveNav() {
  const nav = document.getElementById("nav");
  if (!(nav instanceof HTMLElement)) return;

  const links = Array.from(nav.querySelectorAll("a"))
    .filter((a) => a instanceof HTMLAnchorElement)
    .filter((a) => (a.getAttribute("href") || "").startsWith("#"));

  if (links.length === 0) return;

  const linkById = new Map();
  for (const link of links) {
    const href = link.getAttribute("href") || "";
    const id = href.startsWith("#") ? href.slice(1) : "";
    if (id) linkById.set(id, link);
  }

  const sections = Array.from(linkById.keys())
    .map((id) => document.getElementById(id))
    .filter((el) => el instanceof HTMLElement);

  if (sections.length === 0) return;

  const setActive = (id) => {
    for (const link of links) link.classList.toggle("is-active", (link.getAttribute("href") || "") === `#${id}`);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      let best = null;
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        if (!best || entry.intersectionRatio > best.intersectionRatio) best = entry;
      }
      if (best?.target instanceof HTMLElement && best.target.id) setActive(best.target.id);
    },
    { rootMargin: "-35% 0px -55% 0px", threshold: [0.08, 0.12, 0.2, 0.3, 0.45] }
  );

  for (const section of sections) observer.observe(section);
}

function initHeroMedia() {
  const root = document.getElementById("heroMedia");
  if (!root) return;

  const layers = Array.from(root.querySelectorAll(".hero-media__layer"));
  if (layers.length < 2) return;

  let images = [];
  try {
    const raw = root.getAttribute("data-images");
    images = raw ? JSON.parse(raw) : [];
  } catch {
    images = [];
  }

  if (!Array.isArray(images) || images.length === 0) images = fallbackHeroImages();

  let active = 0;
  let front = 0;
  let timer = null;

  const setLayerImage = (layer, src) => {
    layer.style.backgroundImage = `url('${src}')`;
  };

  setLayerImage(layers[0], images[0]);
  setLayerImage(layers[1], images[1] ?? images[0]);
  layers[0].classList.add("is-active");
  layers[1].classList.remove("is-active");

  const tick = () => {
    const next = clampIndex(active + 1, images.length);
    const back = front === 0 ? 1 : 0;

    setLayerImage(layers[back], images[next]);
    layers[back].classList.add("is-active");
    layers[front].classList.remove("is-active");

    front = back;
    active = next;
  };

  const start = () => {
    stop();
    if (images.length <= 1) return;
    timer = window.setInterval(tick, HERO_INTERVAL_MS);
  };

  const stop = () => {
    if (timer) window.clearInterval(timer);
    timer = null;
  };

  root.addEventListener("mouseenter", stop);
  root.addEventListener("mouseleave", start);
  document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));

  start();
}

function initFacesNav() {
  const track = document.getElementById("facesTrack");
  if (!track) return;

  const prev = document.querySelector("[data-faces-prev]");
  const next = document.querySelector("[data-faces-next]");

  const scrollByAmount = (dir) => {
    const amount = Math.max(260, Math.floor(track.clientWidth * 0.8));
    track.scrollBy({ left: dir * amount, behavior: "smooth" });
  };

  prev?.addEventListener("click", () => scrollByAmount(-1));
  next?.addEventListener("click", () => scrollByAmount(1));
}

function initLightbox() {
  const lightbox = document.getElementById("lightbox");
  const imgEl = document.getElementById("lightboxImg");
  if (!lightbox || !(imgEl instanceof HTMLImageElement)) return;

  const open = (src) => {
    imgEl.src = src;
    lightbox.classList.add("lightbox--open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  };

  const close = () => {
    lightbox.classList.remove("lightbox--open");
    lightbox.setAttribute("aria-hidden", "true");
    imgEl.removeAttribute("src");
    document.body.style.overflow = "";
  };

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    const closeEl = target.closest("[data-close]");
    if (closeEl) {
      close();
      return;
    }

    const opener = target.closest("[data-full]");
    if (opener) {
      const src = opener.getAttribute("data-full");
      if (src) open(src);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") close();
  });
}

initLoading();
initImageFallback();
initHeaderScroll();
initScrollProgress();
initMobileNav();
initSmoothAnchors();
initReveal();
initActiveNav();
initHeroMedia();
initFacesNav();
initLightbox();
