// === CONFIGURACIÓN DE FORMACIONES ===
const FORMATIONS = {
    '3-3-1': [
        { id: 0, x: 50, y: 90, role: 'GK' },
        { id: 1, x: 20, y: 75, role: 'DEF' }, { id: 2, x: 50, y: 75, role: 'DEF' }, { id: 3, x: 80, y: 75, role: 'DEF' },
        { id: 4, x: 20, y: 50, role: 'MED' }, { id: 5, x: 50, y: 50, role: 'MED' }, { id: 6, x: 80, y: 50, role: 'MED' },
        { id: 7, x: 50, y: 25, role: 'DEL' }
    ],
    '4-2-1': [
        { id: 0, x: 50, y: 90, role: 'GK' },
        { id: 1, x: 15, y: 75, role: 'DEF' }, { id: 2, x: 38, y: 75, role: 'DEF' }, { id: 3, x: 62, y: 75, role: 'DEF' }, { id: 6, x: 85, y: 75, role: 'DEF' }, // 4 defensas
        { id: 4, x: 35, y: 45, role: 'MED' }, { id: 5, x: 65, y: 45, role: 'MED' }, // 2 medios
        { id: 7, x: 50, y: 20, role: 'DEL' } // 1 punta
    ],
    '2-3-2': [
        { id: 0, x: 50, y: 90, role: 'GK' },
        { id: 1, x: 30, y: 75, role: 'DEF' }, { id: 3, x: 70, y: 75, role: 'DEF' }, // 2 defensas
        { id: 2, x: 50, y: 50, role: 'MED' }, { id: 4, x: 20, y: 50, role: 'MED' }, { id: 5, x: 80, y: 50, role: 'MED' }, // 3 medios
        { id: 6, x: 35, y: 25, role: 'DEL' }, { id: 7, x: 65, y: 25, role: 'DEL' } // 2 puntas
    ],
    '3-2-2': [
        { id: 0, x: 50, y: 90, role: 'GK' },
        { id: 1, x: 20, y: 75, role: 'DEF' }, { id: 2, x: 50, y: 75, role: 'DEF' }, { id: 3, x: 80, y: 75, role: 'DEF' },
        { id: 4, x: 35, y: 50, role: 'MED' }, { id: 5, x: 65, y: 50, role: 'MED' },
        { id: 6, x: 35, y: 25, role: 'DEL' }, { id: 7, x: 65, y: 25, role: 'DEL' }
    ],
    '2-4-1': [
        { id: 0, x: 50, y: 90, role: 'GK' },
        { id: 1, x: 30, y: 75, role: 'DEF' }, { id: 2, x: 70, y: 75, role: 'DEF' },
        { id: 3, x: 15, y: 50, role: 'MED' }, { id: 4, x: 38, y: 50, role: 'MED' }, { id: 5, x: 62, y: 50, role: 'MED' }, { id: 6, x: 85, y: 50, role: 'MED' },
        { id: 7, x: 50, y: 25, role: 'DEL' }
    ],
    '3-4-0': [
        { id: 0, x: 50, y: 90, role: 'GK' },
        { id: 1, x: 20, y: 75, role: 'DEF' }, { id: 2, x: 50, y: 75, role: 'DEF' }, { id: 3, x: 80, y: 75, role: 'DEF' },
        { id: 4, x: 15, y: 40, role: 'MED' }, { id: 5, x: 38, y: 40, role: 'MED' }, { id: 6, x: 62, y: 40, role: 'MED' }, { id: 7, x: 85, y: 40, role: 'MED' }
    ],
    '4-3-0': [
        { id: 0, x: 50, y: 90, role: 'GK' },
        { id: 1, x: 15, y: 75, role: 'DEF' }, { id: 2, x: 38, y: 75, role: 'DEF' }, { id: 3, x: 62, y: 75, role: 'DEF' }, { id: 6, x: 85, y: 75, role: 'DEF' },
        { id: 4, x: 20, y: 45, role: 'MED' }, { id: 5, x: 50, y: 45, role: 'MED' }, { id: 7, x: 80, y: 45, role: 'MED' }
    ]
};

let currentFormationKey = '3-3-1';

