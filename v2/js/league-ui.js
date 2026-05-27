"use strict";

window.MoncofaApp = window.MoncofaApp || {};

MoncofaApp.LeagueUI = {
    currentTab: 'standings',
    currentSeasonId: null,

    async init() {
        // Load current season
        const currentSeason = await MoncofaApp.DB.getCurrentSeason();
        if (currentSeason) {
            this.currentSeasonId = currentSeason.id;
            document.getElementById('league-title-display').innerText = currentSeason.name;
        } else {
            document.getElementById('league-title-display').innerText = "SIN TEMPORADA ACTIVA";
        }

        await this.renderCurrentTab();
    },

    async switchTab(tab) {
        this.currentTab = tab;
        const tabs = document.querySelectorAll('.league-tab');
        tabs.forEach(t => {
            const isTarget = t.getAttribute('onclick').includes(`'${tab}'`);
            t.classList.toggle('active', isTarget);
            t.classList.toggle('text-yellow-600', isTarget);
            t.classList.toggle('border-b-2', isTarget);
            t.classList.toggle('border-yellow-600', isTarget);
            t.classList.toggle('text-slate-500', !isTarget);
        });
        await this.renderCurrentTab();
    },

    async renderCurrentTab() {
        const container = document.getElementById('league-content-area');
        if (!container) return;
        container.innerHTML = `<div class="flex justify-center items-center py-20"><i data-lucide="loader-2" class="w-8 h-8 text-yellow-500 animate-spin"></i></div>`;
        lucide.createIcons();

        try {
            if (this.currentTab === 'dashboard') await this.renderDashboard(container);
            else if (this.currentTab === 'standings') await this.renderStandings(container);
            else if (this.currentTab === 'calendar') await this.renderCalendar(container);
            else if (this.currentTab === 'teams') await this.renderTeams(container);
            else if (this.currentTab === 'squad') await this.renderSquad(container);
            else if (this.currentTab === 'settings') await this.renderSettings(container);
            
            lucide.createIcons();
        } catch (e) {
            console.error("Error rendering league:", e);
            container.innerHTML = `<div class="p-8 text-center text-red-500">Error al cargar datos de la liga.</div>`;
        }
    },

    // ==========================================
    // STANDINGS (Clasificación)
    // ==========================================
    async renderStandings(container) {
        if (!this.currentSeasonId) {
            container.innerHTML = `<div class="p-10 text-center text-slate-500 font-bold">No hay temporada activa. Ve a Ajustes para crear una.</div>`;
            return;
        }

        const standings = await MoncofaApp.LeagueManager.generateStandings(this.currentSeasonId);
        const calendar = await MoncofaApp.DB.getCalendarMatches(this.currentSeasonId);
        const playedMatches = calendar.filter(m => m.isPlayed);

        if (standings.length === 0) {
            container.innerHTML = `<div class="p-10 text-center text-slate-500 font-bold">No hay equipos en la liga. Ve a la pestaña Equipos.</div>`;
            return;
        }

        // Get season name
        const season = await MoncofaApp.DB.getCurrentSeason();
        const seasonName = season ? season.name : 'Temporada';

        let html = `
            <div class="p-4 max-w-4xl mx-auto">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="font-black text-2xl text-slate-800 uppercase tracking-tighter">Clasificación</h3>
                    <button onclick="MoncofaApp.LeagueUI.downloadStandingsImage()" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow transition-all text-xs md:text-sm">
                        <i data-lucide="download" class="w-4 h-4"></i> Descargar Imagen
                    </button>
                </div>
                
                <div id="standings-table-card" class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden p-0.5 bg-slate-50">
                    <div class="bg-indigo-900 border-b border-indigo-950 rounded-t-2xl flex justify-between items-center p-5 text-white gap-4 relative">
                        <!-- Left Part: Logo & Titles -->
                        <div class="flex items-center gap-3.5">
                            <div class="w-12 h-12 bg-white rounded-xl flex items-center justify-center p-1 shadow-sm">
                                <img src="${season && season.leagueLogo ? season.leagueLogo : 'assets/icon.png'}" class="w-full h-full object-contain" onerror="this.src='../assets/icon.png'">
                            </div>
                            <div class="flex flex-col justify-center">
                                <h4 class="font-black uppercase tracking-tight text-[16px] md:text-[18px] leading-tight m-0 p-0">Clasificación de la Liga</h4>
                                <p class="text-[11px] md:text-[12px] text-indigo-300 font-bold uppercase tracking-wider mt-1 leading-none m-0 p-0">${seasonName.toLowerCase().includes('temporada') ? seasonName : 'Temporada ' + seasonName}</p>
                            </div>
                        </div>
                        <!-- Right Part: Category & Group -->
                        <div class="flex flex-col items-end justify-center text-right">
                            <span class="text-[11px] md:text-[12px] font-black uppercase text-indigo-100 tracking-tight leading-tight m-0 p-0">Benjamí Mixt Castelló</span>
                            <span class="text-[10px] md:text-[11px] font-black uppercase text-white tracking-wider mt-1 leading-none m-0 p-0">Grup 2</span>
                        </div>
                    </div>
                    
                    <div class="overflow-x-auto">
                        <table class="w-full text-left text-sm border-collapse min-w-[700px] bg-white">
                            <thead>
                                <tr class="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200">
                                    <th class="p-3 font-bold text-center w-10">Pos</th>
                                    <th class="p-3 font-bold sticky left-0 bg-slate-50 z-10 shadow-[1px_0_0_#e2e8f0]">Equipo / Forma</th>
                                    <th class="p-3 font-bold text-center text-blue-600 text-sm w-14">PTS</th>
                                    <th class="p-3 font-bold text-center w-12">PJ</th>
                                    <th class="p-3 font-bold text-center text-green-600 w-12">PG</th>
                                    <th class="p-3 font-bold text-center text-orange-500 w-12">PE</th>
                                    <th class="p-3 font-bold text-center text-red-600 w-12">PP</th>
                                    <th class="p-3 font-bold text-center text-green-500 w-12">GF</th>
                                    <th class="p-3 font-bold text-center text-red-500 w-12">GC</th>
                                    <th class="p-3 font-bold text-center w-14">DIF</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-100">
        `;

        standings.forEach(t => {
            const isUs = t.isUs ? 'bg-blue-50/30' : 'hover:bg-slate-50/50';
            const nameColor = t.isUs ? 'text-blue-700 font-black' : 'text-slate-700 font-bold';
            
            // Calculate Form for this team
            const teamMatches = playedMatches
                .filter(m => m.homeTeamId === t.teamId || m.awayTeamId === t.teamId)
                .sort((a,b) => b.matchday - a.matchday)
                .slice(0, 5);
            
            const formHtml = teamMatches.reverse().map(m => {
                const isHome = m.homeTeamId === t.teamId;
                const result = m.homeScore === m.awayScore ? 'E' : ((isHome && m.homeScore > m.awayScore) || (!isHome && m.awayScore > m.homeScore)) ? 'G' : 'P';
                const color = result === 'G' ? 'bg-green-500' : result === 'E' ? 'bg-orange-500' : 'bg-red-500';
                return `<span class="${color} w-3 h-3 rounded-full inline-block" title="${result}"></span>`;
            }).join('<span class="w-0.5"></span>');

            html += `
                <tr class="${isUs} transition-colors group">
                    <td class="p-3 text-center font-bold text-slate-400">${t.position}</td>
                    <td class="p-3 sticky left-0 bg-white shadow-[1px_0_0_#e2e8f0] z-10 group-hover:bg-slate-50 transition-colors whitespace-nowrap">
                        <div class="flex items-center gap-3">
                            <div class="w-9 h-9 rounded-lg bg-white border border-slate-100 flex items-center justify-center p-1 shadow-sm flex-shrink-0">
                                ${t.teamLogo ? `<img src="${t.teamLogo}" style="max-width:100%; max-height:100%; object-fit:contain;">` : `<div class="w-6 h-6 rounded-md bg-slate-200 flex items-center justify-center text-slate-400"><i data-lucide="shield" class="w-3.5 h-3.5"></i></div>`}
                            </div>
                            <div class="flex flex-col justify-center">
                                <span class="${nameColor} uppercase tracking-tight text-[11px] md:text-[13px] leading-tight whitespace-nowrap">${t.teamName}</span>
                                <div class="flex items-center mt-2.5">${formHtml}</div>
                            </div>
                        </div>
                    </td>
                    <td class="p-3 text-center font-black text-blue-600 text-lg bg-blue-50/20">${t.points}</td>
                    <td class="p-3 text-center font-bold text-slate-600">${t.played}</td>
                    <td class="p-3 text-center text-green-600 font-bold">${t.won}</td>
                    <td class="p-3 text-center text-orange-500 font-bold">${t.drawn}</td>
                    <td class="p-3 text-center text-red-600 font-bold">${t.lost}</td>
                    <td class="p-3 text-center font-bold text-slate-500">${t.gf}</td>
                    <td class="p-3 text-center font-bold text-slate-500">${t.gc}</td>
                    <td class="p-3 text-center font-black ${t.gd > 0 ? 'text-green-500' : t.gd < 0 ? 'text-red-500' : 'text-slate-400'}">${t.gd > 0 ? '+'+t.gd : t.gd}</td>
                </tr>
            `;
        });

        html += `</tbody></table></div></div></div>`;
        container.innerHTML = html;
        lucide.createIcons();
    },

    async downloadStandingsImage() {
        const card = document.getElementById('standings-table-card');
        if (!card) return;

        try {
            const btn = document.querySelector('button[onclick*="downloadStandingsImage"]');
            const originalContent = btn.innerHTML;
            btn.innerHTML = `<i class="animate-spin inline-block mr-2">⏳</i> Generando...`;
            btn.disabled = true;

            // 1. Store original styles
            const originalStyle = card.getAttribute('style') || '';
            const scrollableDiv = card.querySelector('.overflow-x-auto');
            const originalScrollStyle = scrollableDiv ? scrollableDiv.getAttribute('style') || '' : '';

            // 2. Apply print/export styles directly to the onscreen element to force standard wide width
            card.style.width = '850px';
            card.style.maxWidth = '850px';
            card.style.margin = '0 auto';
            card.style.boxShadow = 'none';
            card.style.border = '1px solid #e2e8f0';

            if (scrollableDiv) {
                scrollableDiv.style.overflow = 'visible';
                scrollableDiv.style.width = '100%';
            }

            // Wait for the browser to finish reflow/layout calculations for the new styles
            await new Promise(resolve => setTimeout(resolve, 150));

            // Fix letter-spacing bug for html2canvas (causes off-center text)
            const trackingElements = card.querySelectorAll('[class*="tracking-"]');
            const originalClasses = new Map();
            trackingElements.forEach(el => {
                const classes = Array.from(el.classList).filter(c => c.startsWith('tracking-'));
                originalClasses.set(el, classes);
                classes.forEach(c => el.classList.remove(c));
            });

            // 3. Render using html2canvas directly from the on-screen card!
            const canvas = await html2canvas(card, {
                scale: 3, // Ultra-sharp 3x resolution
                useCORS: true,
                backgroundColor: '#ffffff',
                logging: false
            });

            // Restore tracking classes
            trackingElements.forEach(el => {
                const classes = originalClasses.get(el);
                if (classes) classes.forEach(c => el.classList.add(c));
            });

            // 4. Restore original styles immediately
            if (originalStyle) {
                card.setAttribute('style', originalStyle);
            } else {
                card.removeAttribute('style');
            }

            if (scrollableDiv) {
                if (originalScrollStyle) {
                    scrollableDiv.setAttribute('style', originalScrollStyle);
                } else {
                    scrollableDiv.removeAttribute('style');
                }
            }

            // 5. Download the image
            const dataUrl = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.download = `Clasificacion_Liga_${Date.now()}.png`;
            link.href = dataUrl;
            link.click();

            // Restore button state
            btn.innerHTML = originalContent;
            btn.disabled = false;
            
            // Re-render icons if needed
            lucide.createIcons();
        } catch (error) {
            console.error("Error generating standings image", error);
            MoncofaApp.UI.showToast("No se pudo generar la imagen. Inténtalo de nuevo.", "error");
            const btn = document.querySelector('button[onclick*="downloadStandingsImage"]');
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = `<i data-lucide="download" class="w-4 h-4"></i> Descargar Imagen`;
                lucide.createIcons();
            }
        }
    },

    async renderDashboard(container) {
        try {
            if (!this.currentSeasonId) {
                container.innerHTML = `<div class="p-10 text-center text-slate-500 font-bold">No hay una temporada activa seleccionada. Crea una en Ajustes.</div>`;
                return;
            }

            // Pre-fetch all needed data
            const [stats, matches, calendar, players, playerStats, leagueTeams] = await Promise.all([
                MoncofaApp.StatsEngine.getGlobalStats(this.currentSeasonId),
                MoncofaApp.DB.getAllMatches(),
                MoncofaApp.DB.getCalendarMatches(this.currentSeasonId),
                MoncofaApp.DB.getPlayers(),
                MoncofaApp.StatsEngine.getPlayersStats(this.currentSeasonId),
                MoncofaApp.DB.getLeagueTeams(this.currentSeasonId)
            ]);
        
        // Find next match of our team
        const nextMatch = calendar.filter(m => (m.isOurMatch === 1 || m.isOurMatch === true) && !m.isPlayed).sort((a,b) => a.matchday - b.matchday)[0];
        const lastMatches = matches.sort((a,b) => b.id - a.id).slice(0, 5);

        let topScorer = playerStats.sort((a,b) => b.goals - a.goals)[0];
        let pScorer = topScorer && topScorer.goals > 0 ? players.find(x => x.id === topScorer.playerId) : null;

        let topAssister = playerStats.sort((a,b) => b.assists - a.assists)[0];
        let pAssister = topAssister && topAssister.assists > 0 ? players.find(x => x.id === topAssister.playerId) : null;

        let topParticipation = playerStats.sort((a,b) => (b.goals + b.assists) - (a.goals + a.assists))[0];
        let pParticipation = topParticipation && (topParticipation.goals + topParticipation.assists) > 0 ? players.find(x => x.id === topParticipation.playerId) : null;

        let html = `
            <div class="p-6 space-y-8 animate-in fade-in duration-500">
                <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
                    <!-- Next Match Card -->
                    <div class="md:col-span-12 bg-gradient-to-br from-slate-900 to-indigo-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
                        <div class="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32 blur-3xl"></div>
                        <div class="relative z-10">
                            <span class="bg-blue-500 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest mb-4 inline-block">Próximo Encuentro</span>
                            ${nextMatch ? `
                                <div class="flex items-center justify-between mt-4">
                                    <div class="text-center w-1/3">
                                        <p class="text-xs font-bold text-slate-400 uppercase mb-2">Local</p>
                                        <p class="text-xl font-black uppercase tracking-tighter">${leagueTeams.find(t => t.id === nextMatch.homeTeamId)?.name || '?'}</p>
                                    </div>
                                    <div class="text-center">
                                        <p class="text-4xl font-black text-blue-400">VS</p>
                                        <p class="text-[10px] font-bold text-slate-400 mt-2">JORNADA ${nextMatch.matchday}</p>
                                    </div>
                                    <div class="text-center w-1/3">
                                        <p class="text-xs font-bold text-slate-400 uppercase mb-2">Visitante</p>
                                        <p class="text-xl font-black uppercase tracking-tighter">${leagueTeams.find(t => t.id === nextMatch.awayTeamId)?.name || '?'}</p>
                                    </div>
                                </div>
                            ` : '<p class="text-2xl font-black mt-4">No hay más partidos programados</p>'}
                        </div>
                    </div>

                    <!-- Top Scorer -->
                    <div class="md:col-span-4 lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-100 shadow-xl flex flex-col items-center text-center">
                        <h4 class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Máximo Goleador</h4>
                        ${pScorer ? `
                            <div class="w-20 h-20 rounded-full overflow-hidden border-4 border-yellow-400 shadow-lg mb-4">
                                <img src="${pScorer.photo || 'https://ui-avatars.com/api/?name='+pScorer.name}" class="w-full h-full object-cover">
                            </div>
                            <p class="font-black text-slate-800 text-base uppercase tracking-tighter truncate w-full">${pScorer.name}</p>
                            <div class="bg-yellow-100 text-yellow-700 px-4 py-1 rounded-full text-[10px] font-black mt-2">${topScorer.goals} GOLES</div>
                        ` : '<p class="text-slate-300 font-bold mt-10">Sin datos</p>'}
                    </div>

                    <!-- Top Assister -->
                    <div class="md:col-span-4 lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-100 shadow-xl flex flex-col items-center text-center">
                        <h4 class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Máximo Asistente</h4>
                        ${pAssister ? `
                            <div class="w-20 h-20 rounded-full overflow-hidden border-4 border-blue-400 shadow-lg mb-4">
                                <img src="${pAssister.photo || 'https://ui-avatars.com/api/?name='+pAssister.name}" class="w-full h-full object-cover">
                            </div>
                            <p class="font-black text-slate-800 text-base uppercase tracking-tighter truncate w-full">${pAssister.name}</p>
                            <div class="bg-blue-100 text-blue-700 px-4 py-1 rounded-full text-[10px] font-black mt-2">${topAssister.assists} ASISTENCIAS</div>
                        ` : '<p class="text-slate-300 font-bold mt-10">Sin datos</p>'}
                    </div>

                    <!-- Top Participation -->
                    <div class="md:col-span-4 lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-100 shadow-xl flex flex-col items-center text-center">
                        <h4 class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Mayor Participación</h4>
                        ${pParticipation ? `
                            <div class="w-20 h-20 rounded-full overflow-hidden border-4 border-amber-400 shadow-lg mb-4">
                                <img src="${pParticipation.photo || 'https://ui-avatars.com/api/?name='+pParticipation.name}" class="w-full h-full object-cover">
                            </div>
                            <p class="font-black text-slate-800 text-base uppercase tracking-tighter truncate w-full">${pParticipation.name}</p>
                            <div class="bg-amber-100 text-amber-700 px-4 py-1 rounded-full text-[10px] font-black mt-2">${topParticipation.goals + topParticipation.assists} G+A</div>
                        ` : '<p class="text-slate-300 font-bold mt-10">Sin datos</p>'}
                    </div>
                </div>

                <!-- Recent Form -->
                <div class="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                    <h4 class="text-xs font-black text-slate-500 uppercase tracking-widest mb-6 border-b pb-4">Estado de Forma (Últimos 5 partidos)</h4>
                    <div class="flex gap-4">
                        ${lastMatches.length > 0 ? lastMatches.map(m => {
                            const result = m.homeScore === m.awayScore ? 'E' : ((m.isHome && m.homeScore > m.awayScore) || (!m.isHome && m.awayScore > m.homeScore)) ? 'G' : 'P';
                            const color = result === 'G' ? 'bg-green-500' : result === 'E' ? 'bg-orange-500' : 'bg-red-500';
                            return `<div class="${color} w-10 h-10 rounded-full flex items-center justify-center text-white font-black shadow-lg transform hover:scale-110 transition-all cursor-default" title="${m.rivalName}: ${m.homeScore}-${m.awayScore}">${result}</div>`;
                        }).join('') : '<p class="text-slate-300 italic">No se han jugado partidos todavía</p>'}
                    </div>
                </div>

                <!-- Team Stats Summary -->
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div class="bg-emerald-50 p-6 rounded-3xl border border-emerald-100 text-center">
                        <p class="text-[10px] font-black text-emerald-600 uppercase mb-1">Goles Favor</p>
                        <p class="text-3xl font-black text-emerald-700">${stats.totalGoals || 0}</p>
                    </div>
                    <div class="bg-red-50 p-6 rounded-3xl border border-red-100 text-center">
                        <p class="text-[10px] font-black text-red-600 uppercase mb-1">Goles Contra</p>
                        <p class="text-3xl font-black text-red-700">${stats.totalGoalsConceded || 0}</p>
                    </div>
                    <div class="bg-blue-50 p-6 rounded-3xl border border-blue-100 text-center">
                        <p class="text-[10px] font-black text-blue-600 uppercase mb-1">Portería Cero</p>
                        <p class="text-3xl font-black text-blue-700">${stats.cleanSheets || 0}</p>
                    </div>
                    <div class="bg-indigo-50 p-6 rounded-3xl border border-indigo-100 text-center">
                        <p class="text-[10px] font-black text-indigo-600 uppercase mb-1">Partidos</p>
                        <p class="text-3xl font-black text-indigo-700">${stats.matchesCount || 0}</p>
                    </div>
                </div>
            </div>
        `;
        container.innerHTML = html;
        lucide.createIcons();
        } catch (e) {
            console.error("Dashboard Error Detail:", e);
            container.innerHTML = `
                <div class="p-10 text-center">
                    <div class="bg-red-50 text-red-700 p-6 rounded-3xl border border-red-100 max-w-lg mx-auto">
                        <i data-lucide="alert-circle" class="w-12 h-12 mx-auto mb-4 opacity-50"></i>
                        <h3 class="font-black uppercase tracking-tight text-lg mb-2">Error al cargar el resumen</h3>
                        <p class="text-sm opacity-80 mb-4">${e.message || 'Error desconocido'}</p>
                        <button onclick="location.reload()" class="bg-red-600 text-white px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-red-700 transition-all">Reintentar</button>
                    </div>
                </div>
            `;
            lucide.createIcons();
        }
    },

    async renderTeams(container) {
        const teams = await MoncofaApp.DB.getLeagueTeams(this.currentSeasonId);
        
        // Auto-cleanup any 'undefined' or 'null' base64 logo strings from existing teams
        for (let t of teams) {
            if (t.logo === 'undefined' || t.logo === 'null') {
                t.logo = '';
                await MoncofaApp.DB.saveLeagueTeam(t);
            }
        }

        let html = `
            <div class="p-6">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="font-black text-2xl text-slate-800 uppercase tracking-tighter">Equipos de la Liga</h3>
                    <button onclick="MoncofaApp.LeagueUI.showTeamModal()" class="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-blue-700 flex items-center gap-2 shadow-lg transition-all">
                        <i data-lucide="plus-circle" class="w-5 h-5"></i> Añadir Equipo
                    </button>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        `;

        if (teams.length === 0) {
            html += `<div class="col-span-full py-12 text-center text-slate-400 font-bold">No hay equipos registrados. Añade los rivales de la temporada.</div>`;
        }

        teams.forEach(t => {
            html += `
                <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between group hover:bg-white hover:shadow-xl transition-all duration-300">
                    <div class="flex items-center gap-4">
                        <div onclick="event.stopPropagation(); document.getElementById('quick-logo-input-${t.id}').click()" class="w-12 h-12 bg-white rounded-xl p-1.5 shadow-sm border border-slate-200 flex items-center justify-center overflow-hidden cursor-pointer hover:border-blue-500 hover:shadow-md hover:scale-105 transition-all" title="Haga clic para subir el escudo rápidamente">
                            ${t.logo ? `<img src="${t.logo}" class="w-full h-full object-contain">` : `<div class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-blue-500 transition-all"><i data-lucide="upload" class="w-4 h-4"></i></div>`}
                            <input type="file" id="quick-logo-input-${t.id}" accept="image/*" class="hidden" onchange="MoncofaApp.LeagueUI.handleQuickLogoUpload(event, ${t.id})">
                        </div>
                        <div>
                            <p class="font-black text-slate-800 uppercase tracking-tight">${t.name}</p>
                            ${t.isUs ? '<span class="text-[9px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-full font-bold">MI EQUIPO</span>' : ''}
                        </div>
                    </div>
                    <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        <button onclick="MoncofaApp.LeagueUI.showTeamModal(${t.id})" class="p-2 text-slate-400 hover:text-blue-600"><i data-lucide="edit-2" class="w-4 h-4"></i></button>
                        <button onclick="MoncofaApp.LeagueUI.deleteTeam(${t.id})" class="p-2 text-slate-400 hover:text-red-600"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                    </div>
                </div>
            `;
        });

        html += `</div></div>`;
        container.innerHTML = html;
        lucide.createIcons();
    },

    async handleQuickLogoUpload(event, teamId) {
        event.stopPropagation();
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            const dataUrl = e.target.result;
            try {
                const team = await MoncofaApp.DB.league_teams.get(teamId);
                if (team) {
                    team.logo = dataUrl;
                    await MoncofaApp.DB.saveLeagueTeam(team);
                    // Re-render the active Teams tab
                    await this.renderCurrentTab();
                }
            } catch(err) {
                console.error("Error updating quick team logo:", err);
            }
        };
        reader.readAsDataURL(file);
    },

    async renderSquad(container) {
        let players = await MoncofaApp.DB.getPlayers();
        if (players.length === 0) {
            await MoncofaApp.DB.syncPlayersFromConstants();
            players = await MoncofaApp.DB.getPlayers();
        }

        let html = `
            <div class="p-6">
                <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h3 class="font-black text-3xl text-slate-800 uppercase tracking-tighter">Mi Plantilla</h3>
                        <p class="text-slate-500 font-bold text-sm uppercase tracking-widest">Gestiona las fichas y fotos de los jugadores</p>
                    </div>
                </div>

                <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        `;

        players.sort((a, b) => a.number - b.number).forEach(p => {
            html += `
                <div class="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 relative">
                    <div class="aspect-[4/5] bg-slate-100 relative overflow-hidden">
                        <img src="${p.photo || 'https://ui-avatars.com/api/?name=' + p.name + '&background=random&size=200'}" 
                             id="player-photo-${p.id}"
                             class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700">
                        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                        <div class="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg shadow-sm border border-white/50">
                            <span class="text-[10px] font-black text-slate-800 uppercase tracking-wider">${p.role}</span>
                        </div>
                        <div class="absolute bottom-4 left-4">
                            <span class="text-4xl font-black text-white italic drop-shadow-lg">${p.number}</span>
                        </div>
                        <button onclick="document.getElementById('photo-input-${p.id}').click()" 
                                class="absolute top-3 right-3 bg-blue-600 text-white p-2 rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-blue-700 hover:scale-110">
                            <i data-lucide="camera" class="w-4 h-4"></i>
                        </button>
                        <input type="file" id="photo-input-${p.id}" hidden accept="image/*" onchange="MoncofaApp.LeagueUI.handlePlayerPhotoUpload(${p.id}, this)">
                    </div>
                    <div class="p-4 bg-white text-center">
                        <h4 class="font-black text-slate-800 uppercase tracking-tight leading-tight mb-1 truncate px-1">${p.name}</h4>
                    </div>
                </div>
            `;
        });

        html += `</div></div>`;
        container.innerHTML = html;
        lucide.createIcons();
    },

    async handlePlayerPhotoUpload(playerId, input) {
        if (!input.files || !input.files[0]) return;
        const file = input.files[0];
        const reader = new FileReader();
        reader.onload = async (e) => {
            const img = new Image();
            img.onload = async () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 256;
                const MAX_HEIGHT = 256;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }
                
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                const b64 = canvas.toDataURL('image/jpeg', 0.8);
                await MoncofaApp.DB.updatePlayerPhoto(playerId, b64);
                const imgEl = document.getElementById(`player-photo-${playerId}`);
                if (imgEl) imgEl.src = b64;
                MoncofaApp.UI.showToast("¡Foto de jugador actualizada!", "success");
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    },

    showTeamModal(teamId = null) {
        const loadTeamHtml = async () => {
            let t = { name: '', logo: '', isUs: false };
            if (teamId) {
                const teams = await MoncofaApp.DB.getLeagueTeams(this.currentSeasonId);
                const found = teams.find(x => x.id === teamId);
                if (found) t = found;
            }

            const html = `
                <div class="flex justify-between items-center mb-4">
                    <h3 class="font-bold text-lg flex items-center gap-2 text-slate-800"><i data-lucide="shield" class="w-5 h-5 text-blue-500"></i> ${teamId ? 'Editar Equipo' : 'Nuevo Equipo'}</h3>
                    <button onclick="MoncofaApp.UI.closeModal()" class="text-slate-400 hover:text-slate-600"><i data-lucide="x" class="w-6 h-6"></i></button>
                </div>
                <form id="team-form" onsubmit="event.preventDefault(); MoncofaApp.LeagueUI.saveTeam(${teamId || 'null'})" class="space-y-4">
                    <div>
                        <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Nombre del Equipo</label>
                        <input type="text" id="team-name" required class="w-full border p-2 rounded-lg bg-slate-50 font-bold" value="${t.name}">
                    </div>
                    
                    <div>
                        <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Escudo (Subir Imagen)</label>
                        <input type="file" id="league-team-logo-input" accept="image/*" class="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100">
                        <div id="logo-feedback">
                            ${t.logo && t.logo !== 'undefined' && t.logo !== 'null' ? `<div class="mt-2 text-xs text-green-600 font-bold flex items-center gap-1"><i data-lucide="check-circle" class="w-4 h-4"></i> Escudo actual guardado</div><img src="${t.logo}" class="w-12 h-12 object-contain mt-2 border border-slate-200 rounded p-1 bg-white">` : ''}
                        </div>
                        <input type="hidden" id="team-logo-b64" value="${t.logo && t.logo !== 'undefined' && t.logo !== 'null' ? t.logo : ''}">
                    </div>

                    <div class="flex items-center gap-2 mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                        <input type="checkbox" id="team-isus" class="w-4 h-4 text-blue-600 rounded" ${t.isUs ? 'checked' : ''}>
                        <label for="team-isus" class="text-sm font-bold text-blue-800">Este es NUESTRO equipo (C.F. Platges de Moncofa)</label>
                    </div>
                    <p class="text-[10px] text-slate-500 italic mt-1 leading-tight">Marcar esta casilla permitirá conectar el calendario automáticamente con la Pizarra Táctica.</p>

                    <button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-lg transition-all mt-4">
                        Guardar Equipo
                    </button>
                </form>
            `;
            MoncofaApp.UI.openModal(html);
            lucide.createIcons();

            document.getElementById('league-team-logo-input').addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(event) {
                        const img = new Image();
                        img.onload = function() {
                            const canvas = document.createElement('canvas');
                            const MAX_WIDTH = 256;
                            const MAX_HEIGHT = 256;
                            let width = img.width;
                            let height = img.height;

                            if (width > height) {
                                if (width > MAX_WIDTH) {
                                    height *= MAX_WIDTH / width;
                                    width = MAX_WIDTH;
                                }
                            } else {
                                if (height > MAX_HEIGHT) {
                                    width *= MAX_HEIGHT / height;
                                    height = MAX_HEIGHT;
                                }
                            }
                            
                            canvas.width = width;
                            canvas.height = height;
                            const ctx = canvas.getContext('2d');
                            ctx.drawImage(img, 0, 0, width, height);
                            
                            const dataUrl = canvas.toDataURL('image/png');
                            document.getElementById('team-logo-b64').value = dataUrl;
                            
                            const feedbackDiv = document.getElementById('logo-feedback');
                            if (feedbackDiv) {
                                feedbackDiv.innerHTML = `<img src="${dataUrl}" class="w-12 h-12 object-contain mt-2 border border-slate-200 rounded p-1 bg-white">`;
                            }
                        };
                        img.src = event.target.result;
                    };
                    reader.readAsDataURL(file);
                }
            });
        };
        loadTeamHtml();
    },

    async saveTeam(id) {
        const name = document.getElementById('team-name').value;
        let logo = document.getElementById('team-logo-b64').value;
        const isUs = document.getElementById('team-isus').checked;

        if (!logo || logo === 'undefined' || logo === 'null') {
            logo = '';
        }

        if (isUs) {
            const all = await MoncofaApp.DB.getLeagueTeams(this.currentSeasonId);
            for (let t of all) {
                if (t.isUs && t.id !== id) {
                    t.isUs = false;
                    await MoncofaApp.DB.saveLeagueTeam(t);
                }
            }
        }

        const teamObj = {
            seasonId: this.currentSeasonId,
            name: name,
            logo: logo,
            isUs: isUs
        };
        if (id) teamObj.id = id;

        await MoncofaApp.DB.saveLeagueTeam(teamObj);
        MoncofaApp.UI.closeModal();
        this.renderCurrentTab();
    },

    async deleteTeam(id) {
        MoncofaApp.UI.showConfirm(
            "Eliminar Equipo",
            "¿Seguro que deseas eliminar este equipo? Se borrarán sus resultados del calendario.",
            async () => {
                await MoncofaApp.DB.deleteLeagueTeam(id);
                const matches = await MoncofaApp.DB.getCalendarMatches(this.currentSeasonId);
                for (let m of matches) {
                    if (m.homeTeamId === id || m.awayTeamId === id) {
                        await MoncofaApp.DB.deleteCalendarMatch(m.id);
                    }
                }
                MoncofaApp.UI.showToast("Equipo eliminado con éxito.", "success");
                this.renderCurrentTab();
            }
        );
    },

    // ==========================================
    // CALENDAR
    // ==========================================
    async renderCalendar(container) {
        if (!this.currentSeasonId) {
            container.innerHTML = `<div class="p-10 text-center text-slate-500 font-bold">No hay temporada activa. Ve a Ajustes para crear una.</div>`;
            return;
        }

        const teams = await MoncofaApp.DB.getLeagueTeams(this.currentSeasonId);
        if (teams.length < 2) {
            container.innerHTML = `<div class="p-10 text-center text-slate-500 font-bold">Se necesitan al menos 2 equipos para crear partidos. Ve a la pestaña Equipos.</div>`;
            return;
        }

        const allMatches = await MoncofaApp.DB.getCalendarMatches(this.currentSeasonId);
        let maxJ = 1;
        allMatches.forEach(m => { if (m.matchday > maxJ) maxJ = m.matchday; });
        const season = await MoncofaApp.DB.getCurrentSeason();
        const totalJ = season?.matchdaysCount || 26;
        
        if (!this.currentMatchday) this.currentMatchday = 1;

        let options = '';
        for (let i = 1; i <= Math.max(maxJ, totalJ); i++) {
            options += `<option value="${i}" ${this.currentMatchday === i ? 'selected' : ''}>Jornada ${i}</option>`;
        }

        const dayMatches = allMatches.filter(m => m.matchday === this.currentMatchday);

        let html = `
            <div class="p-6">
                <div class="flex flex-col md:flex-row justify-between items-center mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div class="flex items-center gap-4 w-full md:w-auto">
                        <label class="font-black text-slate-700 uppercase tracking-tight text-sm whitespace-nowrap"><i data-lucide="calendar" class="w-4 h-4 inline mb-1"></i> Calendario</label>
                        <select id="jornada-select" onchange="MoncofaApp.LeagueUI.changeMatchday(this.value)" class="bg-white border-2 border-slate-300 text-slate-800 font-bold text-lg rounded-lg px-4 py-2 w-full md:w-48 shadow-sm focus:border-blue-500 outline-none">
                            ${options}
                        </select>
                    </div>
                    <button onclick="MoncofaApp.LeagueUI.showMatchModal()" class="mt-4 md:mt-0 bg-emerald-600 text-white font-bold px-4 py-2 rounded-lg hover:bg-emerald-700 flex items-center justify-center gap-2 shadow-sm transition-colors w-full md:w-auto">
                        <i data-lucide="plus" class="w-4 h-4"></i> Añadir Partido
                    </button>
                </div>

                <div class="space-y-3">
        `;

        if (dayMatches.length === 0) {
            html += `<div class="p-10 text-center text-slate-400 italic bg-white rounded-xl border border-dashed border-slate-300">No hay partidos programados para esta jornada.</div>`;
        } else {
            dayMatches.forEach(m => {
                const home = teams.find(t => t.id === m.homeTeamId);
                const away = teams.find(t => t.id === m.awayTeamId);
                if (!home || !away) return;

                const isOurGame = home.isUs || away.isUs;
                const borderClass = isOurGame ? 'border-blue-400 shadow-blue-100' : 'border-slate-200';
                const bgClass = isOurGame ? 'bg-blue-50/20' : 'bg-white';

                html += `
                    <div class="flex flex-col md:flex-row items-center border ${borderClass} ${bgClass} rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow relative">
                        ${isOurGame ? `<div class="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full tracking-widest uppercase shadow-sm">Nuestro Partido</div>` : ''}
                        
                        <div class="w-full md:w-48 text-center md:text-left mb-3 md:mb-0 border-b md:border-b-0 md:border-r border-slate-100 pb-2 md:pb-0 md:pr-4 flex flex-col justify-center">
                            <span class="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center justify-center md:justify-start gap-1"><i data-lucide="calendar-clock" class="w-3 h-3"></i> ${m.date || 'Sin Fecha'}</span>
                            <span class="text-lg font-black text-slate-700">${m.time || '--:--'}</span>
                        </div>

                        <div class="flex-1 flex items-center justify-center gap-2 md:gap-6 w-full py-2">
                            <div class="flex-1 flex items-center justify-end gap-2 md:gap-3 text-right">
                                <span class="font-bold text-slate-800 text-sm md:text-base ${home.isUs ? 'text-blue-700' : ''}">${home.name}</span>
                                ${home.logo ? `<img src="${home.logo}" class="w-8 h-8 md:w-10 md:h-10 object-contain drop-shadow-sm">` : `<div class="w-8 h-8 bg-slate-100 rounded-full"></div>`}
                            </div>

                            <div class="bg-slate-800 text-white px-3 md:px-5 py-2 rounded-xl flex items-center justify-center min-w-[80px] md:min-w-[100px] shadow-inner font-display text-xl md:text-2xl font-bold tracking-widest cursor-pointer hover:bg-slate-700 transition-colors" onclick="MoncofaApp.LeagueUI.showScoreModal(${m.id})">
                                ${m.isPlayed ? `${m.homeScore} - ${m.awayScore}` : 'VS'}
                            </div>

                            <div class="flex-1 flex items-center justify-start gap-2 md:gap-3 text-left">
                                ${away.logo ? `<img src="${away.logo}" class="w-8 h-8 md:w-10 md:h-10 object-contain drop-shadow-sm">` : `<div class="w-8 h-8 bg-slate-100 rounded-full"></div>`}
                                <span class="font-bold text-slate-800 text-sm md:text-base ${away.isUs ? 'text-blue-700' : ''}">${away.name}</span>
                            </div>
                        </div>

                        <div class="w-full md:w-auto mt-3 md:mt-0 flex items-center justify-center md:pl-4 border-t md:border-t-0 md:border-l border-slate-100 pt-2 md:pt-0 gap-2">
                            ${m.isPlayed ? `
                                <button onclick="MoncofaApp.ExportManager.shareMatchWhatsApp(${m.id})" class="p-2 text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors title="Compartir en WhatsApp">
                                    <i data-lucide="share-2" class="w-5 h-5"></i>
                                </button>
                            ` : ''}
                            <button onclick="MoncofaApp.LeagueUI.showMatchModal(${m.id})" class="p-2 text-slate-400 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 rounded-lg transition-colors"><i data-lucide="edit-3" class="w-5 h-5"></i></button>
                            <button onclick="MoncofaApp.LeagueUI.deleteMatch(${m.id})" class="p-2 text-slate-400 hover:text-red-600 bg-slate-50 hover:bg-red-50 rounded-lg transition-colors"><i data-lucide="trash-2" class="w-5 h-5"></i></button>
                        </div>
                    </div>
                `;
            });
        }

        html += `</div></div>`;
        container.innerHTML = html;
    },

    changeMatchday(day) {
        this.currentMatchday = parseInt(day);
        this.renderCurrentTab();
    },

    showMatchModal(matchId = null) {
        const loadHtml = async () => {
            const teams = await MoncofaApp.DB.getLeagueTeams(this.currentSeasonId);
            const allMatches = await MoncofaApp.DB.getCalendarMatches(this.currentSeasonId);
            const dayMatches = allMatches.filter(m => m.matchday === this.currentMatchday);
            
            let m = { matchday: this.currentMatchday, homeTeamId: '', awayTeamId: '', date: '', time: '' };
            if (matchId) {
                const found = allMatches.find(x => x.id === matchId);
                if (found) m = found;
            }

            // Filter teams that already have a match today
            const busyTeamIds = dayMatches.reduce((acc, match) => {
                if (match.id !== matchId) { // If editing, don't count the current match teams as busy
                    acc.add(match.homeTeamId);
                    acc.add(match.awayTeamId);
                }
                return acc;
            }, new Set());

            let teamOptions = `<option value="">-- Seleccionar Equipo --</option>`;
            teams.forEach(t => {
                if (!busyTeamIds.has(t.id)) {
                    teamOptions += `<option value="${t.id}">${t.name} ${t.isUs ? '(NOSOTROS)' : ''}</option>`;
                }
            });

            const html = `
                <div class="flex justify-between items-center mb-4">
                    <h3 class="font-bold text-lg flex items-center gap-2 text-slate-800"><i data-lucide="calendar" class="w-5 h-5 text-emerald-500"></i> ${matchId ? 'Editar Partido' : 'Añadir Partido'}</h3>
                    <button onclick="MoncofaApp.UI.closeModal()" class="text-slate-400 hover:text-slate-600"><i data-lucide="x" class="w-6 h-6"></i></button>
                </div>
                <form onsubmit="event.preventDefault(); MoncofaApp.LeagueUI.saveMatch(${matchId || 'null'})" class="space-y-4">
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Equipo Local</label>
                            <select id="match-home" required class="w-full border p-2 rounded-lg bg-slate-50 font-bold text-slate-700">
                                ${teamOptions.replace(`value="${m.homeTeamId}"`, `value="${m.homeTeamId}" selected`)}
                            </select>
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Equipo Visitante</label>
                            <select id="match-away" required class="w-full border p-2 rounded-lg bg-slate-50 font-bold text-slate-700">
                                ${teamOptions.replace(`value="${m.awayTeamId}"`, `value="${m.awayTeamId}" selected`)}
                            </select>
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                        <div>
                            <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Fecha</label>
                            <input type="date" id="match-date" class="w-full border p-2 rounded-lg bg-slate-50 text-slate-700" value="${m.date}">
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Hora</label>
                            <input type="time" id="match-time" class="w-full border p-2 rounded-lg bg-slate-50 text-slate-700" value="${m.time}">
                        </div>
                    </div>

                    <input type="hidden" id="match-matchday" value="${m.matchday}">

                    <button type="submit" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg shadow-lg transition-all mt-4">
                        Guardar Partido
                    </button>
                </form>
            `;
            MoncofaApp.UI.openModal(html);
            lucide.createIcons();
        };
        loadHtml();
    },

    async saveMatch(id) {
        const homeId = parseInt(document.getElementById('match-home').value);
        const awayId = parseInt(document.getElementById('match-away').value);
        const date = document.getElementById('match-date').value;
        const time = document.getElementById('match-time').value;
        const matchday = parseInt(document.getElementById('match-matchday').value);

        if (homeId === awayId) {
            MoncofaApp.UI.showToast("El equipo local y visitante no pueden ser el mismo.", "warning");
            return;
        }

        const teams = await MoncofaApp.DB.getLeagueTeams(this.currentSeasonId);
        const homeT = teams.find(t => t.id === homeId);
        const awayT = teams.find(t => t.id === awayId);
        const isOurMatch = (homeT && homeT.isUs) || (awayT && awayT.isUs) ? 1 : 0;

        const matchObj = {
            seasonId: this.currentSeasonId,
            matchday: matchday,
            homeTeamId: homeId,
            awayTeamId: awayId,
            date: date,
            time: time,
            isOurMatch: isOurMatch
        };

        if (id) {
            const allMatches = await MoncofaApp.DB.getCalendarMatches(this.currentSeasonId);
            const existing = allMatches.find(m => m.id === id);
            if(existing) {
                matchObj.isPlayed = existing.isPlayed;
                matchObj.homeScore = existing.homeScore;
                matchObj.awayScore = existing.awayScore;
                matchObj.id = id;
            }
        } else {
            matchObj.isPlayed = 0;
            matchObj.homeScore = 0;
            matchObj.awayScore = 0;
        }

        await MoncofaApp.DB.saveCalendarMatch(matchObj);
        MoncofaApp.UI.closeModal();
        this.renderCurrentTab();
    },

    async deleteMatch(id) {
        MoncofaApp.UI.showConfirm(
            "Eliminar Partido",
            "¿Seguro que deseas eliminar este partido del calendario?",
            async () => {
                await MoncofaApp.DB.deleteCalendarMatch(id);
                MoncofaApp.UI.showToast("Partido eliminado del calendario.", "success");
                this.renderCurrentTab();
            }
        );
    },

    showScoreModal(matchId) {
        const loadHtml = async () => {
            const matches = await MoncofaApp.DB.getCalendarMatches(this.currentSeasonId);
            const m = matches.find(x => x.id === matchId);
            if (!m) return;

            const teams = await MoncofaApp.DB.getLeagueTeams(this.currentSeasonId);
            const home = teams.find(t => t.id === m.homeTeamId);
            const away = teams.find(t => t.id === m.awayTeamId);

            if (m.isOurMatch) {
                this.showManualMatchEntryModal(matchId, m, home, away);
                return;
            }

            const html = `
                <div class="flex justify-between items-center mb-4">
                    <h3 class="font-bold text-lg flex items-center gap-2 text-slate-800"><i data-lucide="dribbble" class="w-5 h-5 text-slate-800"></i> Resultado Final</h3>
                    <button onclick="MoncofaApp.UI.closeModal()" class="text-slate-400 hover:text-slate-600"><i data-lucide="x" class="w-6 h-6"></i></button>
                </div>
                <form onsubmit="event.preventDefault(); MoncofaApp.LeagueUI.saveScore(${matchId})" class="space-y-6">
                    <div class="flex items-center justify-between gap-4">
                        <div class="flex-1 flex flex-col items-center">
                            ${home.logo ? `<img src="${home.logo}" class="w-12 h-12 mb-2 object-contain">` : ''}
                            <span class="font-bold text-sm text-center line-clamp-1 mb-2">${home.name}</span>
                            <input type="number" id="score-h" min="0" required class="w-16 h-16 text-center text-3xl font-black border-2 border-slate-300 rounded-xl focus:border-blue-500" value="${m.isPlayed ? m.homeScore : 0}">
                        </div>

                        <span class="font-black text-slate-300 text-2xl mt-8">-</span>

                        <div class="flex-1 flex flex-col items-center">
                            ${away.logo ? `<img src="${away.logo}" class="w-12 h-12 mb-2 object-contain">` : ''}
                            <span class="font-bold text-sm text-center line-clamp-1 mb-2">${away.name}</span>
                            <input type="number" id="score-a" min="0" required class="w-16 h-16 text-center text-3xl font-black border-2 border-slate-300 rounded-xl focus:border-blue-500" value="${m.isPlayed ? m.awayScore : 0}">
                        </div>
                    </div>

                    <div class="flex gap-2">
                        ${m.isPlayed ? `<button type="button" onclick="MoncofaApp.LeagueUI.resetScore(${matchId})" class="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-3 rounded-lg transition-all">Resetear a 'No Jugado'</button>` : ''}
                        <button type="submit" class="flex-[2] bg-slate-800 hover:bg-black text-white font-bold py-3 rounded-lg shadow-lg transition-all">
                            Guardar Resultado
                        </button>
                    </div>
                </form>
            `;
            MoncofaApp.UI.openModal(html);
            lucide.createIcons();
        };
        loadHtml();
    },

    manualSubs: [],
    manualGoals: [],

    async showManualMatchEntryModal(matchId, m, home, away) {
        let squad = await MoncofaApp.DB.getPlayers();
        if (squad.length === 0) {
            await MoncofaApp.DB.syncPlayersFromConstants();
            squad = await MoncofaApp.DB.getPlayers();
        }
        this.currentManualSquad = squad; // Cache for sub-renders
        this.isUsHome = home ? !!home.isUs : true; // Cache reliable boolean status
        this.manualSubs = []; 
        this.manualGoals = [];
        let existingMatch = null;
        let existingStats = [];

        try {
            const allMatches = await MoncofaApp.DB.getAllMatches();
            existingMatch = allMatches.find(x => x.leagueMatchId != null && parseInt(x.leagueMatchId) === parseInt(matchId));
            
            if (existingMatch) {
                existingMatch.logs.forEach(log => {
                    const absMin = log.d?.min || 0;
                    const period = absMin > 25 ? 2 : 1;
                    const relMin = absMin > 25 ? absMin - 25 : absMin;

                    if (log.type === 'sub') {
                        this.manualSubs.push({ 
                            period: period,
                            min: relMin, 
                            inId: log.d.in?.id, 
                            outId: log.d.out?.id 
                        });
                    } else if (['goal', 'penalty_scored', 'penalty_missed', 'penalty_rival_scored', 'penalty_rival_missed', 'own_goal', 'own_goal_rival'].includes(log.type)) {
                        this.manualGoals.push({
                            period: period,
                            min: relMin,
                            scorerId: log.d?.scorer?.id || log.d?.player?.id || null,
                            assistId: log.d?.assist?.id || null,
                            type: log.type
                        });
                    }
                });
                existingStats = await MoncofaApp.DB.getPlayerStatsForMatch(existingMatch.id);
            }
        } catch (e) {
            console.error("Error cargando persistencia:", e);
        }

        let playerOptions = `<option value="">-- Seleccionar Jugador --</option>`;
        squad.forEach(p => playerOptions += `<option value="${p.id}">${p.number} - ${p.name}</option>`);

        let html = `
            <div class="flex justify-between items-center mb-6 border-b pb-4">
                <div class="flex items-center gap-3">
                    <div class="bg-blue-600 text-white p-2 rounded-lg shadow-lg">
                        <i data-lucide="clipboard-edit" class="w-6 h-6"></i>
                    </div>
                    <div>
                        <h3 class="font-black text-2xl text-slate-800 uppercase tracking-tighter leading-none">Reconstructor</h3>
                        <p class="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Manual de Estadísticas</p>
                    </div>
                </div>
                <button onclick="MoncofaApp.UI.closeModal()" class="text-slate-400 hover:text-slate-600 bg-slate-100 p-2 rounded-full transition-colors"><i data-lucide="x" class="w-6 h-6"></i></button>
            </div>

            <form id="manual-match-form" onsubmit="event.preventDefault(); MoncofaApp.LeagueUI.saveManualMatchAndStats(${matchId}, ${home.isUs})" class="space-y-6">
                
                <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div class="lg:col-span-7 space-y-6">
                        <div class="bg-slate-900 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
                            <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
                            <div class="flex items-center justify-around gap-4">
                                <div class="flex flex-col items-center gap-3 w-1/3">
                                    <div class="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center p-2 border border-white/20">
                                        <img src="${home.logo || 'assets/icon.png'}" class="w-full h-full object-contain">
                                    </div>
                                    <span class="font-black text-xs text-white uppercase tracking-wider text-center line-clamp-2 h-8">${home.name}</span>
                                    <input type="number" id="manual-score-h" min="0" required data-is-us="${home.isUs}" class="w-16 h-16 text-center text-3xl font-black bg-white/10 border-2 border-white/20 rounded-2xl text-white focus:border-blue-400 focus:ring-0 transition-all" value="${existingMatch ? existingMatch.homeScore : (m.isPlayed ? m.homeScore : 0)}">
                                </div>

                                <div class="flex flex-col items-center">
                                    <span class="text-slate-500 font-black text-2xl">VS</span>
                                </div>

                                <div class="flex flex-col items-center gap-3 w-1/3">
                                    <div class="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center p-2 border border-white/20">
                                        <img src="${away.logo || 'assets/icon.png'}" class="w-full h-full object-contain">
                                    </div>
                                    <span class="font-black text-xs text-white uppercase tracking-wider text-center line-clamp-2 h-8">${away.name}</span>
                                    <input type="number" id="manual-score-a" min="0" required data-is-us="${away.isUs}" class="w-16 h-16 text-center text-3xl font-black bg-white/10 border-2 border-white/20 rounded-2xl text-white focus:border-blue-400 focus:ring-0 transition-all" value="${existingMatch ? existingMatch.awayScore : (m.isPlayed ? m.awayScore : 0)}">
                                </div>
                            </div>
                        </div>

                        <div class="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                            <div class="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
                                <h4 class="font-bold text-sm text-slate-700 uppercase tracking-tight flex items-center gap-2">
                                    <i data-lucide="users" class="w-4 h-4"></i> Plantilla y Alineación
                                </h4>
                                <span class="text-[10px] font-bold text-slate-400 uppercase">Scroll para ver todos</span>
                            </div>
                            <div class="overflow-y-auto max-h-[400px] hide-scrollbar">
                                <table class="w-full text-left text-xs border-collapse">
                                    <thead class="bg-slate-50 text-slate-500 sticky top-0 z-10 border-b">
                                        <tr>
                                            <th class="p-3 font-bold">Jugador</th>
                                            <th class="p-3 font-bold text-center w-16">Conv. / Motivo</th>
                                            <th class="p-3 font-bold text-center w-16">Tit. 1ª <br><span id="count-t1" class="text-[9px] font-black">0/8</span></th>
                                            <th class="p-3 font-bold text-center w-16">Tit. 2ª <br><span id="count-t2" class="text-[9px] font-black">0/8</span></th>
                                            <th class="p-3 font-bold text-center w-24">G. Encaj.</th>
                                        </tr>
                                    </thead>
                                    <tbody class="divide-y divide-slate-100 bg-white">
        `;

        squad.forEach(p => {
            const pStat = existingStats.find(s => s.playerId === p.id);
            const isT1 = pStat ? pStat.starts1st : false;
            const isT2 = pStat ? pStat.starts2nd : false;
            const ge = pStat ? (pStat.goalsConceded || 0) : 0;

            html += `
                <tr class="hover:bg-blue-50/30 transition-colors group">
                    <td class="p-3 font-bold text-slate-700">
                        <div class="flex items-center gap-3">
                            <span class="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-[10px] text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">${p.number}</span>
                            <span>${p.name}</span>
                        </div>
                    </td>
                    <td class="p-2 text-center">
                        <div class="flex flex-col items-center gap-1">
                            <input type="checkbox" id="p-conv-${p.id}" ${pStat ? (pStat.calledUp ? 'checked' : '') : 'checked'} onchange="MoncofaApp.LeagueUI.toggleAbsenceReason(${p.id}); MoncofaApp.LeagueUI.updateManualPlayerSelects()" class="w-5 h-5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer">
                            <select id="p-reason-${p.id}" class="text-[9px] border-none bg-slate-50 p-0 font-bold text-slate-500 ${pStat && !pStat.calledUp ? '' : 'hidden'}">
                                <option value="" ${!pStat?.absenceReason ? 'selected' : ''}>Motivo...</option>
                                <option value="Lesión" ${pStat?.absenceReason === 'Lesión' ? 'selected' : ''}>Lesión</option>
                                <option value="Enfermedad" ${pStat?.absenceReason === 'Enfermedad' ? 'selected' : ''}>Enfermo</option>
                                <option value="Viaje" ${pStat?.absenceReason === 'Viaje' ? 'selected' : ''}>Viaje</option>
                                <option value="Decisión Técnica" ${pStat?.absenceReason === 'Decisión Técnica' ? 'selected' : ''}>D. Técnica</option>
                            </select>
                        </div>
                    </td>
                    <td class="p-2 text-center"><input type="checkbox" id="p-t1-${p.id}" ${isT1 ? 'checked' : ''} onchange="MoncofaApp.LeagueUI.updateStarterCounts()" class="w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"></td>
                    <td class="p-2 text-center"><input type="checkbox" id="p-t2-${p.id}" ${isT2 ? 'checked' : ''} onchange="MoncofaApp.LeagueUI.updateStarterCounts()" class="w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"></td>
                    <td class="p-2">
                        <input type="number" id="p-ge-${p.id}" min="0" value="${ge}" 
                            oninput="MoncofaApp.LeagueUI.updateScoreFromGoals()"
                            class="w-full border border-slate-200 rounded-lg px-1 py-2 text-center font-black ${p.role === 'GK' ? 'text-red-600 bg-red-50' : 'bg-slate-50 text-slate-300 opacity-50'} shadow-inner" 
                            ${p.role !== 'GK' ? 'disabled' : ''} placeholder="0">
                    </td>
                </tr>
            `;
        });

        html += `
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <div class="lg:col-span-5 space-y-6">
                        <div class="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
                            <h4 class="font-bold text-slate-800 mb-4 flex items-center gap-2 border-b pb-3">
                                <i data-lucide="goal" class="w-5 h-5 text-emerald-500"></i> Registro de Goles
                            </h4>
                            
                            <div class="space-y-3 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <div class="grid grid-cols-2 gap-3">
                                    <div class="col-span-1">
                                        <label class="block text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Tiempo</label>
                                        <select id="mg-period" class="w-full border border-slate-200 p-2.5 rounded-lg text-sm font-bold text-slate-700 focus:ring-2 focus:ring-slate-500/20 transition-all shadow-sm">
                                            <option value="1">1ª Parte</option>
                                            <option value="2">2ª Parte</option>
                                        </select>
                                    </div>
                                    <div class="col-span-1">
                                        <label class="block text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Minuto (0-25)</label>
                                        <input type="number" id="mg-min" min="0" max="25" class="w-full border border-slate-200 p-2.5 rounded-lg text-sm font-bold focus:ring-2 focus:ring-slate-500/20 transition-all shadow-sm" placeholder="Ej: 15">
                                    </div>
                                    <div class="col-span-2">
                                        <label class="block text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Anotador</label>
                                        <select id="mg-scorer" class="w-full border border-slate-200 p-2.5 rounded-lg text-sm font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm">${playerOptions}</select>
                                    </div>
                                    <div class="col-span-1">
                                        <label class="block text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Asistencia</label>
                                        <select id="mg-assist" class="w-full border border-slate-200 p-2.5 rounded-lg text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm">${playerOptions}</select>
                                    </div>
                                    <div class="col-span-1">
                                        <label class="block text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Tipo</label>
                                        <select id="mg-type" class="w-full border border-slate-200 p-2.5 rounded-lg text-sm font-bold text-slate-700 focus:ring-2 focus:ring-slate-500/20 transition-all shadow-sm">
                                            <option value="goal">Gol Normal</option>
                                            <option value="penalty_scored">Penalti Anotado (Nosotros)</option>
                                            <option value="penalty_missed">Penalti Fallado (Nosotros)</option>
                                            <option value="penalty_rival_scored">Penalti Anotado (Rival)</option>
                                            <option value="penalty_rival_missed">Penalti Fallado (Rival)</option>
                                            <option value="own_goal">GOL EN PROPIA (En Contra)</option>
                                            <option value="own_goal_rival">GOL EN PROPIA RIVAL (A Favor)</option>
                                        </select>
                                    </div>
                                </div>
                                <button type="button" onclick="MoncofaApp.LeagueUI.addManualGoal()" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 rounded-lg shadow-md transition-all flex justify-center items-center gap-2 mt-2">
                                    <i data-lucide="plus-circle" class="w-5 h-5"></i> Añadir Gol
                                </button>
                            </div>

                            <div id="manual-goals-list" class="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                            </div>
                        </div>

                        <div class="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
                            <h4 class="font-bold text-slate-800 mb-4 flex items-center gap-2 border-b pb-3">
                                <i data-lucide="refresh-cw" class="w-5 h-5 text-blue-500"></i> Cambios Realizados
                            </h4>
                            
                            <div class="space-y-3 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <div class="grid grid-cols-2 gap-3">
                                    <div class="col-span-1">
                                        <label class="block text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Tiempo</label>
                                        <select id="ms-period" class="w-full border border-slate-200 p-2.5 rounded-lg text-sm font-bold text-slate-700 focus:ring-2 focus:ring-slate-500/20 transition-all shadow-sm">
                                            <option value="1">1ª Parte</option>
                                            <option value="2">2ª Parte</option>
                                        </select>
                                    </div>
                                    <div class="col-span-1">
                                        <label class="block text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Minuto (0-25)</label>
                                        <input type="number" id="ms-min" min="0" max="25" class="w-full border border-slate-200 p-2.5 rounded-lg text-sm font-bold focus:ring-2 focus:ring-blue-500/20 transition-all" placeholder="Ej: 14">
                                    </div>
                                    <div class="col-span-1">
                                        <label class="block text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Entra</label>
                                        <select id="ms-in" class="w-full border border-slate-200 p-2.5 rounded-lg text-sm font-bold text-green-700 focus:ring-2 focus:ring-green-500/20 transition-all shadow-sm">${playerOptions}</select>
                                    </div>
                                    <div class="col-span-1">
                                        <label class="block text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Sale</label>
                                        <select id="ms-out" class="w-full border border-slate-200 p-2.5 rounded-lg text-sm font-bold text-red-700 focus:ring-2 focus:ring-red-500/20 transition-all shadow-sm">${playerOptions}</select>
                                    </div>
                                </div>
                                <button type="button" onclick="MoncofaApp.LeagueUI.addManualSub()" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-3 rounded-lg shadow-md transition-all flex justify-center items-center gap-2 mt-2">
                                    <i data-lucide="plus-circle" class="w-5 h-5"></i> Registrar Cambio
                                </button>
                            </div>

                            <div id="manual-subs-list" class="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                            </div>
                        </div>
                    </div>
                </div>

                <div class="flex flex-col sm:flex-row gap-4 pt-6 border-t mt-8">
                    <button type="button" onclick="MoncofaApp.UI.closeModal()" class="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-4 rounded-xl transition-all flex justify-center items-center gap-2">
                        <i data-lucide="x" class="w-5 h-5"></i> Cancelar y Salir
                    </button>
                    <button type="submit" class="flex-[2] bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-xl shadow-xl shadow-indigo-200 transition-all text-xl flex justify-center items-center gap-2">
                        <i data-lucide="save" class="w-6 h-6"></i> Guardar Todo
                    </button>
                </div>
            </form>
        `;
        
        MoncofaApp.UI.openModal(html);
        
        const modalContent = document.getElementById('modal-content');
        if (modalContent) {
            modalContent.classList.remove('max-w-sm');
            modalContent.classList.add('max-w-4xl');
        }
        
        const modalContainer = document.getElementById('action-modal');
        if (modalContainer) {
            modalContainer.classList.remove('items-center', 'pt-40');
            modalContainer.classList.add('items-start', 'pt-10', 'pb-10', 'overflow-y-auto');
        }

        this.renderManualSubs();
        this.renderManualGoals();
        this.updateStarterCounts();
        this.updateManualPlayerSelects();
        lucide.createIcons();
    },

    updateManualPlayerSelects() {
        const selects = ['mg-scorer', 'mg-assist', 'ms-in', 'ms-out'];
        const squad = this.currentManualSquad;
        
        // Find which players are called up
        const calledUpPlayers = squad.filter(p => {
            const cb = document.getElementById(`p-conv-${p.id}`);
            return cb ? cb.checked : true;
        });

        let html = `<option value="">-- Seleccionar --</option>`;
        calledUpPlayers.forEach(p => {
            html += `<option value="${p.id}">${p.number} - ${p.name}</option>`;
        });

        selects.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                const currentVal = el.value;
                el.innerHTML = html;
                el.value = currentVal;
            }
        });
    },

    toggleAbsenceReason(playerId) {
        const isConv = document.getElementById(`p-conv-${playerId}`).checked;
        const reasonSelect = document.getElementById(`p-reason-${playerId}`);
        if (reasonSelect) {
            reasonSelect.classList.toggle('hidden', isConv);
        }
    },

    updateScoreFromGoals() {
        const isHome = this.isUsHome;
        let scoreUs = 0;
        let scoreRival = 0;

        // 1. Goles de nuestro equipo desde manualGoals
        this.manualGoals.forEach(g => {
            if (['goal', 'penalty_scored', 'own_goal_rival'].includes(g.type)) {
                scoreUs++;
            }
        });

        // 2. Goles del rival: sumamos los goles encajados de todos los porteros
        let gkConcededSum = 0;
        if (this.currentManualSquad) {
            this.currentManualSquad.forEach(p => {
                if (p.role === 'GK') {
                    const el = document.getElementById(`p-ge-${p.id}`);
                    if (el) {
                        gkConcededSum += parseInt(el.value) || 0;
                    }
                }
            });
        }

        // 3. También sumamos los goles del rival registrados en manualGoals (por si no hay portero o no se ha puesto)
        let manualRivalGoals = 0;
        this.manualGoals.forEach(g => {
            if (['penalty_rival_scored', 'own_goal'].includes(g.type)) {
                manualRivalGoals++;
            }
        });

        // El marcador del rival será el mayor entre los goles encajados por los porteros y los registrados en el log
        scoreRival = Math.max(gkConcededSum, manualRivalGoals);

        const scoreHInput = document.getElementById('manual-score-h');
        const scoreAInput = document.getElementById('manual-score-a');

        if (scoreHInput && scoreAInput) {
            scoreHInput.value = isHome ? scoreUs : scoreRival;
            scoreAInput.value = isHome ? scoreRival : scoreUs;
        }
    },

    updateStarterCounts() {
        const squad = this.currentManualSquad;
        let c1 = 0;
        let c2 = 0;
        
        squad.forEach(p => {
            if (document.getElementById(`p-t1-${p.id}`)?.checked) c1++;
            if (document.getElementById(`p-t2-${p.id}`)?.checked) c2++;
        });

        const el1 = document.getElementById('count-t1');
        const el2 = document.getElementById('count-t2');

        if (el1) {
            el1.innerText = `${c1}/8`;
            el1.className = `text-[9px] font-black ${c1 === 8 ? 'text-green-600' : c1 > 8 ? 'text-red-600' : 'text-slate-400'}`;
        }
        if (el2) {
            el2.innerText = `${c2}/8`;
            el2.className = `text-[9px] font-black ${c2 === 8 ? 'text-green-600' : c2 > 8 ? 'text-red-600' : 'text-slate-400'}`;
        }
    },

    addManualSub() {
        const period = parseInt(document.getElementById('ms-period').value);
        const min = parseInt(document.getElementById('ms-min').value);
        const inId = parseInt(document.getElementById('ms-in').value);
        const outId = parseInt(document.getElementById('ms-out').value);

        if (isNaN(min) || !inId || !outId) {
            MoncofaApp.UI.showToast("Rellena el minuto, quién entra y quién sale.", "warning");
            return;
        }

        if (inId === outId) {
            MoncofaApp.UI.showToast("No puede entrar y salir el mismo jugador a la vez.", "warning");
            return;
        }

        this.manualSubs.push({ period, min, inId, outId });
        // Sort by period then min
        this.manualSubs.sort((a, b) => (a.period - b.period) || (a.min - b.min));
        this.renderManualSubs();
        this.updateScoreFromGoals();

        document.getElementById('ms-min').value = '';
        document.getElementById('ms-in').value = '';
        document.getElementById('ms-out').value = '';
    },

    editManualSub(index) {
        const sub = this.manualSubs[index];
        document.getElementById('ms-period').value = sub.period;
        document.getElementById('ms-min').value = sub.min;
        document.getElementById('ms-in').value = sub.inId;
        document.getElementById('ms-out').value = sub.outId;
        
        // Remove from list so it can be re-added
        this.manualSubs.splice(index, 1);
        this.renderManualSubs();
    },

    removeManualSub(index) {
        this.manualSubs.splice(index, 1);
        this.renderManualSubs();
        this.updateScoreFromGoals();
    },

    renderManualSubs() {
        const container = document.getElementById('manual-subs-list');
        if (!container) return;

        if (this.manualSubs.length === 0) {
            container.innerHTML = `<div class="text-xs text-slate-400 italic text-center py-2 bg-white rounded-lg border border-dashed">No hay cambios registrados.</div>`;
            return;
        }

        let html = '';
        this.manualSubs.forEach((s, i) => {
            const pIn = this.currentManualSquad.find(x => x.id === s.inId);
            const pOut = this.currentManualSquad.find(x => x.id === s.outId);
            const timeLabel = s.period === 2 ? '2T' : '1T';

            html += `
                <div class="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl shadow-sm hover:shadow-md transition-all group">
                    <div class="flex items-center gap-3">
                        <span class="text-[10px] font-black text-slate-500 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">${timeLabel} - ${s.min}'</span>
                        <div class="flex items-center gap-2">
                            <span class="font-bold text-red-600 truncate max-w-[120px]" title="${pOut ? pOut.number + ' - ' + pOut.name : '?'}">
                                ${pOut ? `${pOut.number}. ${pOut.name}` : '?'}
                            </span>
                            <i data-lucide="arrow-right" class="w-3.5 h-3.5 text-slate-400"></i>
                            <span class="font-bold text-green-600 truncate max-w-[120px]" title="${pIn ? pIn.number + ' - ' + pIn.name : '?'}">
                                ${pIn ? `${pIn.number}. ${pIn.name}` : '?'}
                            </span>
                        </div>
                    </div>
                    <div class="flex items-center gap-1">
                        <button type="button" onclick="MoncofaApp.LeagueUI.editManualSub(${i})" class="text-slate-300 hover:text-blue-500 transition-colors p-1"><i data-lucide="edit-2" class="w-4 h-4"></i></button>
                        <button type="button" onclick="MoncofaApp.LeagueUI.removeManualSub(${i})" class="text-slate-300 hover:text-red-500 transition-colors p-1"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                    </div>
                </div>
            `;
        });
        container.innerHTML = html;
        lucide.createIcons();
    },

    addManualGoal() {
        const period = parseInt(document.getElementById('mg-period').value);
        const min = parseInt(document.getElementById('mg-min').value);
        const scorerId = parseInt(document.getElementById('mg-scorer').value);
        const assistId = parseInt(document.getElementById('mg-assist').value) || null;
        const type = document.getElementById('mg-type').value;

        const needsOurPlayer = ['goal', 'penalty_scored', 'penalty_missed', 'own_goal'].includes(type);
        
        if (needsOurPlayer && !scorerId) {
            MoncofaApp.UI.showToast("Debes seleccionar al jugador involucrado en la acción.", "warning");
            return;
        }

        this.manualGoals.push({ period: period || 1, min: min || 0, scorerId: needsOurPlayer ? scorerId : null, assistId, type });
        this.manualGoals.sort((a, b) => (a.period - b.period) || (a.min - b.min));
        this.renderManualGoals();
        this.updateScoreFromGoals();

        document.getElementById('mg-min').value = '';
        document.getElementById('mg-scorer').value = '';
        document.getElementById('mg-assist').value = '';
        document.getElementById('mg-type').value = 'goal';
    },

    editManualGoal(index) {
        const g = this.manualGoals[index];
        document.getElementById('mg-period').value = g.period;
        document.getElementById('mg-min').value = g.min;
        document.getElementById('mg-scorer').value = g.scorerId || '';
        document.getElementById('mg-assist').value = g.assistId || '';
        document.getElementById('mg-type').value = g.type;

        this.manualGoals.splice(index, 1);
        this.renderManualGoals();
    },

    removeManualGoal(index) {
        this.manualGoals.splice(index, 1);
        this.renderManualGoals();
        this.updateScoreFromGoals();
    },

    renderManualGoals() {
        const container = document.getElementById('manual-goals-list');
        if (!container) return;

        if (this.manualGoals.length === 0) {
            container.innerHTML = `<div class="text-xs text-slate-400 italic text-center py-2 bg-white rounded-lg border border-dashed">No hay goles registrados.</div>`;
            return;
        }

        let html = '';
        this.manualGoals.forEach((g, i) => {
            const scorer = this.currentManualSquad.find(x => x.id === g.scorerId);
            const assist = this.currentManualSquad.find(x => x.id === g.assistId);
            const timeLabel = g.period === 2 ? '2T' : '1T';

            let typeLabel = "GOL";
            let typeColor = "text-emerald-600 bg-emerald-50";
            if (g.type === 'own_goal_rival') {
                typeLabel = "GOL P.P. (RIVAL)";
                typeColor = "text-emerald-600 bg-emerald-50";
            } else if (g.type.includes('penalty_rival') || g.type === 'own_goal') {
                typeLabel = "RIVAL";
                typeColor = "text-red-600 bg-red-50";
            }

            html += `
                <div class="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl shadow-sm hover:shadow-md transition-all group">
                    <div class="flex items-center gap-3">
                        <span class="text-[10px] font-black ${typeColor} px-2 py-1 rounded-md border border-slate-100">${timeLabel} - ${g.min}'</span>
                        <div class="flex flex-col">
                            <span class="font-black text-slate-800 uppercase tracking-tighter text-sm">
                                ${scorer ? `${scorer.number}. ${scorer.name}` : typeLabel}
                            </span>
                            ${assist ? `<span class="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5"><i data-lucide="handshake" class="w-3 h-3"></i> Asist: ${assist.number}. ${assist.name}</span>` : ''}
                        </div>
                    </div>
                    <div class="flex items-center gap-1">
                        <button type="button" onclick="MoncofaApp.LeagueUI.editManualGoal(${i})" class="text-slate-300 hover:text-blue-500 transition-colors p-1"><i data-lucide="edit-2" class="w-4 h-4"></i></button>
                        <button type="button" onclick="MoncofaApp.LeagueUI.removeManualGoal(${i})" class="text-slate-300 hover:text-red-500 transition-colors p-1"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                    </div>
                </div>
            `;
        });
        container.innerHTML = html;
        lucide.createIcons();
    },

    async saveManualMatchAndStats(calendarMatchId, isHome) {
        const scoreH = parseInt(document.getElementById('manual-score-h').value) || 0;
        const scoreA = parseInt(document.getElementById('manual-score-a').value) || 0;

        const matches = await MoncofaApp.DB.getCalendarMatches(this.currentSeasonId);
        const calMatch = matches.find(x => x.id === calendarMatchId);
        const seasonTeams = await MoncofaApp.DB.getLeagueTeams(this.currentSeasonId);
        
        if (calMatch) {
            calMatch.isPlayed = 1;
            calMatch.homeScore = scoreH;
            calMatch.awayScore = scoreA;
            await MoncofaApp.DB.saveCalendarMatch(calMatch);
        }

        const squad = this.currentManualSquad || await MoncofaApp.DB.getPlayers();
        const initialLineup = [];
        const secondHalfLineup = [];

        squad.forEach(p => {
            if (document.getElementById(`p-t1-${p.id}`)?.checked) initialLineup.push(p.id);
            if (document.getElementById(`p-t2-${p.id}`)?.checked) secondHalfLineup.push(p.id);
        });

        // 3. Crear logs falsos basados en los cambios
        const logs = this.manualSubs.map(s => ({
            type: 'sub',
            d: {
                in: { id: s.inId },
                out: { id: s.outId },
                min: s.period === 2 ? 25 + s.min : s.min
            }
        }));

        // Añadir logs de los goles ordenados
        this.manualGoals.forEach(g => {
            const absoluteMin = g.period === 2 ? 25 + g.min : g.min;
            if (g.type === 'goal') {
                logs.push({
                    type: 'goal',
                    d: {
                        scorer: { id: g.scorerId },
                        assist: g.assistId ? { id: g.assistId } : null,
                        min: absoluteMin
                    }
                });
            } else if (g.type === 'penalty_scored') {
                logs.push({
                    type: 'penalty_scored',
                    d: { player: { id: g.scorerId }, min: absoluteMin }
                });
            } else if (g.type === 'penalty_missed') {
                logs.push({
                    type: 'penalty_missed',
                    d: { player: { id: g.scorerId }, min: absoluteMin }
                });
            } else if (g.type === 'penalty_rival_scored') {
                logs.push({
                    type: 'penalty_rival_scored',
                    text: 'Penalti anotado por el rival',
                    d: { min: absoluteMin }
                });
            } else if (g.type === 'penalty_rival_missed') {
                logs.push({
                    type: 'penalty_rival_missed',
                    text: 'Penalti fallado por el rival',
                    d: { min: absoluteMin }
                });
            } else if (g.type === 'own_goal') {
                logs.push({
                    type: 'own_goal',
                    d: { player: { id: g.scorerId }, min: absoluteMin }
                });
            } else if (g.type === 'own_goal_rival') {
                logs.push({
                    type: 'own_goal_rival',
                    text: 'Gol del rival en propia puerta',
                    d: { min: absoluteMin }
                });
            }
        });

        const rivalTeamName = calMatch 
            ? (isHome 
                ? (seasonTeams.find(t => t.id === calMatch.awayTeamId)?.name || "Rival Visitante") 
                : (seasonTeams.find(t => t.id === calMatch.homeTeamId)?.name || "Rival Local"))
            : (isHome ? "Rival Visitante" : "Rival Local");

        const fakeMatchData = {
            seasonId: calMatch ? calMatch.seasonId : this.currentSeasonId,
            date: calMatch ? calMatch.date : new Date().toISOString().split('T')[0],
            matchday: calMatch ? calMatch.matchday : 0,
            rivalName: rivalTeamName,
            isHome: isHome,
            homeScore: scoreH,
            awayScore: scoreA,
            period: 2,
            totalMs: 3000000,
            logs: logs,
            isManual: true,
            leagueMatchId: calendarMatchId
        };

        const processingSquad = squad.map(p => ({
            ...p, 
            calledUp: document.getElementById(`p-conv-${p.id}`)?.checked || false,
            absenceReason: document.getElementById(`p-reason-${p.id}`)?.value || null
        }));

        const calculatedStats = MoncofaApp.StatsEngine.calculatePlayerStats(fakeMatchData, initialLineup, processingSquad, secondHalfLineup);

        const finalPlayerStatsToSave = [];
        calculatedStats.forEach(stat => {
            const pId = stat.playerId;
            const ge = parseInt(document.getElementById(`p-ge-${pId}`).value) || 0;
            const pObj = processingSquad.find(x => x.id === pId);

            if (stat.mins1st > 0 || stat.mins2nd > 0 || stat.goals > 0 || stat.assists > 0 || ge > 0 || stat.penaltiesTaken > 0 || (pObj && !pObj.calledUp)) {
                stat.goalsConceded = ge;
                stat.calledUp = pObj ? pObj.calledUp : true;
                stat.absenceReason = pObj ? pObj.absenceReason : null;
                finalPlayerStatsToSave.push(stat);
            }
        });

        await MoncofaApp.DB.saveMatch(fakeMatchData, finalPlayerStatsToSave);
        MoncofaApp.UI.closeModal();
        this.renderCurrentTab();
        MoncofaApp.UI.showToast("¡Partido y estadísticas manuales guardadas con éxito!", "success");
    },

    async saveScore(matchId) {
        const h = document.getElementById('score-h').value;
        const a = document.getElementById('score-a').value;

        const matches = await MoncofaApp.DB.getCalendarMatches(this.currentSeasonId);
        const m = matches.find(x => x.id === matchId);
        if (m) {
            m.isPlayed = 1;
            m.homeScore = parseInt(h);
            m.awayScore = parseInt(a);
            await MoncofaApp.DB.saveCalendarMatch(m);
            MoncofaApp.UI.closeModal();
            this.renderCurrentTab();
        }
    },

    async resetScore(matchId) {
        const matches = await MoncofaApp.DB.getCalendarMatches(this.currentSeasonId);
        const m = matches.find(x => x.id === matchId);
        if (m) {
            m.isPlayed = 0;
            m.homeScore = 0;
            m.awayScore = 0;
            await MoncofaApp.DB.saveCalendarMatch(m);
            MoncofaApp.UI.closeModal();
            this.renderCurrentTab();
        }
    },

    async renderSettings(container) {
        const seasons = await MoncofaApp.DB.getSeasons();
        const season = seasons.find(s => s.isCurrent) || seasons[0] || {};
        
        let html = `
            <div class="p-6 max-w-2xl mx-auto">
                <div class="mb-8 text-center">
                    <h3 class="font-black text-2xl text-slate-800 mb-2">Gestión de Temporadas</h3>
                    <p class="text-slate-500">Crea una nueva temporada o cambia la liga activa.</p>
                </div>

                <div class="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 mb-8">
                    <h4 class="font-bold text-lg border-b pb-2 mb-4">Temporadas Disponibles</h4>
                    <div class="space-y-3">
        `;

        if (seasons.length === 0) {
            html += `<p class="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-100 font-bold">No tienes ninguna temporada creada. Crea la primera abajo.</p>`;
        } else {
            seasons.forEach(s => {
                html += `
                    <div class="flex items-center justify-between p-3 rounded-xl border ${s.isCurrent ? 'border-yellow-400 bg-yellow-50' : 'border-slate-200 bg-slate-50'}">
                        <div>
                            <span class="font-black text-lg text-slate-800 mr-2">${s.name}</span>
                            <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">${s.category}</span>
                            ${s.isCurrent ? `<span class="ml-2 bg-yellow-400 text-yellow-900 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">Activa</span>` : ''}
                        </div>
                        <div class="flex gap-2">
                            ${!s.isCurrent ? `<button onclick="MoncofaApp.LeagueUI.setSeasonActive(${s.id})" class="text-xs bg-white border border-slate-300 hover:bg-slate-100 font-bold px-3 py-1.5 rounded transition-colors shadow-sm">Activar</button>` : ''}
                            <button onclick="MoncofaApp.LeagueUI.deleteSeason(${s.id})" class="text-xs text-red-500 hover:bg-red-50 font-bold px-3 py-1.5 rounded transition-colors"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                        </div>
                    </div>
                `;
            });
        }

        html += `
                    </div>
                </div>

                <div class="bg-slate-800 rounded-2xl shadow-xl p-6 text-white">
                    <h4 class="font-bold text-lg border-b border-slate-700 pb-2 mb-4 flex items-center gap-2"><i data-lucide="folder-plus" class="w-5 h-5 text-emerald-400"></i> Crear Nueva Temporada</h4>
                    <form onsubmit="event.preventDefault(); MoncofaApp.LeagueUI.createSeason()" class="space-y-4">
                        <div>
                            <label class="block text-xs font-bold text-slate-400 uppercase mb-1">Nombre de la Temporada (Ej: 26/27)</label>
                            <input type="text" id="new-season-name" required class="w-full border-0 p-3 rounded-lg bg-slate-700 text-white font-bold placeholder-slate-500" placeholder="Ej: 2026/2027">
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-slate-400 uppercase mb-1">Categoría / Grupo</label>
                            <input type="text" id="new-season-cat" class="w-full border-0 p-3 rounded-lg bg-slate-700 text-white font-bold placeholder-slate-500" placeholder="Ej: 2ª Regional Grupo 3">
                        </div>
                        <button type="submit" class="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-black py-3 rounded-lg shadow-lg transition-all mt-2">
                            Crear e Iniciar Temporada
                        </button>
                    </form>
                </div>

                <div class="bg-white rounded-2xl shadow-xl p-6 border border-slate-200 mb-8">
                    <h4 class="font-bold text-lg border-b border-slate-100 pb-2 mb-4 flex items-center gap-2 text-slate-800"><i data-lucide="settings-2" class="w-5 h-5 text-blue-500"></i> Configuración de la Liga</h4>
                    <div class="space-y-6">
                        <div>
                            <label class="block text-xs font-bold text-slate-400 uppercase mb-1">Número de Jornadas de la Temporada</label>
                            <div class="flex gap-2">
                                <input type="number" id="league-matchdays-count" value="${season.matchdaysCount || 26}" class="w-24 border border-slate-200 p-3 rounded-lg font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none">
                                <button onclick="MoncofaApp.LeagueUI.updateMatchdaysCount()" class="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-2 rounded-lg shadow-md transition-all text-sm flex items-center gap-2">
                                    <i data-lucide="save" class="w-4 h-4"></i> Guardar
                                </button>
                            </div>
                            <p class="text-[10px] text-slate-500 mt-2 italic">Define cuántas jornadas aparecerán en el selector del calendario (Por defecto: 26).</p>
                        </div>

                        <div class="border-t pt-4">
                            <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Logo / Escudo de la Competición</label>
                            <div class="flex items-center gap-4 mt-2">
                                <div class="w-16 h-16 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center p-2 overflow-hidden shadow-sm flex-shrink-0">
                                    <img id="league-logo-preview" src="${season.leagueLogo || 'assets/icon.png'}" class="w-full h-full object-contain" onerror="this.src='../assets/icon.png'">
                                </div>
                                <div class="flex-grow">
                                    <input type="file" id="league-logo-file" accept="image/*" class="hidden" onchange="MoncofaApp.LeagueUI.handleLeagueLogoUpload(this)">
                                    <button onclick="document.getElementById('league-logo-file').click()" class="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-4 py-2 rounded-lg text-sm border border-slate-300 transition-all flex items-center gap-2">
                                        <i data-lucide="image" class="w-4 h-4"></i> Cambiar Escudo
                                    </button>
                                    <p class="text-[10px] text-slate-400 mt-1">Sube el logo de la federación o liga para la cabecera de la clasificación.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="mt-8 bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
                    <h4 class="font-bold text-lg text-yellow-900 mb-2 flex items-center gap-2"><i data-lucide="refresh-cw" class="w-5 h-5"></i> Sincronización FFCV</h4>
                    <p class="text-sm text-yellow-800 mb-4">Importa automáticamente los resultados oficiales de la liga (Benjamín Mixto Castelló G2) directamente de la federación.</p>
                    <button onclick="MoncofaApp.LeagueImporter.importData()" class="w-full bg-yellow-500 hover:bg-yellow-400 text-yellow-900 font-black py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 mb-4">
                        <i data-lucide="download-cloud" class="w-6 h-6"></i> 1. IMPORTAR CALENDARIO FFCV
                    </button>
                    
                    <div id="ipad-import-area" class="bg-white/50 p-4 rounded-xl border border-yellow-200">
                        <p class="text-xs font-bold text-yellow-900 mb-2 uppercase tracking-widest flex items-center gap-2">
                            <i data-lucide="tablet" class="w-4 h-4"></i> 2. Importar Estadísticas iPad
                        </p>
                        <button onclick="MoncofaApp.IpadImporter.importFromJSON()" id="btn-import-ipad" class="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-lg shadow-md transition-all flex items-center justify-center gap-2">
                            <i data-lucide="file-spread-sheet" class="w-5 h-5 text-emerald-400"></i> PROCESAR 'DATOS_PARTIDOS.XLSX'
                        </button>
                        <p id="ipad-status" class="text-[9px] text-slate-500 mt-2 italic">Si el botón no funciona, asegúrate de haber importado primero el calendario FFCV.</p>
                    </div>

                    <p class="text-[10px] text-yellow-700 font-bold mt-4 text-center uppercase tracking-wider italic">Temporada: 2025/26 | Sincronización Detallada</p>
                </div>

                </div>

                <div class="mt-8 bg-emerald-50 border border-emerald-100 rounded-2xl p-6">
                    <h4 class="font-bold text-lg text-emerald-900 mb-2 flex items-center gap-2">
                        <i data-lucide="cloud" class="w-5 h-5 text-emerald-600"></i> Sincronización en la Nube (Supabase)
                    </h4>
                    <p class="text-sm text-emerald-700 mb-4">Sincroniza todas tus temporadas, jugadores, partidos y estadísticas locales con la base de datos en la nube de Supabase. Esto permitirá que los padres vean los datos actualizados en el portal.</p>
                    
                    <div class="bg-white/80 p-4 rounded-xl border border-emerald-200 mb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <span class="text-xs font-bold text-slate-400 uppercase tracking-widest block">Estado de la Base de Datos Nube</span>
                            <div class="flex items-center gap-2 mt-1">
                                <span id="sync-settings-led" class="inline-block w-2.5 h-2.5 rounded-full bg-slate-400"></span>
                                <span id="sync-settings-text" class="text-sm font-bold text-slate-600">Comprobando conexión...</span>
                            </div>
                        </div>
                        <button onclick="MoncofaApp.LeagueUI.triggerCloudSync()" class="bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3 px-6 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm">
                            <i data-lucide="refresh-cw" class="w-5 h-5"></i> Sincronizar Todo
                        </button>
                    </div>

                    <div id="sync-progress-bar-container" class="hidden mt-4">
                        <div class="flex justify-between text-xs font-bold text-emerald-800 mb-1">
                            <span id="sync-progress-label">Sincronizando...</span>
                            <span id="sync-progress-pct">0%</span>
                        </div>
                        <div class="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                            <div id="sync-progress-bar" class="bg-emerald-500 h-full rounded-full transition-all duration-300" style="width: 0%"></div>
                        </div>
                    </div>
                </div>

                <div class="mt-8 bg-blue-50 border border-blue-100 rounded-2xl p-6">
                    <h4 class="font-bold text-lg text-blue-900 mb-2 flex items-center gap-2"><i data-lucide="hard-drive" class="w-5 h-5"></i> Copias de Seguridad (Sincronización Local)</h4>
                    <p class="text-sm text-blue-700 mb-4">Usa estas opciones para exportar todos los datos (Ligas, Partidos, Estadísticas) y pasarlos de un dispositivo a otro.</p>
                    
                    <div class="flex flex-col md:flex-row gap-4">
                        <button onclick="MoncofaApp.DB.exportDatabase()" class="flex-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold py-3 px-4 rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all">
                            <i data-lucide="download" class="w-5 h-5 text-blue-500"></i> Descargar Copia
                        </button>
                        
                        <div class="flex-1 relative">
                            <input type="file" id="import-db-file" accept=".json" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onchange="MoncofaApp.LeagueUI.handleImport(event)">
                            <button class="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 px-4 rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all pointer-events-none">
                                <i data-lucide="upload" class="w-5 h-5 text-emerald-400"></i> Restaurar Copia
                            </button>
                        </div>
                    </div>
                    <p class="text-[10px] text-red-500 font-bold mt-3 text-center uppercase tracking-wider">⚠️ Restaurar una copia sobrescribirá TODOS los datos actuales.</p>
                </div>
            </div>
        `;
        container.innerHTML = html;
        lucide.createIcons();
        setTimeout(() => {
            MoncofaApp.LeagueUI.updateSettingsSyncStatus();
        }, 100);
    },

    async handleImport(event) {
        const file = event.target.files[0];
        if (!file) return;

        MoncofaApp.UI.showConfirm(
            "⚠️ ¡ADVERTENCIA CRÍTICA! ⚠️",
            "Al importar este archivo SE BORRARÁN TODOS LOS DATOS ACTUALES.\n\n¿Estás completamente seguro?",
            () => {
                const reader = new FileReader();
                reader.onload = async (e) => {
                    const success = await MoncofaApp.DB.importDatabase(e.target.result);
                    if (success) {
                        MoncofaApp.UI.showToast("Base de datos restaurada con éxito. La aplicación se recargará ahora.", "success");
                        setTimeout(() => {
                            window.location.reload();
                        }, 1500);
                    } else {
                        MoncofaApp.UI.showToast("Error al restaurar la base de datos.", "error");
                    }
                };
                reader.readAsText(file);
            },
            () => {
                event.target.value = '';
            }
        );
    },

    async createSeason() {
        const name = document.getElementById('new-season-name').value;
        const cat = document.getElementById('new-season-cat').value;

        await MoncofaApp.DB.saveSeason({
            name: name,
            category: cat,
            isCurrent: 1
        });
        
        await this.init(); 
        this.switchTab('teams');
    },

    async setSeasonActive(id) {
        const seasons = await MoncofaApp.DB.getSeasons();
        const s = seasons.find(x => x.id === id);
        if (s) {
            s.isCurrent = 1;
            await MoncofaApp.DB.saveSeason(s);
            await this.init();
        }
    },

    async deleteSeason(id) {
        MoncofaApp.UI.showConfirm(
            "Eliminar Temporada",
            "¡ATENCIÓN! Esto borrará todos los equipos, resultados y calendario de esta temporada. ¿Estás absolutamente seguro?",
            async () => {
                await MoncofaApp.DB.deleteSeason(id);
                MoncofaApp.UI.showToast("Temporada eliminada con éxito.", "success");
                await this.init();
            }
        );
    },

    async updateMatchdaysCount() {
        const count = parseInt(document.getElementById('league-matchdays-count').value);
        if (isNaN(count) || count < 1) return;

        const season = await MoncofaApp.DB.getCurrentSeason();
        if (season) {
            season.matchdaysCount = count;
            await MoncofaApp.DB.saveSeason(season);
            MoncofaApp.UI.showCustomModal("Éxito", `Se ha configurado la liga a ${count} jornadas.`);
            this.init(); // Refrescar UI
        }
    },

    async handleLeagueLogoUpload(input) {
        if (input.files && input.files[0]) {
            const file = input.files[0];
            const reader = new FileReader();
            reader.onload = async (e) => {
                const img = new Image();
                img.onload = async () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    
                    const MAX_SIZE = 256;
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
                    
                    // Update preview immediately
                    const preview = document.getElementById('league-logo-preview');
                    if (preview) preview.src = dataUrl;
                    
                    // Save to IndexedDB
                    const season = await MoncofaApp.DB.getCurrentSeason();
                    if (season) {
                        season.leagueLogo = dataUrl;
                        await MoncofaApp.DB.saveSeason(season);
                    }
                    
                    MoncofaApp.UI.showToast("¡Escudo de la competición actualizado correctamente!", "success");
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    },

    updateSettingsSyncStatus() {
        const led = document.getElementById('sync-settings-led');
        const txt = document.getElementById('sync-settings-text');
        if (!led || !txt) return;

        const isOnline = navigator.onLine && !!(MoncofaApp.State && MoncofaApp.State.supabase);
        if (isOnline) {
            led.className = 'inline-block w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]';
            txt.textContent = 'Conectado a Supabase (Listo para sincronizar)';
            txt.className = 'text-sm font-bold text-emerald-600';
        } else {
            led.className = 'inline-block w-3 h-3 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse';
            txt.textContent = 'Desconectado de la nube / Sin conexión';
            txt.className = 'text-sm font-bold text-red-500';
        }
    },

    async triggerCloudSync() {
        const container = document.getElementById('sync-progress-bar-container');
        const label = document.getElementById('sync-progress-label');
        const pct = document.getElementById('sync-progress-pct');
        const bar = document.getElementById('sync-progress-bar');

        if (container) container.classList.remove('hidden');

        const success = await MoncofaApp.SyncManager.syncAll((msg, percent) => {
            if (label) label.textContent = msg;
            if (pct) pct.textContent = `${percent}%`;
            if (bar) bar.style.width = `${percent}%`;
        });

        if (success) {
            if (label) label.textContent = '¡Sincronización completada con éxito!';
            setTimeout(() => {
                if (container) container.classList.add('hidden');
            }, 3000);
        } else {
            if (label) label.textContent = 'Error al sincronizar. Revisa tu conexión.';
        }
        this.updateSettingsSyncStatus();
    }
};
