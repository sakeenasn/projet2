// script.js - version complète corrigée & commentée
// Dépendances : anime.js (v3) chargé dans ton HTML

/* -----------------------------
   Sélections DOM
   ----------------------------- */
const planets = document.querySelectorAll('.planet');
const sun = document.querySelector('.sun');
const space = document.querySelector('.space');

const planetName = document.getElementById('planet-name');
const planetText = document.getElementById('planet-info');

const speedRange = document.getElementById('speed-range');
const speedValue = document.getElementById('speed-value');
const zoomRange = document.getElementById('zoom-range');
const zoomValue = document.getElementById('zoom-value');

const toggleSoundBtn = document.getElementById('toggle-sound');
const toggleSystemBtn = document.getElementById('toggle-system');

/* -----------------------------
   Données (infos + sons)
   ----------------------------- */
const planetInfo = {
  "Soleil": `⭐ <b>Type :</b> Étoile naine jaune (G2V)<br>🌡️ <b>Température surface :</b> 5 500 °C<br>⚡ <b>Âge :</b> 4,6 milliards d'années<br>💥 <b>Rôle :</b> Source d'énergie et de gravité du système solaire`,
  "Mercure": `🟠 <b>Distance du Soleil :</b> 58 millions km<br>⏱️ <b>Année :</b> 88 jours terrestres<br>🌡️ <b>Température :</b> -180°C à +430°C<br>🧱 <b>Composition :</b> Roche métallique`,
  "Vénus": `💨 <b>Distance du Soleil :</b> 108 millions km<br>⏱️ <b>Année :</b> 225 jours terrestres<br>🌫️ <b>Atmosphère :</b> CO₂ et nuages d'acide sulfurique<br>🌡️ <b>Température moyenne :</b> 465°C`,
  "Terre": `🌍 <b>Distance du Soleil :</b> 150 millions km<br>⏱️ <b>Année :</b> 365 jours<br>🌡️ <b>Température moyenne :</b> 15°C<br>💧 <b>Spécificité :</b> Présence d'eau liquide et de vie<br>🌙 <b>La lune :</b> Satellite naturel de la Terre`,
  "Mars": `🔴 <b>Distance du Soleil :</b> 228 millions km<br>⏱️ <b>Année :</b> 687 jours terrestres<br>🌡️ <b>Température moyenne :</b> -60°C<br>🧱 <b>Surface :</b> poussière de fer rougeâtre, calottes de glace`,
  "Jupiter": `🌕 <b>Distance du Soleil :</b> 778 millions km<br>⏱️ <b>Année :</b> 12 ans terrestres<br>💨 <b>Atmosphère :</b> Hydrogène et hélium<br>⚡ <b>Particularité :</b> La plus grande planète, grande tache rouge`,
  "Saturne": `❄️ <b>Distance du Soleil :</b> 1,4 milliard km<br>⏱️ <b>Année :</b> 29 ans terrestres<br>💠 <b>Anneaux :</b> Glace et poussière<br>🌡️ <b>Température :</b> -140°C`,
  "Uranus": `💎 <b>Distance du Soleil :</b> 2,9 milliards km<br>⏱️ <b>Année :</b> 84 ans terrestres<br>🌀 <b>Inclinaison :</b> 98° sur le côté<br>🌡️ <b>Température :</b> -195°C`,
  "Neptune": `🌊 <b>Distance du Soleil :</b> 4,5 milliards km<br>⏱️ <b>Année :</b> 165 ans terrestres<br>💨 <b>Vents :</b> > 2 000 km/h<br>🌡️ <b>Température :</b> -200°C`
};

// Chemins audio (mets tes fichiers dans le dossier ou adapte le chemin)
const planetSounds = {
  "Soleil": new Audio("sun.mp3"),
  "Mercure": new Audio("mercury.mp3"),
  "Vénus": new Audio("venus.mp3"),
  "Terre": new Audio("earth.mp3"),
  "Mars": new Audio("mars.mp3"),
  "Jupiter": new Audio("jupiter.mp3"),
  "Saturne": new Audio("saturn.mp3"),
  "Uranus": new Audio("uranus.mp3"),
  "Neptune": new Audio("neptune.mp3")
};

