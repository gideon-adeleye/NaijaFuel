// ── FOOD DATABASE ─────────────────────────────────────────────────────────────
// All values are per 100g unless noted
const FOODS = [
  { name: "Jollof Rice",          cal: 148, protein: 3,  carbs: 28, fat: 3,  fiber: 1 },
  { name: "Fried Plantain",       cal: 150, protein: 1,  carbs: 30, fat: 4,  fiber: 2 },
  { name: "Egusi Soup",           cal: 210, protein: 9,  carbs: 6,  fat: 17, fiber: 3 },
  { name: "Pounded Yam",          cal: 118, protein: 1,  carbs: 27, fat: 0,  fiber: 1 },
  { name: "Efo Riro",             cal: 130, protein: 8,  carbs: 5,  fat: 9,  fiber: 3 },
  { name: "Moi Moi",              cal: 125, protein: 9,  carbs: 12, fat: 4,  fiber: 3 },
  { name: "Akara",                cal: 185, protein: 8,  carbs: 18, fat: 9,  fiber: 3 },
  { name: "Ofe Onugbu",           cal: 155, protein: 7,  carbs: 4,  fat: 12, fiber: 2 },
  { name: "Ofada Rice",           cal: 130, protein: 3,  carbs: 27, fat: 1,  fiber: 2 },
  { name: "Ogbono Soup",          cal: 190, protein: 8,  carbs: 5,  fat: 15, fiber: 4 },
  { name: "Suya (beef)",          cal: 200, protein: 22, carbs: 3,  fat: 11, fiber: 1 },
  { name: "Pepper Soup",          cal: 90,  protein: 14, carbs: 2,  fat: 3,  fiber: 1 },
  { name: "Eba (Garri)",          cal: 130, protein: 1,  carbs: 31, fat: 0,  fiber: 1 },
  { name: "Amala",                cal: 110, protein: 2,  carbs: 26, fat: 0,  fiber: 2 },
  { name: "Banga Soup",           cal: 175, protein: 5,  carbs: 6,  fat: 14, fiber: 3 },
  { name: "Afang Soup",           cal: 160, protein: 8,  carbs: 4,  fat: 13, fiber: 5 },
  { name: "Oha Soup",             cal: 140, protein: 7,  carbs: 4,  fat: 10, fiber: 4 },
  { name: "Nkwobi",               cal: 220, protein: 18, carbs: 2,  fat: 15, fiber: 1 },
  { name: "White Rice",           cal: 130, protein: 2,  carbs: 28, fat: 0,  fiber: 0 },
  { name: "Beans (brown)",        cal: 120, protein: 8,  carbs: 21, fat: 0,  fiber: 5 },
  { name: "Okra Soup",            cal: 100, protein: 5,  carbs: 6,  fat: 7,  fiber: 4 },
  { name: "Coconut Rice",         cal: 160, protein: 2,  carbs: 28, fat: 5,  fiber: 1 },
  { name: "Yam Porridge",         cal: 145, protein: 3,  carbs: 30, fat: 2,  fiber: 3 },
  { name: "Stewed Chicken",       cal: 165, protein: 24, carbs: 3,  fat: 7,  fiber: 1 },
  { name: "Fried Fish (tilapia)", cal: 175, protein: 21, carbs: 2,  fat: 9,  fiber: 0 },
  { name: "Boiled Yam",           cal: 118, protein: 2,  carbs: 27, fat: 0,  fiber: 2 },
  { name: "Plantain Porridge",    cal: 138, protein: 2,  carbs: 30, fat: 2,  fiber: 3 },
  { name: "Zobo Drink",           cal: 40,  protein: 0,  carbs: 10, fat: 0,  fiber: 0 },
  { name: "Kunu",                 cal: 60,  protein: 1,  carbs: 14, fat: 0,  fiber: 1 },
  { name: "Groundnut Soup",       cal: 195, protein: 9,  carbs: 6,  fat: 15, fiber: 3 },
];

// Quick-add chips shown in sidebar
const QUICK_FOODS = [
  "Jollof Rice", "Fried Plantain", "Egusi Soup", "Pounded Yam",
  "Suya (beef)", "Moi Moi", "Akara", "Pepper Soup", "Beans (brown)", "Zobo Drink"
];