let SQUAD = [
    { id: 1, number: "1", name: "Jorge", role: "GK", calledUp: true },
    { id: 2, number: "2", name: "Gabriel", role: "FIELD", calledUp: true },
    { id: 3, number: "3", name: "Héctor", role: "FIELD", calledUp: true },
    { id: 4, number: "4", name: "Nicolás", role: "FIELD", calledUp: true },
    { id: 5, number: "5", name: "Hugo", role: "FIELD", calledUp: true },
    { id: 6, number: "6", name: "Leon", role: "FIELD", calledUp: true },
    { id: 7, number: "7", name: "Rubén", role: "FIELD", calledUp: true },
    { id: 8, number: "8", name: "Marc", role: "FIELD", calledUp: true },
    { id: 9, number: "9", name: "Angel", role: "FIELD", calledUp: true },
    { id: 10, number: "10", name: "Martín", role: "FIELD", calledUp: true },
    { id: 11, number: "12", name: "Álex", role: "FIELD", calledUp: true },
    { id: 12, number: "15", name: "Moises", role: "FIELD", calledUp: true },
    { id: 13, number: "16", name: "Imram", role: "FIELD", calledUp: true },
    { id: 14, number: "20", name: "Collado", role: "FIELD", calledUp: true },
    { id: 15, number: "22", name: "Carlos", role: "FIELD", calledUp: true },
    { id: 16, number: "98", name: "Valentino", role: "GK", calledUp: true },
].sort((a, b) => parseInt(a.number) - parseInt(b.number));

// Array de 8 posiciones (F8)
let LINEUP_IDS = Array(8).fill(null);
let MATCH_STATE = { period: 1, isRunning: false, startTime: null, accumulatedMs: 0, displayMs: 0, intervalId: null };
let SCORE = { home: 0, away: 0 };
let MATCH_LOG = [];
let CUSTOM_POSITIONS = {};
const DEFAULT_COLORS = { '--team-shirt': '#dc2626', '--team-shorts': '#000000', '--team-socks': '#000000', '--gk-shirt': '#bef264', '--gk-shorts': '#15803d', '--gk-socks': '#bef264' };
const DEFAULT_LOGO = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 120'%3E%3Cpath d='M10 10 Q50 0 90 10 L95 80 Q50 120 5 80 Z' fill='%23dc2626' stroke='%23000' stroke-width='2'/%3E%3Ctext x='50' y='60' text-anchor='middle' fill='white' font-weight='bold' font-size='40' font-family='sans-serif'%3EM%3C/text%3E%3C/svg%3E";

// HELPERS
const getPlayerById = (id) => SQUAD.find(p => p.id === parseInt(id));
const getStarters = () => LINEUP_IDS.map(id => getPlayerById(id)).filter(Boolean);
const getBench = () => SQUAD.filter(p => p.calledUp && !LINEUP_IDS.includes(p.id));
const getUncalled = () => SQUAD.filter(p => !p.calledUp);
const getCssVar = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
const getCurrentFormation = () => FORMATIONS[currentFormationKey];

// --- LOGICA CAMBIO FORMACIÓN ---
const changeFormation = (newFormation) => {
    currentFormationKey = newFormation;
    // Reiniciar posiciones manuales para ajustar a la nueva tactica
    CUSTOM_POSITIONS = {};
    updateUI();
};

// --- LOGICA PRINCIPAL APP ---
const loadSavedKit = () => {
    const saved = localStorage.getItem('moncofa_kit_colors');
    if(saved) {
        const colors = JSON.parse(saved);
        Object.keys(colors).forEach(key => document.documentElement.style.setProperty(key, colors[key]));
    }
};
const updateKitColor = (varName, color) => {
    document.documentElement.style.setProperty(varName, color);
    let current = localStorage.getItem('moncofa_kit_colors') ? JSON.parse(localStorage.getItem('moncofa_kit_colors')) : {};
    current[varName] = color;
    localStorage.setItem('moncofa_kit_colors', JSON.stringify(current));
};
const handleLogoUpload = (input) => {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const dataUrl = e.target.result;
            document.getElementById('team-logo').src = dataUrl;
            try { localStorage.setItem('moncofa_team_logo', dataUrl); } catch (err) {}
        };
        reader.readAsDataURL(input.files[0]);
    }
};
const loadSavedLogo = () => {
    const saved = localStorage.getItem('moncofa_team_logo');
    document.getElementById('team-logo').src = saved || DEFAULT_LOGO;
};