/* -----------------------------
   État global
   ----------------------------- */
let globalSpeed = parseFloat(speedRange?.value || 1); // multiplicateur de vitesse
let zoomLevel = parseFloat(zoomRange?.value || 1);

let soundEnabled = true;
let systemPaused = false;
let audioUnlocked = false;

/* -----------------------------
   Gestion des étoiles (fond)
   ----------------------------- */
function createStars(count = 150) {
  // supprime les anciennes si besoin
  const existing = space.querySelectorAll('.star');
  if (existing.length) existing.forEach(s => s.remove());

  for (let i = 0; i < count; i++) {
    const star = document.createElement("div");
    star.className = "star";
    star.style.top = Math.random() * 100 + "%";
    star.style.left = Math.random() * 100 + "%";
    star.style.opacity = (0.2 + Math.random() * 0.8).toFixed(2);
    star.style.animationDuration = (1.5 + Math.random() * 4) + "s";
    star.style.transform = `scale(${0.6 + Math.random() * 1.4})`;
    space.appendChild(star);
  }
}
createStars(180);

/* -----------------------------
   Gestion des orbites (wrapper JS)
   Chaque entrée contiendra :
     { name, planet, distance, baseDuration, anim, current: {x,y} }
   ----------------------------- */
const planetOrbits = [];

/**
 * createOrbitObject(name, selector, distance, baseDuration)
 * - name : nom tel qu'utilisé dans data-name (ex: "Terre")
 * - selector : élément DOM (la div .planet)
 * - distance : distance en pixels depuis le centre
 * - baseDuration : durée en ms pour 1x speed
 */
function createOrbitObject(name, element, distance, baseDuration) {
  const obj = {
    name,
    planet: element,
    distance,
    baseDuration,
    anim: null,
    current: { x: 0, y: 0 }
  };
  planetOrbits.push(obj);
  // Création de l'animation initiale
  createOrbitAnim(obj);
  // Ajout d'une orbite visible (CSS) derrière la planète
  const orbitEl = document.createElement('div');
  orbitEl.className = 'orbit';
  orbitEl.style.width = `${distance * 2}px`;
  orbitEl.style.height = `${distance * 2}px`;
  orbitEl.style.marginLeft = `-${distance}px`;
  orbitEl.style.marginTop = `-${distance}px`;
  orbitEl.style.zIndex = 0;
  space.appendChild(orbitEl);
  return obj;
}

/**
 * createOrbitAnim(obj)
 * (re)crée et attache l'animation anime.js à l'objet
 */
function createOrbitAnim(obj) {
  // Si une anim existe, on la stoppe proprement
  if (obj.anim) {
    try { obj.anim.pause(); } catch (e) {}
    obj.anim = null;
  }

  // Crée une nouvelle animation qui met à jour la position via update()
  const duration = Math.max(50, Math.round(obj.baseDuration / globalSpeed));
  obj.anim = anime({
    targets: obj.planet,
    duration,
    easing: 'linear',
    loop: true,
    autoplay: true,
    // onBegin/onLoop ne nous suffiraient pas (on veut update progress)
    update: (anim) => {
      // anim.progress = 0..100
      const angle = (anim.progress / 100) * 2 * Math.PI;
      const x = Math.cos(angle) * obj.distance;
      const y = Math.sin(angle) * obj.distance;
      obj.current.x = x;
      obj.current.y = y;
      // translate relative to center; we offset by half of the planet size so it visually centers
      obj.planet.style.transform = `translate(${x}px, ${y}px)`;
    }
  });

  // Si le système est en pause, mettre la nouvelle animation en pause aussi
  if (systemPaused) obj.anim.pause();
}

/* -----------------------------
   Création des orbites pour chaque planète
   distances et durées sensées (en pixels / ms)
   ----------------------------- */