// ── STATE ─────────────────────────────────────────────────────────────────────
let goal         = parseInt(localStorage.getItem('nf_goal') || '1500');
let log          = JSON.parse(localStorage.getItem('nf_log_' + todayKey()) || '[]');
let selectedFood = null;
let mode         = 'search';

// ── HELPERS ───────────────────────────────────────────────────────────────────
function todayKey() {
  return new Date().toISOString().split('T')[0];
}

function now() {
  return new Date().toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' });
}

function save() {
  localStorage.setItem('nf_log_' + todayKey(), JSON.stringify(log));
  localStorage.setItem('nf_goal', goal);
}

// ── INIT ──────────────────────────────────────────────────────────────────────
function init() {
  // Date display
  const date = new Date();
  document.getElementById('todayDate').textContent =
    date.toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'long' });

  // Goal input default
  document.getElementById('goalInput').value    = goal;
  document.getElementById('goalBarLabel').textContent = goal + ' kcal';

  buildChips();
  buildStreak();
  renderLog();
  renderHistory();
}

// ── MODE TOGGLE ───────────────────────────────────────────────────────────────
function setMode(m) {
  mode = m;
  document.getElementById('searchMode').style.display = m === 'search' ? 'block' : 'none';
  document.getElementById('manualMode').style.display  = m === 'manual' ? 'block' : 'none';
  document.querySelectorAll('.toggle-btn').forEach((btn, i) => {
    btn.classList.toggle('active', (i === 0 && m === 'search') || (i === 1 && m === 'manual'));
  });
}

// ── SEARCH ────────────────────────────────────────────────────────────────────
function filterFoods() {
  const query = document.getElementById('foodSearch').value.toLowerCase().trim();
  const box   = document.getElementById('searchResults');
  selectedFood = null;

  if (!query) { box.style.display = 'none'; return; }

  const matches = FOODS.filter(f => f.name.toLowerCase().includes(query)).slice(0, 6);
  if (!matches.length) { box.style.display = 'none'; return; }

  box.style.display = 'block';
  box.innerHTML = matches.map(f => `
    <div
      class="search-result-item"
      onclick="selectFood(${JSON.stringify(f).replace(/"/g, "'")})"
      onmouseenter="this.style.background='var(--border)'"
      onmouseleave="this.style.background=''">
      <span class="sri-name">${f.name}</span>
      <span class="sri-cal">${f.cal} kcal/100g</span>
    </div>
  `).join('');
}

function selectFood(f) {
  selectedFood = f;
  document.getElementById('foodSearch').value      = f.name;
  document.getElementById('searchResults').style.display = 'none';
}

function addFromSearch() {
  if (!selectedFood) { toast('Select a food first', true); return; }

  const grams = parseFloat(document.getElementById('searchGrams').value) || 100;
  const ratio = grams / 100;

  addEntry({
    id:      Date.now(),
    name:    selectedFood.name,
    grams,
    cal:     Math.round(selectedFood.cal     * ratio),
    protein: Math.round(selectedFood.protein * ratio),
    carbs:   Math.round(selectedFood.carbs   * ratio),
    fat:     Math.round(selectedFood.fat     * ratio),
    fiber:   Math.round(selectedFood.fiber   * ratio),
    time:    now(),
  });

  document.getElementById('foodSearch').value  = '';
  document.getElementById('searchGrams').value = '100';
  selectedFood = null;
}

// ── MANUAL ENTRY ──────────────────────────────────────────────────────────────
function addManual() {
  const name    = document.getElementById('manualName').value.trim();
  const cal     = parseFloat(document.getElementById('manualCal').value)     || 0;
  const protein = parseFloat(document.getElementById('manualProtein').value) || 0;
  const carbs   = parseFloat(document.getElementById('manualCarbs').value)   || 0;
  const fat     = parseFloat(document.getElementById('manualFat').value)     || 0;
  const fiber   = parseFloat(document.getElementById('manualFiber').value)   || 0;
  const grams   = parseFloat(document.getElementById('manualGrams').value)   || 100;

  if (!name) { toast('Enter a food name', true); return; }
  if (!cal)  { toast('Enter calories', true);    return; }

  addEntry({ id: Date.now(), name, grams, cal, protein, carbs, fat, fiber, time: now() });

  ['manualName','manualCal','manualProtein','manualCarbs','manualFat','manualFiber'].forEach(id => {
    document.getElementById(id).value = '';
  });
  document.getElementById('manualGrams').value = '100';
}

