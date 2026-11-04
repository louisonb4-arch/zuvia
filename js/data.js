/* Zuvia — shared data: flavors, plans, fruit pieces per flavor */
window.ZUVIA = (() => {
  const FLAVORS = [
    { id: "tropical", name: "Tropical", cutH: 683, color: "#EE7A1A", tint: "#FCE4C8", word: "#F7CC97",
      ing: ["Piña", "Plátano", "Papaya", "Limón"], water: "350 a 400 ml",
      desc: "Dulce y cítrico. Piña, plátano y papaya con un toque de limón para despertar.",
      fruits: ["pineapple", "banana", "papaya", "lime", "lime-wedge", "pineapple-crown", "banana-peeled", "lime-whole"] },
    { id: "red", name: "Red", cutH: 733, color: "#D22F3B", tint: "#F9DDDF", word: "#F1B9BF",
      ing: ["Betabel", "Piña", "Plátano", "Manzana"], water: "350 a 400 ml",
      desc: "Betabel con fruta dulce: piña, plátano y manzana. Rojo, suave y fácil de tomar.",
      fruits: ["beet", "apple-red", "banana", "pineapple", "beet-cube", "banana-peeled", "apple-red", "beet"] },
    { id: "vampiro", name: "Vampiro", cutH: 739, color: "#8B3A9A", tint: "#EFDFF2", word: "#DEC2E6",
      ing: ["Betabel", "Zanahoria", "Piña", "Pepino", "Lechuga"], water: "350 a 400 ml",
      desc: "El clásico rojo intenso. Betabel y zanahoria, con piña y pepino para equilibrar.",
      fruits: ["beet", "carrot", "cucumber", "pineapple", "beet-cube", "lettuce", "carrot", "cucumber"] },
    { id: "green", name: "Green", cutH: 666, color: "#4E9A2E", tint: "#E2EFD1", word: "#C7E1A7",
      ing: ["Espinaca", "Lechuga", "Manzana verde", "Piña"], water: "350 a 400 ml",
      desc: "El verde de todos los días. Espinaca y lechuga con piña y manzana verde: sabe fresco, no a ensalada.",
      fruits: ["spinach", "apple-green", "lettuce", "pineapple", "spinach", "mint", "apple-green", "lime-wedge"] },
    { id: "green-mix", name: "Green Mix", cutH: 683, color: "#2E8A55", tint: "#D8EEDF", word: "#B5DDC3",
      ing: ["Lechuga", "Pepino", "Piña", "Betabel"], water: "250 a 400 ml",
      desc: "Lo verde y lo dulce en la misma bolsa: lechuga y pepino con piña y betabel.",
      fruits: ["lettuce", "cucumber", "pineapple", "beet", "beet-cube", "cucumber", "mint", "pineapple-crown"] }
  ];
  const PLANS = [
    { id: "lanzamiento", name: "Oferta de lanzamiento", portions: 5, price: 150, badge: "Nuevo",
      fixed: { green: 2, vampiro: 1, tropical: 1, red: 1 } },
    { id: "semanal", name: "Semanal", portions: 5, price: 170 },
    { id: "quincenal", name: "Quincenal", portions: 10, price: 320 },
    { id: "mensual", name: "Mensual", portions: 20, price: 600 },
    { id: "suelta", name: "Por porción", portions: null, price: null }
  ];
  const byId = Object.fromEntries(FLAVORS.map(f => [f.id, f]));
  const bag = (id, w = 960) => `img/cut-${id}-${w}.webp`;
  const fruit = name => `img/fruit/${name}.webp`;
  const glass = id => `img/glass/${id}.webp`;
  const reduce = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  return { FLAVORS, PLANS, byId, bag, fruit, glass, reduce, WA_NUMBER: "522722627912", UNIT: 35 };
})();