const renderSquadList = () => {
    const listEl = document.getElementById('squad-list'); listEl.innerHTML = '';
    [...SQUAD].sort((a,b)=>parseInt(a.number)-parseInt(b.number)).forEach(p => {
        const onP = LINEUP_IDS.includes(p.id), isGK = p.role==='GK';
        const col = onP ? 'bg-green-100 text-green-800 border-green-200' : p.calledUp ? 'bg-white text-slate-700 hover:bg-slate-50' : 'bg-red-50 text-red-800 opacity-60';
        listEl.insertAdjacentHTML('beforeend', `<div class="flex items-center gap-2 p-1.5 rounded-lg border border-slate-200 transition-all ${col}"><div class="w-6 h-6 rounded-full flex items-center justify-center font-bold text-white text-[10px] shadow-sm ${isGK?'bg-yellow-500':'bg-red-600'}">${p.number}</div><div class="flex-1 font-semibold text-xs truncate">${p.name}</div><button onclick="toggleCalledUp(${p.id})" class="p-1 rounded text-white shadow-sm ${p.calledUp?'bg-red-400 hover:bg-red-500':'bg-green-500 hover:bg-green-600'}"><i data-lucide="${p.calledUp?'ban':'check'}" class="w-3 h-3"></i></button></div>`);
    });
    document.getElementById('bench-count').textContent = `${SQUAD.filter(p=>p.calledUp).length} DISP.`;
};

const renderPitch = () => {
    const p = document.getElementById('pitch'); 
    p.querySelectorAll('.player-avatar, .slot-button').forEach(e => e.remove());
    
    const currentPosData = getCurrentFormation();

    currentPosData.forEach((pos, i) => {
        const pid = LINEUP_IDS[i], pl = getPlayerById(pid);
        if(pl) {
            const t = document.getElementById('player-avatar-template').content.cloneNode(true), d = t.querySelector('div');
            d.dataset.playerId = pl.id; 
            d.style.left = `${CUSTOM_POSITIONS[pl.id]?.x || pos.x}%`; 
            d.style.top = `${CUSTOM_POSITIONS[pl.id]?.y || pos.y}%`;
            t.querySelector('.player-number').textContent = pl.number; t.querySelector('.player-name').textContent = pl.name;
            const isGK = pl.role === 'GK';
            const clr = {s: isGK?getCssVar('--gk-shirt'):getCssVar('--team-shirt'), sh: isGK?getCssVar('--gk-shorts'):getCssVar('--team-shorts'), so: isGK?getCssVar('--gk-socks'):getCssVar('--team-socks')};
            d.querySelectorAll('.player-shirt').forEach(e=>e.setAttribute('fill',clr.s)); d.querySelectorAll('.player-shorts').forEach(e=>e.setAttribute('fill',clr.sh)); d.querySelectorAll('.player-socks').forEach(e=>e.setAttribute('stroke',clr.so));
            p.appendChild(d);
        } else {
            const b = document.createElement('button'); b.className='slot-button absolute w-10 h-10 rounded-full border-2 border-dashed border-white/60 bg-black/10 text-white -translate-x-1/2 -translate-y-1/2 hover:scale-110 hover:bg-black/30 transition-all flex items-center justify-center backdrop-blur-sm z-0';
            b.style.left = `${pos.x}%`; b.style.top = `${pos.y}%`; b.innerHTML = '<i data-lucide="plus" class="w-5 h-5 opacity-80"></i>'; b.onclick = () => showBenchSelector(i); p.appendChild(b);
        }
    });
    lucide.createIcons();
};

const renderSquadBreakdown = () => {
    const l = (arr,id) => document.getElementById(id).innerHTML = arr.length ? arr.map(p=>`<li><span class="font-bold">${p.number}.</span> ${p.name}</li>`).join('') : '<li class="text-slate-400 italic">Vacío</li>';
    l(getStarters(),'starters-list'); l(getBench(),'bench-list'); l(getUncalled(),'uncalled-list');
    document.getElementById('starters-count').textContent=getStarters().length; document.getElementById('bench-list-count').textContent=getBench().length; document.getElementById('uncalled-count').textContent=getUncalled().length;
};