// ── QUICK CHIPS ───────────────────────────────────────────────────────────────
function buildChips() {
  document.getElementById('chipList').innerHTML = QUICK_FOODS.map(name => {
    const f = FOODS.find(x => x.name === name);
    return `<div class="chip" onclick="quickAdd('${name}')">${name} <span style="color:var(--accent)">${f.cal}</span></div>`;
  }).join('');
}

function quickAdd(name) {
  const f = FOODS.find(x => x.name === name);
  if (!f) return;
  addEntry({
    id: Date.now(), name: f.name, grams: 100,
    cal: f.cal, protein: f.protein, carbs: f.carbs, fat: f.fat, fiber: f.fiber,
    time: now(),
  });
}

// ── CORE: ADD / DELETE / CLEAR ────────────────────────────────────────────────
function addEntry(entry) {
  log.push(entry);
  save();
  renderLog();
  buildStreak();
  toast(`${entry.name} — ${entry.cal} kcal added`);
}

function deleteEntry(id) {
  log = log.filter(e => e.id !== id);
  save();
  renderLog();
}

function clearLog() {
  if (!log.length) return;
  archiveToday();
  log = [];
  save();
  renderLog();
  renderHistory();
  buildStreak();
}

// ── RENDER LOG ────────────────────────────────────────────────────────────────
function renderLog() {
  const list = document.getElementById('logList');

  if (!log.length) {
    list.innerHTML = '<div class="log-empty">No food logged yet. Start tracking your meal.</div>';
    updateStats(0, 0, 0, 0);
    return;
  }

  const totCal     = log.reduce((s, e) => s + e.cal,     0);
  const totProtein = log.reduce((s, e) => s + e.protein, 0);
  const totCarbs   = log.reduce((s, e) => s + e.carbs,   0);
  const totFat     = log.reduce((s, e) => s + e.fat,     0);

  list.innerHTML = log.map(e => `
    <div class="log-item">
      <div style="flex:1">
        <div class="log-item-name">${e.name}</div>
        <div class="log-item-macros">${e.grams}g · P:${e.protein}g C:${e.carbs}g F:${e.fat}g</div>
      </div>
      <div style="text-align:right">
        <div class="log-item-cal">${e.cal}        <div class="log-item-time">${e.time}</div>
      </div>
      <button class="log-item-del" onclick="deleteEntry(${e.id})">×</button>
    </div>
  `).join('');

  updateStats(totCal, totProtein, totCarbs, totFat);
}

// ── UPDATE STATS (ring, macros, bar) ──────────────────────────────────────────
function updateStats(cal, protein, carbs, fat) {
  const CIRCUMFERENCE = 477.5;
  const pct           = Math.min(cal / goal, 1);
  const isOver        = cal > goal;

  document.getElementById('ringCal').textContent = cal;
  const ring = document.getElementById('ringFill');
  ring.style.strokeDashoffset = CIRCUMFERENCE - pct * CIRCUMFERENCE;
  ring.style.stroke = isOver ? 'var(--red)' : 'url(#ringGrad)';

  const remain = goal - cal;
  document.getElementById('ringRemaining').innerHTML = isOver
    ? `<strong style="color:var(--red)">${Math.abs(remain)}</strong> <span style="color:var(--red)">kcal over goal</span>`
    : `<strong>${remain}</strong> kcal remaining`;

  document.getElementById('totalProtein').textContent = protein + 'g';
  document.getElementById('totalCarbs').textContent   = carbs   + 'g';
  document.getElementById('totalFat').textContent     = fat     + 'g';

  const bar = document.getElementById('goalBar');
  bar.style.width = Math.min((cal / goal) * 100, 100) + '%';
  bar.classList.toggle('over', isOver);
}

