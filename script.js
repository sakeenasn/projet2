/* =========================================================
   🌌 SYSTÈME SOLAIRE — AVEC ORBITES VISIBLES + LUNES
   ========================================================= */

const planets = document.querySelectorAll(".planet");
const sun = document.querySelector(".sun");
const space = document.querySelector(".space");

let globalSpeed = 1;
let zoomLevel = 1;
let soundEnabled = true;
let systemPaused = false;

// ----------- TABLEAU DES ORBITES ------------
const planetOrbits = [];

/* =========================================================
   🔵 FONCTION UTILITAIRE : CRÉER ANNEAU D’ORBITE
   ========================================================= */
function createOrbitRing(distance) {
  const ring = document.createElement("div");
  ring.className = "orbit-ring";
  ring.style.width = distance * 2 + "px";
  ring.style.height = distance * 2 + "px";
  ring.style.marginLeft = -distance + "px";
  ring.style.marginTop = -distance + "px";
  space.appendChild(ring);
}

/* =========================================================
   🔁 FONCTION : ORBITE PLANÈTE OU LUNE
   ========================================================= */
function createOrbit(body, distance, duration, parentOrbitObj = null) {

  const orbitObj = {
    body: body,
    distance: distance,
    baseDuration: duration,
    current: { x: 0, y: 0 },
    type: parentOrbitObj ? "moon" : "planet",
    parent: parentOrbitObj
  };

  const anim = anime({
    targets: orbitObj.current,
    dummy: 1,
    rotate: "1turn",
    duration: duration,
    easing: "linear",
    loop: true,
    autoplay: true,
    update: () => {
      const angle = (anim.progress / 100) * 2 * Math.PI;

      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;

      // planète = orbite autour du soleil
      if (!parentOrbitObj) {
        orbitObj.body.style.transform = `translate(${x}px, ${y}px)`;
        orbitObj.current.x = x;
        orbitObj.current.y = y;
      }

      // lune = orbite autour d’une planète
      else {
        const px = parentOrbitObj.current.x;
        const py = parentOrbitObj.current.y;

        orbitObj.body.style.transform = `translate(${px + x}px, ${py + y}px)`;
        orbitObj.current.x = px + x;
        orbitObj.current.y = py + y;
      }
    }
  });

  orbitObj.anim = anim;
  planetOrbits.push(orbitObj);
  return orbitObj;
}

/* =========================================================
   🌍 PLANÈTES + ORBITES VISIBLES
   ========================================================= */
createOrbitRing(100); const mercury = createOrbit(document.querySelector(".mercury"), 100, 4000);
createOrbitRing(150); const venus   = createOrbit(document.querySelector(".venus"),   150, 7000);
createOrbitRing(210); const earth   = createOrbit(document.querySelector(".earth"),   210, 10000);
createOrbitRing(260); const mars    = createOrbit(document.querySelector(".mars"),    260, 13000);
createOrbitRing(330); const jupiter = createOrbit(document.querySelector(".jupiter"), 330, 20000);
createOrbitRing(400); const saturn  = createOrbit(document.querySelector(".saturn"),  400, 25000);
createOrbitRing(470); const uranus  = createOrbit(document.querySelector(".uranus"),  470, 30000);
createOrbitRing(540); const neptune = createOrbit(document.querySelector(".neptune"), 540, 35000);

/* =========================================================
   🌙 LUNES
   ========================================================= */

// ---- Terre ----
const moon = document.createElement("div");
moon.className = "moon";
space.appendChild(moon);
createOrbit(moon, 28, 2500, earth);

// ---- Mars ----
function addMoon(planetOrbit, size, distance, duration, className) {
  const m = document.createElement("div");
  m.className = className;
  m.style.width = size + "px";
  m.style.height = size + "px";
  space.appendChild(m);
  createOrbit(m, distance, duration, planetOrbit);
}