const renderLog = () => {
    const el = document.getElementById('match-log'); el.innerHTML = MATCH_LOG.length ? '' : '<tr><td colspan="3" class="text-center text-slate-400 p-4 italic">El partido comienza...</td></tr>';
    MATCH_LOG.forEach(l => { 
        const tr = document.createElement('tr'); tr.className='log-item hover:bg-slate-50 group border-b border-slate-50 last:border-0';
        let c='',h='', btn=''; 
        if(l.type=='goal'){ 
            const assistText = l.d.assist ? `<span class="text-[10px] text-slate-500 font-normal ml-1">🅰️ ${l.d.assist}</span>` : '';
            c='text-green-700'; h=`<span class="font-bold flex items-center gap-1 flex-wrap">⚽ ${l.d.scorer} ${assistText}</span>`; 
        }
        else if(l.type.includes('goal')){ c='text-red-600'; h=`<span class="font-bold">⚠️ ${l.text}</span>`; }
        else if(l.type=='sub'){ c='text-blue-700'; h=`<span class="flex items-center gap-1"><i data-lucide="refresh-cw" class="w-3 h-3"></i> ${l.d.in} <span class="text-slate-400 text-[10px]">x</span> ${l.d.out}</span>`; }
        else if(l.type=='lineup'){ c='text-slate-700'; h=`<div class="bg-slate-100 p-2 rounded-lg text-[10px] space-y-1 my-1 border border-slate-200"><div class="font-bold text-indigo-600 border-b border-slate-200 pb-1 mb-1 uppercase tracking-wider">${l.text}</div>${l.d.html}</div>`; }
        else{ c='text-slate-500'; h=`<span class='bg-slate-100 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider'>${l.text}</span>`; }
        if(l.type!=='lineup') btn=`<button onclick="deleteLog(${l.id})" class="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"><i data-lucide="trash-2" class="w-3 h-3"></i></button>`;
        tr.innerHTML=`<td class="px-3 py-2 font-mono text-slate-400 w-12 align-top text-[10px] pt-3">${l.time}</td><td class="px-1 py-2 ${c} align-middle w-full">${h}</td><td class="px-2 py-2 text-right align-top pt-2">${btn}</td>`;
        el.prepend(tr);
    });
    document.getElementById('score-text').textContent = `${SCORE.home} - ${SCORE.away}`;
    lucide.createIcons();
};

const updateUI = () => { renderSquadList(); renderPitch(); renderSquadBreakdown(); renderLog(); };

const saveStartingLineup = () => {
    const activePlayers = getStarters();
    if (activePlayers.length === 0) { alert("No hay jugadores en el campo para guardar la alineación."); return; }
    const lineupData = { GK: [], DEF: [], MED: [], DEL: [] };
    const currentPosData = getCurrentFormation();
    
    LINEUP_IDS.forEach((pid, index) => { 
        if (pid) {
            // Obtener rol dinámico según la formación actual
            const role = currentPosData[index].role;
            lineupData[role].push(getPlayerById(pid).name); 
        }
    });
    const formatLine = (label, names) => names.length ? `<div class='flex gap-1'><span class='font-bold text-slate-500 w-14'>${label}:</span> <span class='flex-1'>${names.join(', ')}</span></div>` : '';
    const htmlContent = [formatLine('Portero', lineupData.GK),formatLine('Defensas', lineupData.DEF),formatLine('Medios', lineupData.MED),formatLine('Delantero', lineupData.DEL)].join('');
    addLog('lineup', `Alineación Inicial (${MATCH_STATE.period}ª Parte) [${currentFormationKey}]`, { html: htmlContent });
};

