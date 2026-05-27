"use strict";

window.MoncofaApp = window.MoncofaApp || {};


MoncofaApp.Main = {
    // Proxies to Managers
    downloadPDF() { MoncofaApp.ExportManager.downloadPDF(); },
    downloadLineupImage() { MoncofaApp.ExportManager.downloadLineupImage(); },
    spawnBall() { MoncofaApp.DragManager.spawnBall(); },



    init() {
        console.log("Initializing Moncofa Tactical Board...");
        MoncofaApp.State.init();

        // Init Local Database
        if (MoncofaApp.DB) MoncofaApp.DB.init();

        // 1. Load Session if exists
        const loaded = MoncofaApp.State.loadSession();
        if (loaded) {
            console.log("Session restored!");
            // Check if timer should be running
            if (MoncofaApp.State.match.isRunning) {
                this.timerLoop(); // Restart animation frame loop
                // Update button state visually
                setTimeout(() => {
                    const btn = document.getElementById('toggle-timer-btn');
                    const statusEl = document.getElementById('timer-status');
                    if (statusEl) statusEl.classList.remove('hidden');
                    if (btn) {
                        btn.innerHTML = '<i data-lucide="pause" class="w-6 h-6 fill-current"></i>';
                        btn.classList.remove('bg-green-500', 'hover:bg-green-400', 'shadow-green-500/30');
                        btn.classList.add('bg-amber-500', 'hover:bg-amber-400', 'shadow-amber-500/30');
                    }
                }, 100);
            }
        }

        // Load configurations (Kit/Logo always separate preference)
        this.loadSavedKit();
        this.loadSavedLogo();

        // Init UI
        MoncofaApp.UI.init(); // Render state (loaded or default)

        // Init Drag Manager
        if (MoncofaApp.DragManager) MoncofaApp.DragManager.init();

        // Init Drawing Tool
        if (MoncofaApp.Drawing) MoncofaApp.Drawing.init();

        // Init Tactics Manager
        if (MoncofaApp.TacticsManager) MoncofaApp.TacticsManager.init();

        // Handle Resize with Debounce
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                MoncofaApp.UI.renderPitch();
            }, 200);
        });

        // Start Timer Interval - REMOVED (Redundant with requestAnimationFrame in toggleTimer)
        // Instead, valid restore check:
        if (MoncofaApp.State.match.isRunning) {
            this.timerLoop();
        }
    },




    // --- Persistencia & Config ---
    loadSavedKit() {
        try {
            const saved = localStorage.getItem('moncofa_kit_colors');
            if (saved) {
                const colors = JSON.parse(saved);
                // Sync to State
                MoncofaApp.State.kitColors = colors;
                Object.keys(colors).forEach(key => document.documentElement.style.setProperty(key, colors[key]));
            }
        } catch (e) { console.error("Error loading kit", e); }
    },

    updateKitColor(varName, color) {
        document.documentElement.style.setProperty(varName, color);
        try {
            // Update Memory
            MoncofaApp.State.kitColors = MoncofaApp.State.kitColors || {};
            MoncofaApp.State.kitColors[varName] = color;

            // Persist Local
            localStorage.setItem('moncofa_kit_colors', JSON.stringify(MoncofaApp.State.kitColors));

            // Trigger Sync
            MoncofaApp.State.saveSession();
        } catch (e) { console.error("Error saving kit", e); }
    },

    updateConfig(key, value) {
        MoncofaApp.State.config[key] = value;
        MoncofaApp.UI.updateScoreBoard();
        MoncofaApp.State.saveSession(); // Persist
    },



    changeOpponentScore(delta) {
        if (delta > 0) {
            MoncofaApp.State.addLog('goal_opponent', 'Gol Rival');
        } else {
            // Find last event contributing to Rival Score
            let foundId = null;
            for (let i = MoncofaApp.State.logs.length - 1; i >= 0; i--) {
                const log = MoncofaApp.State.logs[i];
                if (log.type === 'goal_opponent' || log.type === 'own_goal') {
                    foundId = log.id;
                    break;
                }
            }

            if (foundId) {
                MoncofaApp.State.removeLog(foundId);
            } else {
                // Fallback manual decrement
                const isHome = MoncofaApp.State.config.isHomeGame;
                if (isHome) {
                    MoncofaApp.State.score.away = Math.max(0, MoncofaApp.State.score.away - 1);
                } else {
                    MoncofaApp.State.score.home = Math.max(0, MoncofaApp.State.score.home - 1);
                }
                MoncofaApp.State.saveSession();
            }
        }
        MoncofaApp.UI.updateAll();
        // 6. Check for iPad Desktop Mode (Common PWA Issue)
        this.checkIpadDesktopMode();
    },

    checkIpadDesktopMode() {
        // Robust Check for iPad (Desktop Mode or Mobile Mode)
        const isTouch = navigator.maxTouchPoints && navigator.maxTouchPoints > 0;
        const isMac = /Macintosh/i.test(navigator.userAgent);
        const isIpadLike = /iPad/i.test(navigator.userAgent) || (isMac && isTouch);

        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;

        // If iPad and NOT installed, attempt warn
        if (isIpadLike && !isStandalone) {
            // Only auto-show once per session
            if (!sessionStorage.getItem('moncofa_ipad_warned')) {
                // Wait a bit for user to settle
                setTimeout(() => this.showIpadHelp(), 1500);
            }
        }
    },

    showIpadHelp() {
        const html = `
            <div class="text-center space-y-4">
                <div class="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2 animate-bounce">
                    <i data-lucide="tablet" class="w-8 h-8"></i>
                </div>
                <h3 class="font-bold text-lg text-slate-800">Instalar en iPad</h3>
                <p class="text-sm text-slate-600">
                    Si al añadir a la pantalla de inicio se te abre el navegador en vez de la App completa, sigue estos pasos:
                </p>
                <div class="bg-slate-100 p-3 rounded-lg text-left text-xs text-slate-700 space-y-2 border border-slate-200">
                    <p class="flex items-center gap-2"><span class="bg-slate-800 text-white w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px]">1</span> Toca <b class="bg-white px-1 rounded border shadow-sm">aA</b> en la barra de dirección.</p>
                    <p class="flex items-center gap-2"><span class="bg-slate-800 text-white w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px]">2</span> <b class="text-blue-600">Solicitar sitio web para móviles</b>.</p>
                    <p class="flex items-center gap-2"><span class="bg-slate-800 text-white w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px]">3</span> <b class="text-slate-800">Compartir</b> <i data-lucide="share" class="w-3 h-3 inline"></i> y <b>Añadir a pantalla de inicio</b>.</p>
                </div>
                
                <div class="bg-orange-50 border border-orange-100 p-2 rounded text-[10px] text-orange-700 font-bold">
                    ⚠️ Importante: Borra el icono antiguo antes de añadir el nuevo.
                </div>

                <button onclick="MoncofaApp.UI.closeModal(); sessionStorage.setItem('moncofa_ipad_warned', 'true')" class="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-lg active:scale-95 transform transition-transform">
                    ¡Entendido!
                </button>
            </div>
        `;
        MoncofaApp.UI.openModal(html);
        lucide.createIcons();
    },

    loadSavedLogo() {
        try {
            const saved = localStorage.getItem('moncofa_team_logo');
            const url = saved || MoncofaApp.Constants.DEFAULT_LOGO;
            const teamLogo = document.getElementById('team-logo');
            const landingLogo = document.getElementById('landing-logo');
            if (teamLogo) teamLogo.src = url;
            if (landingLogo) landingLogo.src = url;
        } catch (e) { console.error("Error loading logo", e); }
    },

    handleLogoUpload(input) {
        if (input.files && input.files[0]) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const dataUrl = e.target.result;
                const teamLogo = document.getElementById('team-logo');
                const landingLogo = document.getElementById('landing-logo');
                if (teamLogo) teamLogo.src = dataUrl;
                if (landingLogo) landingLogo.src = dataUrl;
                try { localStorage.setItem('moncofa_team_logo', dataUrl); } catch (err) { console.error("Error saving logo", err); }
            };
            reader.readAsDataURL(input.files[0]);
        }
    },

    // --- Acciones de Usuario ---
    changeFormation(newFormation) {
        MoncofaApp.State.currentFormation = newFormation;
        MoncofaApp.State.customPositions = {}; // Reset manual positions
        MoncofaApp.UI.updateAll();
        MoncofaApp.State.saveSession(); // Persist
    },

    switchPeriod(period) {
        if (MoncofaApp.State.match.isRunning) this.toggleTimer(); // Pause if running

        MoncofaApp.State.match.period = period;
        // Independent timer: Always start at 0
        MoncofaApp.State.match.accumulatedMs = 0;
        MoncofaApp.State.match.displayMs = 0;

        MoncofaApp.State.addLog('match_evt', `Comienza la ${period}ª Parte`);
        MoncofaApp.UI.updateAll();
        // Force timer update manually
        if (MoncofaApp.UI.updateTimerDisplay) MoncofaApp.UI.updateTimerDisplay();
    },

    toggleTimer() {
        // ... handled existing toggle ...
        if (MoncofaApp.State.match.isRunning) {
            // Stop (Pause)
            MoncofaApp.State.match.isRunning = false;
            MoncofaApp.State.match.accumulatedMs += Date.now() - MoncofaApp.State.match.startTime;
            MoncofaApp.State.saveSession(); // Persist Pause

            const statusEl = document.getElementById('timer-status');
            const btn = document.getElementById('toggle-timer-btn');

            if (statusEl) statusEl.classList.add('hidden');
            if (btn) {
                btn.innerHTML = '<i data-lucide="play" class="w-6 h-6 fill-current"></i>';
                btn.classList.remove('bg-amber-500', 'hover:bg-amber-400', 'shadow-amber-500/30');
                btn.classList.add('bg-green-500', 'hover:bg-green-400', 'shadow-green-500/30');
            }
        } else {
            // Start
            MoncofaApp.State.match.isRunning = true;
            MoncofaApp.State.match.startTime = Date.now();
            MoncofaApp.State.saveSession(); // Persist Start

            const statusEl = document.getElementById('timer-status');
            const btn = document.getElementById('toggle-timer-btn');

            if (statusEl) statusEl.classList.remove('hidden');
            if (btn) {
                btn.innerHTML = '<i data-lucide="pause" class="w-6 h-6 fill-current"></i>';
                btn.classList.remove('bg-green-500', 'hover:bg-green-400', 'shadow-green-500/30');
                btn.classList.add('bg-amber-500', 'hover:bg-amber-400', 'shadow-amber-500/30');
            }
            this.timerLoop();
        }
        lucide.createIcons();
    },

    stopTimer() {
        if (MoncofaApp.State.match.isRunning) {
            MoncofaApp.UI.showConfirm(
                'Finalizar Parte',
                '¿Ha finalizado el tiempo de juego?',
                () => {
                    MoncofaApp.State.match.isRunning = false;
                    MoncofaApp.State.match.accumulatedMs += Date.now() - MoncofaApp.State.match.startTime;
                    MoncofaApp.State.saveSession(); // Persist Stopped State

                    const statusEl = document.getElementById('timer-status');
                    const btn = document.getElementById('toggle-timer-btn');

                    if (statusEl) statusEl.classList.add('hidden');
                    if (btn) {
                        btn.innerHTML = '<i data-lucide="play" class="w-6 h-6 fill-current"></i>';
                        btn.classList.remove('bg-amber-500', 'hover:bg-amber-400', 'shadow-amber-500/30');
                        btn.classList.add('bg-green-500', 'hover:bg-green-400', 'shadow-green-500/30');
                    }

                    // Log End Time
                    const currentTime = MoncofaApp.Utils.formatTime(MoncofaApp.State.match.accumulatedMs).t;
                    const period = MoncofaApp.State.match.period || 1;
                    MoncofaApp.State.addLog('match_evt', `Fin la ${period}ª Parte (${currentTime})`, { min: currentTime });

                    MoncofaApp.UI.updateTimerDisplay(); // Force One Update
                    MoncofaApp.UI.updateAll();
                    MoncofaApp.State.saveSession(); // Save Log
                    lucide.createIcons();
                }
            );
        }
    },

    timerLoop() {
        if (!MoncofaApp.State.match.isRunning) return;
        requestAnimationFrame(() => {
            MoncofaApp.UI.updateTimerDisplay();
            if (MoncofaApp.State.match.isRunning) this.timerLoop();
        });
    },

    resetTimer() {
        MoncofaApp.UI.showConfirm(
            'Resetear Cronómetro',
            '¿Resetear cronómetro?',
            () => {
                MoncofaApp.State.match.isRunning = false;
                // Respect period: 00:00 or 45:00
                const period = MoncofaApp.State.match.period || 1;
                MoncofaApp.State.match.accumulatedMs = (period - 1) * 45 * 60 * 1000;
                MoncofaApp.State.match.displayMs = MoncofaApp.State.match.accumulatedMs;

                const statusEl = document.getElementById('timer-status');
                const btn = document.getElementById('toggle-timer-btn');

                if (statusEl) statusEl.classList.add('hidden');
                if (btn) {
                    btn.innerHTML = '<i data-lucide="play" class="w-6 h-6 fill-current"></i>';
                    btn.classList.remove('bg-amber-500', 'hover:bg-amber-400');
                    btn.classList.add('bg-green-500', 'hover:bg-green-400');
                }

                MoncofaApp.UI.updateTimerDisplay();
                lucide.createIcons();
            }
        );
    },

    deleteLog(id) {
        MoncofaApp.UI.showConfirm(
            'Eliminar Evento',
            '¿Estás seguro de que quieres eliminar este evento?',
            () => {
                MoncofaApp.State.removeLog(id);
                MoncofaApp.UI.updateAll();
            }
        );
    },

    resetMatch() {
        MoncofaApp.State.clearSession();
    },

    async finishAndSaveMatch() {
        MoncofaApp.UI.showConfirm(
            'Finalizar y Guardar',
            '¿Deseas finalizar el partido y guardarlo en la Base de Datos? Se borrará el progreso actual tras guardarlo.',
            async () => {
                const currentSeason = await MoncofaApp.DB.getCurrentSeason();

                const matchData = {
                    rivalName: MoncofaApp.State.config.rivalName || 'Rival',
                    isHome: MoncofaApp.State.config.isHomeGame,
                    homeScore: MoncofaApp.State.score.home,
                    awayScore: MoncofaApp.State.score.away,
                    period: MoncofaApp.State.match.period,
                    totalMs: MoncofaApp.State.match.accumulatedMs,
                    logs: MoncofaApp.State.logs,
                    leagueMatchId: MoncofaApp.State.config.leagueMatchId,
                    seasonId: currentSeason ? currentSeason.id : null
                };

                // Extraer estadísticas de jugadores con el nuevo motor de estadísticas
                const playerStatsData = MoncofaApp.StatsEngine.calculatePlayerStats(
                    matchData, 
                    MoncofaApp.State.lineupIds, 
                    MoncofaApp.State.squad
                );

                // Actualizar Liga si es un partido de la misma
                if (MoncofaApp.State.config.leagueMatchId) {
                    try {
                        const currentSeason = await MoncofaApp.DB.getCurrentSeason();
                        if (currentSeason) {
                            const matches = await MoncofaApp.DB.getCalendarMatches(currentSeason.id);
                            const leagueMatch = matches.find(m => m.id === MoncofaApp.State.config.leagueMatchId);
                            if (leagueMatch) {
                                leagueMatch.isPlayed = 1;
                                leagueMatch.homeScore = matchData.isHome ? matchData.homeScore : matchData.awayScore;
                                leagueMatch.awayScore = matchData.isHome ? matchData.awayScore : matchData.homeScore;
                                await MoncofaApp.DB.saveCalendarMatch(leagueMatch);
                            }
                        }
                    } catch (err) {
                        console.error("Error updating league calendar", err);
                    }
                }

                // Guardar
                try {
                    await MoncofaApp.DB.saveMatch(matchData, playerStatsData);
                    MoncofaApp.UI.showToast("Partido guardado con éxito en la base de datos.", "success");
                    this.resetMatch(); // Limpiar tras guardar
                } catch (e) {
                    MoncofaApp.UI.showToast("Error al guardar el partido.", "error");
                    console.error(e);
                }
            }
        );
    },

    // --- Lineup Management ---
    toggleCalledUp(id) {
        const player = MoncofaApp.State.getPlayerById(id);
        if (player) {
            player.calledUp = !player.calledUp;
            // If removed from called up, remove from lineup/bench
            if (!player.calledUp) {
                const idx = MoncofaApp.State.lineupIds.indexOf(player.id);
                if (idx !== -1) MoncofaApp.State.lineupIds[idx] = null;
            }
            MoncofaApp.UI.updateAll();
            // Re-render modal list if open? UI.renderSquadList() does simple ID lookup
            MoncofaApp.UI.renderSquadList();
        }
    },

    showBenchSelector(index) {
        // Restricted Selection Logic
        const formation = MoncofaApp.State.getCurrentFormationData();
        const slotRole = formation[index].role; // 'GK', 'DEF', 'MED', 'DEL'

        // Target Role: 'GK' must match 'GK'. Others match 'FIELD'.
        const requiredRole = slotRole === 'GK' ? 'GK' : 'FIELD';

        // Filter players: Must be Bench AND specific role type
        const available = MoncofaApp.State.getBench().filter(p => p.role === requiredRole);

        let html = `
            <div class="flex justify-between items-center mb-4">
                <h3 class="font-bold text-lg flex items-center gap-2 text-slate-800"><i data-lucide="user-plus" class="w-5 h-5 text-blue-600"></i> Elegir ${requiredRole === 'GK' ? 'Portero' : 'Jugador'}</h3>
                <button onclick="MoncofaApp.UI.closeModal()" class="text-slate-400 hover:text-slate-600"><i data-lucide="x" class="w-5 h-5"></i></button>
            </div>
            <div class="grid grid-cols-1 gap-2 max-h-[60vh] overflow-y-auto pr-1">
        `;

        if (available.length === 0) {
            html += `<p class="text-center text-slate-500 text-sm py-8 italic">No hay ${requiredRole === 'GK' ? 'porteros' : 'jugadores de campo'} disponibles en el banquillo.</p>`;
        } else {
            available.forEach(p => {
                const isGK = p.role === 'GK';
                html += `
                <button onclick="MoncofaApp.Main.addPlayerToPitch(${p.id}, ${index})" 
                    class="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-blue-50 hover:border-blue-300 transition-all text-left bg-white shadow-sm group">
                    <div class="w-9 h-9 rounded-full flex items-center justify-center font-bold text-white text-sm shadow-md ${isGK ? 'bg-yellow-500' : 'bg-red-600 group-hover:scale-110 transition-transform'}">
                        ${p.number}
                    </div>
                    <span class="font-bold text-slate-700 text-sm truncate flex-1">${p.name}</span>
                    <i data-lucide="chevron-right" class="w-4 h-4 text-slate-300 group-hover:text-blue-500"></i>
                </button>
                `;
            });
        }

        html += `</div>`;
        MoncofaApp.UI.openModal(html);
    },

    addPlayerToPitch(playerId, index) {
        // Remove from other slot if present
        const existingIdx = MoncofaApp.State.lineupIds.indexOf(playerId);
        if (existingIdx !== -1) MoncofaApp.State.lineupIds[existingIdx] = null;

        const player = MoncofaApp.State.getPlayerById(playerId);
        const wasEmpty = MoncofaApp.State.lineupIds[index] === null;

        MoncofaApp.State.lineupIds[index] = playerId;

        // Log if match is running and it's a new entry (not a swap internal)
        if (MoncofaApp.State.match.isRunning && player && wasEmpty) {
            const time = MoncofaApp.State.match.displayMs ? Math.floor(MoncofaApp.State.match.displayMs / 60000) : 0;
            MoncofaApp.State.addLog('sub', `Entra ${player.name}`, { min: time, in: player, out: { name: '---' } });
        }

        MoncofaApp.UI.updateAll();
        MoncofaApp.State.saveSession(); // Persist
        MoncofaApp.UI.closeModal();
    },

    removePlayerFromPitch(playerId) {
        const idx = MoncofaApp.State.lineupIds.indexOf(parseInt(playerId));
        if (idx !== -1) {
            const player = MoncofaApp.State.getPlayerById(playerId);
            MoncofaApp.State.lineupIds[idx] = null;
            delete MoncofaApp.State.customPositions[playerId];

            // Log if match is running
            if (MoncofaApp.State.match.isRunning && player) {
                const time = MoncofaApp.State.match.displayMs ? Math.floor(MoncofaApp.State.match.displayMs / 60000) : 0;
                MoncofaApp.State.addLog('sub', `Sale ${player.name}`, { min: time, in: { name: '---' }, out: player });
            }

            MoncofaApp.UI.updateAll();
            MoncofaApp.State.saveSession(); // Persist
        }
    },

    clearPitch() {
        MoncofaApp.UI.showConfirm(
            'Limpiar Pizarra',
            '¿Limpiar toda la alineación de la pizarra táctica?',
            () => {
                MoncofaApp.State.lineupIds = Array(11).fill(null); // Enough checks
                MoncofaApp.State.customPositions = {};
                MoncofaApp.UI.updateAll();
            }
        );
    },

    saveStartingLineup() {
        // Determine Period Label
        const period = MoncofaApp.State.match.period || 1;
        const periodLabel = period === 1 ? "Primer Tiempo" : "Segundo Tiempo";

        MoncofaApp.UI.showConfirm(
            'Registrar Alineación',
            `¿Registrar Alineación del ${periodLabel} en el acta?`,
            () => {
                const lineupIds = MoncofaApp.State.lineupIds;
                const formationData = MoncofaApp.State.getCurrentFormationData();
                const formationName = MoncofaApp.State.currentFormation;

                if (lineupIds.every(id => id === null)) {
                    MoncofaApp.UI.showToast("Alineación vacía", "warning");
                    return;
                }

                // Grouping Logic (Player + X)
                const lines = { 'DEL': [], 'MED': [], 'DEF': [], 'GK': [] };
                formationData.forEach((pos, i) => {
                    const pid = lineupIds[i];
                    if (pid) {
                        const p = MoncofaApp.State.getPlayerById(pid);
                        if (lines[pos.role]) lines[pos.role].push({ player: p, x: pos.x });
                    }
                });

                // 1. Generate HTML (Chips) for Screen
                const renderPlayer = (p, role) => {
                    const isGK = role === 'GK';
                    const bg = isGK ? 'bg-yellow-500' : 'bg-red-600';
                    return `
                    <div class="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded pr-2 pl-1 py-0.5 shadow-sm">
                        <span class="${bg} text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">${p.number}</span>
                        <span class="text-[10px] font-bold text-slate-700 leading-none">${p.name}</span>
                    </div>`;
                };

                const renderSection = (label, colorClass, items, role) => {
                    if (items.length === 0) return '';
                    items.sort((a, b) => a.x - b.x); // Sort Left-to-Right
                    return `
                    <div class="mb-1.5 last:mb-0">
                        <div class="text-[9px] font-black ${colorClass} uppercase tracking-wider mb-0.5 flex items-center gap-1">
                            ${label}
                        </div>
                        <div class="flex flex-wrap gap-1">
                            ${items.map(item => renderPlayer(item.player, role)).join('')}
                        </div>
                    </div>`;
                };

                let html = `<div class="p-1">`;
                html += `<div class="flex justify-between items-baseline border-b border-slate-100 pb-1 mb-2">
                    <span class="text-[10px] font-bold text-slate-400 uppercase">Esquema</span>
                    <span class="text-xs font-black text-indigo-600 font-display">${formationName}</span>
                </div>`;
                html += renderSection('Delanteros', 'text-orange-500', lines['DEL'], 'DEL');
                html += renderSection('Medios', 'text-blue-500', lines['MED'], 'MED');
                html += renderSection('Defensas', 'text-emerald-500', lines['DEF'], 'DEF');
                html += renderSection('Portería', 'text-yellow-600', lines['GK'], 'GK');
                html += `</div>`;

                // 2. Generate Plain Text Summary for PDF
                let plainText = `Esquema: ${formationName}\n`;
                ['DEL', 'MED', 'DEF', 'GK'].forEach(role => {
                    const items = lines[role];
                    if (items.length > 0) {
                        // Sort Left-to-Right
                        items.sort((a, b) => a.x - b.x);
                        // Map to "8 Name"
                        const names = items.map(it => `${it.player.number} ${it.player.name}`).join(', ');
                        // Label mapping
                        let label = role;
                        if (role === 'DEL') label = 'DEL';
                        if (role === 'MED') label = 'MED';
                        if (role === 'DEF') label = 'DEF';
                        if (role === 'GK') label = 'POR';

                        plainText += `${label}: ${names}\n`;
                    }
                });

                const isEmpty = Object.values(lines).every(arr => arr.length === 0);
                if (isEmpty) {
                    MoncofaApp.UI.showToast("Alineación vacía", "warning");
                    return;
                }

                // Save Log with 'plainText' in data
                MoncofaApp.State.addLog('lineup', `Alineación ${periodLabel}`, { html: html, plainText: plainText });
                MoncofaApp.UI.updateAll();
                MoncofaApp.UI.showToast(`Alineación registrada correctamente`, "success");
            }
        );
    },

    // ... (rest of functions) ...

    handleRivalLogoUpload(input) {
        if (input.files && input.files[0]) {
            const file = input.files[0];
            const reader = new FileReader();

            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');

                    // Resize to avoid LocalStorage Quota Exceeded
                    const MAX_SIZE = 150;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_SIZE) {
                            height *= MAX_SIZE / width;
                            width = MAX_SIZE;
                        }
                    } else {
                        if (height > MAX_SIZE) {
                            width *= MAX_SIZE / height;
                            height = MAX_SIZE;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    ctx.drawImage(img, 0, 0, width, height);

                    const dataUrl = canvas.toDataURL('image/png');

                    MoncofaApp.State.config.rivalLogo = dataUrl;
                    MoncofaApp.UI.updateScoreBoard();

                    if (document.getElementById('action-modal').classList.contains('flex')) {
                        this.showKitConfig();
                    }
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    },

    // --- Match Events ---
    showGoalModal() {
        const time = MoncofaApp.State.match.displayMs ? Math.floor(MoncofaApp.State.match.displayMs / 60000) : 0;
        const currentLineup = MoncofaApp.State.lineupIds.map(id => MoncofaApp.State.getPlayerById(id)).filter(p => p);

        let options = '';
        currentLineup.forEach(p => options += `<option value="${p.id}">${p.number} - ${p.name}</option>`);

        // Assist options will be populated dynamically
        const html = `
            <div class="flex justify-between items-center mb-4">
                <h3 class="font-bold text-lg text-slate-800 flex items-center gap-2"><i data-lucide="trophy" class="w-5 h-5 text-yellow-500"></i> Registrar Gol</h3>
                <button onclick="MoncofaApp.UI.closeModal()" class="text-slate-400 hover:text-slate-600"><i data-lucide="x" class="w-5 h-5"></i></button>
            </div>
            <div class="space-y-4">
                <!-- Type Selection -->
                <div class="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <label class="block text-xs font-bold text-slate-500 mb-2 uppercase">Tipo de Gol</label>
                    <div class="space-y-2">
                        <label class="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="goal-type" value="normal" checked onchange="MoncofaApp.Main.toggleGoalFields()" class="text-green-600 focus:ring-green-500">
                            <span class="text-sm font-bold text-slate-700">Gol a Favor</span>
                        </label>
                        <label class="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="goal-type" value="own_us" onchange="MoncofaApp.Main.toggleGoalFields()" class="text-red-600 focus:ring-red-500">
                            <span class="text-sm font-bold text-red-700">Propia Puerta (Nuestro)</span>
                            <span class="text-[10px] text-red-400 ml-auto">Suma al Rival</span>
                        </label>
                        <label class="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="goal-type" value="own_rival" onchange="MoncofaApp.Main.toggleGoalFields()" class="text-blue-600 focus:ring-blue-500">
                            <span class="text-sm font-bold text-blue-700">Propia Puerta (Rival)</span>
                            <span class="text-[10px] text-blue-400 ml-auto">Suma a Nosotros</span>
                        </label>
                    </div>
                </div>

                <div class="flex items-center justify-between bg-slate-100 p-3 rounded-lg">
                    <label class="block text-xs font-bold text-slate-500 mb-0">Minuto Actual</label>
                    <span class="text-xl font-black text-slate-800 pointer-events-none">${time}'</span>
                    <input type="hidden" id="goal-min" value="${time}">
                </div>

                <div id="field-scorer">
                    <label class="block text-xs font-bold text-slate-500 mb-1">Autor / Jugador</label>
                    <select id="goal-player" onchange="MoncofaApp.Main.updateAssistOptions()" class="w-full border-slate-200 rounded-lg p-2 font-bold text-slate-700 bg-white">
                        ${options}
                    </select>
                </div>

                <div id="field-assist">
                    <label class="block text-xs font-bold text-slate-500 mb-1">Asistente (Opcional)</label>
                    <select id="goal-assist" class="w-full border-slate-200 rounded-lg p-2 font-bold text-slate-700 bg-white">
                        <option value="">-- Ninguno --</option>
                        <!-- Updated Dynamically -->
                    </select>
                </div>

                <button onclick="MoncofaApp.Main.confirmGoal()" class="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 rounded-lg shadow-lg transition-all">
                    Guardar Gol
                </button>
            </div>
        `;
        MoncofaApp.UI.openModal(html);
        MoncofaApp.Main.updateAssistOptions(); // Init options
    },

    updateAssistOptions() {
        const scorerId = document.getElementById('goal-player').value;
        const assistSelect = document.getElementById('goal-assist');

        // Helper to get current lineup
        const currentLineup = MoncofaApp.State.lineupIds.map(id => MoncofaApp.State.getPlayerById(id)).filter(p => p);

        let html = `<option value="">-- Ninguno --</option>`;
        currentLineup.forEach(p => {
            if (p.id !== parseInt(scorerId)) {
                html += `<option value="${p.id}">${p.number} - ${p.name}</option>`;
            }
        });
        assistSelect.innerHTML = html;
    },

    toggleGoalFields() {
        const type = document.querySelector('input[name="goal-type"]:checked').value;
        const scorerDiv = document.getElementById('field-scorer');
        const assistDiv = document.getElementById('field-assist');

        if (type === 'normal') {
            scorerDiv.style.display = 'block';
            assistDiv.style.display = 'block';
            MoncofaApp.Main.updateAssistOptions(); // Ensure logic runs if switching back
        } else if (type === 'own_us') {
            scorerDiv.style.display = 'block'; // Who scored the own goal
            assistDiv.style.display = 'none';
        } else if (type === 'own_rival') {
            scorerDiv.style.display = 'none'; // Generic rival
            assistDiv.style.display = 'none';
        }
    },

    confirmGoal() {
        const min = document.getElementById('goal-min').value;
        const type = document.querySelector('input[name="goal-type"]:checked').value;
        const isHome = MoncofaApp.State.config.isHomeGame;

        let logText = '';
        let valid = true;

        if (type === 'normal') {
            const playerId = document.getElementById('goal-player').value;
            const player = MoncofaApp.State.getPlayerById(parseInt(playerId));
            const assistId = document.getElementById('goal-assist').value;
            const assist = assistId ? MoncofaApp.State.getPlayerById(parseInt(assistId)) : null;

            if (player) {
                logText = `Gol de ${player.name} (#${player.number})`;
                if (assist) logText += ` (Asist: ${assist.name})`;

                MoncofaApp.State.addLog('goal', logText, { min: min, scorer: player, assist: assist });
            } else valid = false;

        } else if (type === 'own_us') {
            const playerId = document.getElementById('goal-player').value;
            const player = MoncofaApp.State.getPlayerById(parseInt(playerId));

            if (player) {
                logText = `Gol en Propia de ${player.name} (#${player.number})`;

                MoncofaApp.State.addLog('own_goal', logText, { min: min, player: player });
            } else valid = false;

        } else if (type === 'own_rival') {
            logText = `Gol en Propia Puerta del Rival`;
            // Use 'own_goal_rival' to trigger correct score increment in state.js
            MoncofaApp.State.addLog('own_goal_rival', logText, { min: min });
        }

        if (valid) {
            MoncofaApp.UI.updateAll();
            MoncofaApp.State.saveSession(); // Persist
            MoncofaApp.UI.closeModal();
            lucide.createIcons();
        }
    },

    showPenaltyModal() {
        const time = MoncofaApp.State.match.displayMs ? Math.floor(MoncofaApp.State.match.displayMs / 60000) : 0;
        
        // Players ON PITCH
        const onPitch = MoncofaApp.State.lineupIds
            .map(id => MoncofaApp.State.getPlayerById(id))
            .filter(Boolean);
            
        let playerOptions = `<option value="">-- Seleccionar Jugador --</option>`;
        onPitch.forEach(p => playerOptions += `<option value="${p.id}">${p.number} - ${p.name}</option>`);

        const html = `
            <div class="flex justify-between items-center mb-4">
                <h3 class="font-bold text-lg flex items-center gap-2 text-slate-800"><i data-lucide="circle-dashed" class="w-5 h-5 text-orange-500"></i> Registrar Penalti</h3>
                <button onclick="MoncofaApp.UI.closeModal()" class="text-slate-400 hover:text-slate-600"><i data-lucide="x" class="w-6 h-6"></i></button>
            </div>
            <div class="space-y-4">
                <div class="grid grid-cols-2 gap-2 mb-2">
                    <label class="flex flex-col items-center justify-center p-3 border-2 border-slate-200 rounded-xl cursor-pointer hover:bg-green-50 focus-within:border-green-500 focus-within:bg-green-50 transition-colors">
                        <input type="radio" name="penalty-team" value="us" class="sr-only" onchange="document.getElementById('penalty-player-div').style.display='block'" checked>
                        <span class="font-bold text-slate-700">A Favor</span>
                    </label>
                    <label class="flex flex-col items-center justify-center p-3 border-2 border-slate-200 rounded-xl cursor-pointer hover:bg-red-50 focus-within:border-red-500 focus-within:bg-red-50 transition-colors">
                        <input type="radio" name="penalty-team" value="rival" class="sr-only" onchange="document.getElementById('penalty-player-div').style.display='none'">
                        <span class="font-bold text-slate-700">En Contra</span>
                    </label>
                </div>
                
                <div class="grid grid-cols-2 gap-2 mb-4">
                    <label class="flex flex-col items-center justify-center p-3 border-2 border-slate-200 rounded-xl cursor-pointer hover:bg-blue-50 focus-within:border-blue-500 focus-within:bg-blue-50 transition-colors">
                        <input type="radio" name="penalty-result" value="scored" class="sr-only" checked>
                        <span class="font-bold text-slate-700">Anotado</span>
                    </label>
                    <label class="flex flex-col items-center justify-center p-3 border-2 border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 focus-within:border-slate-500 focus-within:bg-slate-100 transition-colors">
                        <input type="radio" name="penalty-result" value="missed" class="sr-only">
                        <span class="font-bold text-slate-700">Fallado</span>
                    </label>
                </div>

                <div id="penalty-player-div">
                    <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Lanzador (Nuestro Equipo)</label>
                    <select id="penalty-player" class="w-full border p-2 rounded-lg bg-slate-50 font-medium">
                        ${playerOptions}
                    </select>
                </div>
                
                <div>
                    <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Minuto</label>
                    <input type="number" id="penalty-min" class="w-24 border p-2 rounded-lg bg-slate-50 font-bold tabular-nums text-center" value="${time}">
                </div>

                <button onclick="MoncofaApp.Main.confirmPenalty()" class="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 rounded-lg shadow-lg transition-all">
                    Guardar Penalti
                </button>
            </div>
        `;
        MoncofaApp.UI.openModal(html);
        lucide.createIcons();
    },

    confirmPenalty() {
        const team = document.querySelector('input[name="penalty-team"]:checked').value;
        const result = document.querySelector('input[name="penalty-result"]:checked').value;
        const min = document.getElementById('penalty-min').value;
        
        let valid = true;
        let logType = '';
        let logText = '';
        let logData = { min: min };

        if (team === 'us') {
            const playerId = document.getElementById('penalty-player').value;
            const player = MoncofaApp.State.getPlayerById(parseInt(playerId));
            
            if (player) {
                logData.player = player;
                if (result === 'scored') {
                    logType = 'penalty_scored'; // Sub-type of goal essentially, but distinct
                    logText = `Penalti Anotado por ${player.name}`;
                } else {
                    logType = 'penalty_missed';
                    logText = `Penalti Fallado por ${player.name}`;
                }
            } else {
                valid = false;
                MoncofaApp.UI.showToast("Debes seleccionar un lanzador para penaltis a favor.", "warning");
            }
        } else {
            // Rival penalty
            if (result === 'scored') {
                logType = 'penalty_rival_scored';
                logText = `Penalti Anotado por el Rival`;
            } else {
                logType = 'penalty_rival_missed';
                logText = `Penalti Fallado por el Rival`;
            }
        }

        if (valid) {
            MoncofaApp.State.addLog(logType, logText, logData);
            MoncofaApp.UI.updateAll();
            MoncofaApp.State.saveSession();
            MoncofaApp.UI.closeModal();
            lucide.createIcons();
        }
    },

    showSubModal() {
        const time = MoncofaApp.State.match.displayMs ? Math.floor(MoncofaApp.State.match.displayMs / 60000) : 0;

        // Players ON PITCH
        const onPitch = MoncofaApp.State.lineupIds
            .map((id, idx) => ({ p: MoncofaApp.State.getPlayerById(id), idx }))
            .filter(item => item.p);

        // Players ON BENCH (Called Up but not in lineup)
        const bench = MoncofaApp.State.getBench();

        let outOptions = `<option value="">-- Sale --</option>`;
        onPitch.forEach(item => outOptions += `<option value="${item.idx}">${item.p.number} - ${item.p.name}</option>`);

        let inOptions = `<option value="">-- Entra --</option>`;
        bench.forEach(p => inOptions += `<option value="${p.id}">${p.number} - ${p.name}</option>`);

        const html = `
             <div class="flex justify-between items-center mb-4">
                <h3 class="font-bold text-lg text-slate-800 flex items-center gap-2"><i data-lucide="arrow-left-right" class="w-5 h-5 text-blue-500"></i> Realizar Cambio</h3>
                <button onclick="MoncofaApp.UI.closeModal()" class="text-slate-400 hover:text-slate-600"><i data-lucide="x" class="w-5 h-5"></i></button>
            </div>
            <div class="space-y-4">
                <div>
                    <label class="block text-xs font-bold text-slate-500 mb-1">Minuto</label>
                    <input type="number" id="sub-min" value="${time}" class="w-full border-slate-200 rounded-lg p-2 font-bold text-slate-700">
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-xs font-bold text-red-500 mb-1">Jugador Sale</label>
                        <select id="sub-out" class="w-full border-red-200 rounded-lg p-2 font-bold text-slate-700 bg-red-50 focus:ring-2 focus:ring-red-500 outline-none">
                            ${outOptions}
                        </select>
                    </div>
                    <div>
                         <label class="block text-xs font-bold text-green-500 mb-1">Jugador Entra</label>
                        <select id="sub-in" class="w-full border-green-200 rounded-lg p-2 font-bold text-slate-700 bg-green-50 focus:ring-2 focus:ring-green-500 outline-none">
                            ${inOptions}
                        </select>
                    </div>
                </div>
                <button onclick="MoncofaApp.Main.confirmSub()" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-lg shadow-blue-500/30 transition-all">
                    Realizar Cambio
                </button>
            </div>
        `;
        MoncofaApp.UI.openModal(html);
    },

    confirmSub() {
        const min = document.getElementById('sub-min').value;
        const outIdx = document.getElementById('sub-out').value; // Index in lineupIds
        const inId = document.getElementById('sub-in').value;   // Player ID

        if (outIdx === "" || inId === "") return MoncofaApp.UI.showToast("Selecciona ambos jugadores", "warning");

        const playerOutId = MoncofaApp.State.lineupIds[outIdx];
        const playerOut = MoncofaApp.State.getPlayerById(playerOutId);
        const playerIn = MoncofaApp.State.getPlayerById(parseInt(inId));

        // Logic: Swap IDs
        // 1. In goes to Out's slot
        MoncofaApp.State.lineupIds[outIdx] = parseInt(inId);

        // 2. Reset custom position for this slot
        delete MoncofaApp.State.customPositions[playerOutId];

        MoncofaApp.State.addLog('sub', `Cambio: Entra ${playerIn.name} por ${playerOut.name}`, { min: min, in: playerIn, out: playerOut });
        MoncofaApp.UI.updateAll();
        MoncofaApp.State.saveSession(); // Persist
        MoncofaApp.UI.closeModal();
    },


    saveCurrentRival() {
        const name = MoncofaApp.State.config.rivalName;
        const logo = MoncofaApp.State.config.rivalLogo;
        const short = MoncofaApp.State.config.rivalShortName;
        if (!name) return MoncofaApp.UI.showToast("Escribe un nombre para el equipo.", "warning");

        MoncofaApp.State.addRival(name, logo, short);
        this.showKitConfig(); // Refresh to update list
    },

    updateCurrentRival(id) {
        const name = MoncofaApp.State.config.rivalName;
        const logo = MoncofaApp.State.config.rivalLogo;
        const short = MoncofaApp.State.config.rivalShortName;

        MoncofaApp.State.updateRival(id, name, logo, short);
        this.showKitConfig();
        MoncofaApp.UI.showToast("Datos del equipo actualizados.", "success");
    },

    deleteRivalProp(id) {
        MoncofaApp.UI.showConfirm(
            'Borrar Rival',
            '¿Borrar este equipo de la lista de rivales guardados?',
            () => {
                MoncofaApp.State.removeRival(id);
                // Clear selection if it was the one deleted
                MoncofaApp.Main.updateConfig('rivalName', '');
                MoncofaApp.Main.updateConfig('rivalShortName', '');
                MoncofaApp.State.config.rivalLogo = null;
                MoncofaApp.UI.updateScoreBoard();
                this.showKitConfig();
            }
        );
    },

    async selectRival(id) {
        if (!id) {
            // New/Clear
            MoncofaApp.Main.updateConfig('rivalName', '');
            MoncofaApp.Main.updateConfig('rivalShortName', '');
            MoncofaApp.State.config.rivalLogo = null;
            localStorage.removeItem('moncofa_rival_logo');
            MoncofaApp.UI.updateScoreBoard();
            this.showKitConfig();
            return;
        }

        // Try to find in league teams first
        const season = await MoncofaApp.DB.getCurrentSeason();
        const seasonId = season?.id;
        const leagueTeams = seasonId ? await MoncofaApp.DB.getLeagueTeams(seasonId) : [];
        let r = leagueTeams.find(x => x.id === parseInt(id));

        // Fallback to rivals list
        if (!r) {
            r = MoncofaApp.State.rivals.find(x => x.id === id);
        }

        if (r) {
            MoncofaApp.Main.updateConfig('rivalName', r.name);
            const shortName = r.shortName || r.name.substring(0, 8).toUpperCase();
            MoncofaApp.Main.updateConfig('rivalShortName', shortName);
            MoncofaApp.State.config.rivalLogo = r.logo || null;
            if (r.logo) {
                localStorage.setItem('moncofa_rival_logo', r.logo);
            } else {
                localStorage.removeItem('moncofa_rival_logo');
            }
            MoncofaApp.UI.updateScoreBoard();
            this.showKitConfig();
        }
    },

    async autoFillFromMatchday(matchday) {
        if (!matchday) return;
        const currentSeason = await MoncofaApp.DB.getCurrentSeason();
        if (!currentSeason) return;

        const matches = await MoncofaApp.DB.getCalendarMatches(currentSeason.id);
        const dayMatches = matches.filter(m => m.matchday === parseInt(matchday));
        const teams = await MoncofaApp.DB.getLeagueTeams(currentSeason.id);

        const ourMatch = dayMatches.find(m => m.isOurMatch);
        if (ourMatch) {
            const homeT = teams.find(t => t.id === ourMatch.homeTeamId);
            const awayT = teams.find(t => t.id === ourMatch.awayTeamId);

            if (homeT && awayT) {
                let isHome = !!homeT.isUs;
                let rivalName = isHome ? awayT.name : homeT.name;
                let rivalShortName = isHome ? (awayT.shortName || awayT.name.substring(0, 8).toUpperCase()) : (homeT.shortName || homeT.name.substring(0, 8).toUpperCase());
                let rivalLogo = isHome ? awayT.logo : homeT.logo;

                // Update configuration state
                MoncofaApp.State.config.matchday = parseInt(matchday);
                MoncofaApp.State.config.rivalName = rivalName;
                MoncofaApp.State.config.rivalShortName = rivalShortName;
                MoncofaApp.State.config.isHomeGame = isHome;
                MoncofaApp.State.config.leagueMatchId = ourMatch.id;
                MoncofaApp.State.config.rivalLogo = rivalLogo;

                // Sync rival logo directly if available
                if (rivalLogo) {
                    localStorage.setItem('moncofa_rival_logo', rivalLogo);
                } else {
                    localStorage.removeItem('moncofa_rival_logo');
                }
                MoncofaApp.State.saveSession();
                MoncofaApp.UI.updateScoreBoard();
                
                // Refresh modal content to show autofilled values
                this.showKitConfig();
            }
        }
    },

    async showKitConfig() {
        const config = MoncofaApp.State.config;
        const season = await MoncofaApp.DB.getCurrentSeason();
        const seasonId = season?.id;
        const leagueTeams = seasonId ? await MoncofaApp.DB.getLeagueTeams(seasonId) : [];
        let rivals = leagueTeams.filter(t => !t.isUs);
        const hasLeagueTeams = rivals.length > 0;

        if (rivals.length === 0) {
            rivals = MoncofaApp.State.rivals || [];
        }

        const isConnected = !!MoncofaApp.State.supabase;

        // Generate Options
        let options = `<option value="">-- Seleccionar Equipo --</option>`;
        rivals.forEach(r => {
            const selected = r.name === config.rivalName ? 'selected' : '';
            options += `<option value="${r.id}" ${selected}>${r.name} ${hasLeagueTeams ? '(LIGA)' : ''}</option>`;
        });

        const currentRivalObj = rivals.find(r => r.name === config.rivalName);

        const html = `
            <div class="flex justify-between items-center mb-4">
                <h3 class="font-bold text-lg flex items-center gap-2">
                    <i data-lucide="settings" class="w-5 h-5 text-slate-700"></i> Configuración del Partido
                    <span class="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${isConnected ? 'bg-green-100 text-green-700 border-green-200' : 'bg-slate-100 text-slate-500 border-slate-200'}">
                        ${isConnected ? 'Cloud Online' : 'Modo Local'}
                    </span>
                </h3>
                <button onclick="MoncofaApp.UI.closeModal()" class="text-slate-400 hover:text-slate-600"><i data-lucide="x" class="w-5 h-5"></i></button>
            </div>
            
            <div class="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
                <!-- Match Info Section -->
                <div class="bg-indigo-50 p-4 rounded-xl border border-indigo-100 space-y-4">
                    <h4 class="text-xs font-bold text-indigo-800 uppercase tracking-wider border-b border-indigo-200 pb-2">Datos del Encuentro</h4>
                    
                    <div class="space-y-3">
                        <div>
                            <label class="block text-xs font-bold text-indigo-900 mb-1">Jornada Liga</label>
                            <input type="number" id="cfg-matchday" 
                                value="${config.matchday || ''}" 
                                oninput="MoncofaApp.Main.autoFillFromMatchday(this.value)"
                                placeholder="Ej: 5"
                                class="w-full text-sm border-indigo-200 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700">
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-indigo-900 mb-1">Entrenador (Mister)</label>
                            <input type="text" value="${config.coachName || ''}" 
                                onchange="MoncofaApp.Main.updateConfig('coachName', this.value)"
                                class="w-full text-sm border-indigo-200 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none">
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-indigo-900 mb-1">Delegado</label>
                            <input type="text" value="${config.delegateName || ''}" 
                                onchange="MoncofaApp.Main.updateConfig('delegateName', this.value)"
                                class="w-full text-sm border-indigo-200 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none">
                        </div>
                    </div>

                    <!-- Rival Manager Block -->
                    <div class="bg-white p-3 rounded-lg border border-indigo-100 shadow-sm">
                        <label class="block text-xs font-bold text-indigo-900 mb-2 flex justify-between items-center">
                            <span class="flex items-center gap-1"><i data-lucide="users" class="w-3 h-3 text-indigo-500"></i> Selección de Rival</span>
                            ${currentRivalObj && !hasLeagueTeams ? `<button onclick="MoncofaApp.Main.deleteRivalProp('${currentRivalObj.id}')" class="text-[10px] text-red-500 hover:text-red-700 flex items-center gap-1 bg-red-50 px-2 py-1 rounded border border-red-100 hover:bg-red-100 transition-colors"><i data-lucide="trash" class="w-3 h-3"></i> Borrar Guardado</button>` : ''}
                        </label>
                        
                        <select onchange="MoncofaApp.Main.selectRival(this.value)" class="w-full text-sm border-indigo-200 rounded-lg p-2 mb-3 bg-slate-50 outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer font-bold text-slate-700">
                            ${options}
                        </select>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div>
                                <label class="block text-[10px] font-bold text-indigo-400 mb-1 uppercase">Nombre Equipo</label>
                                <input type="text" value="${config.rivalName || ''}" 
                                    onchange="MoncofaApp.Main.updateConfig('rivalName', this.value)"
                                    class="w-full text-sm border-indigo-200 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none mb-2 font-bold text-slate-700" placeholder="Ej: Villarreal C.F.">
                                
                                <label class="block text-[10px] font-bold text-indigo-400 mb-1 uppercase">Nombre Marcador (Corto)</label>
                                <input type="text" value="${config.rivalShortName || ''}" 
                                    onchange="MoncofaApp.Main.updateConfig('rivalShortName', this.value)"
                                    class="w-full text-sm border-indigo-200 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none mb-1 font-bold text-slate-700" placeholder="Ej: VILA-REAL">
                             </div>
                             
                             <div>
                                <label class="block text-[10px] font-bold text-indigo-400 mb-1 uppercase">Escudo</label>
                                <div class="flex items-center gap-2">
                                    <label class="flex-1 flex items-center gap-2 cursor-pointer bg-slate-50 border border-indigo-200 rounded-lg p-2 text-xs font-bold text-indigo-600 hover:bg-indigo-50 transition-colors justify-center hover:shadow-sm h-[38px]">
                                        <i data-lucide="upload" class="w-3 h-3"></i> <span>Subir</span>
                                        <input type="file" accept="image/*" class="hidden" onchange="MoncofaApp.Main.handleRivalLogoUpload(this)">
                                    </label>
                                    ${config.rivalLogo ? `<div class="w-9 h-9 flex items-center justify-center bg-slate-100 rounded border border-slate-200 p-0.5"><img src="${config.rivalLogo}" class="max-w-full max-h-full object-contain"></div>` : ''}
                                </div>
                             </div>
                        </div>
                    </div>

                    <div>
                        <label class="block text-xs font-bold text-indigo-900 mb-1">Sede</label>
                        <div class="flex items-center gap-4 mt-2">
                            <label class="flex items-center gap-2 text-sm font-bold text-slate-700 cursor-pointer">
                                <input type="radio" name="venue" ${config.isHomeGame ? 'checked' : ''} 
                                    onchange="MoncofaApp.Main.updateConfig('isHomeGame', true)"
                                    class="text-indigo-600 focus:ring-indigo-500">
                                Casa
                            </label>
                            <label class="flex items-center gap-2 text-sm font-bold text-slate-700 cursor-pointer">
                                <input type="radio" name="venue" ${!config.isHomeGame ? 'checked' : ''} 
                                    onchange="MoncofaApp.Main.updateConfig('isHomeGame', false)"
                                    class="text-indigo-600 focus:ring-indigo-500">
                                Fuera
                            </label>
                        </div>
                    </div>
                </div>

                <!-- Kit Section -->
                <div>
                     <div class="flex items-center justify-between mb-2">
                        <h4 class="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2"><i data-lucide="palette" class="w-4 h-4"></i> Equipaciones</h4>
                     </div>
                     
                     <!-- Presets separated by Players and Goalkeepers -->
                     <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div class="bg-indigo-50 border border-indigo-100 rounded-xl p-3 flex flex-col gap-2.5">
                            <div class="text-[11px] font-black text-indigo-900 uppercase border-b border-indigo-200/60 pb-1 flex items-center gap-1">
                                <i data-lucide="shirt" class="w-3.5 h-3.5"></i> Equipación Jugadores
                            </div>
                            <div class="flex items-center justify-between gap-2 py-1">
                                <span class="text-[10px] uppercase font-black text-indigo-800">1ª Equip.</span>
                                <div class="flex flex-col gap-2.5 flex-shrink-0">
                                    <button onclick="MoncofaApp.Main.loadKitPreset('home', 'player')" class="text-[8px] uppercase tracking-wider bg-white border border-indigo-200 px-1 py-0.5 rounded hover:bg-indigo-50 font-black text-indigo-600 transition-colors shadow-sm text-center w-[58px] h-[19px] flex items-center justify-center">Cargar</button>
                                    <button onclick="MoncofaApp.Main.saveKitPreset('home', 'player')" class="text-[8px] uppercase tracking-wider bg-indigo-600 border border-indigo-600 px-1 py-0.5 rounded hover:bg-indigo-700 font-black text-white transition-colors shadow-sm text-center w-[58px] h-[19px] flex items-center justify-center">Guardar</button>
                                </div>
                            </div>
                            <div class="flex items-center justify-between gap-2 border-t border-indigo-200/50 pt-2.5 py-1">
                                <span class="text-[10px] uppercase font-black text-indigo-800">2ª Equip.</span>
                                <div class="flex flex-col gap-2.5 flex-shrink-0">
                                    <button onclick="MoncofaApp.Main.loadKitPreset('away', 'player')" class="text-[8px] uppercase tracking-wider bg-white border border-indigo-200 px-1 py-0.5 rounded hover:bg-indigo-50 font-black text-indigo-600 transition-colors shadow-sm text-center w-[58px] h-[19px] flex items-center justify-center">Cargar</button>
                                    <button onclick="MoncofaApp.Main.saveKitPreset('away', 'player')" class="text-[8px] uppercase tracking-wider bg-indigo-600 border border-indigo-600 px-1 py-0.5 rounded hover:bg-indigo-700 font-black text-white transition-colors shadow-sm text-center w-[58px] h-[19px] flex items-center justify-center">Guardar</button>
                                </div>
                            </div>
                        </div>

                        <div class="bg-indigo-50 border border-indigo-100 rounded-xl p-3 flex flex-col gap-2.5">
                            <div class="text-[11px] font-black text-indigo-900 uppercase border-b border-indigo-200/60 pb-1 flex items-center gap-1">
                                <i data-lucide="shield" class="w-3.5 h-3.5"></i> Equipación Porteros
                            </div>
                            <div class="flex items-center justify-between gap-2 py-1">
                                <span class="text-[10px] uppercase font-black text-indigo-800">1ª Equip.</span>
                                <div class="flex flex-col gap-2.5 flex-shrink-0">
                                    <button onclick="MoncofaApp.Main.loadKitPreset('home', 'gk')" class="text-[8px] uppercase tracking-wider bg-white border border-indigo-200 px-1 py-0.5 rounded hover:bg-indigo-50 font-black text-indigo-600 transition-colors shadow-sm text-center w-[58px] h-[19px] flex items-center justify-center">Cargar</button>
                                    <button onclick="MoncofaApp.Main.saveKitPreset('home', 'gk')" class="text-[8px] uppercase tracking-wider bg-indigo-600 border border-indigo-600 px-1 py-0.5 rounded hover:bg-indigo-700 font-black text-white transition-colors shadow-sm text-center w-[58px] h-[19px] flex items-center justify-center">Guardar</button>
                                </div>
                            </div>
                            <div class="flex items-center justify-between gap-2 border-t border-indigo-200/50 pt-2.5 py-1">
                                <span class="text-[10px] uppercase font-black text-indigo-800">2ª Equip.</span>
                                <div class="flex flex-col gap-2.5 flex-shrink-0">
                                    <button onclick="MoncofaApp.Main.loadKitPreset('away', 'gk')" class="text-[8px] uppercase tracking-wider bg-white border border-indigo-200 px-1 py-0.5 rounded hover:bg-indigo-50 font-black text-indigo-600 transition-colors shadow-sm text-center w-[58px] h-[19px] flex items-center justify-center">Cargar</button>
                                    <button onclick="MoncofaApp.Main.saveKitPreset('away', 'gk')" class="text-[8px] uppercase tracking-wider bg-indigo-600 border border-indigo-600 px-1 py-0.5 rounded hover:bg-indigo-700 font-black text-white transition-colors shadow-sm text-center w-[58px] h-[19px] flex items-center justify-center">Guardar</button>
                                </div>
                            </div>
                        </div>
                     </div>


                     <div class="space-y-4">
                        <div>
                            <h5 class="text-[10px] font-bold text-slate-400 uppercase mb-1">Jugadores de Campo</h5>
                            <div class="grid grid-cols-4 gap-2">
                                <div class="color-picker-wrapper bg-slate-100">
                                    <input type="color" value="${MoncofaApp.Utils.getCssVar('--team-shirt')}" oninput="MoncofaApp.Main.updateKitColor('--team-shirt', this.value)">
                                    <div class="color-label">Camiseta</div>
                                </div>
                                <div class="color-picker-wrapper bg-slate-100">
                                    <input type="color" value="${MoncofaApp.Utils.getCssVar('--team-shorts')}" oninput="MoncofaApp.Main.updateKitColor('--team-shorts', this.value)">
                                    <div class="color-label">Pantalón</div>
                                </div>
                                <div class="color-picker-wrapper bg-slate-100">
                                    <input type="color" value="${MoncofaApp.Utils.getCssVar('--team-socks')}" oninput="MoncofaApp.Main.updateKitColor('--team-socks', this.value)">
                                    <div class="color-label">Medias</div>
                                </div>
                                <div class="color-picker-wrapper bg-slate-100">
                                    <input type="color" value="${MoncofaApp.Utils.getCssVar('--team-number')}" oninput="MoncofaApp.Main.updateKitColor('--team-number', this.value)">
                                    <div class="color-label">Dorsal</div>
                                </div>
                            </div>
                        </div>
                        <div>
                            <h5 class="text-[10px] font-bold text-slate-400 uppercase mb-1">Porteros</h5>
                             <div class="grid grid-cols-4 gap-2">
                                <div class="color-picker-wrapper bg-slate-100">
                                    <input type="color" value="${MoncofaApp.Utils.getCssVar('--gk-shirt')}" oninput="MoncofaApp.Main.updateKitColor('--gk-shirt', this.value)">
                                    <div class="color-label">Camiseta</div>
                                </div>
                                <div class="color-picker-wrapper bg-slate-100">
                                    <input type="color" value="${MoncofaApp.Utils.getCssVar('--gk-shorts')}" oninput="MoncofaApp.Main.updateKitColor('--gk-shorts', this.value)">
                                    <div class="color-label">Pantalón</div>
                                </div>
                                <div class="color-picker-wrapper bg-slate-100">
                                    <input type="color" value="${MoncofaApp.Utils.getCssVar('--gk-socks')}" oninput="MoncofaApp.Main.updateKitColor('--gk-socks', this.value)">
                                    <div class="color-label">Medias</div>
                                </div>
                                <div class="color-picker-wrapper bg-slate-100">
                                    <input type="color" value="${MoncofaApp.Utils.getCssVar('--gk-number')}" oninput="MoncofaApp.Main.updateKitColor('--gk-number', this.value)">
                                    <div class="color-label">Dorsal</div>
                                </div>
                            </div>
                        </div>
                     </div>
                </div>

            </div>
            <div class="mt-6 pt-4 border-t flex justify-between items-center">
                <button onclick="MoncofaApp.Main.resetKitColors()" class="text-xs text-red-500 font-bold hover:underline">Reset Colores</button>
                <button onclick="MoncofaApp.UI.closeModal()" class="bg-slate-800 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-slate-700">Guardar y Cerrar</button>
            </div>
        `;
        MoncofaApp.UI.openModal(html);
        lucide.createIcons();
    },

    saveKitPreset(type, role) {
        const presets = JSON.parse(localStorage.getItem('moncofa_kit_presets') || '{}');
        const key = `${role}_${type}`;

        let colorsToSave = {};
        if (role === 'player') {
            colorsToSave = {
                '--team-shirt': MoncofaApp.Utils.getCssVar('--team-shirt'),
                '--team-shorts': MoncofaApp.Utils.getCssVar('--team-shorts'),
                '--team-socks': MoncofaApp.Utils.getCssVar('--team-socks'),
                '--team-number': MoncofaApp.Utils.getCssVar('--team-number')
            };
        } else {
            colorsToSave = {
                '--gk-shirt': MoncofaApp.Utils.getCssVar('--gk-shirt'),
                '--gk-shorts': MoncofaApp.Utils.getCssVar('--gk-shorts'),
                '--gk-socks': MoncofaApp.Utils.getCssVar('--gk-socks'),
                '--gk-number': MoncofaApp.Utils.getCssVar('--gk-number')
            };
        }

        presets[key] = colorsToSave;
        localStorage.setItem('moncofa_kit_presets', JSON.stringify(presets));

        MoncofaApp.UI.showToast(`Equipación ${type === 'home' ? '1ª' : '2ª'} de ${role === 'player' ? 'Jugadores' : 'Porteros'} guardada correctamente.`, 'success');
    },

    loadKitPreset(type, role) {
        const presets = JSON.parse(localStorage.getItem('moncofa_kit_presets') || '{}');
        const key = `${role}_${type}`;
        let colors = presets[key];

        // Fallback backward compatibility: if no player_/gk_ prefix preset exists, try to load from the old legacy combined key ('home' or 'away')
        if (!colors) {
            const legacyColors = presets[type];
            if (legacyColors) {
                colors = {};
                const keys = role === 'player' 
                    ? ['--team-shirt', '--team-shorts', '--team-socks', '--team-number']
                    : ['--gk-shirt', '--gk-shorts', '--gk-socks', '--gk-number'];
                keys.forEach(k => {
                    if (legacyColors[k]) colors[k] = legacyColors[k];
                });
            }
        }

        if (!colors || Object.keys(colors).length === 0) {
            return MoncofaApp.UI.showToast(`No hay ninguna equipación ${type === 'home' ? '1ª' : '2ª'} guardada para ${role === 'player' ? 'Jugadores' : 'Porteros'}.`, 'warning');
        }

        // Apply colors
        Object.keys(colors).forEach(k => {
            this.updateKitColor(k, colors[k]);
        });

        // Refresh Modal to show new colors in pickers
        this.showKitConfig();
    },

    resetKitColors() {
        MoncofaApp.UI.showConfirm(
            'Restablecer Colores',
            '¿Volver a los colores originales?',
            () => {
                Object.keys(MoncofaApp.Constants.DEFAULT_COLORS).forEach(key =>
                    document.documentElement.style.setProperty(key, MoncofaApp.Constants.DEFAULT_COLORS[key])
                );
                localStorage.removeItem('moncofa_kit_colors');
                MoncofaApp.UI.closeModal();
            }
        );
    }
};

