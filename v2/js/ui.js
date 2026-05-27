"use strict";

window.MoncofaApp = window.MoncofaApp || {};

MoncofaApp.UI = {
    init() {
        lucide.createIcons();
        this.updateAll();
        this.switchView('view-landing');

        // --- Sticky Header Logic (JS Compensation) ---
        const header = document.querySelector('header');
        if (header) {
            const adjustPadding = () => {
                const h = header.offsetHeight;
                document.body.style.paddingTop = (h + 8) + 'px'; // +8px breathing room
            };

            // Observer for dynamic height changes (flex wrapping etc)
            const resizeObserver = new ResizeObserver(() => adjustPadding());
            resizeObserver.observe(header);

            // Initial call
            adjustPadding();
            // Add smoothness
            document.body.style.transition = 'padding-top 0.2s ease-out';
        }

        // Load Dark Mode
        if (localStorage.getItem('moncofa_dark_mode') === 'true') {
            document.body.classList.add('dark-mode');

            // Update Icon state manually 
            const btn = document.getElementById('theme-toggle-btn');
            if (btn) {
                btn.innerHTML = '<i data-lucide="sun" class="w-5 h-5 text-yellow-400"></i>';
                lucide.createIcons(); // render icon
            }
        }
    },

    switchView(viewId) {
        // Hide all views
        document.getElementById('view-landing').classList.add('hidden');
        document.getElementById('view-tactical').classList.add('hidden');
        document.getElementById('view-matches').classList.add('hidden');
        document.getElementById('view-stats').classList.add('hidden');
        
        const leagueView = document.getElementById('view-league');
        if (leagueView) leagueView.classList.add('hidden');

        const actsView = document.getElementById('view-acts');
        if (actsView) actsView.classList.add('hidden');

        // Show requested view
        const view = document.getElementById(viewId);
        if (view) {
            view.classList.remove('hidden');
            
            // Trigger view-specific logic
            if (viewId === 'view-tactical') {
                window.dispatchEvent(new Event('resize'));
            } else if (viewId === 'view-matches') {
                this.renderDbMatches();
            } else if (viewId === 'view-stats') {
                if (MoncofaApp.StatsUI) MoncofaApp.StatsUI.init();
            } else if (viewId === 'view-league') {
                if (MoncofaApp.LeagueUI) MoncofaApp.LeagueUI.init();
            }
        }
        window.scrollTo(0, 0);
    },

    toggleDarkMode() {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('moncofa_dark_mode', isDark);

        // Update Icon
        const btn = document.getElementById('theme-toggle-btn');
        if (btn) {
            btn.innerHTML = isDark
                ? '<i data-lucide="sun" class="w-5 h-5 text-yellow-400 theme-icon-animate"></i>'
                : '<i data-lucide="moon" class="w-5 h-5 text-slate-600 theme-icon-animate"></i>';
            lucide.createIcons();
        }
    },

    updateAll() {
        this.renderSquadList();
        this.renderPitch();
        this.renderSquadBreakdown();
        this.renderLog();
        this.updateScoreBoard();
    },

    updateScoreBoard() {
        // Ensure config exists (fallback)
        if (!MoncofaApp.State.config) MoncofaApp.State.config = { isHomeGame: true };

        const isHome = MoncofaApp.State.config.isHomeGame;
        const info = {
            homeScore: MoncofaApp.State.score.home,
            awayScore: MoncofaApp.State.score.away,
            myTeamName: "MONCOFA",
            rivalName: MoncofaApp.State.config.rivalShortName || MoncofaApp.State.config.rivalName || MoncofaApp.State.config.rival || "RIVAL"
        };

        // Logos
        const myLogo = MoncofaApp.Constants.DEFAULT_LOGO;
        const rivalLogo = MoncofaApp.State.config.rivalLogo;
        const genericShield = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23475569' stroke-width='2'%3E%3Cpath d='M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'/%3E%3C/svg%3E";

        const homeLogoSrc = isHome ? myLogo : (rivalLogo || genericShield);
        const awayLogoSrc = isHome ? (rivalLogo || genericShield) : myLogo;

        const homeName = isHome ? info.myTeamName : info.rivalName;
        const awayName = isHome ? info.rivalName : info.myTeamName;

        // Render Logos Outside
        const renderTeamNode = (src, isMe, name) => `
            <div class="flex flex-col items-center gap-2 w-full">
                <div class="w-12 h-12 md:w-16 md:h-16 rounded-full bg-slate-800/80 flex items-center justify-center p-2 border-2 border-slate-600/50 shadow-xl ${isMe ? 'shadow-green-900/40' : 'shadow-red-900/40'} backdrop-blur-md transition-transform hover:scale-105">
                    <img src="${src}" class="w-full h-full object-contain drop-shadow-lg">
                </div>
                <span class="text-[10px] uppercase font-black tracking-widest text-slate-800 bg-white/50 border border-white/40 shadow-sm backdrop-blur-sm px-2 py-0.5 rounded-full min-w-[60px] text-center truncate max-w-[80px]">${name}</span>
            </div>
        `;

        const homeContainer = document.getElementById('home-team-display');
        const awayContainer = document.getElementById('away-team-display');
        if (homeContainer) homeContainer.innerHTML = renderTeamNode(homeLogoSrc, isHome, homeName);
        if (awayContainer) awayContainer.innerHTML = renderTeamNode(awayLogoSrc, !isHome, awayName);

        // Render Central Scoreboard
        const container = document.querySelector('.scoreboard-glass');
        if (!container) return; // Should exist if HTML updated

        // Score Controls
        const renderControls = () => `
             <div class="flex flex-col gap-1">
                <button onclick="MoncofaApp.Main.changeOpponentScore(1)" class="w-6 h-6 flex items-center justify-center bg-slate-800 hover:bg-green-600 rounded shadow border border-slate-600 hover:border-green-500 text-[10px] leading-none transition-all active:scale-95 text-white"><i data-lucide="plus" class="w-3 h-3"></i></button>
                <button onclick="MoncofaApp.Main.changeOpponentScore(-1)" class="w-6 h-6 flex items-center justify-center bg-slate-800 hover:bg-red-600 rounded shadow border border-slate-600 hover:border-red-500 text-[10px] leading-none transition-all active:scale-95 text-white"><i data-lucide="minus" class="w-3 h-3"></i></button>
             </div>
        `;

        // Home Score Block
        const homeBlock = isHome
            ? `<span id="score-home" class="text-4xl text-green-400 font-bold w-12 text-center font-display drop-shadow-[0_0_8px_rgba(74,222,128,0.5)]">${info.homeScore}</span>`
            : `<div class="flex items-center gap-2">
                 ${renderControls()}
                 <span id="score-home" class="text-4xl text-red-400 font-bold w-12 text-center font-display drop-shadow-[0_0_8px_rgba(248,113,113,0.5)]">${info.homeScore}</span>
               </div>`;

        // Away Score Block
        const awayBlock = isHome
            ? `<div class="flex items-center gap-2">
                 <span id="score-away" class="text-4xl text-red-400 font-bold w-12 text-center font-display drop-shadow-[0_0_8px_rgba(248,113,113,0.5)]">${info.awayScore}</span>
                 ${renderControls()}
               </div>`
            : `<span id="score-away" class="text-4xl text-green-400 font-bold w-12 text-center font-display drop-shadow-[0_0_8px_rgba(74,222,128,0.5)]">${info.awayScore}</span>`;

        // TIMER BLOCK (Center)
        let f = MoncofaApp.Utils.formatTime(MoncofaApp.State.match.displayMs);
        const timerHtml = `
            <div class="flex flex-col items-center border-x border-slate-700/50 px-2 min-w-[90px]">
                <span id="timer-display" class="text-3xl font-bold tabular-nums tracking-wider ${f.isAddedTime ? 'text-amber-400' : 'text-slate-100'}">${f.t}</span>
                <span id="timer-status" class="text-[9px] text-red-500 animate-pulse font-bold tracking-[0.3em] mt-0 hidden text-shadow-glow ${MoncofaApp.State.match.isRunning ? '' : 'hidden'}">JUGANDO</span>
            </div>
        `;

        container.innerHTML = `
            <div class="absolute top-0 left-0 w-full h-1/2 bg-white/5 pointer-events-none"></div>
            ${homeBlock}
            ${timerHtml}
            ${awayBlock}
        `;

        lucide.createIcons();

        // Period Buttons Update
        const periodBtn1 = document.getElementById('period-1-btn');
        const periodBtn2 = document.getElementById('period-2-btn');

        if (periodBtn1 && periodBtn2) {
            if (MoncofaApp.State.match.period === 1) {
                periodBtn1.className = 'period-btn active flex-1 py-2 transition-colors tracking-wider';
                periodBtn2.className = 'period-btn inactive flex-1 py-2 transition-colors tracking-wider';
            } else {
                periodBtn1.className = 'period-btn inactive flex-1 py-2 transition-colors tracking-wider';
                periodBtn2.className = 'period-btn active flex-1 py-2 transition-colors tracking-wider';
            }
        }
    },

    renderSquadList() {

        const containers = [];
        const sidebarList = document.getElementById('squad-list');
        const modalList = document.getElementById('squad-list-modal');

        if (sidebarList) containers.push(sidebarList);
        if (modalList) containers.push(modalList);

        if (containers.length === 0) return;

        let content = '';
        const squadData = MoncofaApp.State.squad || [];

        [...squadData].sort((a, b) => parseInt(a.number) - parseInt(b.number)).forEach(p => {
            const onPitch = MoncofaApp.State.lineupIds.includes(p.id);
            const isGK = p.role === 'GK';

            let classes = 'bg-white text-slate-700 hover:bg-slate-50';
            let btnClass = 'bg-green-500 hover:bg-green-600';
            let icon = 'check';

            if (onPitch) {
                classes = 'bg-green-100 text-green-800 border-green-200';
            } else if (!p.calledUp) {
                classes = 'bg-red-50 text-red-800 opacity-60';
                btnClass = 'bg-red-400 hover:bg-red-500';
                icon = 'ban';
            }

            content += `
                <div class="squad-player-item flex items-center gap-2 p-2 rounded-lg border border-slate-200 transition-all ${classes} cursor-move" 
                    draggable="true" 
                    data-player-id="${p.id}"
                    ondragstart="MoncofaApp.DragManager.handleSquadDragStart(event)">
                    <div class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs shadow-sm ${isGK ? 'bg-yellow-500' : 'bg-red-600'} pointer-events-none">
                        ${p.number}
                    </div>
                    <div class="flex-1 font-semibold text-sm truncate pointer-events-none">${p.name}</div>
                    <button onclick="MoncofaApp.Main.toggleCalledUp(${p.id})" class="p-1.5 rounded text-white shadow-sm ${btnClass} pointer-events-auto">
                        <i data-lucide="${icon}" class="w-4 h-4"></i>
                    </button>
                </div>
            `;
        });

        containers.forEach(el => el.innerHTML = content);

        const benchCount = document.getElementById('bench-count');
        if (benchCount) benchCount.textContent = `${MoncofaApp.State.getBench().length + MoncofaApp.State.getStarters().length} DISP.`;
        lucide.createIcons();
    },

    async showConfigModal() {
        const config = MoncofaApp.State.config;
        
        // Find if there is an active season to enable auto-fill
        const currentSeason = await MoncofaApp.DB.getCurrentSeason();
        let seasonInfoHtml = '';
        if (currentSeason) {
            seasonInfoHtml = `<div class="bg-blue-50 text-blue-700 p-2 rounded text-xs font-bold mb-3 border border-blue-100"><i data-lucide="info" class="w-3 h-3 inline"></i> Vinculado a Liga: ${currentSeason.name}. Al escribir la Jornada, se rellenará el rival automáticamente.</div>`;
        }

        const html = `
            <div class="flex justify-between items-center mb-4">
                <h3 class="font-bold text-lg flex items-center gap-2 text-slate-800"><i data-lucide="settings" class="w-5 h-5 text-slate-600"></i> Configuración</h3>
                <button onclick="MoncofaApp.UI.closeModal()" class="text-slate-400 hover:text-slate-600"><i data-lucide="x" class="w-6 h-6"></i></button>
            </div>
            ${seasonInfoHtml}
            <div class="space-y-4">
                <div>
                    <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Jornada</label>
                    <input type="number" id="cfg-matchday" class="w-full border p-2 rounded-lg" value="${config.matchday || ''}" placeholder="Ej: 5" onchange="MoncofaApp.UI.autoFillFromLeague(this.value)">
                </div>
                <div>
                    <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Equipo Rival</label>
                    <input type="text" id="cfg-rival" class="w-full border p-2 rounded-lg" value="${config.rivalName || config.rival || ''}">
                </div>
                <div class="flex items-center gap-4">
                    <label class="flex items-center gap-2 cursor-pointer font-bold text-sm text-slate-700">
                        <input type="radio" id="cfg-venue-home" name="cfg-venue" value="home" ${config.isHomeGame ? 'checked' : ''}> Local
                    </label>
                    <label class="flex items-center gap-2 cursor-pointer font-bold text-sm text-slate-700">
                        <input type="radio" id="cfg-venue-away" name="cfg-venue" value="away" ${!config.isHomeGame ? 'checked' : ''}> Visitante
                    </label>
                </div>
                <!-- Hidden fields for League Sync -->
                <input type="hidden" id="cfg-league-match-id" value="${config.leagueMatchId || ''}">
                <button onclick="MoncofaApp.UI.saveConfig()" class="w-full bg-blue-600 text-white font-bold py-3 rounded-lg shadow-md hover:bg-blue-700 mt-4">Guardar Configuración</button>
            </div>
        `;
        this.openModal(html);
        lucide.createIcons();
    },

    async autoFillFromLeague(matchday) {
        if (!matchday) return;
        const currentSeason = await MoncofaApp.DB.getCurrentSeason();
        if (!currentSeason) return;

        const matches = await MoncofaApp.DB.getCalendarMatchesByDay(currentSeason.id, matchday);
        const teams = await MoncofaApp.DB.getLeagueTeams(currentSeason.id);

        // Find our match
        const ourMatch = matches.find(m => m.isOurMatch);
        if (ourMatch) {
            const homeT = teams.find(t => t.id === ourMatch.homeTeamId);
            const awayT = teams.find(t => t.id === ourMatch.awayTeamId);

            if (homeT && awayT) {
                let isHome = homeT.isUs;
                let rivalName = isHome ? awayT.name : homeT.name;
                let rivalLogo = isHome ? awayT.logo : homeT.logo;

                document.getElementById('cfg-rival').value = rivalName;
                if (isHome) {
                    document.getElementById('cfg-venue-home').checked = true;
                } else {
                    document.getElementById('cfg-venue-away').checked = true;
                }
                document.getElementById('cfg-league-match-id').value = ourMatch.id;

                // Sync rival logo directly if available
                if (rivalLogo) {
                    localStorage.setItem('moncofa_rival_logo', rivalLogo);
                    MoncofaApp.Main.loadSavedLogo('moncofa_rival_logo', 'rival-logo-img', 'rival-logo-icon');
                }
            }
        }
    },

    saveConfig() {
        const matchday = document.getElementById('cfg-matchday').value;
        const rival = document.getElementById('cfg-rival').value;
        const venue = document.querySelector('input[name="cfg-venue"]:checked').value;
        const leagueMatchId = document.getElementById('cfg-league-match-id').value;
        
        MoncofaApp.State.config.matchday = matchday ? parseInt(matchday) : null;
        MoncofaApp.State.config.rival = rival;
        MoncofaApp.State.config.rivalName = rival; // Used in other parts
        MoncofaApp.State.config.isHomeGame = venue === 'home';
        MoncofaApp.State.config.leagueMatchId = leagueMatchId ? parseInt(leagueMatchId) : null;
        
        MoncofaApp.State.saveSession();
        this.closeModal();
    },

    showSquadModal() {
        const html = `
            <div class="flex justify-between items-center mb-4">
                <h3 class="font-bold text-lg flex items-center gap-2 text-slate-800"><i data-lucide="users" class="w-5 h-5 text-blue-600"></i> Plantilla</h3>
                <button onclick="MoncofaApp.UI.closeModal()" class="text-slate-400 hover:text-slate-600"><i data-lucide="x" class="w-6 h-6"></i></button>
            </div>
            <div class="max-h-[60vh] overflow-y-auto pr-1">
                 <div id="squad-list-modal" class="space-y-2"></div>
            </div>
            <div class="mt-4 pt-4 border-t text-center text-xs text-slate-400">
                <p>Gestiona los jugadores disponibles para el partido.</p>
            </div>
        `;
        this.openModal(html);
        this.renderSquadList(); // Render immediately into the new modal element
    },

    renderPitch() {
        const pitch = document.getElementById('pitch');
        pitch.querySelectorAll('.player-avatar, .slot-button').forEach(e => e.remove());

        const formationData = MoncofaApp.State.getCurrentFormationData();

        formationData.forEach((pos, i) => {
            const pid = MoncofaApp.State.lineupIds[i];
            const player = MoncofaApp.State.getPlayerById(pid);

            if (player) {
                const template = document.getElementById('player-avatar-template').content.cloneNode(true);
                const div = template.querySelector('div');
                div.draggable = true; // Enable Drag API
                div.dataset.playerId = player.id;
                div.dataset.playerRole = player.role;
                div.dataset.number = player.number; // For CSS Tactical Modesition if available (dragged), else default formation position
                const customPos = MoncofaApp.State.customPositions[player.id];
                const isGK = player.role === 'GK';

                div.style.left = `${customPos?.x || pos.x}%`;
                div.style.top = isGK ? `${customPos?.y || pos.y}%` : `calc(${customPos?.y || pos.y}% - 15px)`;

                template.querySelector('.player-number').textContent = player.number;
                template.querySelector('.player-name').textContent = player.name;

                const colors = {
                    shirt: MoncofaApp.Utils.getCssVar(isGK ? '--gk-shirt' : '--team-shirt'),
                    shorts: MoncofaApp.Utils.getCssVar(isGK ? '--gk-shorts' : '--team-shorts'),
                    socks: MoncofaApp.Utils.getCssVar(isGK ? '--gk-socks' : '--team-socks'),
                    number: MoncofaApp.Utils.getCssVar(isGK ? '--gk-number' : '--team-number')
                };

                div.querySelectorAll('.player-shirt').forEach(e => e.setAttribute('fill', colors.shirt));
                div.querySelectorAll('.player-shorts').forEach(e => e.setAttribute('fill', colors.shorts));
                div.querySelectorAll('.player-socks').forEach(e => e.setAttribute('stroke', colors.socks));
                div.querySelectorAll('.player-number').forEach(e => e.setAttribute('fill', colors.number));

                pitch.appendChild(div);
            } else {
                const btn = document.createElement('button');
                btn.className = 'slot-button absolute w-10 h-10 rounded-full border-2 border-dashed border-white/60 bg-black/10 text-white -translate-x-1/2 -translate-y-1/2 hover:scale-110 hover:bg-black/30 transition-all flex items-center justify-center backdrop-blur-sm z-0';
                btn.style.left = `${pos.x}%`;
                btn.style.top = `${pos.y}%`;
                btn.innerHTML = '<i data-lucide="plus" class="w-5 h-5 opacity-80"></i>';
                btn.onclick = () => MoncofaApp.Main.showBenchSelector(i);
                pitch.appendChild(btn);
            }
        });
        lucide.createIcons();
    },

    renderSquadBreakdown() {
        const renderList = (players, elementId) => {
            const el = document.getElementById(elementId);
            el.innerHTML = players.length
                ? players.map(p => `<li><span class="font-bold">${p.number}.</span> ${p.name}</li>`).join('')
                : '<li class="text-slate-400 italic">Vacío</li>';
        };

        renderList(MoncofaApp.State.getStarters(), 'starters-list');
        renderList(MoncofaApp.State.getBench(), 'bench-list');
        renderList(MoncofaApp.State.getUncalled(), 'uncalled-list');

        document.getElementById('starters-count').textContent = MoncofaApp.State.getStarters().length;
        document.getElementById('bench-list-count').textContent = MoncofaApp.State.getBench().length;
        document.getElementById('uncalled-count').textContent = MoncofaApp.State.getUncalled().length;
    },

    renderLog() {
        const el = document.getElementById('match-log');
        if (MoncofaApp.State.logs.length === 0) {
            el.innerHTML = '<tr><td colspan="3" class="text-center text-slate-400 p-4 italic">El partido comienza...</td></tr>';
            return;
        }

        el.innerHTML = '';
        // Sort logs by ID descending (newest first) since we are prepending, or just iterate reverse.
        // The original code used prepend on iterator.
        // Let's copy logs and reverse to map correctly or just iterate.
        [...MoncofaApp.State.logs].reverse().forEach(log => {
            const tr = document.createElement('tr');
            tr.className = 'log-item hover:bg-slate-50 group border-b border-slate-50 last:border-0';

            let colorClass = '', contentHtml = '', deleteBtn = '';

            switch (log.type) {
                case 'goal':
                    const scorerName = log.d.scorer ? log.d.scorer.name : 'Desconocido';
                    const assistText = log.d.assist ? `<span class="text-[10px] text-slate-500 font-normal ml-1">🅰️ ${log.d.assist.name}</span>` : '';
                    colorClass = 'text-green-700';
                    contentHtml = `<span class="font-bold flex items-center gap-1 flex-wrap">⚽ ${scorerName} ${assistText}</span>`;
                    break;
                case 'own_goal':
                    const ogName = log.d.player ? log.d.player.name : 'Desconocido';
                    colorClass = 'text-red-600';
                    contentHtml = `<span class="font-bold text-xs">⚠️ P.P. ${ogName}</span>`;
                    break;
                case 'own_goal_rival':
                    colorClass = 'text-green-600';
                    contentHtml = `<span class="font-bold">🥅 ${log.text}</span>`;
                    break;
                case 'goal_opponent':
                case 'goal_away':
                    colorClass = 'text-red-600';
                    contentHtml = `<span class="font-bold">🥅 ${log.text}</span>`;
                    break;
                case 'sub':
                    colorClass = 'text-blue-700';
                    const inName = log.d.in ? log.d.in.name : '?';
                    const outName = log.d.out ? log.d.out.name : '?';
                    contentHtml = `<span class="flex items-center gap-1"><i data-lucide="refresh-cw" class="w-3 h-3"></i> <span class="font-bold">${inName}</span> <span class="text-slate-400 text-[10px]">x</span> <span class="text-slate-500">${outName}</span></span>`;
                    break;
                case 'lineup':
                    colorClass = 'text-slate-700';
                    contentHtml = `<div class="bg-slate-100 p-2 rounded-lg text-[10px] space-y-1 my-1 border border-slate-200">
                        <div class="font-bold text-indigo-600 border-b border-slate-200 pb-1 mb-1 uppercase tracking-wider">${log.text}</div>
                        ${log.d.html}
                    </div>`;
                    break;
                default:
                    colorClass = 'text-slate-500';
                    contentHtml = `<span class='bg-slate-100 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider'>${log.text}</span>`;
            }

            deleteBtn = `<button onclick="MoncofaApp.Main.deleteLog(${log.id})" class="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"><i data-lucide="trash-2" class="w-3 h-3"></i></button>`;

            tr.innerHTML = `
                <td class="px-3 py-2 font-mono text-slate-400 w-12 align-top text-[10px] pt-3">${log.time}</td>
                <td class="px-1 py-2 ${colorClass} align-middle w-full">${contentHtml}</td>
                <td class="px-2 py-2 text-right align-top pt-2">${deleteBtn}</td>
            `;
            el.appendChild(tr);
        });
        lucide.createIcons();
    },

    updateTimerDisplay() {
        let t = MoncofaApp.State.match.accumulatedMs;
        if (MoncofaApp.State.match.isRunning) {
            t += Date.now() - MoncofaApp.State.match.startTime;
        }
        MoncofaApp.State.match.displayMs = t;

        const f = MoncofaApp.Utils.formatTime(t);
        const el = document.getElementById('timer-display');
        el.textContent = f.t;
        el.className = `text-3xl font-bold tabular-nums ${f.isAddedTime ? 'text-amber-400' : 'text-white'}`;
    },

    openModal(htmlContent) {
        const modal = document.getElementById('action-modal');
        const content = document.getElementById('modal-content');
        content.innerHTML = htmlContent;
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        lucide.createIcons();
    },

    closeModal() {
        const modal = document.getElementById('action-modal');
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    },

    showCustomModal(title, message) {
        const html = `
            <div class="text-center">
                <h3 class="font-bold text-lg text-slate-800 mb-2">${title}</h3>
                <p class="text-slate-600 mb-6 text-sm">${message}</p>
                <button onclick="MoncofaApp.UI.closeModal()" class="bg-slate-800 text-white w-full py-2 rounded-lg font-bold transition-all hover:bg-slate-700 active:scale-95">Entendido</button>
            </div>
        `;
        this.openModal(html);
    },

    showConfirm(title, message, onConfirm, onCancel) {
        const html = `
            <div class="text-center">
                <h3 class="font-bold text-lg text-slate-800 mb-2">${title}</h3>
                <p class="text-slate-600 mb-6 text-sm">${message}</p>
                <div class="flex gap-3">
                    <button id="confirm-cancel-btn" class="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-lg font-bold transition-all active:scale-95">Cancelar</button>
                    <button id="confirm-ok-btn" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-bold transition-all active:scale-95">Confirmar</button>
                </div>
            </div>
        `;
        this.openModal(html);

        const cancelBtn = document.getElementById('confirm-cancel-btn');
        const okBtn = document.getElementById('confirm-ok-btn');

        cancelBtn.addEventListener('click', () => {
            this.closeModal();
            if (typeof onCancel === 'function') onCancel();
        });

        okBtn.addEventListener('click', () => {
            this.closeModal();
            if (typeof onConfirm === 'function') onConfirm();
        });
    },

    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const isDark = document.body.classList.contains('dark-mode');
        
        let bgClass, borderClass, textClass, icon;
        switch (type) {
            case 'success':
                bgClass = isDark ? 'bg-emerald-950/90' : 'bg-emerald-50/95';
                borderClass = isDark ? 'border-emerald-800/60' : 'border-emerald-200';
                textClass = isDark ? 'text-emerald-200' : 'text-emerald-900';
                icon = 'check-circle';
                break;
            case 'error':
                bgClass = isDark ? 'bg-rose-950/90' : 'bg-rose-50/95';
                borderClass = isDark ? 'border-rose-800/60' : 'border-rose-200';
                textClass = isDark ? 'text-rose-200' : 'text-rose-900';
                icon = 'alert-triangle';
                break;
            case 'warning':
                bgClass = isDark ? 'bg-amber-950/90' : 'bg-amber-50/95';
                borderClass = isDark ? 'border-amber-800/60' : 'border-amber-200';
                textClass = isDark ? 'text-amber-200' : 'text-amber-900';
                icon = 'alert-circle';
                break;
            case 'info':
            default:
                bgClass = isDark ? 'bg-slate-900/90' : 'bg-blue-50/95';
                borderClass = isDark ? 'border-slate-800/60' : 'border-blue-200';
                textClass = isDark ? 'text-blue-100' : 'text-blue-900';
                icon = 'info';
                break;
        }

        const toast = document.createElement('div');
        toast.className = `pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-md shadow-lg ${bgClass} ${borderClass} ${textClass} max-w-sm w-full`;
        
        toast.innerHTML = `
            <i data-lucide="${icon}" class="w-5 h-5 flex-shrink-0"></i>
            <span class="text-sm font-semibold flex-1">${message}</span>
            <button class="text-current opacity-60 hover:opacity-100 transition-opacity" onclick="this.parentElement.remove()">
                <i data-lucide="x" class="w-4 h-4"></i>
            </button>
        `;
        
        container.appendChild(toast);
        lucide.createIcons({
            attrs: {
                class: ["lucide"]
            },
            nameAttr: "data-lucide",
            node: toast
        });

        // Auto remove after 4s
        setTimeout(() => {
            if (toast.parentNode) {
                toast.style.opacity = '0';
                toast.style.transform = 'translateY(-10px)';
                toast.style.transition = 'all 0.3s ease';
                setTimeout(() => toast.remove(), 300);
            }
        }, 4000);
    },

    updateSyncStatus(status) {
        const led = document.getElementById('sync-led');
        if (!led) return;

        let classes = 'inline-block w-2.5 h-2.5 rounded-full transition-all duration-300 ';
        let title = '';

        switch (status) {
            case 'connected':
            case 'synchronized':
            case 'sync':
                classes += 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]';
                title = 'Sincronizado con la nube (Supabase)';
                break;
            case 'syncing':
                classes += 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)] animate-pulse';
                title = 'Sincronizando cambios...';
                break;
            case 'offline':
            case 'disconnected':
            case 'error':
            default:
                classes += 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]';
                title = 'Modo sin conexión (Dexie Local)';
                break;
        }

        led.className = classes;
        led.title = title;
    },

    async showDatabaseModal() {
        const html = `
            <div class="flex justify-between items-center mb-4 border-b pb-2 border-slate-100">
                <h3 class="font-black text-xl flex items-center gap-2 text-slate-800 uppercase tracking-tighter"><i data-lucide="database" class="w-6 h-6 text-blue-600"></i> Base de Datos</h3>
                <button onclick="MoncofaApp.UI.closeModal()" class="text-slate-400 hover:text-slate-600 bg-slate-100 p-1.5 rounded-full"><i data-lucide="x" class="w-5 h-5"></i></button>
            </div>
            
            <!-- Tabs -->
            <div class="flex border-b mb-4">
                <button onclick="MoncofaApp.UI.renderDbMatches()" id="db-tab-matches" class="flex-1 py-2 text-sm font-bold border-b-2 border-blue-600 text-blue-600">Partidos Guardados</button>
                <button onclick="MoncofaApp.UI.renderDbStats()" id="db-tab-stats" class="flex-1 py-2 text-sm font-bold border-b-2 border-transparent text-slate-500 hover:text-slate-700">Estadísticas Equipo</button>
            </div>

            <div id="db-content-area" class="max-h-[60vh] overflow-y-auto pr-1">
                <div class="text-center py-8"><i data-lucide="loader-2" class="w-8 h-8 animate-spin mx-auto text-blue-500"></i></div>
            </div>
        `;
        // Make modal slightly wider for this view
        const modalContent = document.getElementById('modal-content');
        modalContent.classList.remove('max-w-sm');
        modalContent.classList.add('max-w-md');
        
        this.openModal(html);
        await this.renderDbMatches();
        
        // When modal closes, reset width
        const oldClose = this.closeModal;
        this.closeModal = function() {
            modalContent.classList.remove('max-w-md');
            modalContent.classList.add('max-w-sm');
            oldClose.call(this);
            MoncofaApp.UI.closeModal = oldClose; // Restore
        };
    },

    async renderDbMatches() {
        const content = document.getElementById('matches-content-area');
        content.innerHTML = '<div class="text-center py-8"><i data-lucide="loader-2" class="w-8 h-8 animate-spin mx-auto text-blue-500"></i></div>';
        
        try {
            const matches = await MoncofaApp.DB.getAllMatches();
            
            // Sort matches by matchday (jornada) in ascending order
            matches.sort((a, b) => (parseInt(a.matchday) || 0) - (parseInt(b.matchday) || 0));
            
            if (matches.length === 0) {
                content.innerHTML = `<div class="text-center text-slate-500 py-12 italic bg-slate-50 rounded-xl border border-dashed border-slate-200">No hay partidos guardados todavía.</div>`;
                return;
            }

            let html = '<div class="grid grid-cols-1 md:grid-cols-2 gap-4">';
            
            // Usamos un bucle for tradicional en lugar de forEach para poder usar await
            for (const m of matches) {
                const isHome = m.isHome === true || m.isHome === 1 || m.isHome === "1" || m.isHome === "true";
                let rivalName = m.rivalName || 'Rival';
                
                // Dynamic Self-Healing for placeholder rival names
                if ((rivalName === 'Rival Visitante' || rivalName === 'Rival Local' || rivalName === 'Rival') && m.leagueMatchId) {
                    const calMatch = await MoncofaApp.DB.getCalendarMatch(m.leagueMatchId);
                    if (calMatch) {
                        const seasonId = m.seasonId || calMatch.seasonId || MoncofaApp.LeagueUI?.currentSeasonId;
                        let seasonTeams = seasonId ? await MoncofaApp.DB.getLeagueTeams(seasonId) : [];
                        if (seasonTeams.length === 0) {
                            seasonTeams = await MoncofaApp.DB.league_teams.toArray();
                        }
                        rivalName = isHome 
                            ? (seasonTeams.find(t => t.id === calMatch.awayTeamId)?.name || "Rival Visitante") 
                            : (seasonTeams.find(t => t.id === calMatch.homeTeamId)?.name || "Rival Local");
                        
                        m.rivalName = rivalName;
                        if (seasonId) m.seasonId = seasonId;
                        await MoncofaApp.DB.matches.put(m); // Save the corrected record back to Dexie db
                    }
                }

                const scoreText = `${m.homeScore} - ${m.awayScore}`;
                const date = new Date(m.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
                const fullMatchTitle = isHome ? `MONCOFA vs ${rivalName}` : `${rivalName} vs MONCOFA`;
                
                let resultClass = "bg-slate-100 text-slate-700"; // Draw
                let resultIcon = "minus";
                
                if (isHome) {
                    if (m.homeScore > m.awayScore) { resultClass = "bg-green-100 text-green-700"; resultIcon = "check"; }
                    if (m.homeScore < m.awayScore) { resultClass = "bg-red-100 text-red-700"; resultIcon = "x"; }
                } else {
                    if (m.awayScore > m.homeScore) { resultClass = "bg-green-100 text-green-700"; resultIcon = "check"; }
                    if (m.awayScore < m.homeScore) { resultClass = "bg-red-100 text-red-700"; resultIcon = "x"; }
                }

                // Check if this match has an official act
                const act = await MoncofaApp.DB.getOfficialActByMatch(m.id);
                const actButtonHtml = act 
                    ? `<button onclick="event.stopPropagation(); MoncofaApp.UI.viewAct('${act.id}')" class="text-[10px] bg-purple-100 text-purple-700 px-2 py-1 rounded font-bold hover:bg-purple-200 transition-colors flex items-center gap-1"><i data-lucide="eye" class="w-3 h-3"></i> Ver Acta</button>`
                    : `<button onclick="event.stopPropagation(); MoncofaApp.UI.openUploadActModal('${m.id}', '${m.date}', '${fullMatchTitle}')" class="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded font-bold hover:bg-slate-200 transition-colors flex items-center gap-1"><i data-lucide="upload" class="w-3 h-3"></i> Subir Acta</button>`;

                html += `
                    <div onclick="MoncofaApp.UI.viewMatchReport(${m.id})" class="border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-sm bg-white hover:border-blue-300 transition-all hover:shadow-md cursor-pointer group flex-col sm:flex-row gap-4 sm:gap-0">
                        <div class="flex flex-col items-start w-full sm:w-auto">
                            <span class="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-2">
                                <span class="bg-indigo-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide">Jornada ${m.matchday || '-'}</span>
                                <span>${date}</span> 
                                ${actButtonHtml}
                            </span>
                            <span class="font-bold text-slate-800 text-base md:text-lg mt-2">
                                ${isHome ? 'MONCOFA' : rivalName} 
                                <span class="mx-1 text-slate-400 font-normal text-sm">vs</span> 
                                ${isHome ? rivalName : 'MONCOFA'}
                            </span>
                        </div>
                        <div class="flex items-center gap-3 self-end sm:self-auto">
                            <div class="text-2xl font-black font-display tracking-widest ${resultClass} px-3 py-1 rounded-lg">${scoreText}</div>
                            <div class="${resultClass} w-8 h-8 rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform"><i data-lucide="${resultIcon}" class="w-4 h-4"></i></div>
                        </div>
                    </div>
                `;
            }
            html += '</div>';
            content.innerHTML = html;
            lucide.createIcons();
            
        } catch (e) {
            content.innerHTML = `<div class="text-red-500 bg-red-50 p-4 rounded-xl">Error cargando partidos: ${e.message}</div>`;
            console.error(e);
        }
    },

    async renderDbStats() {
        const content = document.getElementById('stats-content-area');
        content.innerHTML = '<div class="text-center py-8"><i data-lucide="loader-2" class="w-8 h-8 animate-spin mx-auto text-emerald-500"></i></div>';
        
        try {
            const players = MoncofaApp.Constants.INITIAL_SQUAD;
            let html = '<div class="overflow-x-auto"><table class="w-full text-left border-collapse">';
            
            // Render table header
            html += `
                <thead>
                    <tr class="bg-slate-50 border-b-2 border-slate-200 text-xs uppercase font-bold text-slate-500 tracking-wider">
                        <th class="p-3 rounded-tl-lg">Jugador</th>
                        <th class="p-3 text-center" title="Partidos Jugados">PJ</th>
                        <th class="p-3 text-center" title="Goles">⚽ Goles</th>
                        <th class="p-3 text-center rounded-tr-lg" title="Asistencias">🅰️ Asist</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
            `;

            for (const p of players) {
                const stats = await MoncofaApp.DB.getPlayerGlobalStats(p.id);
                if (stats.matchesPlayed > 0) {
                    html += `
                        <tr class="hover:bg-slate-50/80 transition-colors group">
                            <td class="p-3 flex items-center gap-3">
                                <div class="w-8 h-8 bg-slate-800 text-white rounded-full flex items-center justify-center text-xs font-black shadow-sm group-hover:bg-emerald-600 transition-colors">${p.number}</div>
                                <div class="font-bold text-slate-700">${p.name}</div>
                            </td>
                            <td class="p-3 text-center font-bold text-slate-500 text-lg">${stats.matchesPlayed}</td>
                            <td class="p-3 text-center font-black text-green-600 text-lg">${stats.goals}</td>
                            <td class="p-3 text-center font-black text-blue-600 text-lg">${stats.assists}</td>
                        </tr>
                    `;
                }
            }
            html += '</tbody></table></div>';
            
            content.innerHTML = html;
            lucide.createIcons();
            
        } catch (e) {
            content.innerHTML = `<div class="text-red-500 bg-red-50 p-4 rounded-xl">Error cargando estadísticas.</div>`;
            console.error(e);
        }
    },

    // --- Official Acts ---
    openUploadActModal(matchId, dateIso, title) {
        document.getElementById('act-match-id').value = matchId;
        document.getElementById('act-date').value = dateIso;
        document.getElementById('act-title').value = title;
        document.getElementById('act-file').value = '';
        
        const modal = document.getElementById('upload-act-modal');
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    },

    async handleUploadAct() {
        const matchId = document.getElementById('act-match-id').value;
        const date = document.getElementById('act-date').value;
        const title = document.getElementById('act-title').value;
        const fileInput = document.getElementById('act-file');
        const btn = document.getElementById('act-submit-btn');

        if (!matchId || !fileInput.files[0]) return MoncofaApp.UI.showToast('Debes seleccionar un archivo.', 'warning');

        btn.innerHTML = '<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> Guardando...';
        btn.disabled = true;

        const file = fileInput.files[0];
        const reader = new FileReader();

        reader.onload = async (e) => {
            try {
                await MoncofaApp.DB.saveOfficialAct(matchId, date, title, e.target.result, file.name);
                document.getElementById('upload-act-modal').classList.add('hidden');
                document.getElementById('upload-act-modal').classList.remove('flex');
                
                // Limpiar form
                fileInput.value = '';

                // Refrescar vista actual
                this.renderDbMatches();
                MoncofaApp.UI.showToast('Acta guardada con éxito.', 'success');
            } catch (err) {
                MoncofaApp.UI.showToast('Error al guardar el acta: ' + err.message, 'error');
            } finally {
                btn.innerHTML = 'Guardar Acta';
                btn.disabled = false;
            }
        };
        
        reader.readAsDataURL(file); // Convert to base64 string
    },

    viewAct(id) {
        MoncofaApp.DB.getAllOfficialActs().then(acts => {
            const act = acts.find(a => a.id === parseInt(id));
            if (!act) return;

            const isPdf = act.fileName.toLowerCase().endsWith('.pdf');
            
            const html = `
                <div class="flex justify-between items-center mb-4 border-b pb-2 border-slate-100">
                    <h3 class="font-bold text-lg flex items-center gap-2 text-slate-800 uppercase tracking-tighter truncate pr-4">${act.matchTitle}</h3>
                    <button onclick="MoncofaApp.UI.closeModal()" class="text-slate-400 hover:text-slate-600 bg-slate-100 p-1.5 rounded-full flex-shrink-0"><i data-lucide="x" class="w-5 h-5"></i></button>
                </div>
                <div class="w-full h-[60vh] bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center">
                    ${isPdf 
                        ? `<iframe src="${act.fileData}" class="w-full h-full border-0"></iframe>`
                        : `<img src="${act.fileData}" class="max-w-full max-h-full object-contain" />`
                    }
                </div>
                <div class="mt-4 flex justify-between items-center">
                    <button onclick="MoncofaApp.UI.deleteAct('${act.id}')" class="bg-red-50 text-red-600 px-4 py-2 rounded-lg font-bold text-sm hover:bg-red-100 transition-colors flex items-center gap-2">
                        <i data-lucide="trash-2" class="w-4 h-4"></i> Eliminar
                    </button>
                    <a href="${act.fileData}" download="${act.fileName}" class="bg-slate-800 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-slate-700 transition-colors flex items-center gap-2">
                        <i data-lucide="download" class="w-4 h-4"></i> Descargar
                    </a>
                </div>
            `;
            
            const modalContent = document.getElementById('modal-content');
            modalContent.classList.remove('max-w-sm');
            modalContent.classList.add('max-w-3xl'); // Make wider for viewing
            
            this.openModal(html);
            
            const oldClose = this.closeModal;
            this.closeModal = function() {
                modalContent.classList.remove('max-w-3xl');
                modalContent.classList.add('max-w-sm');
                oldClose.call(this);
                MoncofaApp.UI.closeModal = oldClose;
            };
        });
    },

    deleteAct(id) {
        this.showConfirm(
            'Eliminar Acta',
            '¿Estás seguro de eliminar esta acta? Esta acción no se puede deshacer.',
            async () => {
                await MoncofaApp.DB.deleteOfficialAct(id);
                this.closeModal();
                this.renderDbMatches();
                this.showToast('Acta eliminada con éxito.', 'success');
            }
        );
    },

    async viewMatchReport(matchId, activeTab = 'papis') {
        const match = await MoncofaApp.DB.getMatchById(parseInt(matchId));
        if (!match) return;

        const playerStats = await MoncofaApp.DB.getPlayerStatsForMatch(matchId);
        const players = await MoncofaApp.DB.getPlayers();

        const isHome = match.isHome === true || match.isHome === 1 || match.isHome === "1" || match.isHome === "true";
        let rivalName = match.rivalName || 'Rival';

        // Dynamic Self-Healing for placeholder rival names
        if ((rivalName === 'Rival Visitante' || rivalName === 'Rival Local' || rivalName === 'Rival') && match.leagueMatchId) {
            const calMatch = await MoncofaApp.DB.getCalendarMatch(match.leagueMatchId);
            if (calMatch) {
                const seasonId = match.seasonId || calMatch.seasonId || MoncofaApp.LeagueUI?.currentSeasonId;
                let seasonTeams = seasonId ? await MoncofaApp.DB.getLeagueTeams(seasonId) : [];
                if (seasonTeams.length === 0) {
                    seasonTeams = await MoncofaApp.DB.league_teams.toArray();
                }
                rivalName = isHome 
                    ? (seasonTeams.find(t => t.id === calMatch.awayTeamId)?.name || "Rival Visitante") 
                    : (seasonTeams.find(t => t.id === calMatch.homeTeamId)?.name || "Rival Local");
                
                match.rivalName = rivalName;
                if (seasonId) match.seasonId = seasonId;
                await MoncofaApp.DB.matches.put(match); // Save the corrected record back to Dexie db
            }
        }

        const scoreText = `${match.homeScore} - ${match.awayScore}`;
        const date = new Date(match.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
        const matchTitle = isHome ? `MONCOFA ${match.homeScore} - ${match.awayScore} ${rivalName}` : `${rivalName} ${match.homeScore} - ${match.awayScore} MONCOFA`;

        // Fetch logos
        const seasonIdToUse = match.seasonId || MoncofaApp.LeagueUI?.currentSeasonId;
        let seasonTeams = seasonIdToUse ? await MoncofaApp.DB.getLeagueTeams(seasonIdToUse) : [];
        if (seasonTeams.length === 0) {
            seasonTeams = await MoncofaApp.DB.league_teams.toArray();
        }
        const rivalTeamObj = seasonTeams.find(t => {
            const n1 = t.name.toLowerCase().replace(/['"“’”]/g, '').trim();
            const n2 = rivalName.toLowerCase().replace(/['"“’”]/g, '').trim();
            return n1 === n2 || n1.includes(n2) || n2.includes(n1);
        });
        const myLogo = localStorage.getItem('moncofa_team_logo') || 'img/logo.png';
        const rivalLogo = rivalTeamObj?.logo || localStorage.getItem('moncofa_rival_logo') || '';

        const myLogoHtml = `<img src="${myLogo}" class="w-12 h-12 md:w-16 md:h-16 object-contain filter drop-shadow-[0_4px_8px_rgba(255,255,255,0.15)] mx-auto mb-2" />`;
        const rivalLogoHtml = rivalLogo 
            ? `<img src="${rivalLogo}" class="w-12 h-12 md:w-16 md:h-16 object-contain filter drop-shadow-[0_4px_8px_rgba(255,255,255,0.15)] mx-auto mb-2" />` 
            : `<div class="w-12 h-12 md:w-16 md:h-16 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-xl md:text-2xl shadow-lg mx-auto mb-2">🛡️</div>`;

        const localLogoHtml = isHome ? myLogoHtml : rivalLogoHtml;
        const visitorLogoHtml = isHome ? rivalLogoHtml : myLogoHtml;

        // Adjust modal width
        const modalContent = document.getElementById('modal-content');
        modalContent.classList.remove('max-w-sm', 'max-w-md');
        modalContent.classList.add('max-w-4xl');

        // Render Tab Buttons
        const papisTabClass = activeTab === 'papis' ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200';
        const coachesTabClass = activeTab === 'coaches' ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200';

        let tabContentHtml = '';

        if (activeTab === 'papis') {
            // PAPIS TAB
            const goals = (match.logs || []).filter(l => l.type === 'goal' || l.type === 'penalty_scored' || l.type === 'own_goal' || l.type === 'own_goal_rival' || l.type === 'goal_opponent');
            
            let goalsListHtml = '';
            if (goals.length === 0) {
                goalsListHtml = `<div class="p-6 text-center text-slate-400 italic">No hay goles registrados en este partido.</div>`;
            } else {
                goalsListHtml = `<div class="space-y-3">`;
                goals.forEach(g => {
                    const absMin = parseInt(g.d?.min || g.time || 0);
                    const isSecondHalf = absMin > 25;
                    const relMin = isSecondHalf ? absMin - 25 : absMin;
                    const periodText = isSecondHalf ? '2ª Parte' : '1ª Parte';
                    
                    // Look up scorer and assistant names
                    const scorerId = g.d?.scorer?.id;
                    const scorerPlayer = scorerId ? players.find(p => p.id === parseInt(scorerId)) : null;
                    const scorerName = scorerPlayer ? scorerPlayer.name : (g.d?.scorer?.name || g.text || 'Jugador');

                    const assistId = g.d?.assist?.id;
                    const assistPlayer = assistId ? players.find(p => p.id === parseInt(assistId)) : null;
                    const assistName = assistPlayer ? assistPlayer.name : (g.d?.assist?.name || '');

                    let icon = '⚽';
                    let text = '';
                    if (g.type === 'goal') {
                        text = `<span class="font-extrabold text-slate-800">${scorerName}</span>`;
                        if (assistName) {
                            text += ` (Asistencia de <span class="font-bold text-slate-500">${assistName}</span>)`;
                        }
                    } else if (g.type === 'penalty_scored') {
                        icon = '🎯';
                        const penaltyPlayerId = g.d?.player?.id;
                        const penaltyPlayer = penaltyPlayerId ? players.find(p => p.id === parseInt(penaltyPlayerId)) : null;
                        const penaltyPlayerName = penaltyPlayer ? penaltyPlayer.name : (g.d?.player?.name || 'Jugador');
                        text = `<span class="font-extrabold text-slate-800">${penaltyPlayerName}</span> (Penalti)`;
                    } else if (g.type === 'own_goal') {
                        icon = '❌';
                        const ownGoalPlayerId = g.d?.player?.id;
                        const ownGoalPlayer = ownGoalPlayerId ? players.find(p => p.id === parseInt(ownGoalPlayerId)) : null;
                        const ownGoalPlayerName = ownGoalPlayer ? ownGoalPlayer.name : (g.d?.player?.name || 'Jugador');
                        text = `<span class="font-bold text-red-600">Gol en propia puerta de ${ownGoalPlayerName}</span>`;
                    } else if (g.type === 'own_goal_rival') {
                        icon = '🎁';
                        text = `<span class="font-bold text-emerald-600">Gol en propia puerta del rival</span>`;
                    } else if (g.type === 'goal_opponent') {
                        icon = '⚽';
                        text = `<span class="font-bold text-red-600">Gol del Rival (${match.rivalName})</span>`;
                    }

                    goalsListHtml += `
                        <div class="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-xl p-3 shadow-sm hover:bg-slate-100/50 transition-colors">
                            <span class="text-xl flex-shrink-0">${icon}</span>
                            <div class="flex-1 text-sm font-semibold text-slate-700">${text}</div>
                            <span class="text-xs font-black bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full uppercase tracking-wider">${relMin}' (${periodText})</span>
                        </div>
                    `;
                });
                goalsListHtml += `</div>`;
            }

            tabContentHtml = `
                <div id="papis-export-card" class="bg-gradient-to-br from-slate-900 to-indigo-900 rounded-2xl p-6 text-white relative overflow-hidden shadow-lg border border-slate-800">
                    <div class="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32 blur-3xl"></div>
                    <div class="relative z-10">
                        <div class="flex justify-between items-center border-b border-white/10 pb-4 mb-4">
                            <div class="flex items-center gap-2">
                                <span class="bg-blue-500 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-widest">RESUMEN PAPIS</span>
                                <span class="text-[10px] font-bold text-slate-300 uppercase">${date}</span>
                            </div>
                            <span class="text-xs font-bold text-slate-300">Jornada ${match.matchday || '-'}</span>
                        </div>
                        <div class="flex items-center justify-between py-6">
                            <div class="text-center w-1/3 flex flex-col items-center">
                                ${localLogoHtml}
                                <span class="text-xs font-bold text-indigo-200 uppercase block mb-1">Local</span>
                                <span class="text-sm md:text-lg font-black uppercase tracking-tighter block leading-tight ${isHome ? 'text-yellow-400' : 'text-white'}">${isHome ? 'PLATGES DE MONCOFA' : match.rivalName}</span>
                            </div>
                            <div class="text-center w-1/3 flex flex-col items-center justify-center">
                                <div class="bg-blue-600 text-white font-black font-display px-4 py-2 rounded-2xl border border-blue-500 shadow-lg tracking-widest text-2xl md:text-3xl leading-none w-28 text-center">${scoreText}</div>
                                <span class="text-[9px] font-bold text-slate-400 mt-3 tracking-widest uppercase">Marcador Final</span>
                            </div>
                            <div class="text-center w-1/3 flex flex-col items-center">
                                ${visitorLogoHtml}
                                <span class="text-xs font-bold text-indigo-200 uppercase block mb-1">Visitante</span>
                                <span class="text-sm md:text-lg font-black uppercase tracking-tighter block leading-tight ${!isHome ? 'text-yellow-400' : 'text-white'}">${!isHome ? 'PLATGES DE MONCOFA' : match.rivalName}</span>
                            </div>
                        </div>
                        <div class="bg-white rounded-xl p-4 text-slate-800 shadow-xl border border-slate-100 mt-4">
                            <h4 class="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 pb-2 border-b border-slate-100 flex items-center gap-1.5"><i data-lucide="award" class="w-4 h-4 text-yellow-500"></i> Goles y Asistencias</h4>
                            ${goalsListHtml}
                        </div>
                    </div>
                </div>
                <div class="flex justify-end mt-4">
                    <button onclick="MoncofaApp.ExportManager.downloadPapisImage(${matchId})" class="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-3 rounded-xl flex items-center justify-center gap-2 shadow-md transition-all text-sm w-full sm:w-auto">
                        <i data-lucide="download" class="w-4 h-4"></i> Descargar Imagen para Compartir (Papis)
                    </button>
                </div>
            `;
        } else {
            // COACHES TAB
            let tableRowsHtml = '';
            if (playerStats.length === 0) {
                tabContentHtml = `
                    <div class="p-8 text-center text-slate-500 bg-slate-50 rounded-2xl border border-slate-200">
                        <p class="font-black text-slate-700 text-base uppercase mb-2">Sin estadísticas detalladas</p>
                        <p class="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">Este partido fue importado de la FFCV o no tiene registradas estadísticas de jugadores ni minutos jugados. Para ver las actas de entrenador completas, debes jugar el partido desde la pizarra táctica o registrar las alineaciones.</p>
                    </div>
                `;
            } else {
                playerStats.forEach(stat => {
                    const p = players.find(x => x.id === stat.playerId);
                    if (!p) return;
                    
                    const totalMins = (stat.mins1st || 0) + (stat.mins2nd || 0);
                    const minsText = `${totalMins}' <span class="text-[9px] text-slate-400 font-normal">(${stat.mins1st || 0}'+${stat.mins2nd || 0}')</span>`;
                    
                    // Generate movements timeline
                    const movements = [];
                    if (stat.starts1st) movements.push(`<span class="bg-indigo-50 text-indigo-700 text-[9px] font-bold px-1.5 py-0.5 rounded border border-indigo-100">Titular 1ªT</span>`);
                    if (stat.starts2nd) movements.push(`<span class="bg-indigo-50 text-indigo-700 text-[9px] font-bold px-1.5 py-0.5 rounded border border-indigo-100">Titular 2ªT</span>`);
                    
                    const matchSubs = (match.logs || []).filter(l => l.type === 'sub').sort((a, b) => (a.d?.min || 0) - (b.d?.min || 0));
                    matchSubs.forEach(l => {
                        const min = l.d?.min || 0;
                        const period = min <= 25 ? '1ªT' : '2ªT';
                        if (l.d?.in?.id === p.id) {
                            movements.push(`<span class="bg-green-50 text-green-700 text-[9px] font-bold px-1.5 py-0.5 rounded border border-green-100">⬆️ Entra ${min}' (${period})</span>`);
                        }
                        if (l.d?.out?.id === p.id) {
                            movements.push(`<span class="bg-red-50 text-red-700 text-[9px] font-bold px-1.5 py-0.5 rounded border border-red-100">⬇️ Sale ${min}' (${period})</span>`);
                        }
                    });

                    const movementsHtml = movements.length > 0 ? `<div class="flex flex-wrap gap-1">${movements.join('')}</div>` : `<span class="text-xs text-slate-400 italic">No conv. / No jugó</span>`;

                    const gkStatsHtml = p.role === 'GK' ? `<span class="font-extrabold text-red-600 text-sm">${stat.goalsConceded || 0}</span>` : `<span class="text-slate-300">-</span>`;

                    tableRowsHtml += `
                        <tr class="hover:bg-slate-50 transition-colors border-b border-slate-100">
                            <td class="p-3 text-center w-12 flex-shrink-0">
                                <span class="bg-slate-800 text-white font-extrabold text-xs w-6 h-6 rounded-lg flex items-center justify-center shadow-sm mx-auto">${p.number}</span>
                            </td>
                            <td class="p-3 font-bold text-slate-700 text-sm whitespace-nowrap">${p.name} <span class="text-[9px] text-slate-400 font-extrabold uppercase ml-1 bg-slate-100 px-1 rounded">${p.role}</span></td>
                            <td class="p-3 text-center font-extrabold text-slate-700 text-sm whitespace-nowrap">${minsText}</td>
                            <td class="p-3">${movementsHtml}</td>
                            <td class="p-3 text-center font-extrabold text-green-600 text-base">${stat.goals || 0}</td>
                            <td class="p-3 text-center font-extrabold text-blue-600 text-base">${stat.assists || 0}</td>
                            <td class="p-3 text-center font-bold">${gkStatsHtml}</td>
                        </tr>
                    `;
                });

                tabContentHtml = `
                    <div id="coaches-export-card" class="bg-white rounded-2xl border border-slate-200 shadow-sm p-0.5 overflow-hidden">
                        <div class="bg-emerald-950 border-b border-emerald-900 rounded-t-2xl p-5 text-white flex justify-between items-center gap-4">
                            <div>
                                <h4 class="font-black uppercase tracking-tight text-[16px] md:text-[18px] leading-tight">Acta del Entrenador - Platges de Moncofa</h4>
                                <p class="text-[10px] md:text-[11px] text-emerald-300 font-bold uppercase tracking-wider mt-1.5 leading-none">Jornada ${match.matchday || '-'} | ${date}</p>
                            </div>
                            <div class="bg-emerald-800 text-emerald-100 font-black px-4 py-2 rounded-xl text-lg tracking-widest border border-emerald-700">
                                ${scoreText}
                            </div>
                        </div>
                        <div class="overflow-x-auto">
                            <table class="w-full text-left text-sm border-collapse min-w-[700px]">
                                <thead>
                                    <tr class="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
                                        <th class="p-3 text-center w-12">#</th>
                                        <th class="p-3">Jugador</th>
                                        <th class="p-3 text-center w-24">Minutos</th>
                                        <th class="p-3">Rotaciones y Cambios</th>
                                        <th class="p-3 text-center w-14">Goles</th>
                                        <th class="p-3 text-center w-14">Asist</th>
                                        <th class="p-3 text-center w-14">🧤 Enc</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-slate-100 bg-white">
                                    ${tableRowsHtml}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div class="flex justify-end mt-4">
                        <button onclick="MoncofaApp.ExportManager.downloadCoachesImage(${matchId})" class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-3 rounded-xl flex items-center justify-center gap-2 shadow-md transition-all text-sm w-full sm:w-auto">
                            <i data-lucide="download" class="w-4 h-4"></i> Descargar Acta Técnica (Entrenador)
                        </button>
                    </div>
                `;
            }
        }

        const html = `
            <div class="flex justify-between items-center mb-6">
                <div>
                    <h3 class="font-black text-xl text-slate-800 uppercase tracking-tighter truncate leading-tight">${matchTitle}</h3>
                    <p class="text-xs font-bold text-slate-400 mt-1 uppercase">Detalles e Informes del Partido</p>
                </div>
                <button onclick="MoncofaApp.UI.closeModal()" class="text-slate-400 hover:text-slate-600 bg-slate-100 p-2 rounded-full"><i data-lucide="x" class="w-5 h-5"></i></button>
            </div>

            <!-- Tab Selectors -->
            <div class="grid grid-cols-2 gap-3 mb-6">
                <button onclick="MoncofaApp.UI.viewMatchReport(${matchId}, 'papis')" class="${papisTabClass} py-3 rounded-xl font-black text-xs md:text-sm tracking-wider uppercase transition-all flex items-center justify-center gap-2">
                    <i data-lucide="heart" class="w-4 h-4 text-rose-500 fill-rose-500"></i> Para los Papis (Goles y Asist)
                </button>
                <button onclick="MoncofaApp.UI.viewMatchReport(${matchId}, 'coaches')" class="${coachesTabClass} py-3 rounded-xl font-black text-xs md:text-sm tracking-wider uppercase transition-all flex items-center justify-center gap-2">
                    <i data-lucide="clipboard-list" class="w-4 h-4"></i> Para Entrenadores (Minutos y Cambios)
                </button>
            </div>

            <!-- Tab Content -->
            <div class="space-y-4">
                ${tabContentHtml}
            </div>
        `;

        this.openModal(html);
        lucide.createIcons();

        // Restore modal width reset on close
        const oldClose = this.closeModal;
        this.closeModal = function() {
            modalContent.classList.remove('max-w-4xl');
            modalContent.classList.add('max-w-sm');
            oldClose.call(this);
            MoncofaApp.UI.closeModal = oldClose; // Restore original
        };
    }
};