// LOGICA PARTIDO Y UTILS
let activeP=null, pRect=null;
const startDrag = (e) => { const t = e.target.closest('.player-avatar'); if(!t || e.target.closest('.remove-btn')) return; if(e.type === 'touchstart') document.body.style.overscrollBehavior = 'none'; activeP = t; activeP.classList.add('dragging'); pRect = document.getElementById('pitch').getBoundingClientRect(); document.addEventListener('mousemove', drag, {passive: false}); document.addEventListener('mouseup', endDrag); document.addEventListener('touchmove', drag, {passive: false}); document.addEventListener('touchend', endDrag); };
const drag = (e) => { if(!activeP) return; if(e.cancelable) e.preventDefault(); const cX = e.touches ? e.touches[0].clientX : e.clientX; const cY = e.touches ? e.touches[0].clientY : e.clientY; let x = ((cX - pRect.left) / pRect.width) * 100; let y = ((cY - pRect.top) / pRect.height) * 100; x = Math.max(0, Math.min(100, x)); y = Math.max(0, Math.min(100, y)); activeP.style.left = `${x}%`; activeP.style.top = `${y}%`; };
const endDrag = () => { if(!activeP) return; activeP.classList.remove('dragging'); const pid = parseInt(activeP.dataset.playerId); CUSTOM_POSITIONS[pid] = { x: parseFloat(activeP.style.left), y: parseFloat(activeP.style.top) }; activeP = null; document.body.style.overscrollBehavior = ''; document.removeEventListener('mousemove', drag); document.removeEventListener('mouseup', endDrag); document.removeEventListener('touchmove', drag); document.removeEventListener('touchend', endDrag); };
const formatTime = (ms) => { const s = Math.floor(ms/1000); const lim = MATCH_STATE.period===1 ? 1500 : 3000; const cur = s - (MATCH_STATE.period===2 ? 1500 : 0); if(s < lim) return {t:`${Math.floor(cur/60).toString().padStart(2,'0')}:${(cur%60).toString().padStart(2,'0')}`, a:false}; const a = s - lim; return {t:`25:00 +${Math.floor(a/60)}:${(a%60).toString().padStart(2,'0')}`, a:true}; };
const updateTimerDisplay = () => { let t = MATCH_STATE.accumulatedMs; if(MATCH_STATE.isRunning) t += Date.now() - MATCH_STATE.startTime; MATCH_STATE.displayMs = t; const f = formatTime(t); const el = document.getElementById('timer-display'); el.textContent = f.t; el.className = `text-3xl font-bold tabular-nums ${f.a ? 'text-amber-400' : 'text-white'}`; };
const toggleTimer = () => { if(MATCH_STATE.isRunning) { clearInterval(MATCH_STATE.intervalId); MATCH_STATE.accumulatedMs += Date.now() - MATCH_STATE.startTime; MATCH_STATE.isRunning = false; document.getElementById('timer-status').classList.add('hidden'); document.getElementById('toggle-timer-btn').innerHTML='<i data-lucide="play" class="w-6 h-6"></i>'; document.getElementById('toggle-timer-btn').classList.remove('bg-red-100', 'text-red-700'); document.getElementById('toggle-timer-btn').classList.add('bg-green-100', 'text-green-700'); } else { MATCH_STATE.startTime = Date.now(); MATCH_STATE.isRunning = true; MATCH_STATE.intervalId = setInterval(updateTimerDisplay, 1000); document.getElementById('timer-status').classList.remove('hidden'); document.getElementById('toggle-timer-btn').innerHTML='<i data-lucide="pause" class="w-6 h-6"></i>'; document.getElementById('toggle-timer-btn').classList.remove('bg-green-100', 'text-green-700'); document.getElementById('toggle-timer-btn').classList.add('bg-red-100', 'text-red-700'); } lucide.createIcons(); };
const resetTimer = () => { if(MATCH_STATE.isRunning) toggleTimer(); if(confirm("¿Reiniciar cronómetro a 00:00?")) { MATCH_STATE = {period:1,isRunning:false,startTime:null,accumulatedMs:0,displayMs:0,intervalId:null}; updateTimerDisplay(); updateUI(); document.getElementById('period-1-btn').className = 'period-btn active flex-1 py-1.5 transition-colors'; document.getElementById('period-2-btn').className = 'period-btn inactive flex-1 py-1.5 transition-colors'; } };
const switchPeriod = (p) => { if(MATCH_STATE.isRunning) toggleTimer(); MATCH_STATE.period = p; MATCH_STATE.accumulatedMs = p === 2 ? 1500000 : 0; MATCH_STATE.displayMs = MATCH_STATE.accumulatedMs; addLog('info', `Inicio ${p}ª Parte`); updateTimerDisplay(); const b1 = document.getElementById('period-1-btn'), b2 = document.getElementById('period-2-btn'); if(p === 1) { b1.className = 'period-btn active flex-1 py-1.5 transition-colors'; b2.className = 'period-btn inactive flex-1 py-1.5 transition-colors'; } else { b1.className = 'period-btn inactive flex-1 py-1.5 transition-colors'; b2.className = 'period-btn active flex-1 py-1.5 transition-colors'; } };
const changeAwayScore = (i) => { SCORE.away = Math.max(0, SCORE.away + i); if(i > 0) addLog('goal_away', 'Gol Rival'); document.getElementById('score-away').textContent = SCORE.away; updateUI(); };
const addLog = (ty, tx, d) => { MATCH_LOG.push({id:Date.now(), time:formatTime(MATCH_STATE.displayMs).t, type:ty, text:tx, d}); if(ty=='goal') SCORE.home++; if(ty=='own_goal') SCORE.away++; document.getElementById('score-home').textContent=SCORE.home; document.getElementById('score-away').textContent=SCORE.away; renderLog(); };
const deleteLog = (id) => { if(!confirm("¿Eliminar este evento?")) return; const l = MATCH_LOG.find(x => x.id === id); if(l){ if(l.type=='goal') SCORE.home--; if(l.type.includes('goal') && l.type!='goal') SCORE.away--; MATCH_LOG = MATCH_LOG.filter(x => x.id !== id); document.getElementById('score-home').textContent=SCORE.home; document.getElementById('score-away').textContent=SCORE.away; renderLog(); } };
const toggleCalledUp = (id) => { const p = getPlayerById(id); p.calledUp = !p.calledUp; if(!p.calledUp){ const i = LINEUP_IDS.indexOf(id); if(i > -1) LINEUP_IDS[i] = null; } updateUI(); };
const clearPitch = () => { if(confirm("¿Limpiar la pizarra táctica?")) { LINEUP_IDS.fill(null); CUSTOM_POSITIONS={}; updateUI(); } };

