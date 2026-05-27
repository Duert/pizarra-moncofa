"use strict";

window.MoncofaApp = window.MoncofaApp || {};

MoncofaApp.UI = {
    init() {
        lucide.createIcons();
        this.updateAll();

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

    toggleDarkMode() {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('moncofa_dark_mode', isDark);

        // Update Icon
        const btn = document.getElementById('theme-toggle-btn');
        if (btn) {
            btn.innerHTML = isDark
                ? '<i data-lucide="sun" class="w-5 h-5 text-yellow-400"></i>'
                : '<i data-lucide="moon" class="w-5 h-5 text-slate-600"></i>';
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
                <button onclick="MoncofaApp.UI.closeModal()" class="bg-slate-800 text-white w-full py-2 rounded-lg font-bold">Entendido</button>
            </div>
        `;
        this.openModal(html);
    }
};