addMoon(mars, 5, 18, 1800, "phobos");
addMoon(mars, 5, 25, 2500, "deimos");

// ---- Jupiter : Io, Europe, Ganymède, Callisto ----
addMoon(jupiter, 6, 30, 2200, "io");
addMoon(jupiter, 6, 40, 3000, "europa");
addMoon(jupiter, 8, 52, 3800, "ganymede");
addMoon(jupiter, 7, 64, 4500, "callisto");

// ---- Saturne : Titan, Encelade ----
addMoon(saturn, 8, 35, 3500, "titan");
addMoon(saturn, 5, 24, 2000, "enceladus");

/* =========================================================
   🌟 ÉTOILES DÉCORATIVES
   ========================================================= */
for (let i = 0; i < 150; i++) {
  const star = document.createElement("div");
  star.className = "star";
  star.style.top = Math.random() * 100 + "%";
  star.style.left = Math.random() * 100 + "%";
  star.style.animationDuration = (2 + Math.random() * 4) + "s";
  space.appendChild(star);
}

/* =========================================================
   📘 INFOS + SONS
   ========================================================= */
const planetInfo = { /* identique, inchangé */ };
const planetName = document.getElementById("planet-name");
const planetText = document.getElementById("planet-info");

const planetSounds = { /* identique */ };

function playSound(n) {
  if (!soundEnabled) return;
  if (!planetSounds[n]) return;

  Object.values(planetSounds).forEach(a => { a.pause(); a.currentTime = 0; });
  planetSounds[n].play().catch(()=>{});
}

/* =========================================================
   🖱️ CLICS PLANÈTES
   ========================================================= */
planets.forEach(p => {
  p.addEventListener("click", () => {
    const name = p.dataset.name;
    planetName.textContent = name;
    planetText.innerHTML = planetInfo[name];
    playSound(name);
  });
});

sun.addEventListener("click", () => {
  planetName.textContent = "Soleil";
  planetText.innerHTML = planetInfo["Soleil"];
  playSound("Soleil");
});

/* =========================================================
   🎚️ VITESSE
   ========================================================= */
document.getElementById("speed-range").addEventListener("input", e => {
  globalSpeed = parseFloat(e.target.value);
  document.getElementById("speed-value").textContent = globalSpeed + "x";

  planetOrbits.forEach(o => {
    o.anim.duration = o.baseDuration / globalSpeed;
  });
});

/* =========================================================
   🔍 ZOOM + MOLETTE
   ========================================================= */
const zoomRange = document.getElementById("zoom-range");

zoomRange.addEventListener("input", e => {
  zoomLevel = parseFloat(e.target.value);
  space.style.transform = `scale(${zoomLevel})`;
  document.getElementById("zoom-value").textContent = zoomLevel + "x";
});

window.addEventListener("wheel", e => {
  e.preventDefault();
  zoomLevel += e.deltaY * -0.001;
  zoomLevel = Math.min(Math.max(0.5, zoomLevel), 2.5);

  space.style.transform = `scale(${zoomLevel})`;
  zoomRange.value = zoomLevel;
  document.getElementById("zoom-value").textContent = zoomLevel.toFixed(1) + "x";
}, { passive: false });

/* =========================================================
   ⏸️ BOUTONS
   ========================================================= */
document.getElementById("toggle-sound").addEventListener("click", function () {
  soundEnabled = !soundEnabled;
  this.textContent = soundEnabled ? "🔊 Son : ON" : "🔇 Son : OFF";

  if (!soundEnabled)
    Object.values(planetSounds).forEach(s => { s.pause(); s.currentTime = 0; });
});

document.getElementById("toggle-system").addEventListener("click", function () {
  systemPaused = !systemPaused;

  if (systemPaused) {
    planetOrbits.forEach(o => o.anim.pause());
    this.textContent = "▶ Reprendre système";
  } else {
    planetOrbits.forEach(o => o.anim.play());
    this.textContent = "⏸️ Pause système";
  }
});