const showBenchSelector = (idx) => { 
    const b = getBench(); 
    // Usar la formación actual para determinar el rol del slot
    const currentForm = getCurrentFormation();
    const role = currentForm[idx].role; 
    const v = b.filter(p => role=='GK' ? p.role=='GK' : p.role=='FIELD'); 
    if(!v.length) return showCustomModal('Info', 'Sin jugadores disponibles para esta posición'); 
    const m = document.getElementById('modal-content'); 
    m.innerHTML = `<div class="flex justify-between items-center mb-4"><h3 class="font-bold text-lg">Elegir ${role}</h3><button onclick="closeModal()" class="text-slate-400"><i data-lucide="x" class="w-5 h-5"></i></button></div><div class="space-y-2 max-h-60 overflow-y-auto pr-1">${v.map(p => `<div onclick="assignPlayer(${p.id},${idx})" class="p-3 border rounded-xl cursor-pointer hover:bg-blue-50 flex gap-3 font-bold items-center transition-colors"><span class="bg-slate-800 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-sm">${p.number}</span><span class="text-slate-700">${p.name}</span></div>`).join('')}</div>`; 
    document.getElementById('action-modal').classList.remove('hidden'); document.getElementById('action-modal').classList.add('flex'); lucide.createIcons(); 
};

const assignPlayer = (pid, idx) => { const prev = LINEUP_IDS.indexOf(pid); if(prev > -1) LINEUP_IDS[prev] = null; LINEUP_IDS[idx] = pid; closeModal(); updateUI(); };
const removePlayerFromPitch = (pid) => { const i = LINEUP_IDS.indexOf(parseInt(pid)); if(i > -1) LINEUP_IDS[i] = null; updateUI(); };

// NUEVO HELPER PARA EL TOGGLE
window.toggleGoalInputs = () => {
    const ogRival = document.getElementById('rival_og_check').checked;
    const ogOur = document.getElementById('og_check').checked;
    
    const sc = document.getElementById('sc');
    const as = document.getElementById('as');
    
    // Si es autogol del rival (gol para nosotros) O autogol nuestro (gol para rival)
    // No tiene sentido seleccionar goleador nuestro para el gol
    const disable = ogRival || ogOur;
    
    sc.disabled = disable;
    as.disabled = disable;
    
    if(disable) {
        sc.classList.add('opacity-50', 'bg-slate-100');
        as.classList.add('opacity-50', 'bg-slate-100');
    } else {
        sc.classList.remove('opacity-50', 'bg-slate-100');
        as.classList.remove('opacity-50', 'bg-slate-100');
    }

    // Mutuamente excluyentes
    if (ogRival) document.getElementById('og_check').checked = false;
    if (ogOur) document.getElementById('rival_og_check').checked = false;
};