// ── GOAL ──────────────────────────────────────────────────────────────────────
function setGoal() {
  const v = parseInt(document.getElementById('goalInput').value);
  if (v < 500 || v > 5000) { toast('Goal must be between 500–5000 kcal', true); return; }
  goal = v;
  document.getElementById('goalBarLabel').textContent = goal + ' kcal';
  save();
  renderLog();
  toast('Goal updated to ' + goal + ' kcal');
}

// ── STREAK ────────────────────────────────────────────────────────────────────
function buildStreak() {
  const row     = document.getElementById('streakRow');
  const today   = todayKey();
  const history = JSON.parse(localStorage.getItem('nf_history') || '[]');
  row.innerHTML = '';
  for (let i = 6; i >= 0; i--) {
    const d   = new Date();
    d.setDate(d.getDate() - i);
    const key     = d.toISOString().split('T')[0];
    const isToday = key === today;
    const logged  = history.some(h => h.date === key) || (isToday && log.length > 0);
    const label   = d.toLocaleDateString('en-NG', { weekday: 'narrow' });
    const dot = document.createElement('div');
    dot.className = ['streak-dot', logged ? 'logged' : '', isToday ? 'today' : ''].join(' ').trim();
    dot.textContent = label;
    dot.title = key;
    row.appendChild(dot);
  }
}

// ── HISTORY ───────────────────────────────────────────────────────────────────
function archiveToday() {
  if (!log.length) return;
  const hist     = JSON.parse(localStorage.getItem('nf_history') || '[]');
  const key      = todayKey();
  const cal      = log.reduce((s, e) => s + e.cal, 0);
  const entry    = { date: key, cal, items: log.length };
  const existing = hist.findIndex(h => h.date === key);
  if (existing > -1) hist[existing] = entry;
  else hist.unshift(entry);
  localStorage.setItem('nf_history', JSON.stringify(hist.slice(0, 30)));
}

function renderHistory() {
  const hist = JSON.parse(localStorage.getItem('nf_history') || '[]');
  const list = document.getElementById('historyList');
  if (!hist.length) {
    list.innerHTML = '<div class="history-empty">No history yet</div>';
    return;
  }
  list.innerHTML = hist.slice(0, 7).map(h => `
    <div class="history-day">
      <div>
        <div>${h.items} item${h.items !== 1 ? 's' : ''}</div>
        <div class="hd-date">${new Date(h.date + 'T12:00:00').toLocaleDateString('en-NG', { weekday:'short', day:'numeric', month:'short' })}</div>
      </div>
      <div class="hd-cal">${h.cal} kcal</div>
    </div>
  `).join('');
}

// ── TOAST ─────────────────────────────────────────────────────────────────────
function toast(msg, isError = false) {
  const t = document.getElementById('toast');
  t.textContent      = msg;
  t.style.background = isError ? 'var(--red)' : 'var(--green)';
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

// ── KEYBOARD SHORTCUTS ────────────────────────────────────────────────────────
document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && mode === 'search') addFromSearch();
  if (e.key === 'Enter' && mode === 'manual') addManual();
  if (e.key === 'Escape') document.getElementById('searchResults').style.display = 'none';
});

// ── ARCHIVE ON PAGE CLOSE ─────────────────────────────────────────────────────
window.addEventListener('beforeunload', () => {
  if (log.length) archiveToday();
});

// ── SEARCH RESULT ITEM STYLES (JS-generated elements) ─────────────────────────
const srStyle = document.createElement('style');
srStyle.textContent = `
  .search-result-item {
    padding: 0.6rem 0.9rem;
    cursor: pointer;
    font-size: 0.8rem;
    border-bottom: 1px solid var(--border);
    transition: background 0.15s;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .search-result-item:last-child { border-bottom: none; }
  .sri-name { font-weight: 600; }
  .sri-cal  { color: var(--muted); font-size: 0.7rem; }
`;
document.head.appendChild(srStyle);

// ── START ─────────────────────────────────────────────────────────────────────
init();