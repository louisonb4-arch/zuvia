/* Zuvia — motion: intro, scroll reveals, scrubbed parallax, pinned steps, magnetic buttons, smart header.
   Everything is visible without JS; GSAP only animates from/to that resting state. */
(() => {
  const Z = window.ZUVIA, G = window.gsap;
  const loader = document.querySelector(".loader");
  const top = document.querySelector(".top");
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  Z.scrollTo = el => {
    const box = el.closest(".pin-spacer") || el;
    const y = box.getBoundingClientRect().top + scrollY - (box === el ? 76 : 0);
    if (Z.lenis) Z.lenis.scrollTo(y, { duration: 1.2 }); else window.scrollTo({ top: y, behavior: Z.reduce() ? "auto" : "smooth" });
  };

  // smart header: transparent on top, solid after, hides on scroll down
  // direction-based with a small dead-zone, so smooth (per-frame) scrolling works too
  let anchorY = scrollY;
  const onScroll = () => {
    const y = scrollY;
    top.classList.toggle("is-scrolled", y > 24);
    if (y < 400) { top.classList.remove("is-hidden"); anchorY = y; return; }
    if (y > anchorY + 24) { top.classList.add("is-hidden"); anchorY = y; }
    else if (y < anchorY - 24) { top.classList.remove("is-hidden"); anchorY = y; }
    else if (top.classList.contains("is-hidden") ? y > anchorY : y < anchorY) anchorY = y;
  };
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  if (!G || Z.reduce()) { loader && loader.remove(); return; }
  G.registerPlugin(ScrollTrigger, SplitText);
  G.defaults({ ease: "power3.out", force3D: true });
  ScrollTrigger.config({ ignoreMobileResize: true });

  /* ---------- smooth scroll (mouse / trackpad only; touch keeps native momentum) ---------- */
  if (window.Lenis && matchMedia("(pointer: fine)").matches) {
    const lenis = new Lenis({ lerp: .1, wheelMultiplier: 1, smoothWheel: true });
    Z.lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    G.ticker.add(t => lenis.raf(t * 1000));
    G.ticker.lagSmoothing(0);
    document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener("click", e => {
      const id = a.getAttribute("href"); if (id.length < 2) return;
      const t = document.querySelector(id); if (!t) return;
      e.preventDefault(); Z.scrollTo(t);
    }));
  }

  /* ---------- intro ---------- */
  const heroTl = G.timeline({ paused: true });
  heroTl
    .from(".hero__blobs span", { scale: .6, opacity: 0, duration: 1.4, stagger: .1 }, 0)
    .from(".hero__title .tag", { yPercent: 120, rotation: 0, opacity: 0, duration: .9, stagger: .12, ease: "back.out(1.6)" }, .05)
    .from(".hero__script", { y: 20, opacity: 0, duration: .7 }, .35)
    .from(".hero__bag", { y: -90, rotation: 7, scale: .9, opacity: 0, duration: 1.1, ease: "back.out(1.4)", clearProps: "transform,opacity" }, .25)
    .add(() => { Z.hero && Z.hero.burst(0); Z.hero && Z.hero.ambientIn(); }, .55)
    .from(".hero__bar > *", { y: 24, opacity: 0, duration: .7, stagger: .08 }, .6)
    .from(".top", { yPercent: -100, duration: .7, clearProps: "transform" }, .3);

  const start = () => heroTl.play();
  if (loader) {
    const lt = G.timeline({ onComplete: () => loader.remove() });
    lt.from(".loader__logo", { scale: .7, opacity: 0, duration: .6, ease: "back.out(1.8)" })
      .from(".loader__script", { y: 14, opacity: 0, duration: .45 }, "-=.25")
      .to(".loader__in", { y: -30, opacity: 0, duration: .4, ease: "power2.in" }, "+=.25")
      .to(loader, { clipPath: "inset(0 0 100% 0)", duration: .7, ease: "power4.inOut" }, "-=.1")
      .add(start, "-=.45");
  } else start();

  /* ---------- hero scroll-out ---------- */
  const hs = { trigger: ".hero", start: "top top", end: "bottom top", scrub: .5 };
  G.to(".hero__bagwrap", { yPercent: 18, scale: .86, ease: "none", scrollTrigger: hs });
  G.to(".hero__copy", { yPercent: -40, opacity: .2, ease: "none", scrollTrigger: hs });
  G.to(".hero .fruits--near", { yPercent: -45, ease: "none", scrollTrigger: hs });
  G.to(".hero .fruits--far", { yPercent: 25, ease: "none", scrollTrigger: hs });
  G.to(".hero__stage .fruits--front", { yPercent: -12, ease: "none", scrollTrigger: hs });

  /* ---------- titles ---------- */
  $$("[data-split]").forEach(el => {
    const tags = el.querySelectorAll(".tag");
    const st = { trigger: el, start: "top 85%" };
    if (tags.length) {
      G.from(tags, { yPercent: 110, rotation: 0, opacity: 0, duration: .9, stagger: .1, ease: "back.out(1.6)", scrollTrigger: st });
    } else {
      SplitText.create(el, { type: "lines", mask: "lines", autoSplit: true, onSplit: s =>
        G.from(s.lines, { yPercent: 110, duration: .9, stagger: .09, ease: "power4.out", scrollTrigger: st }) });
    }
  });
  $$("[data-reveal]").forEach(el => G.from(el, { y: 30, opacity: 0, duration: .8, scrollTrigger: { trigger: el, start: "top 88%" } }));

  /* ---------- manifesto: words light up as you read ---------- */
  $$("[data-words]").forEach(el => {
    SplitText.create(el, { type: "words", autoSplit: true, onSplit: s =>
      G.fromTo(s.words, { opacity: .14 }, { opacity: 1, stagger: .06, ease: "none",
        scrollTrigger: { trigger: el, start: "top 80%", end: "bottom 50%", scrub: .6 } }) });
  });

  /* ---------- depth parallax for loose fruit ---------- */
  $$("[data-depth]").forEach(el => {
    const d = parseFloat(el.dataset.depth);
    G.fromTo(el, { yPercent: 40 * d, rotation: `-=${8 * d}` }, { yPercent: -40 * d, rotation: `+=${16 * d}`, ease: "none",
      scrollTrigger: { trigger: el.closest("section, footer"), start: "top bottom", end: "bottom top", scrub: .6 } });
  });

  /* ---------- la gama ---------- */
  G.from(".gama__item", { y: 140, rotation: i => (i - 2) * 7, opacity: 0, duration: 1, stagger: .08, ease: "back.out(1.3)",
    scrollTrigger: { trigger: ".gama__row", start: "top 85%" } });

  /* ---------- sabor: scale in ---------- */
  G.from(".sabor__ui > *", { y: 40, opacity: 0, duration: .8, stagger: .1, scrollTrigger: { trigger: ".sabor", start: "top 55%" } });

  /* ---------- cómo funciona ---------- */
  const mm = G.matchMedia();
  mm.add("(min-width: 900px)", () => {
    const track = document.querySelector(".como__track");
    const dist = () => track.scrollWidth - innerWidth;
    const tw = G.to(track, { x: () => -dist(), ease: "none",
      scrollTrigger: { trigger: ".como", start: "top top", end: () => "+=" + dist(), pin: true, scrub: .8, invalidateOnRefresh: true, anticipatePin: 1 } });
    G.to(".como__bar span", { scale: 1, ease: "none", scrollTrigger: { trigger: ".como", start: "top top", end: () => "+=" + dist(), scrub: .8 } });
    $$(".step").forEach(s => ScrollTrigger.create({ trigger: s, containerAnimation: tw, start: "left 75%", onEnter: () => s.classList.add("is-in") }));
  });
  mm.add("(max-width: 899px)", () => {
    $$(".step").forEach(s => {
      ScrollTrigger.create({ trigger: s, start: "top 72%", once: true, onEnter: () => s.classList.add("is-in") });
      G.from(s.querySelector(".step__copy"), { y: 28, opacity: 0, duration: .8, scrollTrigger: { trigger: s, start: "top 70%" } });
      G.from(s.querySelector(".step__disc"), { scale: .7, opacity: 0, duration: 1, ease: "back.out(1.4)", scrollTrigger: { trigger: s, start: "top 80%" } });
    });
  });

  /* ---------- band ---------- */
  G.from(".band__in", { scale: .94, duration: 1.2, scrollTrigger: { trigger: ".band", start: "top 75%" } });

  /* ---------- builder & faq ---------- */
  G.from(".plan", { y: 30, opacity: 0, duration: .6, stagger: .06, scrollTrigger: { trigger: ".plans", start: "top 85%" } });
  G.from(".pick", { x: -24, opacity: 0, duration: .6, stagger: .06, scrollTrigger: { trigger: ".picks", start: "top 85%" } });
  G.from(".summary", { y: 40, opacity: 0, duration: .9, scrollTrigger: { trigger: ".summary", start: "top 90%" } });
  G.from(".faq details", { y: 24, opacity: 0, duration: .6, stagger: .07, scrollTrigger: { trigger: ".faq__list", start: "top 85%" } });

  /* ---------- footer ---------- */
  G.from(".foot__top > *", { y: 40, opacity: 0, duration: .8, stagger: .08, scrollTrigger: { trigger: ".foot", start: "top 85%" } });
  G.fromTo(".foot__word", { yPercent: 40 }, { yPercent: 0, ease: "none", scrollTrigger: { trigger: ".foot__word", start: "top bottom", end: "bottom bottom", scrub: .6 } });

  /* ---------- magnetic buttons ---------- */
  if (matchMedia("(pointer: fine)").matches) {
    $$(".magnetic").forEach(el => {
      const xTo = G.quickTo(el, "x", { duration: .5, ease: "power3" }), yTo = G.quickTo(el, "y", { duration: .5, ease: "power3" });
      el.addEventListener("pointermove", e => { const r = el.getBoundingClientRect(); xTo((e.clientX - r.left - r.width / 2) * .3); yTo((e.clientY - r.top - r.height / 2) * .4); });
      el.addEventListener("pointerleave", () => { xTo(0); yTo(0); });
    });
  }

  addEventListener("load", () => ScrollTrigger.refresh());
  document.fonts && document.fonts.ready.then(() => ScrollTrigger.refresh());
})();