const showGoalModal = () => { 
    const s = getStarters(); 
    if(!s.length) return showCustomModal('Error', 'No hay jugadores en el campo'); 
    
    const options = s.map(p => `<option value="${p.id}">${p.number} - ${p.name}</option>`).join(''); 
    
    document.getElementById('modal-content').innerHTML = `
      <h3 class="font-bold text-lg mb-4 flex items-center gap-2"><i data-lucide="trophy" class="w-5 h-5 text-yellow-500"></i> Registrar Gol</h3>
      
      <div class="space-y-2 mb-4">
          <!-- Checkbox 1: Autogol nuestro (Malo) -->
          <div class="bg-red-50 p-2 rounded-lg border border-red-100">
             <label class="flex items-center gap-2 cursor-pointer font-bold text-xs text-red-700">
                 <input type="checkbox" id="og_check" onchange="toggleGoalInputs()"> 
                 AUTOGOL NUESTRO (Suma al rival)
             </label>
          </div>
          <!-- Checkbox 2: Autogol rival (Bueno) -->
          <div class="bg-green-50 p-2 rounded-lg border border-green-100">
             <label class="flex items-center gap-2 cursor-pointer font-bold text-xs text-green-700">
                 <input type="checkbox" id="rival_og_check" onchange="toggleGoalInputs()"> 
                 AUTOGOL DEL RIVAL (Suma a nosotros)
             </label>
          </div>
      </div>
      
      <div class="mb-4">
          <label class="text-xs font-bold text-slate-500 uppercase mb-1 block">Goleador</label>
          <select id="sc" class="w-full border p-3 rounded-lg bg-white font-medium focus:ring-2 focus:ring-green-500 outline-none">
              <option value="">Seleccionar Jugador...</option>
              ${options}
          </select>
      </div>

      <div class="mb-6">
          <label class="text-xs font-bold text-slate-500 uppercase mb-1 block">Asistencia (Opcional)</label>
          <select id="as" class="w-full border p-3 rounded-lg bg-white font-medium focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="">Sin asistencia / Acción individual</option>
              ${options}
          </select>
      </div>

      <div class="grid grid-cols-2 gap-3">
          <button onclick="closeModal()" class="text-slate-500 font-bold py-3 hover:bg-slate-100 rounded-lg">Cancelar</button>
          <button onclick="confirmGoal()" class="bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold shadow-lg shadow-green-200">Guardar Gol</button>
      </div>`; 
    
    document.getElementById('action-modal').classList.remove('hidden'); 
    document.getElementById('action-modal').classList.add('flex'); 
    lucide.createIcons();
};

const confirmGoal = () => { 
    const sid = document.getElementById('sc').value; 
    const aid = document.getElementById('as').value;
    const og_our = document.getElementById('og_check').checked; 
    const og_rival = document.getElementById('rival_og_check').checked;
    
    // Caso 1: Autogol del Rival (Suma a nosotros, sin jugador)
    if (og_rival) {
        addLog('goal', 'Gol', { scorer: 'Autogol Rival', assist: null });
        closeModal();
        return;
    }

    // Caso 2: Autogol Nuestro (Suma al rival, necesita jugador culpable? No es estricto en logica previa)
    if (og_our) {
         // Si seleccionó jugador, lo ponemos, sino genérico
         let culpritName = "Jugador";
         if(sid) { const s = getPlayerById(sid); culpritName = s.name; }
         addLog('own_goal', `Autogol ${culpritName}`, {scorer: culpritName});
         closeModal();
         return;
    }

    // Caso 3: Gol Normal
    if(!sid) return; 
    
    const s = getPlayerById(sid); 
    const a = aid ? getPlayerById(aid) : null;

    const data = { scorer: s.name };
    if (a) data.assist = a.name;
    addLog('goal', 'Gol', data); 
    
    closeModal(); 
};

