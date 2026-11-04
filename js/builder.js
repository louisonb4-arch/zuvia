/* Zuvia — pack builder: plan → flavors → WhatsApp message */
(() => {
  const Z = window.ZUVIA, { FLAVORS, PLANS, UNIT, WA_NUMBER } = Z;
  const planById = Object.fromEntries(PLANS.map(p => [p.id, p]));
  const $ = s => document.querySelector(s);
  const mxn = n => "$" + n.toLocaleString("es-MX") + " MXN";

  /* ---------- Builder ---------- */
  const state = { plan: "lanzamiento", qty: {} };
  FLAVORS.forEach(f => state.qty[f.id] = 0);
  Object.assign(state.qty, PLANS[0].fixed);

  $("#plans").innerHTML = PLANS.map(p => {
    const per = p.portions ? Math.round(p.price / p.portions) : UNIT;
    const save = p.portions ? p.portions * UNIT - p.price : 0;
    return `
    <div class="plan">
      <input type="radio" name="plan" id="plan-${p.id}" value="${p.id}" ${p.id === state.plan ? "checked" : ""}>
      <label for="plan-${p.id}">
        <span class="plan__top"><span class="plan__name">${p.name}</span>${p.badge ? `<span class="plan__badge">${p.badge}</span>` : ""}</span>
        <span class="plan__price">${p.price ? "$" + p.price : "$" + UNIT}<small> MXN</small></span>
        <span class="plan__meta">${p.portions ? `${p.portions} porciones · $${per} MXN c/u` : "Elige las que quieras"}</span>
        ${save > 0 ? `<span class="plan__save">Ahorras $${save} MXN</span>` : ""}
      </label>
    </div>`;
  }).join("");

  $("#picks").innerHTML = FLAVORS.map(f => `
    <li class="pick" data-id="${f.id}">
      <span class="pick__thumb" style="--c:${f.tint}"><img src="${Z.bag(f.id, 560)}" alt="" width="560" height="${Math.round(f.cutH * 560 / 960)}"></span>
      <span style="min-width:0"><span class="pick__name">${f.name}</span><br><span class="pick__ing">${f.ing.join(", ")}</span></span>
      <span class="stepper">
        <button type="button" data-act="-" aria-label="Quitar una porción de ${f.name}">−</button>
        <output id="q-${f.id}" aria-live="polite">0</output>
        <button type="button" data-act="+" aria-label="Agregar una porción de ${f.name}">+</button>
      </span>
    </li>`).join("");

  const total = () => Object.values(state.qty).reduce((a, b) => a + b, 0);

  function setPlan(id) {
    const prev = planById[state.plan];
    const p = planById[id];
    state.plan = id;
    if (p.fixed) {
      FLAVORS.forEach(f => state.qty[f.id] = p.fixed[f.id] || 0);
    } else {
      if (prev.fixed) FLAVORS.forEach(f => state.qty[f.id] = 0); // leaving the fixed combo: start a fresh pick
      // trim if over the new limit
      if (p.portions) {
        let over = total() - p.portions;
        for (const f of [...FLAVORS].reverse()) {
          while (over > 0 && state.qty[f.id] > 0) { state.qty[f.id]--; over--; }
        }
      }
    }
    $(`#plan-${id}`).checked = true;
    render();

  }

  $("#plans").addEventListener("change", e => { if (e.target.name === "plan") setPlan(e.target.value); });

  $("#picks").addEventListener("click", e => {
    const b = e.target.closest("button[data-act]");
    if (!b) return;
    const id = b.closest(".pick").dataset.id;
    const p = planById[state.plan];
    if (p.fixed) return;
    if (b.dataset.act === "+") {
      if (!p.portions || total() < p.portions) state.qty[id]++;
    } else if (state.qty[id] > 0) state.qty[id]--;
    render();
  });

  function priceNow() {
    const p = planById[state.plan];
    return p.price ?? total() * UNIT;
  }

  function render() {
    const p = planById[state.plan];
    const t = total();
    const full = p.portions ? t === p.portions : t > 0;
    const max = p.portions || Math.max(t, 1);

    document.querySelectorAll(".pick").forEach(li => {
      const id = li.dataset.id;
      li.classList.toggle("is-locked", !!p.fixed);
      li.querySelector("output").textContent = state.qty[id];
      li.querySelector('[data-act="-"]').disabled = !!p.fixed || state.qty[id] === 0;
      li.querySelector('[data-act="+"]').disabled = !!p.fixed || (p.portions && t >= p.portions);
    });

    const note = $("#picksNote");
    if (p.fixed) note.textContent = "Este combo ya viene armado: 2 Green, 1 Vampiro, 1 Tropical y 1 Red.";
    else if (p.portions && t < p.portions) note.textContent = `Te ${p.portions - t === 1 ? "falta 1 porción" : `faltan ${p.portions - t} porciones`} por elegir.`;
    else if (p.portions) note.textContent = "¡Listo! Tu paquete está completo.";
    else note.textContent = t ? `${t} ${t === 1 ? "porción" : "porciones"} a $${UNIT} MXN cada una.` : "Agrega las porciones que quieras.";

    $("#sumPlan").textContent = p.portions ? `${p.name} · ${p.portions} porciones` : `${p.name} · $${UNIT} MXN c/u`;
    $("#sumBar").style.width = (p.portions ? Math.min(100, (t / max) * 100) : (t ? 100 : 0)) + "%";
    $("#sumCount").textContent = p.portions ? `${t} de ${p.portions} porciones` : `${t} ${t === 1 ? "porción" : "porciones"}`;

    const lines = FLAVORS.filter(f => state.qty[f.id] > 0).map(f => `<li><span>${f.name}</span><span>× ${state.qty[f.id]}</span></li>`);
    $("#sumLines").innerHTML = lines.length ? lines.join("") : `<li class="empty">Aún no eliges sabores.</li>`;

    const price = priceNow();
    $("#sumTotal").textContent = mxn(price);
    const save = p.portions ? p.portions * UNIT - p.price : 0;
    $("#sumSave").parentElement.hidden = save <= 0;
    $("#sumSave").textContent = mxn(save);

    $("#mbarTotal").textContent = mxn(price);
    $("#mbarCount").textContent = $("#sumCount").textContent;
    $("#mbarGo").textContent = full ? "Ver mi pedido" : (p.portions ? `Faltan ${p.portions - t}` : "Ver mi pedido");
    const btn = $("#sendWa");
    btn.setAttribute("aria-disabled", String(!full));
    $("#sendLabel").textContent = full ? "Enviar pedido por WhatsApp" : (p.portions ? `Elige ${p.portions - t} más para enviar` : "Agrega al menos 1 porción");
    btn.href = full ? waLink() : "#";
  }

  function waLink() {
    const p = planById[state.plan];
    const name = $("#fName").value.trim();
    const zone = $("#fZone").value.trim();
    const items = FLAVORS.filter(f => state.qty[f.id] > 0).map(f => `• ${state.qty[f.id]} ${f.name}`).join("\n");
    const head = p.portions ? `${p.name} (${p.portions} porciones) – ${mxn(p.price)}` : `Porciones sueltas – ${mxn(priceNow())}`;
    const msg = [
      `¡Hola Zuvia! ${name ? `Soy ${name}. ` : ""}Quiero hacer un pedido:`,
      "", head, items, "",
      zone ? `Entrega en: ${zone}` : null,
      "¿Me confirman entrega y forma de pago? Gracias."
    ].filter(x => x !== null).join("\n");
    return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
  }

  ["#fName", "#fZone"].forEach(s => $(s).addEventListener("input", render));

  // Copy phone
  $("#copyPhone").addEventListener("click", e => {
    const b = e.currentTarget;
    const done = () => { b.textContent = "Copiado"; setTimeout(() => b.textContent = "Copiar", 1600); };
    const fallback = () => { const r = document.createRange(); r.selectNodeContents($("#phoneTxt")); const s = getSelection(); s.removeAllRanges(); s.addRange(r); };
    try { navigator.clipboard.writeText("2722627912").then(done, fallback); } catch { fallback(); }
  });

  // public: add one portion of a flavor (from hero, range or flavor detail)
  // mobile bar: visible while the flavor picker is on screen and the summary is not
  const mbar = $("#mbar"); let inPicks = false, inSum = false;
  const syncBar = () => mbar.classList.toggle("is-on", inPicks && !inSum);
  new IntersectionObserver(es => { inPicks = es[0].isIntersecting; syncBar(); }, { rootMargin: "0px 0px -20% 0px" }).observe($(".builder__main"));
  new IntersectionObserver(es => { inSum = es[0].isIntersecting; syncBar(); }, { threshold: .25 }).observe($(".summary"));
  $("#mbarGo").addEventListener("click", () => { const s = $(".summary"); Z.scrollTo ? Z.scrollTo(s) : s.scrollIntoView({ behavior: "smooth" }); });

  Z.addToPack = id => {
    if (planById[state.plan].fixed) { FLAVORS.forEach(f => state.qty[f.id] = 0); setPlan("semanal"); }
    const p = planById[state.plan];
    if (!p.portions || total() < p.portions) state.qty[id]++;
    else if (p.id === "semanal") { setPlan("quincenal"); state.qty[id]++; }
    render();
    const target = $("#paquetes");
    if (Z.scrollTo) Z.scrollTo(target); else target.scrollIntoView({ behavior: Z.reduce() ? "auto" : "smooth" });
    const li = document.querySelector(`.pick[data-id="${id}"]`);
    li && li.animate([{ transform: "scale(1.03)", boxShadow: "inset 0 0 0 2px var(--leaf)" }, { transform: "none", boxShadow: "inset 0 0 0 1px var(--line)" }], { duration: 1200, easing: "cubic-bezier(.2,.7,.2,1)" });
  };

  render();
})();