createOrbitObject("Mercure", document.querySelector('.mercury'), 100, 4000);
createOrbitObject("Vénus",   document.querySelector('.venus'),   150, 7000);
createOrbitObject("Terre",   document.querySelector('.earth'),   210, 10000);
createOrbitObject("Mars",    document.querySelector('.mars'),    260, 13000);
createOrbitObject("Jupiter", document.querySelector('.jupiter'), 330, 20000);
createOrbitObject("Saturne", document.querySelector('.saturn'),  400, 25000);
createOrbitObject("Uranus",  document.querySelector('.uranus'),  470, 30000);
createOrbitObject("Neptune", document.querySelector('.neptune'), 540, 35000);

/* -----------------------------
   Lune : créée dans l'espace (même système de coordonnées que les planètes).
   On ne l'attache PAS à .earth pour éviter les conflits de transform.
   ----------------------------- */
const moon = document.createElement('div');
moon.className = 'moon';
space.appendChild(moon);

const moonSettings = {
  distance: 28,   // distance de la lune à la Terre (en px)
  baseDuration: 2500,
  anim: null
};

function createMoonAnim() {
  if (moonSettings.anim) {
    try { moonSettings.anim.pause(); } catch (e) {}
    moonSettings.anim = null;
  }

  const duration = Math.max(50, Math.round(moonSettings.baseDuration / globalSpeed));
  moonSettings.anim = anime({
    targets: moon,
    duration,
    loop: true,
    easing: 'linear',
    autoplay: true,
    update: (anim) => {
      const angle = (anim.progress / 100) * 2 * Math.PI;
      const mx = Math.cos(angle) * moonSettings.distance;
      const my = Math.sin(angle) * moonSettings.distance;

      // Récupère la position actuelle de la Terre dans planetOrbits
      const earthObj = planetOrbits.find(o => o.name === 'Terre');
      if (earthObj) {
        const ex = earthObj.current.x;
        const ey = earthObj.current.y;
        moon.style.transform = `translate(${ex + mx}px, ${ey + my}px)`;
      }
    }
  });

  if (systemPaused) moonSettings.anim.pause();
}
createMoonAnim();

/* -----------------------------
   Mettre à jour toutes les animations quand la vitesse change
   (on recrée chaque anim proprement)
   ----------------------------- */
function updateAllAnimationsForSpeed() {
  planetOrbits.forEach(obj => createOrbitAnim(obj));
  createMoonAnim();
}

/* -----------------------------
   Fonctions audio
   ----------------------------- */
function unlockAudio() {
  if (audioUnlocked) return;
  audioUnlocked = true;
  Object.values(planetSounds).forEach(s => {
    // essayer de jouer/pause pour débloquer iOS
    s.play().catch(()=>{}); 
    s.pause();
    s.currentTime = 0;
  });
  console.log("Audio débloqué");
}

window.addEventListener("touchstart", unlockAudio, { once: true });
window.addEventListener("click", unlockAudio, { once: true });

function stopAllSounds() {
  Object.values(planetSounds).forEach(s => {
    try { s.pause(); s.currentTime = 0; } catch (e) {}
  });
}

/**
 * playSound(name)
 * - respecte soundEnabled
 */
function playSound(name) {
  if (!soundEnabled) return;
  const s = planetSounds[name];
  if (!s) return;
  stopAllSounds();
  s.play().catch(e => console.warn("Impossible de jouer le son :", e));
}

/* -----------------------------
   Interactions utilisateur (clics, sliders, boutons)
   ----------------------------- */

// Clic sur chaque planète : affiche infos + joue son
planets.forEach(p => {
  p.addEventListener('click', (ev) => {
    const name = p.dataset.name;
    planetName.textContent = name;
    planetText.innerHTML = planetInfo[name] || "Aucune information disponible.";
    playSound(name);
  });
});