const showSubModal = () => { const s = getStarters(), b = getBench(); if(!s.length || !b.length) return showCustomModal('Info', 'Se necesitan titulares y suplentes para realizar un cambio.'); const so = s.map(p => `<option value="${p.id}">${p.number} ${p.name}</option>`).join(''); const bo = b.map(p => `<option value="${p.id}">${p.number} ${p.name}</option>`).join(''); document.getElementById('modal-content').innerHTML = `<h3 class="font-bold text-lg mb-4 flex items-center gap-2"><i data-lucide="replace" class="w-5 h-5 text-blue-500"></i> Realizar Cambio</h3><div class="grid grid-cols-2 gap-4 mb-6"><div class="bg-red-50 p-2 rounded-lg border border-red-100"><label class="text-xs font-bold text-red-500 block mb-1 uppercase">Sale</label><select id="sout" class="w-full border-0 bg-transparent font-bold text-sm focus:ring-0 p-0 text-slate-700">${so}</select></div><div class="bg-green-50 p-2 rounded-lg border border-green-100"><label class="text-xs font-bold text-green-600 block mb-1 uppercase">Entra</label><select id="sin" class="w-full border-0 bg-transparent font-bold text-sm focus:ring-0 p-0 text-slate-700">${bo}</select></div></div><div class="grid grid-cols-2 gap-3"><button onclick="closeModal()" class="text-slate-500 font-bold py-3 hover:bg-slate-100 rounded-lg">Cancelar</button><button onclick="confirmSub()" class="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold shadow-lg shadow-blue-200">Confirmar</button></div>`; document.getElementById('action-modal').classList.remove('hidden'); document.getElementById('action-modal').classList.add('flex'); lucide.createIcons(); };
const confirmSub = () => { const oid = parseInt(document.getElementById('sout').value); const iid = parseInt(document.getElementById('sin').value); const idx = LINEUP_IDS.indexOf(oid); if(idx > -1){ LINEUP_IDS[idx] = iid; if(CUSTOM_POSITIONS[oid]){ CUSTOM_POSITIONS[iid] = CUSTOM_POSITIONS[oid]; delete CUSTOM_POSITIONS[oid]; } const po = getPlayerById(oid), pi = getPlayerById(iid); addLog('sub', 'Cambio', {out:po.name, in:pi.name}); closeModal(); updateUI(); } };
const showKitConfig = () => { document.getElementById('modal-content').innerHTML = `<div class="flex justify-between items-center mb-4"><h3 class="font-bold text-lg flex items-center gap-2"><i data-lucide="palette" class="w-5 h-5 text-blue-500"></i> Equipaciones</h3><button onclick="closeModal()" class="text-slate-400"><i data-lucide="x" class="w-5 h-5"></i></button></div><div class="space-y-6"><div><h4 class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Jugadores</h4><div class="grid grid-cols-3 gap-3"><div class="color-picker-wrapper bg-slate-100"><input type="color" value="${getCssVar('--team-shirt')}" oninput="updateKitColor('--team-shirt', this.value)"><div class="color-label">Camiseta</div></div><div class="color-picker-wrapper bg-slate-100"><input type="color" value="${getCssVar('--team-shorts')}" oninput="updateKitColor('--team-shorts', this.value)"><div class="color-label">Pantalón</div></div><div class="color-picker-wrapper bg-slate-100"><input type="color" value="${getCssVar('--team-socks')}" oninput="updateKitColor('--team-socks', this.value)"><div class="color-label">Medias</div></div></div></div><div><h4 class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Porteros</h4><div class="grid grid-cols-3 gap-3"><div class="color-picker-wrapper bg-slate-100"><input type="color" value="${getCssVar('--gk-shirt')}" oninput="updateKitColor('--gk-shirt', this.value)"><div class="color-label">Camiseta</div></div><div class="color-picker-wrapper bg-slate-100"><input type="color" value="${getCssVar('--gk-shorts')}" oninput="updateKitColor('--gk-shorts', this.value)"><div class="color-label">Pantalón</div></div><div class="color-picker-wrapper bg-slate-100"><input type="color" value="${getCssVar('--gk-socks')}" oninput="updateKitColor('--gk-socks', this.value)"><div class="color-label">Medias</div></div></div></div></div><div class="mt-6 pt-4 border-t flex justify-end"><button onclick="resetKitColors()" class="text-xs text-red-500 font-bold hover:underline">Restablecer colores originales</button></div>`; document.getElementById('action-modal').classList.remove('hidden'); document.getElementById('action-modal').classList.add('flex'); lucide.createIcons(); };
const resetKitColors = () => { if(confirm("¿Volver a los colores originales?")) { Object.keys(DEFAULT_COLORS).forEach(key => document.documentElement.style.setProperty(key, DEFAULT_COLORS[key])); localStorage.removeItem('moncofa_kit_colors'); closeModal(); } };
const closeModal = () => { document.getElementById('action-modal').classList.add('hidden'); document.getElementById('action-modal').classList.remove('flex'); };
const showCustomModal = (t, m) => { document.getElementById('modal-content').innerHTML = `<div class="text-center"><h3 class="font-bold text-lg text-slate-800 mb-2">${t}</h3><p class="text-slate-600 mb-6 text-sm">${m}</p><button onclick="closeModal()" class="bg-slate-800 text-white w-full py-2 rounded-lg font-bold">Entendido</button></div>`; document.getElementById('action-modal').classList.remove('hidden'); document.getElementById('action-modal').classList.add('flex'); };

window.onload = () => { updateTimerDisplay(); updateUI(); lucide.createIcons(); loadSavedLogo(); loadSavedKit(); };
