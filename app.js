const $$ = document.querySelectorAll.bind(document)

const PANELS = {}

for (const $article of $$('article')) {
  const articleId = $article.getAttribute('id')
  const [id, lang] = articleId.split('-')
  if (!lang) {
    continue;
  }
  if (!PANELS[id]) {
    const marker = MARKERS.find(m => m.id == id)
    if (! marker) {
      continue;
    }
    PANELS[id] = {level: marker.level}
  }
  PANELS[id][lang] = {
    title: $article.querySelector('h2')?.innerHTML ?? '',
    badge: $article.querySelector('.badge')?.innerHTML ?? '',
    subtitle: $article.querySelector('.subtitle')?.innerHTML ?? '',
    body: $article.querySelector('.body')?.innerHTML ?? ''
  }
}

const MAP_VIEWS = {
  global:   { center:[10,20],    zoom:1.8,  pitch:20, bearing:0 },
  national: { center:[10.5,51.2],zoom:5.2,  pitch:30, bearing:-5 },
  local:    { center:[9.93,53.55],zoom:11.5,pitch:40, bearing:10 },
};

// ═══════════════════════════════════════════════════════════════════════════
// State & Init
// ═══════════════════════════════════════════════════════════════════════════
let map = null;
let currentLevel = 'global';
let currentLang  = 'de';
let panelOpen    = false;
let markerObjects = [];
let currentPanelId = null;

function startPresentation() {
  document.getElementById('intro-overlay').classList.add('hidden');
  setTimeout(initMap, 300);
}

function initMap() {
  map = new maplibregl.Map({
    container:'map',
    style:'https://tiles.openfreemap.org/styles/positron',
    center:MAP_VIEWS.global.center, zoom:MAP_VIEWS.global.zoom,
    pitch:MAP_VIEWS.global.pitch,   bearing:MAP_VIEWS.global.bearing,
    attributionControl:true
  });
  map.addControl(new maplibregl.NavigationControl({showCompass:false}),'top-right');
  map.on('load', () => { addMarkers(); setLevel('global', false); });
  map.on('mousedown', () => document.getElementById('hint-pill').classList.add('hidden'));
}

function addMarkers() {
  MARKERS.forEach(m => {
    const p = PANELS[m.id];
    if (!p) return;
    const el = document.createElement('button');
    el.className = `map-marker ${m.level}${m.hq?' hq':''}`;
    el.setAttribute('aria-label', m.id);

    const marker = new maplibregl.Marker({element:el, anchor:'center'})
      .setLngLat([m.lng, m.lat]).addTo(map);

    el.addEventListener('click', (e) => {
      e.stopPropagation();
      map.flyTo({center:[m.lng, m.lat], zoom:Math.max(map.getZoom(),4), speed:1.2});
      openPanel(m.id);
    });
    markerObjects.push({marker, data:m});
  });
}

function setLevel(level, animate=true) {
  currentLevel = level;
  const v = MAP_VIEWS[level];
  if (map && animate) {
    map.flyTo({center:v.center,zoom:v.zoom,pitch:v.pitch,bearing:v.bearing,duration:1800,essential:true});
  } else if (map) {
    map.jumpTo({center:v.center,zoom:v.zoom,pitch:v.pitch,bearing:v.bearing});
  }
  // Pills
  document.querySelectorAll('.level-pill').forEach(p=>p.classList.remove('active'));
  const pills = document.querySelectorAll('.level-pill');
  const idx = ['global','national','local'].indexOf(level);
  if (pills[idx]) { pills[idx].classList.add('active'); pills[idx].setAttribute('aria-selected','true'); }
  pills.forEach((p,i) => { if(i!==idx) p.setAttribute('aria-selected','false'); });
  // Breadcrumb
  ['global','national','local'].forEach(l => {
    const bc = document.getElementById(`bc-${l}`);
    if (bc) bc.classList.toggle('active', l===level);
  });
  // Marker visibility
  markerObjects.forEach(({marker,data}) => {
    const el = marker.getElement();
    if (level==='global') el.style.display='';
    else if (level==='national') el.style.display=(data.level==='national'||data.level==='local')?'':'none';
    else el.style.display=data.level==='local'?'':'none';
  });
  // Open level overview panel after short delay
  const overviewMap = {global:'icrc', national:'drk_berlin', local:'hamburg'};
  setTimeout(() => openPanel(overviewMap[level]), animate ? 500 : 0);
}

function openPanel(panelId) {
  const p = PANELS[panelId];
  if (!p) return;
  currentPanelId = panelId;
  const lang = currentLang;
  const data = p[lang];
  document.getElementById('panel-badge').textContent = data.badge;
  document.getElementById('panel-badge').className = `panel-level-badge ${p.level}`;
  document.getElementById('panel-title').innerHTML = data.title;
  document.getElementById('panel-subtitle').textContent = data.subtitle;
  document.getElementById('panel-body').innerHTML = data.body;
  document.getElementById('info-panel').classList.add('open');
  document.getElementById('info-panel').setAttribute('aria-hidden','false');
  document.getElementById('overlay-backdrop').classList.add('active');
  panelOpen = true;
}

function closePanel() {
  document.getElementById('info-panel').classList.remove('open');
  document.getElementById('info-panel').setAttribute('aria-hidden','true');
  document.getElementById('overlay-backdrop').classList.remove('active');
  panelOpen = false;
}

// ═══════════════════════════════════════════════════════════════════════════
// i18n — apply translations
// ═══════════════════════════════════════════════════════════════════════════
function applyTranslations(lang) {
  const t = T[lang];
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (t[key] !== undefined) el.textContent = t[key];
  });
  document.documentElement.setAttribute('lang', lang);
  // If panel is open, refresh it
  if (panelOpen && currentPanelId) openPanel(currentPanelId);
}

function toggleLang() {
  currentLang = currentLang === 'de' ? 'en' : 'de';
  document.getElementById('lang-label').textContent = currentLang === 'de' ? 'EN' : 'DE';
  document.documentElement.setAttribute('data-lang', currentLang);
  applyTranslations(currentLang);
}

// ═══════════════════════════════════════════════════════════════════════════
// Dark mode
// ═══════════════════════════════════════════════════════════════════════════
(function() {
  const toggle = document.querySelector('[data-theme-toggle]');
  const root   = document.documentElement;
  let theme = matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light';
  root.setAttribute('data-theme', theme);
  update(toggle, theme);
  if (toggle) toggle.addEventListener('click', () => {
    theme = theme==='dark'?'light':'dark';
    root.setAttribute('data-theme', theme);
    update(toggle, theme);
  });
  function update(btn, t) {
    if (!btn) return;
    btn.innerHTML = t==='dark'
      ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>'
      : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
  }
})();

// Keyboard
document.addEventListener('keydown', e => { if (e.key==='Escape' && panelOpen) closePanel(); });
