"use strict";

window.MoncofaApp = window.MoncofaApp || {};

MoncofaApp.StatsUI = {
    currentTab: 'individual',

    async init() {
        // Cargar datos al abrir la vista
        await this.renderCurrentTab();
    },

    async switchTab(tabId) {
        this.currentTab = tabId;
        
        // Update UI Tabs
        document.querySelectorAll('.stats-tab').forEach(btn => {
            btn.classList.remove('text-emerald-600', 'border-b-2', 'border-emerald-600', 'active');
            btn.classList.add('text-slate-500');
        });
        const activeBtn = Array.from(document.querySelectorAll('.stats-tab')).find(b => b.getAttribute('onclick').includes(tabId));
        if (activeBtn) {
            activeBtn.classList.add('text-emerald-600', 'border-b-2', 'border-emerald-600', 'active');
            activeBtn.classList.remove('text-slate-500');
        }

        await this.renderCurrentTab();
    },

    async renderCurrentTab() {
        const container = document.getElementById('stats-content-area');
        container.innerHTML = `<div class="flex justify-center items-center py-20"><i data-lucide="loader-2" class="w-8 h-8 text-emerald-500 animate-spin"></i></div>`;
        lucide.createIcons();

        try {
            // Header with Export Button
            const header = document.createElement('div');
            header.className = 'flex justify-between items-center mb-6 px-4';
            header.innerHTML = `
                <h3 class="font-black text-xl text-slate-800 uppercase tracking-tighter">Estadísticas Detalladas</h3>
                <button onclick="MoncofaApp.ExportManager.exportStatsImage()" class="bg-slate-800 text-white px-4 py-2 rounded-xl font-bold hover:bg-slate-900 flex items-center gap-2 shadow-lg transition-all text-sm">
                    <i data-lucide="image" class="w-4 h-4"></i> Exportar Imagen
                </button>
            `;
            container.innerHTML = '';
            container.appendChild(header);

            const content = document.createElement('div');
            container.appendChild(content);

            if (this.currentTab === 'individual') await this.renderIndividual(content);
            else if (this.currentTab === 'global') await this.renderGlobal(content);
            else if (this.currentTab === 'rankings') await this.renderRankings(content);
            else if (this.currentTab === 'goalsList') await this.renderGoalsList(content);
            else if (this.currentTab === 'rests') await this.renderRests(content);
            else if (this.currentTab === 'history') await this.renderHistory(content);
            
            lucide.createIcons();
        } catch (e) {
            console.error("Error rendering stats:", e);
            container.innerHTML = `
                <div class="p-10 text-center">
                    <div class="bg-red-50 text-red-700 p-6 rounded-3xl border border-red-100 max-w-lg mx-auto">
                        <i data-lucide="alert-circle" class="w-12 h-12 mx-auto mb-4 opacity-50"></i>
                        <h3 class="font-black uppercase tracking-tight text-lg mb-2">Error al cargar estadísticas</h3>
                        <p class="text-sm opacity-80 mb-4">${e.message || 'Error desconocido'}</p>
                        <button onclick="location.reload()" class="bg-red-600 text-white px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-red-700 transition-all">Reintentar</button>
                    </div>
                </div>
            `;
            lucide.createIcons();
        }
    },

    getDetailedPlayerTableHtml(rows) {
        if (!rows || rows.length === 0) return '';
        let html = `
            <div class="mt-8 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-0.5 mx-4 mb-4">
                <div class="bg-slate-800 p-4 flex justify-between items-center">
                    <h3 class="font-black text-white flex items-center gap-2"><i data-lucide="table" class="w-5 h-5"></i> Desglose Estadístico Completo</h3>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-sm text-left">
                        <thead class="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200">
                            <tr>
                                <th class="p-3 font-bold text-center w-10">#</th>
                                <th class="p-3 font-bold sticky left-0 bg-slate-50 z-10 shadow-[1px_0_0_#e2e8f0]">Jugador</th>
                                <th class="p-3 font-bold text-center" title="Partidos Jugados">PJ</th>
                                <th class="p-3 font-bold text-center" title="Titularidades 1ª Parte">T1</th>
                                <th class="p-3 font-bold text-center" title="Suplencias 1ª Parte">S1</th>
                                <th class="p-3 font-bold text-center" title="Titularidades 2ª Parte">T2</th>
                                <th class="p-3 font-bold text-center" title="Suplencias 2ª Parte">S2</th>
                                <th class="p-3 font-bold text-center text-emerald-600">Min</th>
                                <th class="p-3 font-bold text-center text-green-600">G</th>
                                <th class="p-3 font-bold text-center text-blue-600">A</th>
                                <th class="p-3 font-bold text-center text-red-500">GC</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100">
        `;

        rows.forEach(p => {
            const pj = p.matchesPlayed || 0;
            if (pj === 0) return;
            const isGK = p.role === 'GK';
            const encajados = isGK ? (p.goalsConceded || 0) : '-';
            
            html += `
                            <tr class="hover:bg-slate-50 transition-colors">
                                <td class="p-3 text-center font-black text-slate-400">${p.dorsal}</td>
                                <td class="p-3 sticky left-0 bg-white shadow-[1px_0_0_#e2e8f0] z-10 group-hover:bg-slate-50 transition-colors whitespace-nowrap font-bold text-slate-700">
                                    <div class="flex items-center gap-2">
                                        <div class="w-6 h-6 rounded-full bg-slate-200 overflow-hidden flex-shrink-0 border border-slate-200">
                                            <img src="${p.photo || `https://ui-avatars.com/api/?name=${p.name}&background=random`}" class="w-full h-full object-cover">
                                        </div>
                                        ${p.name}
                                    </div>
                                </td>
                                <td class="p-3 text-center font-black text-slate-800 bg-slate-50/50">${pj}</td>
                                <td class="p-3 text-center font-bold text-slate-500">${p.starts1stCount || 0}</td>
                                <td class="p-3 text-center font-bold text-slate-500">${p.subs1stCount || 0}</td>
                                <td class="p-3 text-center font-bold text-slate-500">${p.starts2ndCount || 0}</td>
                                <td class="p-3 text-center font-bold text-slate-500">${p.subs2ndCount || 0}</td>
                                <td class="p-3 text-center font-black text-emerald-600 bg-emerald-50/30">${p.minsTot}'</td>
                                <td class="p-3 text-center font-black text-green-600 bg-green-50/30">${p.goals || 0}</td>
                                <td class="p-3 text-center font-black text-blue-600 bg-blue-50/30">${p.assists || 0}</td>
                                <td class="p-3 text-center font-black ${isGK ? 'text-red-500 bg-red-50/30' : 'text-slate-300'}">${encajados}</td>
                            </tr>
            `;
        });

        html += `
                        </tbody>
                    </table>
                    <div class="p-3 bg-slate-50 border-t border-slate-200 text-[10px] sm:text-xs text-slate-500 font-medium flex flex-wrap gap-x-4 gap-y-2">
                        <span><b class="text-slate-700">T1/T2:</b> Titular 1ª/2ª</span>
                        <span><b class="text-slate-700">S1/S2:</b> Suplente 1ª/2ª</span>
                        <span><b class="text-slate-700">Min:</b> Minutos Jugados</span>
                        <span><b class="text-slate-700">G:</b> Goles</span>
                        <span><b class="text-slate-700">A:</b> Asistencias</span>
                        <span><b class="text-slate-700">GC:</b> Goles Encajados (Porteros)</span>
                    </div>
                </div>
            </div>
        `;
        return html;
    },

    async renderIndividual(container) {
        const season = await MoncofaApp.DB.getCurrentSeason();
        const seasonId = season?.id;
        const players = await MoncofaApp.DB.getPlayers();
        const allStats = await MoncofaApp.StatsEngine.getPlayersStats(seasonId);

        if (!allStats || allStats.length === 0) {
            container.innerHTML = `<div class="p-10 text-center text-slate-500 font-bold">No hay estadísticas registradas.</div>`;
            return;
        }

        const rows = allStats.map(s => {
            const p = players.find(x => x.id === s.playerId);
            return {
                ...s,
                id: s.playerId,
                name: p ? p.name : 'Desconocido',
                dorsal: p ? p.number : '?',
                role: p ? p.role : '?',
                photo: p?.photo || null
            };
        }).sort((a, b) => parseInt(a.dorsal) - parseInt(b.dorsal));

        let html = `
            <div id="fifa-cards-grid" class="export-hide grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 p-4">
        `;
        rows.forEach(p => {
            const pj = p.matchesPlayed || 0;
            if (pj === 0) return;
            const isGK = p.role === 'GK';
            const photo = p.photo || `https://ui-avatars.com/api/?name=${p.name}&background=random&size=200`;
            const avgMins = (p.minsTot / pj).toFixed(1);

            html += `
                <div class="flex justify-center" onclick="MoncofaApp.StatsUI.showPlayerDetail(${p.id})">
                    <div class="fifa-card group cursor-pointer">
                        <div class="fifa-card-inner">
                            <div class="fifa-card-info-top">
                                <span class="fifa-card-number">${p.dorsal}</span>
                                <span class="fifa-card-role">${p.role}</span>
                                <div class="w-8 h-5 bg-yellow-500 mt-2 rounded-sm shadow-sm border border-black/10"></div>
                            </div>
                            <img src="${photo}" class="fifa-card-photo object-cover group-hover:scale-110 transition-transform duration-500">
                            <div class="fifa-card-name-area">
                                <h4 class="fifa-card-name">${p.name}</h4>
                            </div>
                            <div class="grid grid-cols-2 gap-y-2 gap-x-4 text-center px-2 relative z-10">
                                <div>
                                    <p class="text-[8px] font-black text-slate-400 uppercase tracking-widest">Partidos</p>
                                    <p class="text-lg font-black text-slate-700 dark:text-slate-200">${pj}</p>
                                </div>
                                <div>
                                    <p class="text-[8px] font-black text-slate-400 uppercase tracking-widest">Promedio</p>
                                    <p class="text-lg font-black text-amber-600">${avgMins}'</p>
                                </div>
                                <div>
                                    <p class="text-[8px] font-black text-slate-400 uppercase tracking-widest">${isGK ? 'G. Encaj' : 'Goles'}</p>
                                    <p class="text-lg font-black ${isGK ? 'text-red-500' : 'text-emerald-600'}">${isGK ? p.goalsConceded : p.goals}</p>
                                </div>
                                <div>
                                    <p class="text-[8px] font-black text-slate-400 uppercase tracking-widest">Asist</p>
                                    <p class="text-lg font-black text-indigo-500">${p.assists}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
        html += `</div>`;
        html += this.getDetailedPlayerTableHtml(rows);
        container.innerHTML = html;
    },

    async renderGlobal(container) {
        const matches = await MoncofaApp.DB.getAllMatches();
        if (matches.length === 0) {
            container.innerHTML = `<div class="p-10 text-center text-slate-500 font-bold">No hay partidos registrados.</div>`;
            return;
        }

        let pj = matches.length;
        let gf = 0;
        let gc = 0;
        let ownRival = 0;
        let ownUs = 0;
        let penForScored = 0;
        let penForMissed = 0;
        let penAgainstScored = 0;
        let penAgainstMissed = 0;

        matches.forEach(m => {
            gf += m.isHome ? m.homeScore : m.awayScore;
            gc += m.isHome ? m.awayScore : m.homeScore;

            if (m.logs) {
                m.logs.forEach(l => {
                    if (l.type === 'own_goal_rival') ownRival++;
                    if (l.type === 'own_goal') ownUs++;
                    if (l.type === 'penalty_scored') penForScored++;
                    if (l.type === 'penalty_missed') penForMissed++;
                    if (l.type === 'penalty_rival_scored') penAgainstScored++;
                    if (l.type === 'penalty_rival_missed') penAgainstMissed++;
                });
            }
        });

        // Ajuste manual solicitado por el usuario: +7 goles en propia del rival
        ownRival += 7;

        const diff = gf - gc;
        const avgGf = (gf / pj).toFixed(1);
        const avgGc = (gc / pj).toFixed(1);

        let html = `
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
                <div class="bg-blue-50 p-6 rounded-2xl border border-blue-100 flex flex-col items-center justify-center text-center">
                    <span class="text-blue-500 font-bold text-sm uppercase tracking-widest mb-2">Partidos Jugados</span>
                    <span class="text-5xl font-black text-blue-700">${pj}</span>
                </div>
                
                <div class="bg-green-50 p-6 rounded-2xl border border-green-100 flex flex-col items-center justify-center text-center shadow-[inset_0_0_20px_rgba(74,222,128,0.1)]">
                    <span class="text-green-600 font-bold text-sm uppercase tracking-widest mb-2">Goles a Favor</span>
                    <span class="text-5xl font-black text-green-700">${gf}</span>
                    <span class="text-green-600 text-xs font-bold mt-2 bg-green-200/50 px-3 py-1 rounded-full">${avgGf} por partido</span>
                </div>

                <div class="bg-red-50 p-6 rounded-2xl border border-red-100 flex flex-col items-center justify-center text-center">
                    <span class="text-red-500 font-bold text-sm uppercase tracking-widest mb-2">Goles en Contra</span>
                    <span class="text-5xl font-black text-red-600">${gc}</span>
                    <span class="text-red-500 text-xs font-bold mt-2 bg-red-200/50 px-3 py-1 rounded-full">${avgGc} por partido</span>
                </div>

                <div class="bg-slate-800 p-6 rounded-2xl flex flex-col items-center justify-center text-center col-span-1 md:col-span-2 lg:col-span-3">
                    <span class="text-slate-400 font-bold text-sm uppercase tracking-widest mb-2">Diferencia de Goles</span>
                    <span class="text-6xl font-black ${diff > 0 ? 'text-green-400' : diff < 0 ? 'text-red-400' : 'text-slate-200'}">
                        ${diff > 0 ? '+' : ''}${diff}
                    </span>
                </div>

                <!-- Detalles Menores -->
                <div class="bg-white border border-slate-200 p-4 rounded-xl">
                    <h4 class="font-bold text-slate-800 mb-3 border-b pb-2 flex items-center gap-2"><i data-lucide="shield-alert" class="w-4 h-4 text-orange-500"></i> Goles en Propia</h4>
                    <div class="flex justify-between items-center py-2 border-b border-dashed">
                        <span class="text-sm text-slate-600">A nuestro favor (Rival p.p)</span>
                        <span class="font-bold text-green-600">${ownRival}</span>
                    </div>
                    <div class="flex justify-between items-center py-2">
                        <span class="text-sm text-slate-600">En nuestra contra (Propia)</span>
                        <span class="font-bold text-red-500">${ownUs}</span>
                    </div>
                </div>

                <div class="bg-white border border-slate-200 p-4 rounded-xl lg:col-span-2">
                    <h4 class="font-bold text-slate-800 mb-3 border-b pb-2 flex items-center gap-2"><i data-lucide="circle-dashed" class="w-4 h-4 text-blue-500"></i> Penaltis</h4>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <span class="block text-xs font-bold text-slate-400 uppercase mb-2">A Favor (${penForScored + penForMissed})</span>
                            <div class="flex items-center gap-4">
                                <div class="text-center"><span class="block text-xl font-black text-green-500">${penForScored}</span><span class="text-[10px] text-slate-500">Anotados</span></div>
                                <div class="text-center"><span class="block text-xl font-black text-red-400">${penForMissed}</span><span class="text-[10px] text-slate-500">Fallados</span></div>
                            </div>
                        </div>
                        <div>
                            <span class="block text-xs font-bold text-slate-400 uppercase mb-2">En Contra (${penAgainstScored + penAgainstMissed})</span>
                            <div class="flex items-center gap-4">
                                <div class="text-center"><span class="block text-xl font-black text-red-500">${penAgainstScored}</span><span class="text-[10px] text-slate-500">Anotados</span></div>
                                <div class="text-center"><span class="block text-xl font-black text-green-400">${penAgainstMissed}</span><span class="text-[10px] text-slate-500">Fallados</span></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = html;
    },

    async renderRankings(container) {
        const season = await MoncofaApp.DB.getCurrentSeason();
        const seasonId = season?.id;
        const players = await MoncofaApp.DB.getPlayers();
        const allStats = await MoncofaApp.StatsEngine.getPlayersStats(seasonId);
        const matches = (await MoncofaApp.DB.getAllMatches()).sort((a, b) => (a.matchday || 0) - (b.matchday || 0));

        if (allStats.length === 0) {
            container.innerHTML = `<div class="p-10 text-center text-slate-500 font-bold">No hay datos para generar rankings.</div>`;
            return;
        }

        // 1. Pichichis, Asistentes y Participación (Desde StatsEngine para consistencia con las cartas)
        const pichichis = [...allStats].sort((a, b) => b.goals - a.goals).slice(0, 10);
        const assistants = [...allStats].sort((a, b) => b.assists - a.assists).slice(0, 10);
        const participations = [...allStats].sort((a, b) => (b.goals + b.assists) - (a.goals + a.assists)).slice(0, 10);

        let pichichiHtml = pichichis.filter(p => p.goals > 0).map((p, i) => {
            const pInfo = players.find(x => x.id === p.playerId);
            const photo = pInfo?.photo || `https://ui-avatars.com/api/?name=${pInfo?.name || '?'}&background=random`;
            return `
                <div class="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl hover:shadow-md transition-all">
                    <div class="flex items-center gap-3">
                        <span class="font-black text-slate-300 w-4">${i + 1}</span>
                        <img src="${photo}" class="w-10 h-10 rounded-full object-cover border border-slate-200">
                        <span class="font-bold text-slate-700">${pInfo?.name || 'Desconocido'}</span>
                    </div>
                    <span class="bg-emerald-100 text-emerald-700 font-black px-3 py-1 rounded-lg text-sm">${p.goals} Goles</span>
                </div>
            `;
        }).join('');

        let assistantsHtml = assistants.filter(p => p.assists > 0).map((p, i) => {
            const pInfo = players.find(x => x.id === p.playerId);
            const photo = pInfo?.photo || `https://ui-avatars.com/api/?name=${pInfo?.name || '?'}&background=random`;
            return `
                <div class="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl hover:shadow-md transition-all">
                    <div class="flex items-center gap-3">
                        <span class="font-black text-slate-300 w-4">${i + 1}</span>
                        <img src="${photo}" class="w-10 h-10 rounded-full object-cover border border-slate-200">
                        <span class="font-bold text-slate-700">${pInfo?.name || 'Desconocido'}</span>
                    </div>
                    <span class="bg-blue-100 text-blue-700 font-black px-3 py-1 rounded-lg text-sm">${p.assists} Asist</span>
                </div>
            `;
        }).join('');

        let participationsHtml = participations.filter(p => (p.goals + p.assists) > 0).map((p, i) => {
            const pInfo = players.find(x => x.id === p.playerId);
            const photo = pInfo?.photo || `https://ui-avatars.com/api/?name=${pInfo?.name || '?'}&background=random`;
            return `
                <div class="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl hover:shadow-md transition-all">
                    <div class="flex items-center gap-3">
                        <span class="font-black text-slate-300 w-4">${i + 1}</span>
                        <img src="${photo}" class="w-10 h-10 rounded-full object-cover border border-slate-200">
                        <span class="font-bold text-slate-700">${pInfo?.name || 'Desconocido'}</span>
                    </div>
                    <div class="flex gap-1 text-xs">
                        <span class="bg-emerald-100 text-emerald-700 font-black px-2 py-1 rounded-lg">${p.goals} G</span>
                        <span class="bg-blue-100 text-blue-700 font-black px-2 py-1 rounded-lg">${p.assists} A</span>
                        <span class="bg-amber-100 text-amber-700 font-black px-2 py-1 rounded-lg ml-1">=${p.goals + p.assists}</span>
                    </div>
                </div>
            `;
        }).join('');


        container.innerHTML = `
            <div class="space-y-12 p-4">
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div class="space-y-4">
                        <h3 class="font-black text-xl text-slate-800 flex items-center gap-2"><i data-lucide="trophy" class="w-6 h-6 text-emerald-500"></i> Pichichi</h3>
                        ${pichichiHtml || '<p class="text-slate-400 italic">No hay goles registrados.</p>'}
                    </div>
                    <div class="space-y-4">
                        <h3 class="font-black text-xl text-slate-800 flex items-center gap-2"><i data-lucide="medal" class="w-6 h-6 text-blue-500"></i> Asistentes</h3>
                        ${assistantsHtml || '<p class="text-slate-400 italic">No hay asistencias registradas.</p>'}
                    </div>
                    <div class="space-y-4">
                        <h3 class="font-black text-xl text-slate-800 flex items-center gap-2"><i data-lucide="star" class="w-6 h-6 text-amber-500"></i> Participación</h3>
                        ${participationsHtml || '<p class="text-slate-400 italic">No hay datos.</p>'}
                    </div>
                </div>
            </div>
        `;
        lucide.createIcons();
    },

    async renderGoalsList(container) {
        const season = await MoncofaApp.DB.getCurrentSeason();
        const seasonId = season?.id;
        const players = await MoncofaApp.DB.getPlayers();
        const matches = (await MoncofaApp.DB.getAllMatches()).sort((a, b) => (a.matchday || 0) - (b.matchday || 0));

        // Listas de Eventos (Historial)
        let goalList = [];
        let totalGoals = 0;

        matches.forEach(m => {
            if (seasonId && m.seasonId !== seasonId) return;
            const jnd = m.matchday ? `J${m.matchday}` : `Amistoso`;
            let matchGoalCount = 0;
            if (m.logs) {
                m.logs.forEach(l => {
                    if (l.type === 'goal' || l.type === 'penalty_scored' || l.type === 'own_goal_rival') {
                        totalGoals++; matchGoalCount++;
                        let scorer = '';
                        if (l.type === 'own_goal_rival') {
                            scorer = 'GOL P.P. (Rival)';
                        } else if (l.type === 'penalty_scored') {
                            let pName = l.d?.player?.name;
                            if (!pName && l.d?.player?.id) {
                                const pObj = players.find(p => p.id.toString() === l.d.player.id.toString());
                                if (pObj) pName = pObj.name;
                            }
                            scorer = (pName || 'Desconocido') + ' (P)';
                        } else {
                            let pName = l.d?.scorer?.name;
                            if (!pName && l.d?.scorer?.id) {
                                const pObj = players.find(p => p.id.toString() === l.d.scorer.id.toString());
                                if (pObj) pName = pObj.name;
                            }
                            scorer = pName || 'Desconocido';
                        }
                        goalList.push({
                            numTotal: totalGoals, numMatch: matchGoalCount, jnd, rival: m.rivalName,
                            min: l.d?.min || '?', player: scorer
                        });
                    }
                });
            }
        });

        if (goalList.length === 0) {
            container.innerHTML = `<div class="p-10 text-center text-slate-500 font-bold">No hay goles en esta temporada.</div>`;
            return;
        }

        container.innerHTML = `
            <div class="space-y-6 p-4">
                <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                    <div class="bg-slate-800 p-4 flex justify-between items-center">
                        <h3 class="font-black text-white flex items-center gap-2"><i data-lucide="list" class="w-5 h-5"></i> Historial de Goles</h3>
                        <span class="text-slate-400 text-xs font-bold uppercase tracking-widest">${totalGoals} Goles Totales</span>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="w-full text-sm text-left">
                            <thead class="bg-slate-50 text-slate-500 sticky top-0">
                                <tr>
                                    <th class="p-3 pl-4 whitespace-nowrap">#T / #P</th>
                                    <th class="p-3 whitespace-nowrap">Jornada/Rival</th>
                                    <th class="p-3 whitespace-nowrap">Autor</th>
                                    <th class="p-3 whitespace-nowrap">Minuto</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-100">
                                ${goalList.map(g => `
                                    <tr class="hover:bg-slate-50 transition-colors">
                                        <td class="p-3 pl-4 font-bold text-slate-400 whitespace-nowrap">#${g.numTotal} / <span class="text-emerald-500">#${g.numMatch}</span></td>
                                        <td class="p-3 whitespace-nowrap"><span class="font-bold text-slate-700">${g.jnd}</span> <span class="text-xs text-slate-500">vs ${g.rival}</span></td>
                                        <td class="p-3 font-bold text-slate-800 whitespace-nowrap">${g.player}</td>
                                        <td class="p-3 text-slate-500 whitespace-nowrap">${g.min}'</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
        lucide.createIcons();
    },

    async renderRests(container) {
        const matches = await MoncofaApp.DB.getAllMatches();
        const players = await MoncofaApp.DB.getPlayers();
        const allStats = await MoncofaApp.DB.player_stats.toArray();

        if (matches.length === 0) {
            container.innerHTML = `<div class="p-10 text-center text-slate-500 font-bold">No hay partidos registrados.</div>`;
            return;
        }

        let html = `<div class="space-y-4 p-4">`;
        matches.sort((a, b) => (b.matchday || 0) - (a.matchday || 0)).forEach(m => {
            const jnd = m.matchday ? `Jornada ${m.matchday}` : `Partido Amistoso`;
            const rival = m.rivalName;
            const loc = m.isHome ? 'Local' : 'Visitante';
            const matchStats = allStats.filter(s => s.matchId === m.id);
            const restedPlayers = players.filter(p => {
                const s = matchStats.find(stat => stat.playerId === p.id);
                return !s || ((s.mins1st || 0) + (s.mins2nd || 0) === 0);
            });

            html += `
                <div class="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <div class="bg-slate-50 p-4 flex justify-between items-center border-b border-slate-100">
                        <div>
                            <h4 class="font-black text-slate-800">${jnd}</h4>
                            <p class="text-sm text-slate-500">vs <span class="font-bold text-slate-700">${rival}</span> (${loc})</p>
                        </div>
                        <span class="bg-slate-200 text-slate-600 font-bold px-3 py-1 rounded-full text-sm">${restedPlayers.length} Descansos</span>
                    </div>
                    <div class="p-4">
                        ${restedPlayers.length > 0 ? `
                            <div class="flex flex-wrap gap-2">
                                ${restedPlayers.map(p => `
                                    <span class="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-xs font-bold border border-slate-200">${p.name}</span>
                                `).join('')}
                            </div>
                        ` : `<p class="text-sm text-slate-400 italic text-center py-2">No descansó nadie. Todos jugaron.</p>`}
                    </div>
                </div>
            `;
        });

        html += `</div>`;
        container.innerHTML = html;
        lucide.createIcons();
    },

    async renderHistory(container) {
        let matches = await MoncofaApp.DB.getAllMatches();
        const season = await MoncofaApp.DB.getCurrentSeason();
        const seasonId = season ? season.id : null;

        if (seasonId) {
            matches = matches.filter(m => m.seasonId === parseInt(seasonId) || !m.seasonId);
        }

        if (matches.length === 0) {
            container.innerHTML = `<div class="p-10 text-center text-slate-500 font-bold">No hay partidos en el historial de esta temporada.</div>`;
            return;
        }

        let html = `
            <div class="p-6">
                <div class="bg-amber-50 border border-amber-100 p-4 rounded-2xl mb-6 flex items-start gap-3">
                    <i data-lucide="info" class="w-5 h-5 text-amber-600 mt-0.5"></i>
                    <p class="text-sm text-amber-800 font-medium">Aquí puedes ver los partidos guardados y eliminar duplicados si te has equivocado al finalizar un partido.</p>
                </div>
                <div class="space-y-4">`;

        matches.forEach(m => {
            const dateStr = m.date || 'Sin fecha';
            const homeS = m.homeScore !== undefined ? m.homeScore : 0;
            const awayS = m.awayScore !== undefined ? m.awayScore : 0;

            const scoreHtml = m.isPlayed ? `
                <div class="flex items-center gap-2 bg-slate-900 text-white px-3 py-1 rounded-lg font-black text-lg">
                    <span>${homeS}</span>
                    <span class="text-slate-500 text-xs">-</span>
                    <span>${awayS}</span>
                </div>
            ` : `
                <div class="bg-slate-100 text-slate-400 px-3 py-1 rounded-lg font-bold text-xs uppercase tracking-widest">
                    Pendiente
                </div>
            `;

            html += `
                <div class="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex justify-between items-center group hover:border-blue-200 transition-all">
                    <div class="flex items-center gap-4">
                        <div class="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                            <i data-lucide="calendar" class="w-6 h-6"></i>
                        </div>
                        <div>
                            <div class="flex items-center gap-2 mb-1">
                                <span class="text-[10px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded uppercase">${dateStr}</span>
                                <span class="text-[10px] font-black bg-blue-100 text-blue-600 px-2 py-0.5 rounded uppercase">${m.isHome ? 'Local' : 'Visitante'}</span>
                            </div>
                            <h4 class="font-bold text-slate-800 text-lg">vs ${m.rivalName}</h4>
                            <div class="mt-2">
                                ${scoreHtml}
                            </div>
                        </div>
                    </div>
                    <div class="flex items-center gap-2">
                        <button onclick="MoncofaApp.StatsUI.showMatchDetails(${m.id})" class="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm flex items-center gap-2 font-bold">
                            <i data-lucide="eye" class="w-4 h-4"></i>
                            <span class="text-xs uppercase tracking-widest">Detalles</span>
                        </button>
                        <button onclick="MoncofaApp.StatsUI.deleteMatch(${m.id})" class="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm flex items-center gap-2 font-bold">
                            <i data-lucide="trash-2" class="w-4 h-4"></i>
                            <span class="text-xs uppercase tracking-widest">Borrar</span>
                        </button>
                    </div>
                </div>
            `;
        });
        html += `</div></div>`;
        container.innerHTML = html;
        lucide.createIcons();
    },

    async showMatchDetails(id) {
        const match = await MoncofaApp.DB.getMatchById(id);
        if (!match) return;

        let logsHtml = '<div class="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">';
        if (match.logs && match.logs.length > 0) {
            match.logs.forEach(l => {
                // Robustness fallbacks for legacy or malformed logs
                const time = l.d?.min || l.time || '0';
                let text = l.text;

                if (!text && l.type) {
                    // Reconstruct text from type/data if missing
                    switch (l.type) {
                        case 'goal': text = `Gol de ${l.d?.scorer?.name || '??'}`; break;
                        case 'sub': text = `Cambio: Entra ${l.d?.in?.name || '??'} por ${l.d?.out?.name || '??'}`; break;
                        case 'match_evt': text = l.d?.text || 'Evento de partido'; break;
                        default: text = l.type.toUpperCase();
                    }
                }

                logsHtml += `
                    <div class="flex items-center gap-3 p-2 bg-slate-50 rounded-lg text-xs border border-slate-100">
                        <span class="font-black text-slate-400 w-10">${time}${time.toString().includes(':') ? '' : '\''}</span>
                        <span class="font-bold text-slate-700">${text || 'Evento registrado'}</span>
                    </div>
                `;
            });
        } else {
            logsHtml += '<p class="text-center text-slate-400 italic py-4">Sin eventos registrados.</p>';
        }
        logsHtml += '</div>';

        const html = `
            <div class="flex justify-between items-center mb-4">
                <h3 class="font-black text-slate-800 uppercase tracking-tighter text-xl">Resumen de Partido</h3>
                <button onclick="MoncofaApp.UI.closeModal()" class="text-slate-400 hover:text-slate-600"><i data-lucide="x"></i></button>
            </div>
            <div class="bg-slate-900 p-6 rounded-2xl text-white text-center mb-4 relative overflow-hidden">
                <div class="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16 blur-2xl"></div>
                <p class="text-xs font-black text-slate-400 uppercase mb-2">Resultado Final</p>
                <p class="text-5xl font-black">${match.homeScore} - ${match.awayScore}</p>
                <p class="text-sm font-bold text-slate-400 mt-2 uppercase tracking-widest">vs ${match.rivalName}</p>
            </div>
            <h4 class="font-black text-slate-500 text-[10px] uppercase tracking-widest mb-2 px-1">Cronología de Eventos</h4>
            ${logsHtml}
        `;
        MoncofaApp.UI.openModal(html);
        lucide.createIcons();
    },


    async showPlayerDetail(playerId) {
        const player = (await MoncofaApp.DB.getPlayers()).find(p => p.id === playerId);
        const season = await MoncofaApp.DB.getCurrentSeason();
        const seasonId = season?.id;
        const allStats = await MoncofaApp.DB.player_stats.where('playerId').equals(playerId).toArray();
        const filteredStats = seasonId ? allStats.filter(s => parseInt(s.seasonId) == parseInt(seasonId) || !s.seasonId) : allStats;
        const playedStats = filteredStats.filter(s => (s.mins1st || 0) + (s.mins2nd || 0) > 0);
        
        // Get matches to show names
        const matchIds = playedStats.map(s => s.matchId);
        const matches = await MoncofaApp.DB.matches.where('id').anyOf(matchIds).toArray();

        let statsHtml = '';
        let totalGoals = 0, totalAssists = 0, totalMins = 0;
        let totalMins1st = 0, totalMins2nd = 0;
        let starts1stCount = 0, starts2ndCount = 0;
        let subs1stCount = 0, subs2ndCount = 0;
        let totalGoalsConceded = 0;

        // Sort filteredStats by matchday (joining with matches)
        filteredStats.sort((a, b) => {
            const mA = matches.find(m => m.id === a.matchId);
            const mB = matches.find(m => m.id === b.matchId);
            return ((mA && mA.matchday) || 0) - ((mB && mB.matchday) || 0);
        });

        filteredStats.forEach(s => {
            const m = matches.find(match => match.id === s.matchId) || { matchday: null, rivalName: 'Desconocido/Borrado' };
            const jnd = m.matchday ? `J${m.matchday}` : 'Amistoso';
            totalGoals += (s.goals || 0);
            totalAssists += (s.assists || 0);
            totalGoalsConceded += (s.goalsConceded || 0);
            
            const m1 = s.mins1st || 0;
            const m2 = s.mins2nd || 0;
            totalMins1st += m1;
            totalMins2nd += m2;
            totalMins += (m1 + m2);

            if (s.starts1st === true) starts1stCount++;
            else if (s.subs1st === true) subs1stCount++;

            if (s.starts2nd === true) starts2ndCount++;
            else if (s.subs2nd === true) subs2ndCount++;

            // Only show match details in the scrollable list if they actually played minutes, 
            // OR if they had goals/assists/starts/subs (in case of orphaned matches).
            if ((m1 + m2) > 0 || s.goals > 0 || s.assists > 0 || s.starts1st || s.subs1st || s.starts2nd || s.subs2nd || s.goalsConceded > 0) {
                statsHtml += `
                    <div class="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl mb-2">
                        <div class="flex flex-col">
                            <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">${jnd} vs ${m.rivalName}</span>
                            <span class="text-xs font-bold text-slate-600">${m1+m2} mins jugados</span>
                        </div>
                        <div class="flex gap-4">
                            <div class="text-center">
                                <span class="block text-xs font-black text-emerald-500">${s.goals || 0}</span>
                                <span class="text-[8px] text-slate-400 uppercase font-bold">Goles</span>
                            </div>
                            <div class="text-center">
                                <span class="block text-xs font-black text-blue-500">${s.assists || 0}</span>
                                <span class="text-[8px] text-slate-400 uppercase font-bold">Asist</span>
                            </div>
                        </div>
                    </div>
                `;
            }
        });

        const photo = player.photo || `https://ui-avatars.com/api/?name=${player.name}&background=random&size=200`;
        const matchesCount = playedStats.length; // Partidos Jugados (minutos > 0)
        const convocadoStats = filteredStats.filter(s => s.calledUp !== false);
        const convocatoriasCount = convocadoStats.length; // Veces en el banquillo/campo
        
        // El porcentaje de titularidad se calcula sobre las CONVOCATORIAS, como quiere el usuario
        const knownStarts1stMatches = convocatoriasCount;
        const knownStarts2ndMatches = convocatoriasCount;
        
        const avgMins = matchesCount > 0 ? (totalMins / matchesCount).toFixed(1) : 0;
        const avgMins1st = knownStarts1stMatches > 0 ? (totalMins1st / knownStarts1stMatches).toFixed(1) : 0;
        const avgMins2nd = knownStarts2ndMatches > 0 ? (totalMins2nd / knownStarts2ndMatches).toFixed(1) : 0;
        
        const avgGoals = matchesCount > 0 ? (totalGoals / matchesCount).toFixed(2) : 0;
        const avgAssists = matchesCount > 0 ? (totalAssists / matchesCount).toFixed(2) : 0;
        const avgConceded = matchesCount > 0 ? (totalGoalsConceded / matchesCount).toFixed(2) : 0;

        const percStarts1st = knownStarts1stMatches > 0 ? Math.round((starts1stCount / knownStarts1stMatches) * 100) : 0;
        const percSubs1st = knownStarts1stMatches > 0 ? Math.round((subs1stCount / knownStarts1stMatches) * 100) : 0;
        const percStarts2nd = knownStarts2ndMatches > 0 ? Math.round((starts2ndCount / knownStarts2ndMatches) * 100) : 0;
        const percSubs2nd = knownStarts2ndMatches > 0 ? Math.round((subs2ndCount / knownStarts2ndMatches) * 100) : 0;

        const isGk = player.role === 'GK';

        const html = `
            <div class="flex justify-between items-center mb-6">
                <h3 class="font-black text-slate-800 uppercase tracking-tighter text-xl">Ficha del Jugador</h3>
                <button onclick="MoncofaApp.UI.closeModal()" class="text-slate-400 hover:text-slate-600 p-2"><i data-lucide="x"></i></button>
            </div>
            
            <div class="flex items-center gap-4 bg-slate-900 p-6 rounded-2xl text-white mb-6 shadow-xl relative overflow-hidden">
                <div class="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16 blur-2xl"></div>
                <div class="w-20 h-20 rounded-full overflow-hidden border-2 border-white/20 shadow-lg relative z-10">
                    <img src="${photo}" class="w-full h-full object-cover">
                </div>
                <div class="relative z-10">
                    <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">#${player.number} | ${player.role}</p>
                    <h4 class="text-2xl font-black uppercase tracking-tighter">${player.name}</h4>
                    <div class="flex gap-2 mt-2 flex-wrap">
                        <span class="bg-emerald-500/20 text-emerald-400 text-[10px] font-black px-2 py-0.5 rounded border border-emerald-500/30 uppercase tracking-widest">${totalGoals} Goles (${avgGoals}/p)</span>
                        <span class="bg-blue-500/20 text-blue-400 text-[10px] font-black px-2 py-0.5 rounded border border-blue-500/30 uppercase tracking-widest">${totalAssists} Asist (${avgAssists}/p)</span>
                        ${isGk ? `<span class="bg-red-500/20 text-red-400 text-[10px] font-black px-2 py-0.5 rounded border border-red-500/30 uppercase tracking-widest">${totalGoalsConceded} Encajados (${avgConceded}/p)</span>` : ''}
                    </div>
                </div>
            </div>

            <!-- Resumen Minutos Generales -->
            <div class="grid grid-cols-3 gap-3 mb-4">
                <div class="bg-white border border-slate-200 p-3 rounded-xl shadow-sm text-center">
                    <span class="block text-[9px] font-black text-slate-400 uppercase mb-1">Partidos</span>
                    <span class="text-xl font-black text-slate-800">${matchesCount}</span>
                </div>
                <div class="bg-white border border-slate-200 p-3 rounded-xl shadow-sm text-center">
                    <span class="block text-[9px] font-black text-slate-400 uppercase mb-1">Mins Totales</span>
                    <span class="text-xl font-black text-slate-800">${totalMins}'</span>
                </div>
                <div class="bg-white border border-slate-200 p-3 rounded-xl shadow-sm text-center">
                    <span class="block text-[9px] font-black text-slate-400 uppercase mb-1">Promedio</span>
                    <span class="text-xl font-black text-amber-600">${avgMins}'</span>
                </div>
            </div>

            <!-- Análisis por Partes -->
            <div class="grid grid-cols-2 gap-4 mb-6">
                <!-- 1ª Parte -->
                <div class="bg-blue-50 border border-blue-100 p-4 rounded-xl shadow-sm">
                    <h5 class="text-xs font-black text-blue-800 uppercase tracking-widest mb-3 border-b border-blue-200 pb-2 flex justify-between">
                        <span>1ª Parte</span>
                        <span class="text-blue-600">${totalMins1st}' <span class="text-[10px] opacity-70">(${avgMins1st}'/p)</span></span>
                    </h5>
                    <div class="space-y-2">
                        <div class="flex justify-between items-center text-sm">
                            <span class="text-slate-600 font-bold">Titularidades</span>
                            <span class="font-black text-blue-700">${starts1stCount} <span class="text-[10px] text-slate-400 ml-1">(${percStarts1st}%)</span></span>
                        </div>
                        <div class="flex justify-between items-center text-sm">
                            <span class="text-slate-600 font-bold">Suplencias</span>
                            <span class="font-black text-slate-700">${subs1stCount} <span class="text-[10px] text-slate-400 ml-1">(${percSubs1st}%)</span></span>
                        </div>
                    </div>
                </div>

                <!-- 2ª Parte -->
                <div class="bg-emerald-50 border border-emerald-100 p-4 rounded-xl shadow-sm">
                    <h5 class="text-xs font-black text-emerald-800 uppercase tracking-widest mb-3 border-b border-emerald-200 pb-2 flex justify-between">
                        <span>2ª Parte</span>
                        <span class="text-emerald-600">${totalMins2nd}' <span class="text-[10px] opacity-70">(${avgMins2nd}'/p)</span></span>
                    </h5>
                    <div class="space-y-2">
                        <div class="flex justify-between items-center text-sm">
                            <span class="text-slate-600 font-bold">Titularidades</span>
                            <span class="font-black text-emerald-700">${starts2ndCount} <span class="text-[10px] text-slate-400 ml-1">(${percStarts2nd}%)</span></span>
                        </div>
                        <div class="flex justify-between items-center text-sm">
                            <span class="text-slate-600 font-bold">Suplencias</span>
                            <span class="font-black text-slate-700">${subs2ndCount} <span class="text-[10px] text-slate-400 ml-1">(${percSubs2nd}%)</span></span>
                        </div>
                    </div>
                </div>
            </div>

            <h5 class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Desglose por Partido</h5>
            <div class="max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                ${statsHtml || '<div class="text-center py-4 text-slate-400 italic text-xs">Sin registros detallados.</div>'}
            </div>
        `;

        MoncofaApp.UI.openModal(html);
        lucide.createIcons();
    },

    async deleteMatch(id) {
        MoncofaApp.UI.showConfirm(
            "Eliminar Partido",
            "¿Estás seguro de que quieres eliminar este partido del historial? Esto afectará a todas las estadísticas de los jugadores.",
            async () => {
                try {
                    // Borrar partido y sus estadísticas
                    await MoncofaApp.DB.player_stats.where('matchId').equals(id).delete();
                    await MoncofaApp.DB.matches.delete(id);
                    MoncofaApp.UI.showToast("Partido y estadísticas eliminadas correctamente.", "success");
                    this.renderCurrentTab();
                } catch (e) {
                    console.error(e);
                    MoncofaApp.UI.showToast("Error al eliminar el partido: " + e.message, "error");
                }
            }
        );
    }
};