// Soleil : affiche infos + son
sun.addEventListener('click', () => {
  planetName.textContent = "Soleil";
  planetText.innerHTML = planetInfo["Soleil"];
  playSound("Soleil");
});

// Slider vitesse
if (speedRange) {
  speedRange.addEventListener('input', (e) => {
    globalSpeed = parseFloat(e.target.value);
    speedValue.textContent = globalSpeed.toFixed(1) + "x";
    updateAllAnimationsForSpeed();
  });
  // init affichage
  speedValue.textContent = globalSpeed.toFixed(1) + "x";
}

// Slider zoom
if (zoomRange) {
  zoomRange.addEventListener('input', (e) => {
    zoomLevel = parseFloat(e.target.value);
    zoomValue.textContent = zoomLevel.toFixed(1) + "x";
    space.style.transform = `scale(${zoomLevel})`;
  });
  zoomValue.textContent = zoomLevel.toFixed(1) + "x";
}

// Zoom à la molette
window.addEventListener('wheel', (e) => {
  e.preventDefault();
  zoomLevel += e.deltaY * -0.001;
  zoomLevel = Math.min(Math.max(0.5, zoomLevel), 2.5);
  space.style.transform = `scale(${zoomLevel})`;
  if (zoomRange) zoomRange.value = zoomLevel;
  if (zoomValue) zoomValue.textContent = zoomLevel.toFixed(1) + "x";
}, { passive: false });

// Bouton son ON/OFF
toggleSoundBtn.addEventListener('click', () => {
  soundEnabled = !soundEnabled;
  toggleSoundBtn.textContent = soundEnabled ? "🔊 Son : ON" : "🔇 Son : OFF";
  toggleSoundBtn.classList.toggle('off', !soundEnabled);

  if (!soundEnabled) stopAllSounds();
});

// Bouton pause/reprendre le système
toggleSystemBtn.addEventListener('click', () => {
  systemPaused = !systemPaused;

  if (systemPaused) {
    // Pause toutes les anims
    planetOrbits.forEach(o => { if (o.anim) try { o.anim.pause(); } catch (e){} });
    if (moonSettings.anim) try { moonSettings.anim.pause(); } catch (e){}
    toggleSystemBtn.textContent = "▶ Reprendre système";
    toggleSystemBtn.classList.add('paused');
  } else {
    // Reprend (si on a recréé des animations lors du changement de speed, elles sont créées en paused=false)
    planetOrbits.forEach(o => { if (o.anim) try { o.anim.play(); } catch (e){} else createOrbitAnim(o) });
    if (moonSettings.anim) try { moonSettings.anim.play(); } catch (e){} else createMoonAnim();
    toggleSystemBtn.textContent = "⏸️ Pause système";
    toggleSystemBtn.classList.remove('paused');
  }
});

/* -----------------------------
   Détection / affichage initial
   ----------------------------- */
planetName.textContent = "Clique sur un astre 🌍";
planetText.textContent = "Découvre les planètes en cliquant dessus !";

/* -----------------------------
   Utilitaires : reposition initial (optionnel)
   - On place instantanément chaque planète au point initial (angle 0)
   ----------------------------- */
function placePlanetsAtStart() {
  planetOrbits.forEach(o => {
    const x = Math.cos(0) * o.distance;
    const y = Math.sin(0) * o.distance;
    o.current.x = x;
    o.current.y = y;
    o.planet.style.transform = `translate(${x}px, ${y}px)`;
  });

  // position lune initiale
  const earthObj = planetOrbits.find(o => o.name === 'Terre');
  if (earthObj) {
    const mx = moonSettings.distance;
    moon.style.transform = `translate(${earthObj.current.x + mx}px, ${earthObj.current.y}px)`;
  }
}
placePlanetsAtStart();

/* -----------------------------
   Petit helper pour debug (optionnel)
   ----------------------------- */
window.__planetOrbits = planetOrbits;
window.__moonSettings = moonSettings;
window.__recreateAnims = updateAllAnimationsForSpeed;

console.log("Système solaire initialisé ✅");
