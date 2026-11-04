/* Zuvia — flavor scenes: hero switcher, la gama row, flavor detail.
   Real fruit cut-outs orbit the bag; on change they get pulled into the bag and burst back out. */
(() => {
  const Z = window.ZUVIA, G = window.gsap;
  const { FLAVORS, byId } = Z;
  const anim = () => G && !Z.reduce();

  // pieces on an ellipse around the bag: a = angle (0 = right, 90 = bottom), k = radius factor, s = size, d = parallax depth
  const RIM = [
    { a: 196, k: 1.04, s: 1.05, d: 26, r: -16, L: "front" },
    { a: 16,  k: 1.02, s: 1.15, d: 30, r: 22,  L: "front" },
    { a: 322, k: 1.0,  s: 0.82, d: 16, r: -8,  L: "front" },
    { a: 144, k: 1.0,  s: 0.92, d: 20, r: 28,  L: "front" },
    { a: 94,  k: 1.06, s: 0.74, d: 12, r: 10,  L: "front" },
    { a: 56,  k: 1.04, s: 0.82, d: 14, r: -18, L: "front" },
    { a: 246, k: 0.9,  s: 0.62, d: 6,  r: 18,  L: "back" },
    { a: 292, k: 0.94, s: 0.56, d: 6,  r: -14, L: "back" }
  ];

  function Layer(stage, opts) {
    const back = stage.querySelector(".fruits--back"), front = stage.querySelector(".fruits--front");
    let pieces = [];
    const box = () => (opts.box ? opts.box() : stage.getBoundingClientRect());
    function place(el, sl) {
      const b = box(), W = b.width, H = b.height;
      const rx = W * opts.rx / 2, ry = H * opts.ry / 2, t = sl.a * Math.PI / 180;
      el.style.left = (50 + Math.cos(t) * rx * sl.k / W * 100).toFixed(2) + "%";
      el.style.top = (50 + Math.sin(t) * ry * sl.k / H * 100).toFixed(2) + "%";
    }
    function make(id) {
      return byId[id].fruits.map((name, i) => {
        const sl = RIM[i], el = document.createElement("div");
        el.className = "piece piece--" + sl.L;
        el.style.cssText = `--s:${sl.s};--d:${sl.d};--r:${sl.r}deg;--dur:${5.5 + (i % 3) * 1.3}s;--delay:${-i * .8}s`;
        el.innerHTML = `<img src="${Z.fruit(name)}" alt="" draggable="false" decoding="async">`;
        place(el, sl);
        (sl.L === "back" ? back : front).appendChild(el);
        return el;
      });
    }
    function toCenter(el) {
      const s = box(), r = el.getBoundingClientRect();
      return [s.left + s.width / 2 - (r.left + r.width / 2), s.top + s.height / 2 - (r.top + r.height / 2)];
    }
    return {
      set(id) { pieces.forEach(p => p.remove()); pieces = make(id); return pieces; },
      burst(delay = 0) {
        if (!anim()) return;
        pieces.forEach((el, i) => { const [x, y] = toCenter(el);
          G.from(el, { x, y, scale: .1, rotation: -70, opacity: 0, duration: 1.05, delay: delay + i * .05, ease: "back.out(1.7)", clearProps: "transform,opacity" }); });
      },
      implode() {
        if (!anim()) { pieces.forEach(p => p.remove()); pieces = []; return Promise.resolve(); }
        const old = pieces; pieces = [];
        return Promise.all(old.map((el, i) => { const [x, y] = toCenter(el);
          return G.to(el, { x, y, scale: .12, rotation: 80, opacity: 0, duration: .38, delay: i * .02, ease: "power3.in" }).then(() => el.remove()); }));
      },
      relayout() { pieces.forEach((el, i) => place(el, RIM[i])); }
    };
  }

  function parallax(el, target) {
    if (Z.reduce() || !matchMedia("(pointer: fine)").matches) return;
    let raf = 0;
    el.addEventListener("pointermove", e => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => {
      const r = el.getBoundingClientRect();
      target.style.setProperty("--px", ((e.clientX - r.left) / r.width - .5).toFixed(3));
      target.style.setProperty("--py", ((e.clientY - r.top) / r.height - .5).toFixed(3)); }); });
    el.addEventListener("pointerleave", () => { target.style.setProperty("--px", 0); target.style.setProperty("--py", 0); });
  }
  function swipe(el, fn) {
    let sx = null, sy = null;
    el.addEventListener("pointerdown", e => { sx = e.clientX; sy = e.clientY; });
    el.addEventListener("pointerup", e => { if (sx === null) return; const dx = e.clientX - sx, dy = e.clientY - sy; sx = null;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) fn(dx < 0 ? 1 : -1); });
  }
  function swapBag(img, id, size) {
    const f = byId[id];
    const set = () => { img.src = Z.bag(id); img.srcset = `${Z.bag(id, 560)} 460w, ${Z.bag(id)} 760w`; img.width = 960; img.height = f.cutH; img.alt = `Bolsa Zuvia ${f.name}`; };
    if (!anim()) { set(); return Promise.resolve(); }
    return G.to(img, { y: 40, rotation: -6, scale: .9, opacity: 0, duration: .3, ease: "power2.in" }).then(() => {
      set();
      G.fromTo(img, { y: -70, rotation: 6, scale: .94, opacity: 0 }, { y: 0, rotation: 0, scale: 1, opacity: 1, duration: .85, ease: "back.out(1.5)", clearProps: "transform,opacity" });
    });
  }
  // warm the cache for the other flavors once the page is idle (not during first paint)
  const warm = () => { const seen = new Set(); FLAVORS.forEach(f => [Z.bag(f.id), Z.glass(f.id), ...f.fruits.map(Z.fruit)].forEach(u => { if (seen.has(u)) return; seen.add(u); const i = new Image(); i.decoding = "async"; i.src = u; })); };
  addEventListener("load", () => (window.requestIdleCallback || (cb => setTimeout(cb, 1200)))(warm));

  /* ---------- HERO ---------- */
  const hero = document.getElementById("hero");
  if (hero) {
    const stage = hero.querySelector(".hero__stage"), bag = hero.querySelector(".hero__bag");
    const pills = hero.querySelector(".hero__pills"), far = hero.querySelector(".fruits--far"), near = hero.querySelector(".fruits--near");
    const layer = Layer(stage, { rx: .84, ry: .9, box: () => {
      const r = stage.getBoundingClientRect(), b = bag.getBoundingClientRect();
      return { left: b.left - (b.width * .02), top: b.top - b.height * .05, width: b.width * 1.04, height: b.height * 1.1 }; } });
    // fix pieces relative to the stage, not the bag box: convert after placing
    let index = 0, busy = false;
    pills.innerHTML = FLAVORS.map((f, i) => `<button type="button" role="tab" class="pill" data-flavor="${f.id}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}">${f.name}</button>`).join("");

    const AMB = { far: [{ x: 6, y: 22, s: 1, r: -20 }, { x: 93, y: 30, s: .8, r: 16 }], near: [{ x: 97, y: 92, s: 1, r: -24 }, { x: 2, y: 86, s: .75, r: 30 }] };
    function ambient(id, animateIn) {
      const fr = byId[id].fruits;
      [[far, AMB.far, [fr[2], fr[5]], "far"], [near, AMB.near, [fr[0], fr[3]], "near"]].forEach(([wrap, spots, names, cls]) => {
        const old = [...wrap.children];
        if (anim() && old.length) G.to(old, { opacity: 0, scale: .8, duration: .4, onComplete: () => old.forEach(o => o.remove()) }); else old.forEach(o => o.remove());
        spots.forEach((p, i) => {
          const el = document.createElement("div");
          el.className = `piece piece--${cls}`;
          el.style.cssText = `left:${p.x}%;top:${p.y}%;--s:${p.s};--d:${cls === "near" ? 50 : 8};--r:${p.r}deg;--dur:${8 + i * 2}s;--delay:${-i * 2}s`;
          el.innerHTML = `<img src="${Z.fruit(names[i])}" alt="" draggable="false">`;
          wrap.appendChild(el);
          if (animateIn && anim()) G.from(el, { opacity: 0, scale: .6, y: cls === "near" ? 80 : -40, duration: 1.1, delay: .15 + i * .1, ease: "power3.out", clearProps: "transform,opacity" });
        });
      });
    }
    function info(f) {
      hero.querySelector("#heroMeta").textContent = f.ing.join(", ").replace(/, ([^,]*)$/, " y $1");
      hero.querySelector("#heroCtaLabel").textContent = `Pedir ${f.name}`;
      pills.querySelectorAll(".pill").forEach((p, i) => { p.setAttribute("aria-selected", i === index); p.tabIndex = i === index ? 0 : -1; });
    }
    // pieces live in stage coordinates; Layer.place uses the bag box so they hug the bag at any size
    const placeAll = () => layer.relayout();
    async function go(next, focus) {
      if (busy) return; next = (next + FLAVORS.length) % FLAVORS.length; if (next === index) return;
      busy = true; index = next; const f = FLAVORS[index];
      hero.dataset.flavor = f.id; info(f);
      if (focus) pills.children[index].focus();
      ambient(f.id, true);
      await Promise.all([layer.implode(), swapBag(bag, f.id)]);
      layer.set(f.id); fixToStage(); layer.burst(.1);
      setTimeout(() => busy = false, 420);
    }
    // Layer.place writes % of the bag box; re-express in % of the stage
    function fixToStage() {
      const s = stage.getBoundingClientRect(), b = bag.getBoundingClientRect();
      const bx = { left: b.left - b.width * .02, top: b.top - b.height * .05, width: b.width * 1.04, height: b.height * 1.1 };
      stage.querySelectorAll(".piece").forEach(el => {
        const px = parseFloat(el.style.left) / 100, py = parseFloat(el.style.top) / 100;
        el.style.left = ((bx.left - s.left + px * bx.width) / s.width * 100).toFixed(2) + "%";
        el.style.top = ((bx.top - s.top + py * bx.height) / s.height * 100).toFixed(2) + "%";
      });
    }
    pills.addEventListener("click", e => { const p = e.target.closest(".pill"); if (p) go([...pills.children].indexOf(p)); });
    pills.addEventListener("keydown", e => { if (e.key === "ArrowRight") { e.preventDefault(); go(index + 1, true); } if (e.key === "ArrowLeft") { e.preventDefault(); go(index - 1, true); } });
    swipe(stage, d => go(index + d));
    parallax(hero, hero);
    hero.querySelector("#heroCta").addEventListener("click", () => Z.addToPack && Z.addToPack(FLAVORS[index].id));
    let rt; addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => { placeAll(); fixToStage(); }, 120); });

    const f0 = FLAVORS[0];
    hero.dataset.flavor = f0.id; info(f0); ambient(f0.id, false);
    const init = () => { layer.set(f0.id); fixToStage(); };
    if (bag.complete) init(); else bag.addEventListener("load", init, { once: true });
    Z.hero = { burst: d => layer.burst(d), bag, ambientIn() { if (!anim()) return; G.from(hero.querySelectorAll(".fruits--far .piece, .fruits--near .piece"), { opacity: 0, scale: .6, duration: 1.2, stagger: .1, ease: "power3.out", clearProps: "transform,opacity" }); } };
  }

  /* ---------- SABOR (detail) ---------- */
  const sabor = document.getElementById("sabores");
  if (sabor) {
    const bag = sabor.querySelector("#saborBag"), word = sabor.querySelector("#saborWord"), tabs = sabor.querySelector("#saborTabs");
    const layer = Layer(sabor, { rx: .78, ry: .9, box: () => {
      const b = bag.getBoundingClientRect(); return { left: b.left, top: b.top - b.height * .08, width: b.width, height: b.height * 1.16 }; } });
    let index = 0, busy = false, shown = false;
    tabs.innerHTML = FLAVORS.map((f, i) => `<button type="button" role="tab" class="prog" aria-selected="${i === 0}" aria-label="${f.name}">${f.name}</button>`).join("");
    function setWord(f, animateIn) {
      const letters = [...f.name.toUpperCase()];
      word.style.setProperty("--len", Math.max(letters.length, 4));
      word.innerHTML = letters.map(c => `<span>${c === " " ? "&nbsp;" : c}</span>`).join("");
      if (animateIn && anim()) G.from(word.children, { yPercent: 70, opacity: 0, rotation: 6, duration: .7, stagger: .035, ease: "back.out(1.6)", clearProps: "transform,opacity" });
    }
    function info(f) {
      sabor.querySelector("#saborName").textContent = f.name;
      sabor.querySelector("#saborDesc").textContent = f.desc;
      sabor.querySelector("#saborWater").textContent = f.water;
      sabor.querySelector("#saborIng").innerHTML = f.ing.map(x => `<li>${x}</li>`).join("");
      sabor.querySelector("#saborAdd").textContent = `Agregar ${f.name} a mi paquete`;
      tabs.querySelectorAll(".prog").forEach((t, i) => t.setAttribute("aria-selected", i === index));
    }
    function stageFix() {
      const s = sabor.getBoundingClientRect(), b = bag.getBoundingClientRect();
      const bx = { left: b.left, top: b.top - b.height * .08, width: b.width, height: b.height * 1.16 };
      sabor.querySelectorAll(".fruits .piece").forEach(el => {
        const wrap = el.parentElement.getBoundingClientRect();
        const px = parseFloat(el.style.left) / 100, py = parseFloat(el.style.top) / 100;
        el.style.left = ((bx.left - wrap.left + px * bx.width) / wrap.width * 100).toFixed(2) + "%";
        el.style.top = ((bx.top - wrap.top + py * bx.height) / wrap.height * 100).toFixed(2) + "%";
      });
    }
    async function go(next) {
      if (busy) return; next = (next + FLAVORS.length) % FLAVORS.length; if (next === index && shown) return;
      busy = true; index = next; const f = FLAVORS[index];
      sabor.dataset.flavor = f.id; info(f);
      const out = anim() && word.children.length ? G.to(word.children, { yPercent: -60, opacity: 0, duration: .25, stagger: .02, ease: "power2.in" }) : Promise.resolve();
      const glass = sabor.querySelector("#saborGlass");
      const gOut = anim() ? G.to(glass, { y: 40, opacity: 0, rotation: 16, duration: .3, ease: "power2.in" }) : Promise.resolve();
      await Promise.all([layer.implode(), swapBag(bag, f.id), out, gOut]);
      glass.src = Z.glass(f.id);
      if (anim()) G.fromTo(glass, { y: 60, opacity: 0, rotation: -8 }, { y: 0, opacity: 1, rotation: 0, duration: .9, delay: .2, ease: "back.out(1.6)", clearProps: "transform,opacity" });
      setWord(f, true); layer.set(f.id); stageFix(); layer.burst(.08);
      setTimeout(() => busy = false, 420);
    }
    sabor.querySelector(".sabor__prev").addEventListener("click", () => go(index - 1));
    sabor.querySelector(".sabor__next").addEventListener("click", () => go(index + 1));
    tabs.addEventListener("click", e => { const t = e.target.closest(".prog"); if (t) go([...tabs.children].indexOf(t)); });
    sabor.addEventListener("keydown", e => { if (e.key === "ArrowRight") go(index + 1); if (e.key === "ArrowLeft") go(index - 1); });
    swipe(sabor, d => go(index + d));
    parallax(sabor, sabor);
    sabor.querySelector("#saborAdd").addEventListener("click", () => Z.addToPack && Z.addToPack(FLAVORS[index].id));
    let rt; addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => { layer.relayout(); stageFix(); }, 120); });

    const f0 = FLAVORS[0];
    sabor.dataset.flavor = f0.id; info(f0); setWord(f0, false);
    const init = () => { layer.set(FLAVORS[index].id); stageFix(); shown = true; };
    // build pieces when the section first comes near the viewport (bag is lazy)
    new IntersectionObserver((es, io) => { if (es[0].isIntersecting) { io.disconnect();
      const run = () => { init(); layer.burst(.2); };
      if (bag.complete && bag.naturalWidth) run(); else bag.addEventListener("load", run, { once: true }); } }, { rootMargin: "200px" }).observe(sabor);
    Z.sabor = { select(id) { const i = FLAVORS.findIndex(f => f.id === id); if (shown) go(i); else { index = i; const f = FLAVORS[i]; sabor.dataset.flavor = f.id; info(f); setWord(f, false); sabor.querySelector("#saborGlass").src = Z.glass(f.id); bag.src = Z.bag(f.id); bag.srcset = `${Z.bag(f.id, 560)} 460w, ${Z.bag(f.id)} 760w`; bag.height = f.cutH; } } };
  }

  /* ---------- LA GAMA row ---------- */
  const row = document.getElementById("gamaRow");
  if (row) {
    row.innerHTML = FLAVORS.map(f => `
      <li class="gama__item">
        <button type="button" class="gama__btn" data-id="${f.id}" aria-label="Ver ${f.name}">
          <img class="gama__glass" src="${Z.glass(f.id)}" alt="" draggable="false">
          <img class="gama__img" src="${Z.bag(f.id, 560)}" alt="Bolsa Zuvia ${f.name}" width="560" height="${Math.round(f.cutH * 560 / 960)}" draggable="false">
          <span class="gama__shadow" aria-hidden="true"></span>
          <span class="pill" data-flavor="${f.id}">${f.name}</span>
        </button>
      </li>`).join("");
    row.addEventListener("click", e => {
      const b = e.target.closest(".gama__btn"); if (!b) return;
      Z.sabor && Z.sabor.select(b.dataset.id);
      const t = document.getElementById("sabores");
      Z.scrollTo ? Z.scrollTo(t) : t.scrollIntoView({ behavior: "smooth" });
    });
  }
  /* footer flavor links open that flavor */
  document.querySelectorAll("[data-flavor-link]").forEach(a => a.addEventListener("click", e => {
    e.preventDefault(); Z.sabor && Z.sabor.select(a.dataset.flavorLink);
    const t = document.getElementById("sabores"); Z.scrollTo ? Z.scrollTo(t) : t.scrollIntoView();
  }));
})();