window.onload = () => {
    MoncofaApp.Main.init();
    MoncofaApp.Animation.init();

    // Reparar estadísticas retroactivas una sola vez
    if (!localStorage.getItem('moncofa_stats_repaired_v9')) {
        MoncofaApp.StatsEngine.repairRetroactiveStats().then(() => {
            localStorage.setItem('moncofa_stats_repaired_v9', 'true');
            if (MoncofaApp.UI.currentTab === 'stats') {
                MoncofaApp.StatsUI.renderStats();
            }
        });
    }

    // Service Worker Registration for PWA Offline Support
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('ServiceWorker registration successful with scope: ', registration.scope);
            })
            .catch(error => {
                console.log('ServiceWorker registration failed: ', error);
            });
    }
};
window.ForceRepair = async () => {
    MoncofaApp.UI.showToast("Iniciando reconstrucción total. Por favor, no cierres esta ventana...", "info");
    try {
        const matches = await MoncofaApp.DB.matches.toArray();
        const squad = await MoncofaApp.DB.players.toArray();
        const playerStats = await MoncofaApp.DB.player_stats.toArray();
        const blob = window.MoncofaApp && window.MoncofaApp.IpadDataBlob ? window.MoncofaApp.IpadDataBlob : null;

        let totalGkJorge = 0;
        let totalGkValen = 0;

        for (const m of matches) {
            const mStats = playerStats.filter(s => s.matchId === m.id);
            const mday = m.matchday;
            const sheetKey = blob ? Object.keys(blob).find(k => k.toLowerCase().includes(`jornada ${mday}_`) || k.toLowerCase().includes(`jornada ${mday} `)) : null;
            
            const newMStats = [];
            
            squad.forEach(p => {
                let s = mStats.find(x => x.playerId === p.id);
                if (!s) s = { matchId: m.id, seasonId: m.seasonId, playerId: p.id, playerName: p.name, mins1st: 0, mins2nd: 0, goals: 0, assists: 0, goalsConceded: 0, penaltiesTaken: 0, starts1st: false, subs1st: false, starts2nd: false, subs2nd: false };
                
                // Si es un partido viejo importado del iPad
                if (!m.isManual && sheetKey) {
                    const rows = blob[sheetKey].slice(1);
                    const r = rows.find(row => {
                        const numStr = row[0] ? row[0].toString().trim() : "";
                        const nameFirst = row[1] ? row[1].toString().split(' ')[0].toLowerCase().trim() : "";
                        const pName = p.name ? p.name.toLowerCase() : "";
                        return (numStr && p.number != null && p.number.toString() === numStr) || (nameFirst && pName.includes(nameFirst));
                    });
                    
                    if (r) {
                        const m1 = Math.round(parseFloat(r[6])*1440) || 0;
                        const m2 = Math.round(parseFloat(r[10])*1440) || 0;
                        if (m1 > 0) s.mins1st = m1;
                        if (m2 > 0) s.mins2nd = m2;
                        
                        s.starts1st = (r[3] === "1");
                        s.subs1st = (r[3] === "0");
                        s.starts2nd = (r[7] === "1");
                        s.subs2nd = (r[7] === "0");
                        
                        s.goals = Math.max(s.goals || 0, parseInt(r[11]) || 0);
                        s.assists = Math.max(s.assists || 0, parseInt(r[12]) || 0);
                    }
                } else if (m.isManual) {
                    // Para partidos manuales
                    if (m.initialLineup) {
                        if (m.initialLineup.includes(p.id)) s.starts1st = true;
                        else s.subs1st = true;
                    }
                    if (m.secondHalfLineup) {
                        if (m.secondHalfLineup.includes(p.id)) s.starts2nd = true;
                        else s.subs2nd = true;
                    }
                }
                
                // FALLBACK ORIGINAL (por si faltan datos pero sí jugaron minutos)
                if (s.mins1st > 0 && !s.starts1st && !s.subs1st) {
                    const wasSubbedIn1st = m.logs && m.logs.some(l => (l.period === 1 || (l.d && l.d.min <= 25)) && (l.type === 'sub' || l.type === 'sub_in') && l.d && l.d.in && l.d.in.id === p.id);
                    if (wasSubbedIn1st) s.subs1st = true;
                    else s.starts1st = true;
                }
                if (s.mins2nd > 0 && !s.starts2nd && !s.subs2nd) {
                    const wasSubbedIn2nd = m.logs && m.logs.some(l => (l.period === 2 || (l.d && l.d.min > 25)) && (l.type === 'sub' || l.type === 'sub_in') && l.d && l.d.in && l.d.in.id === p.id);
                    if (wasSubbedIn2nd) s.subs2nd = true;
                    else s.starts2nd = true;
                }

                // --- STRICT ENFORCER ---
                // Regla estricta: Si pisaron el campo (PJ > 0 en total), deben tener EXACTAMENTE UNA titularidad o suplencia por parte.
                // Si no pisaron el campo en absoluto, tienen CERO en ambas partes.
                const playedMatch = (s.mins1st + s.mins2nd) > 0;
                
                if (playedMatch) {
                    if (!s.starts1st && !s.subs1st) s.subs1st = true; // Si jugó pero la 1ª parte no tiene nada, es suplente de la 1ª parte
                    if (!s.starts2nd && !s.subs2nd) s.subs2nd = true;
                    
                    // Asegurar que no haya dobles positivos (no puedes ser titular y suplente a la vez)
                    if (s.starts1st && s.subs1st) s.subs1st = false;
                    if (s.starts2nd && s.subs2nd) s.subs2nd = false;
                } else {
                    s.starts1st = false;
                    s.subs1st = false;
                    s.starts2nd = false;
                    s.subs2nd = false;
                }
                
                if (s.mins1st > 0 || s.mins2nd > 0 || s.goals > 0 || s.assists > 0 || s.goalsConceded > 0 || s.penaltiesTaken > 0 || s.calledUp) {
                    newMStats.push(s);
                }
            });

            if (newMStats.length > 0) {
                await MoncofaApp.DB.player_stats.where('matchId').equals(m.id).delete();
                await MoncofaApp.DB.player_stats.bulkAdd(newMStats);
            }
        }

        // Forzar exactamente 20 goles a Jorge y 21 a Valentino repartiéndolos SOLO en partidos jugados
        const allSavedStats = await MoncofaApp.DB.player_stats.toArray();
        const jorgeStats = allSavedStats.filter(s => s.playerName && s.playerName.toLowerCase().includes('jorge') && (s.mins1st > 0 || s.mins2nd > 0)).sort((a,b)=>a.matchId-b.matchId);
        const valenStats = allSavedStats.filter(s => s.playerName && s.playerName.toLowerCase().includes('valentino') && (s.mins1st > 0 || s.mins2nd > 0)).sort((a,b)=>a.matchId-b.matchId);
        
        // Limpiar los goles encajados de TODOS los partidos de Jorge y Valen primero (incluso los no jugados)
        allSavedStats.forEach(s => {
            if (s.playerName && (s.playerName.toLowerCase().includes('jorge') || s.playerName.toLowerCase().includes('valentino'))) {
                s.goalsConceded = 0;
            }
        });
        await MoncofaApp.DB.player_stats.bulkPut(allSavedStats);
        
        let jG = 20;
        let vG = 21;
        
        while (jG > 0 && jorgeStats.length > 0) {
            for (let s of jorgeStats) { if (jG > 0) { s.goalsConceded++; jG--; } }
        }
        while (vG > 0 && valenStats.length > 0) {
            for (let s of valenStats) { if (vG > 0) { s.goalsConceded++; vG--; } }
        }
        
        await MoncofaApp.DB.player_stats.bulkPut([...jorgeStats, ...valenStats]);

        location.reload();
    } catch (e) {
        MoncofaApp.UI.showToast("Error: " + e.message, "error");
        console.error(e);
    }
};
