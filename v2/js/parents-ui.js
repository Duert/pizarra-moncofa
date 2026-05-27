"use strict";

window.MoncofaParents = window.MoncofaParents || {};

MoncofaParents.UI = {
    supabase: null,
    seasons: [],
    selectedSeasonId: null,
    currentTab: 'standings',
    currentStatSubtab: 'goals',
    selectedMatchId: null,

    // Raw fetched data for current season
    players: [],
    leagueTeams: [],
    matches: [],
    playerStats: [],
    calendarMatches: [],

    // Helpers
    getRoleName(role) {
        if (!role) return 'Jugador';
        const r = role.toString().trim().toUpperCase();
        if (r === 'GK' || r === 'PORTERO') return 'Portero';
        return 'Jugador';
    },

    cleanLogoBackground(logoUrl, callback) {
        if (!logoUrl || !logoUrl.startsWith('data:image')) {
            callback(logoUrl);
            return;
        }
        const img = new Image();
        img.onload = () => {
            try {
                const canvas = document.createElement('canvas');
                const width = img.width;
                const height = img.height;
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                
                const imgData = ctx.getImageData(0, 0, width, height);
                const data = imgData.data;
                
                // Flood fill from corners/edges to find connected black pixels
                const visited = new Uint8Array(width * height);
                const queue = [];
                
                const checkAndPush = (x, y) => {
                    if (x < 0 || x >= width || y < 0 || y >= height) return;
                    const idx = y * width + x;
                    if (visited[idx]) return;
                    visited[idx] = 1;
                    
                    const pIdx = idx * 4;
                    const r = data[pIdx];
                    const g = data[pIdx+1];
                    const b = data[pIdx+2];
                    
                    // Check if pixel is close to black (R < 30, G < 30, B < 30)
                    if (r < 30 && g < 30 && b < 30) {
                        queue.push(idx);
                    }
                };
                
                // Push edge pixels to start flood-fill from border
                for (let x = 0; x < width; x++) {
                    checkAndPush(x, 0);
                    checkAndPush(x, height - 1);
                }
                for (let y = 0; y < height; y++) {
                    checkAndPush(0, y);
                    checkAndPush(width - 1, y);
                }
                
                let head = 0;
                while (head < queue.length) {
                    const idx = queue[head++];
                    const pIdx = idx * 4;
                    
                    // Make it transparent
                    data[pIdx+3] = 0;
                    
                    const x = idx % width;
                    const y = Math.floor(idx / width);
                    
                    // 4-connected neighbors
                    checkAndPush(x + 1, y);
                    checkAndPush(x - 1, y);
                    checkAndPush(x, y + 1);
                    checkAndPush(x, y - 1);
                }
                
                ctx.putImageData(imgData, 0, 0);
                callback(canvas.toDataURL('image/png'));
            } catch (err) {
                console.error("Error cleaning logo background:", err);
                callback(logoUrl);
            }
        };
        img.onerror = () => callback(logoUrl);
        img.src = logoUrl;
    },

    async init() {
        const SUPABASE_URL = 'https://ietelfmzsxoiktigkwdc.supabase.co';
        const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlldGVsZm16c3hvaWt0aWdrd2RjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5MDIxOTIsImV4cCI6MjA5NTQ3ODE5Mn0.QByo7nzlAJRzkN0EJE5esDfVlC_7onreJztzawpfebQ';

        if (window.supabase) {
            this.supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
            console.log("Supabase initialized in Parents Portal.");
            
            try {
                await this.loadSeasons();
            } catch (error) {
                console.error("Error during initialization:", error);
                this.showErrorOverlay("Error de conexión con la base de datos.");
            }
        } else {
            console.error("Supabase library not loaded!");
            this.showErrorOverlay("No se pudo cargar la librería de la base de datos.");
        }
    },

    showErrorOverlay(msg) {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.innerHTML = `
                <div class="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-4 max-w-sm border border-slate-100 text-center">
                    <div class="bg-red-50 text-red-500 p-4 rounded-full"><i data-lucide="alert-triangle" class="w-12 h-12"></i></div>
                    <p class="font-black text-slate-800 uppercase tracking-tight text-lg">Error de Carga</p>
                    <p class="text-sm text-slate-500">${msg}</p>
                    <button onclick="location.reload()" class="bg-slate-800 hover:bg-slate-700 text-white font-bold py-2 px-6 rounded-xl transition-all text-sm mt-2">Reintentar</button>
                </div>
            `;
            lucide.createIcons();
        }
    },

    async loadSeasons() {
        const { data, error } = await this.supabase
            .from('seasons')
            .select('*')
            .order('name', { ascending: false });

        if (error) {
            console.error("Error loading seasons:", error);
            throw error;
        }

        this.seasons = data || [];
        if (this.seasons.length === 0) {
            this.showErrorOverlay("No hay temporadas registradas por el entrenador.");
            return;
        }

        // Populate dropdown
        const selector = document.getElementById('season-selector');
        if (selector) {
            selector.innerHTML = this.seasons.map(s => `
                <option value="${s.id}" ${s.is_current === 1 ? 'selected' : ''}>${s.name} - ${s.category || ''}</option>
            `).join('');
        }

        // Set initial selected season
        const currentSeason = this.seasons.find(s => s.is_current === 1) || this.seasons[0];
        this.selectedSeasonId = currentSeason.id;

        // Set league headers
        const leagueNameEl = document.getElementById('league-name');
        const leagueCategoryEl = document.getElementById('league-category');
        if (leagueNameEl) leagueNameEl.textContent = `Moncofa C.F. - ${currentSeason.name}`;
        if (leagueCategoryEl) leagueCategoryEl.textContent = currentSeason.category || 'Categoría no definida';

        await this.loadSeasonData();
    },

    async loadSeasonData() {
        this.showLoading(true);
        const seasonId = this.selectedSeasonId;

        try {
            // Run fetches in parallel for efficiency
            const [playersRes, teamsRes, matchesRes, statsRes, calendarRes] = await Promise.all([
                this.supabase.from('players').select('*'),
                this.supabase.from('league_teams').select('*').eq('season_id', seasonId),
                this.supabase.from('matches').select('*').eq('season_id', seasonId),
                this.supabase.from('player_stats').select('*').eq('season_id', seasonId),
                this.supabase.from('calendar_matches').select('*').eq('season_id', seasonId)
            ]);

            if (playersRes.error) throw playersRes.error;
            if (teamsRes.error) throw teamsRes.error;
            if (matchesRes.error) throw matchesRes.error;
            if (statsRes.error) throw statsRes.error;
            if (calendarRes.error) throw calendarRes.error;

            this.players = playersRes.data || [];
            this.leagueTeams = teamsRes.data || [];
            this.matches = matchesRes.data || [];
            this.playerStats = statsRes.data || [];
            this.calendarMatches = calendarRes.data || [];

            console.log("Loaded season data:", {
                players: this.players.length,
                teams: this.leagueTeams.length,
                matches: this.matches.length,
                stats: this.playerStats.length,
                calendar: this.calendarMatches.length
            });

            // Render UI tabs
            this.renderAll();
            this.showLoading(false);
        } catch (error) {
            console.error("Error loading season data:", error);
            this.showErrorOverlay("No se pudieron descargar los datos de esta temporada.");
        }
    },

    showLoading(show) {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            if (show) {
                overlay.style.opacity = '1';
                overlay.style.pointerEvents = 'auto';
                overlay.classList.remove('hidden');
                overlay.classList.add('flex');
            } else {
                overlay.style.opacity = '0';
                overlay.style.pointerEvents = 'none';
                setTimeout(() => {
                    overlay.classList.add('hidden');
                    overlay.classList.remove('flex');
                }, 500);
            }
        }
    },

    changeSeason(seasonId) {
        this.selectedSeasonId = parseInt(seasonId);
        this.selectedMatchId = null; // Reset selected match
        
        // Update header headers
        const currentSeason = this.seasons.find(s => s.id === this.selectedSeasonId);
        if (currentSeason) {
            const leagueNameEl = document.getElementById('league-name');
            const leagueCategoryEl = document.getElementById('league-category');
            if (leagueNameEl) leagueNameEl.textContent = `Moncofa C.F. - ${currentSeason.name}`;
            if (leagueCategoryEl) leagueCategoryEl.textContent = currentSeason.category || 'Categoría no definida';
        }

        this.loadSeasonData();
    },

    switchTab(tabId) {
        this.currentTab = tabId;

        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('bg-white', 'text-slate-800', 'shadow-sm');
            btn.classList.add('text-slate-500', 'hover:text-slate-800');
        });

        const activeBtn = document.getElementById(`tab-btn-${tabId}`);
        if (activeBtn) {
            activeBtn.classList.remove('text-slate-500', 'hover:text-slate-800');
            activeBtn.classList.add('bg-white', 'text-slate-800', 'shadow-sm');
        }

        // Update tab contents
        document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
        const activeContent = document.getElementById(`tab-content-${tabId}`);
        if (activeContent) activeContent.classList.remove('hidden');

        lucide.createIcons();
    },

    switchPlayerStatTab(subtabId) {
        this.currentStatSubtab = subtabId;

        document.querySelectorAll('.stat-subtab').forEach(btn => {
            btn.classList.remove('bg-emerald-500', 'text-white', 'shadow-sm');
            btn.classList.add('bg-white', 'text-slate-600', 'border', 'border-slate-200', 'hover:bg-slate-50');
        });

        const activeBtn = document.getElementById(`stat-subtab-${subtabId}`);
        if (activeBtn) {
            activeBtn.classList.remove('bg-white', 'text-slate-600', 'border', 'border-slate-200', 'hover:bg-slate-50');
            activeBtn.classList.add('bg-emerald-500', 'text-white', 'shadow-sm');
        }

        document.querySelectorAll('.player-stat-tab-content').forEach(c => c.classList.add('hidden'));
        const activeContent = document.getElementById(`player-stat-content-${subtabId}`);
        if (activeContent) activeContent.classList.remove('hidden');

        lucide.createIcons();
    },

    renderAll() {
        this.renderStandings();
        this.renderTeamStats();
        this.renderPlayerStats();
        lucide.createIcons();
    },

    // --- RENDER CLASIFICACION ---
    generateStandings() {
        const teams = this.leagueTeams;
        if (teams.length === 0) return [];

        const matches = this.calendarMatches;
        
        // Initialize stats
        const stats = {};
        teams.forEach(t => {
            stats[t.id] = {
                teamId: t.id,
                teamName: t.name,
                teamLogo: t.logo,
                isUs: t.name.toLowerCase().includes('moncofa') || t.name.toLowerCase().includes('platges'),
                played: 0,
                won: 0,
                drawn: 0,
                lost: 0,
                gf: 0,
                gc: 0,
                points: 0,
                h2hMatches: []
            };
        });

        // Process played matches
        const playedMatches = matches.filter(m => m.is_played);
        playedMatches.forEach(m => {
            const home = stats[m.home_team_id];
            const away = stats[m.away_team_id];

            if (!home || !away) return;

            const hg = parseInt(m.home_score) || 0;
            const ag = parseInt(m.away_score) || 0;

            home.gf += hg;
            home.gc += ag;
            away.gf += ag;
            away.gc += hg;

            home.played++;
            away.played++;

            home.h2hMatches.push(m);
            away.h2hMatches.push(m);

            if (hg > ag) {
                home.won++;
                home.points += 3;
                away.lost++;
            } else if (hg < ag) {
                away.won++;
                away.points += 3;
                home.lost++;
            } else {
                home.drawn++;
                away.drawn++;
                home.points += 1;
                away.points += 1;
            }
        });

        // Convert to array and sort
        const standingsArray = Object.values(stats);
        standingsArray.sort((a, b) => {
            // 1. Points
            if (a.points !== b.points) return b.points - a.points;

            // 2. Head-to-Head (H2H)
            let h2hPointsA = 0;
            let h2hPointsB = 0;
            const directMatches = playedMatches.filter(m => 
                (m.home_team_id === a.teamId && m.away_team_id === b.teamId) ||
                (m.home_team_id === b.teamId && m.away_team_id === a.teamId)
            );

            directMatches.forEach(m => {
                const hg = parseInt(m.home_score);
                const ag = parseInt(m.away_score);
                if (m.home_team_id === a.teamId) {
                    if (hg > ag) h2hPointsA += 3;
                    else if (hg < ag) h2hPointsB += 3;
                    else { h2hPointsA += 1; h2hPointsB += 1; }
                } else {
                    if (ag > hg) h2hPointsA += 3;
                    else if (ag < hg) h2hPointsB += 3;
                    else { h2hPointsA += 1; h2hPointsB += 1; }
                }
            });

            if (h2hPointsA !== h2hPointsB) return h2hPointsB - h2hPointsA;

            // 3. Goal Difference
            const aDiff = a.gf - a.gc;
            const bDiff = b.gf - b.gc;
            if (aDiff !== bDiff) return bDiff - aDiff;

            // 4. Goals For
            if (a.gf !== b.gf) return b.gf - a.gf;

            // 5. Goals Against
            if (a.gc !== b.gc) return a.gc - b.gc;

            return a.teamName.localeCompare(b.teamName);
        });

        // Assign positions
        standingsArray.forEach((team, index) => {
            team.position = index + 1;
            team.gd = team.gf - team.gc;
        });

        return standingsArray;
    },

    renderStandings() {
        const standings = this.generateStandings();
        const tbody = document.getElementById('standings-table-body');
        if (!tbody) return;

        if (standings.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="10" class="py-8 text-center text-slate-400 font-bold">No hay equipos o partidos cargados para esta temporada.</td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = standings.map(t => {
            const rowClass = t.isUs 
                ? 'bg-emerald-50/70 hover:bg-emerald-100/70 border-b border-emerald-100 font-bold' 
                : 'hover:bg-slate-50 border-b border-slate-100';
            const posClass = t.position === 1 
                ? 'bg-amber-100 text-amber-800' 
                : (t.position <= 3 ? 'bg-slate-100 text-slate-700' : 'text-slate-400');
            const logo = t.isUs ? 'img/logo.png' : (t.teamLogo || `https://ui-avatars.com/api/?name=${encodeURIComponent(t.teamName)}&background=random`);
            const imgId = `team-logo-img-${t.teamId}`;

            return `
                <tr class="${rowClass} text-slate-700 text-sm transition-colors">
                    <td class="py-3.5 px-6 text-center">
                        <span class="inline-flex items-center justify-center w-6 h-6 rounded-full font-black text-xs ${posClass}">
                            ${t.position}
                        </span>
                    </td>
                    <td class="py-3.5 px-4">
                        <div class="flex items-center gap-3">
                            <img id="${imgId}" src="${logo}" class="w-12 h-12 rounded-xl object-contain bg-slate-50 p-1.5 border border-slate-100" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(t.teamName)}&background=random'">
                            <span class="truncate max-w-[200px] md:max-w-xs">${t.teamName}</span>
                        </div>
                    </td>
                    <td class="py-3.5 px-4 text-center font-medium">${t.played}</td>
                    <td class="py-3.5 px-4 text-center text-emerald-600">${t.won}</td>
                    <td class="py-3.5 px-4 text-center text-slate-500">${t.drawn}</td>
                    <td class="py-3.5 px-4 text-center text-red-500">${t.lost}</td>
                    <td class="py-3.5 px-4 text-center text-slate-500">${t.gf}</td>
                    <td class="py-3.5 px-4 text-center text-slate-500">${t.gc}</td>
                    <td class="py-3.5 px-4 text-center font-bold ${t.gd > 0 ? 'text-emerald-600' : (t.gd < 0 ? 'text-red-500' : 'text-slate-500')}">${t.gd > 0 ? '+' : ''}${t.gd}</td>
                    <td class="py-3.5 px-6 text-center font-black bg-emerald-50/50 text-emerald-800 text-base">${t.points}</td>
                </tr>
            `;
        }).join('');

        // Clean logo backgrounds dynamically for base64 logos
        standings.forEach(t => {
            if (!t.isUs && t.teamLogo && t.teamLogo.startsWith('data:image')) {
                this.cleanLogoBackground(t.teamLogo, (cleanedUrl) => {
                    const imgEl = document.getElementById(`team-logo-img-${t.teamId}`);
                    if (imgEl) {
                        imgEl.src = cleanedUrl;
                    }
                });
            }
        });
    },

    // --- RENDER ESTADISTICAS GRUPAL ---
    renderTeamStats() {
        const matches = this.matches; // Our matches saved by the coach
        
        let played = matches.length;
        let wins = 0;
        let draws = 0;
        let losses = 0;
        let gf = 0;
        let gc = 0;
        let cleanSheets = 0;

        matches.forEach(m => {
            const isUsHome = m.is_home;
            const ourScore = isUsHome ? m.home_score : m.away_score;
            const rivalScore = isUsHome ? m.away_score : m.home_score;

            gf += ourScore;
            gc += rivalScore;

            if (ourScore > rivalScore) wins++;
            else if (ourScore < rivalScore) losses++;
            else draws++;

            if (rivalScore === 0) cleanSheets++;
        });

        // Set card values
        document.getElementById('ts-played').textContent = played;
        document.getElementById('ts-goals-for').textContent = gf;
        document.getElementById('ts-goals-against').textContent = gc;
        document.getElementById('ts-clean-sheets').textContent = cleanSheets;

        // Detailed values
        document.getElementById('team-wins').textContent = wins;
        document.getElementById('team-draws').textContent = draws;
        document.getElementById('team-losses').textContent = losses;
        document.getElementById('team-avg-gf').textContent = played > 0 ? (gf / played).toFixed(1) : '0.0';
        document.getElementById('team-avg-gc').textContent = played > 0 ? (gc / played).toFixed(1) : '0.0';

        // Render Match Details dropdown and card
        this.renderMatchDetails(this.selectedMatchId);

        // Render Next Match
        const nextMatchCard = document.getElementById('next-match-card');
        if (nextMatchCard) {
            // Find next unplayed match in calendar matches where we play
            const ourTeams = this.leagueTeams.filter(t => t.name.toLowerCase().includes('moncofa') || t.name.toLowerCase().includes('platges'));
            const ourTeamIds = ourTeams.map(t => t.id);

            const nextPlayed = this.calendarMatches
                .filter(c => !c.is_played && (ourTeamIds.includes(c.home_team_id) || ourTeamIds.includes(c.away_team_id)))
                .sort((a, b) => a.matchday - b.matchday);

            if (nextPlayed.length > 0) {
                const next = nextPlayed[0];
                const homeTeam = this.leagueTeams.find(t => t.id === next.home_team_id);
                const awayTeam = this.leagueTeams.find(t => t.id === next.away_team_id);
                const isHome = ourTeamIds.includes(next.home_team_id);

                nextMatchCard.innerHTML = `
                    <div class="flex items-center justify-between w-full text-xs font-bold">
                        <span class="bg-amber-100 text-amber-800 px-2 py-0.5 rounded uppercase tracking-wider text-[9px]">Jornada ${next.matchday}</span>
                        <div class="flex items-center gap-2">
                            <span class="${isHome ? 'text-slate-800 font-black' : 'text-slate-500 font-medium'}">${homeTeam?.name || 'Local'}</span>
                            <span class="text-slate-400">vs</span>
                            <span class="${!isHome ? 'text-slate-800 font-black' : 'text-slate-500 font-medium'}">${awayTeam?.name || 'Visitante'}</span>
                        </div>
                        <span class="text-[10px] text-slate-400 font-black uppercase">${isHome ? 'En Casa' : 'Fuera'}</span>
                    </div>
                `;
            } else {
                nextMatchCard.innerHTML = `<p class="text-xs text-slate-500 font-bold mx-auto">Todos los partidos han sido jugados.</p>`;
            }
        }
    },

    changeMatchday(matchId) {
        this.selectedMatchId = matchId ? parseInt(matchId) : null;
        this.renderMatchDetails(this.selectedMatchId);
    },

    renderMatchDetails(selectedMatchId = null) {
        const matches = this.matches;
        const selector = document.getElementById('matchday-selector');
        const lastMatchCard = document.getElementById('last-match-card');
        if (!lastMatchCard) return;

        if (matches.length === 0) {
            if (selector) selector.innerHTML = '<option value="">Sin partidos</option>';
            lastMatchCard.innerHTML = `<p class="text-sm text-slate-400 font-bold mx-auto text-center py-4">No hay partidos jugados registrados.</p>`;
            return;
        }

        // Sort matches by matchday descending
        const sortedMatches = [...matches].sort((a, b) => b.matchday - a.matchday);

        // Populate matchday selector if it's empty or needs refresh
        if (selector) {
            selector.innerHTML = sortedMatches.map(m => `
                <option value="${m.id}" ${selectedMatchId === m.id || (!selectedMatchId && m.id === sortedMatches[0].id) ? 'selected' : ''}>
                    Jornada ${m.matchday}
                </option>
            `).join('');
        }

        // Selected match
        const activeMatch = selectedMatchId 
            ? matches.find(m => m.id === parseInt(selectedMatchId)) 
            : sortedMatches[0];

        if (!activeMatch) return;

        const ourScore = activeMatch.is_home ? activeMatch.home_score : activeMatch.away_score;
        const rivalScore = activeMatch.is_home ? activeMatch.away_score : activeMatch.home_score;
        const statusColor = ourScore > rivalScore 
            ? 'bg-emerald-100 text-emerald-800' 
            : (ourScore < rivalScore ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-800');
        const statusText = ourScore > rivalScore 
            ? 'Victoria' 
            : (ourScore < rivalScore ? 'Derrota' : 'Empate');

        // Fetch goals and assists for this match
        const matchStats = this.playerStats.filter(s => s.match_id === activeMatch.id);
        const scorers = [];
        const assistants = [];
        let totalPlayerGoals = 0;

        matchStats.forEach(s => {
            const player = this.players.find(p => p.id === s.player_id);
            if (!player) return;

            if (s.goals > 0) {
                totalPlayerGoals += s.goals;
                scorers.push({
                    name: player.name,
                    goals: s.goals
                });
            }
            if (s.assists > 0) {
                assistants.push({
                    name: player.name,
                    assists: s.assists
                });
            }
        });

        // Calculate rival own goals
        const ownGoalsCount = Math.max(0, ourScore - totalPlayerGoals);
        if (ownGoalsCount > 0) {
            scorers.push({
                name: 'Gol en propia',
                goals: ownGoalsCount
            });
        }

        // Format scorers text
        let scorersHtml = '';
        if (scorers.length > 0) {
            const scorersText = scorers.map(s => `${s.name}${s.goals > 1 ? ` (${s.goals})` : ''}`).join(', ');
            scorersHtml = `
                <div class="flex items-start gap-2 text-xs text-left border-t border-slate-200/50 pt-2">
                    <span class="font-black text-slate-400 uppercase tracking-wider min-w-[70px]">Goles:</span>
                    <span class="text-slate-600 font-bold">${scorersText}</span>
                </div>
            `;
        } else if (ourScore > 0) {
            scorersHtml = `
                <div class="flex items-start gap-2 text-xs text-left border-t border-slate-200/50 pt-2">
                    <span class="font-black text-slate-400 uppercase tracking-wider min-w-[70px]">Goles:</span>
                    <span class="text-slate-400 italic font-medium">Sin goleadores registrados</span>
                </div>
            `;
        }

        // Format assistants text
        let assistantsHtml = '';
        if (assistants.length > 0) {
            const assistantsText = assistants.map(a => `${a.name}${a.assists > 1 ? ` (${a.assists})` : ''}`).join(', ');
            assistantsHtml = `
                <div class="flex items-start gap-2 text-xs text-left border-t border-slate-200/50 pt-2">
                    <span class="font-black text-slate-400 uppercase tracking-wider min-w-[70px]">Asists:</span>
                    <span class="text-slate-600 font-bold">${assistantsText}</span>
                </div>
            `;
        }

        // Date text formatting
        const dateText = activeMatch.date || '';

        lastMatchCard.innerHTML = `
            <div class="flex flex-col items-center">
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Jornada ${activeMatch.matchday || '?'}</span>
                <div class="flex items-center justify-center gap-3 w-full my-1">
                    <span class="font-black text-slate-700 text-sm text-right flex-1 truncate">Platges de Moncofa</span>
                    <span class="font-black text-2xl text-slate-800 bg-white border border-slate-100 rounded-lg px-2 py-0.5 shadow-sm">${ourScore}</span>
                    <span class="text-xs font-bold text-slate-400">-</span>
                    <span class="font-black text-2xl text-slate-800 bg-white border border-slate-100 rounded-lg px-2 py-0.5 shadow-sm">${rivalScore}</span>
                    <span class="font-bold text-slate-600 text-sm text-left flex-1 truncate">${activeMatch.rival_name}</span>
                </div>
                <div class="flex items-center gap-2 mt-1">
                    <span class="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${statusColor}">${statusText}</span>
                    ${dateText ? `<span class="text-[10px] text-slate-400 font-medium">${dateText}</span>` : ''}
                </div>
            </div>
            
            ${scorersHtml || assistantsHtml ? `
                <div class="mt-2 space-y-1.5 bg-white/40 p-3 rounded-xl border border-white/60">
                    ${scorersHtml}
                    ${assistantsHtml}
                </div>
            ` : ''}
        `;
    },

    // --- RENDER ESTADISTICAS INDIVIDUALES ---
    renderPlayerStats() {
        const stats = this.playerStats;
        const players = this.players;

        // Group statistics by player
        const playerMap = {};
        players.forEach(p => {
            playerMap[p.id] = {
                id: p.id,
                name: p.name,
                number: p.number,
                photo: p.photo,
                role: p.role,
                goals: 0,
                assists: 0,
                minutes: 0,
                matchesPlayed: 0
            };
        });

        stats.forEach(s => {
            const p = playerMap[s.player_id];
            if (p) {
                p.goals += s.goals || 0;
                p.assists += s.assists || 0;
                p.minutes += s.minutes_played || 0;
                if (s.minutes_played > 0) {
                    p.matchesPlayed++;
                }
            }
        });

        const playerList = Object.values(playerMap);

        // 1. Render Goals (Pichichi)
        const goalsRankingList = document.getElementById('goals-ranking-list');
        if (goalsRankingList) {
            const sortedByGoals = [...playerList].sort((a, b) => b.goals - a.goals || a.name.localeCompare(b.name));
            const activeGoleadores = sortedByGoals.filter(p => p.goals > 0);

            if (activeGoleadores.length === 0) {
                goalsRankingList.innerHTML = `<p class="text-sm text-slate-400 font-bold text-center col-span-2 py-4">No se han registrado goles en esta temporada.</p>`;
            } else {
                goalsRankingList.innerHTML = activeGoleadores.map((p, index) => {
                    const photo = p.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=random`;
                    return `
                        <div class="flex items-center justify-between p-3 bg-slate-50/50 border border-slate-100 rounded-2xl hover:shadow-md hover:bg-white transition-all">
                            <div class="flex items-center gap-4">
                                <span class="font-black text-slate-300 w-6 text-center text-base">${index + 1}</span>
                                <img src="${photo}" class="w-14 h-14 rounded-full object-cover border border-slate-200 shadow-sm" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=random'">
                                <div>
                                    <span class="font-bold text-slate-800 text-sm block leading-tight">${p.name}</span>
                                    <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Dorsal ${p.number || '-'} • ${this.getRoleName(p.role)}</span>
                                </div>
                            </div>
                            <span class="bg-emerald-100 text-emerald-800 font-black px-3 py-1.5 rounded-lg text-xs tracking-tight">${p.goals} Goles</span>
                        </div>
                    `;
                }).join('');
            }
        }

        // 2. Render Assists
        const assistsRankingList = document.getElementById('assists-ranking-list');
        if (assistsRankingList) {
            const sortedByAssists = [...playerList].sort((a, b) => b.assists - a.assists || a.name.localeCompare(b.name));
            const activeAssistants = sortedByAssists.filter(p => p.assists > 0);

            if (activeAssistants.length === 0) {
                assistsRankingList.innerHTML = `<p class="text-sm text-slate-400 font-bold text-center col-span-2 py-4">No se han registrado asistencias en esta temporada.</p>`;
            } else {
                assistsRankingList.innerHTML = activeAssistants.map((p, index) => {
                    const photo = p.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=random`;
                    return `
                        <div class="flex items-center justify-between p-3 bg-slate-50/50 border border-slate-100 rounded-2xl hover:shadow-md hover:bg-white transition-all">
                            <div class="flex items-center gap-4">
                                <span class="font-black text-slate-300 w-6 text-center text-base">${index + 1}</span>
                                <img src="${photo}" class="w-14 h-14 rounded-full object-cover border border-slate-200 shadow-sm" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=random'">
                                <div>
                                    <span class="font-bold text-slate-800 text-sm block leading-tight">${p.name}</span>
                                    <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Dorsal ${p.number || '-'} • ${this.getRoleName(p.role)}</span>
                                </div>
                            </div>
                            <span class="bg-blue-100 text-blue-800 font-black px-3 py-1.5 rounded-lg text-xs tracking-tight">${p.assists} Asistencias</span>
                        </div>
                    `;
                }).join('');
            }
        }

        // 3. Render Participations (Goals + Assists)
        const minutesRankingList = document.getElementById('minutes-ranking-list');
        if (minutesRankingList) {
            const sortedByPart = [...playerList].sort((a, b) => (b.goals + b.assists) - (a.goals + a.assists) || b.goals - a.goals || a.name.localeCompare(b.name));
            const activeParticipations = sortedByPart.filter(p => (p.goals + p.assists) > 0);

            if (activeParticipations.length === 0) {
                minutesRankingList.innerHTML = `<p class="text-sm text-slate-400 font-bold text-center col-span-2 py-4">No se han registrado participaciones en goles aún.</p>`;
            } else {
                minutesRankingList.innerHTML = activeParticipations.map((p, index) => {
                    const photo = p.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=random`;
                    const totalPart = p.goals + p.assists;
                    return `
                        <div class="flex items-center justify-between p-3 bg-slate-50/50 border border-slate-100 rounded-2xl hover:shadow-md hover:bg-white transition-all">
                            <div class="flex items-center gap-4">
                                <span class="font-black text-slate-300 w-6 text-center text-base">${index + 1}</span>
                                <img src="${photo}" class="w-14 h-14 rounded-full object-cover border border-slate-200 shadow-sm" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=random'">
                                <div>
                                    <span class="font-bold text-slate-800 text-sm block leading-tight">${p.name}</span>
                                    <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Dorsal ${p.number || '-'} • ${this.getRoleName(p.role)} • (${p.goals} G + ${p.assists} A)</span>
                                </div>
                            </div>
                            <span class="bg-indigo-100 text-indigo-800 font-black px-3 py-1.5 rounded-lg text-xs tracking-tight">${totalPart} Part.</span>
                        </div>
                    `;
                }).join('');
            }
        }

        // 4. Render Plantilla (Players Grid List)
        const playersGridList = document.getElementById('players-grid-list');
        if (playersGridList) {
            const sortedByNumber = [...playerList].sort((a, b) => (a.number || 99) - (b.number || 99) || a.name.localeCompare(b.name));
            if (sortedByNumber.length === 0) {
                playersGridList.innerHTML = `<p class="text-sm text-slate-400 font-bold text-center col-span-3 py-4">No hay jugadores registrados en esta temporada.</p>`;
            } else {
                playersGridList.innerHTML = sortedByNumber.map(p => {
                    const photo = p.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=random`;
                    return `
                        <div onclick="MoncofaParents.UI.openPlayerDetails(${p.id})" class="flex items-center gap-5 p-4 bg-slate-50 hover:bg-emerald-50/50 border border-slate-100 hover:border-emerald-200 rounded-3xl cursor-pointer transition-all duration-300 hover:shadow-lg group">
                            <div class="relative w-20 h-20 flex-shrink-0">
                                <img src="${photo}" class="w-full h-full rounded-full object-cover border-2 border-slate-200 shadow-sm" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=random'">
                                <span class="absolute -bottom-1 -right-1 bg-slate-800 group-hover:bg-emerald-500 text-white font-black text-[10px] px-2 py-0.5 rounded-full border-2 border-white transition-colors shadow-sm">
                                    #${p.number || '--'}
                                </span>
                            </div>
                            <div class="truncate flex-1 min-w-0">
                                <span class="font-extrabold text-slate-800 text-base block leading-tight group-hover:text-emerald-950 truncate">${p.name}</span>
                                <span class="text-[10px] font-black text-slate-400 group-hover:text-emerald-700 uppercase tracking-widest block mt-1">${this.getRoleName(p.role)}</span>
                            </div>
                            <div class="text-slate-300 group-hover:text-emerald-400 transition-colors ml-1">
                                <i data-lucide="chevron-right" class="w-5 h-5"></i>
                            </div>
                        </div>
                    `;
                }).join('');
            }
        }
    },

    openPlayerDetails(playerId) {
        const player = this.players.find(p => p.id === parseInt(playerId));
        if (!player) return;

        // Stats calculations
        const stats = this.playerStats.filter(s => s.player_id === player.id);
        
        let goals = 0;
        let assists = 0;
        let minutes = 0;
        let played = 0;
        let starters = 0;
        let subs = 0;
        let called = stats.length;

        stats.forEach(s => {
            goals += s.goals || 0;
            assists += s.assists || 0;
            minutes += s.minutes_played || 0;
            if (s.minutes_played > 0) {
                played++;
                if (s.is_starter) {
                    starters++;
                } else {
                    subs++;
                }
            }
        });

        const avgMins = played > 0 ? Math.round(minutes / played) : 0;

        // Populate modal data
        document.getElementById('player-modal-name').textContent = player.name;
        document.getElementById('player-modal-role').textContent = this.getRoleName(player.role);
        document.getElementById('player-modal-number').textContent = `#${player.number || '--'}`;
        
        const photoEl = document.getElementById('player-modal-photo');
        if (photoEl) {
            photoEl.src = player.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&background=random`;
        }

        document.getElementById('player-modal-goals').textContent = goals;
        document.getElementById('player-modal-assists').textContent = assists;
        document.getElementById('player-modal-minutes').textContent = minutes;
        
        document.getElementById('player-modal-played').textContent = played;
        document.getElementById('player-modal-starters').textContent = starters;
        document.getElementById('player-modal-subs').textContent = subs;
        document.getElementById('player-modal-avg-mins').textContent = `${avgMins} min`;

        // Match-by-match history
        const historyContainer = document.getElementById('player-modal-matchday-history');
        if (historyContainer) {
            if (stats.length === 0) {
                historyContainer.innerHTML = `<p class="text-xs text-slate-400 italic text-center py-2">No se registra participación en partidos para esta temporada.</p>`;
            } else {
                // We need to match each stat to the match information
                // Let's sort stats by matchday descending
                const enrichedStats = stats.map(s => {
                    const match = this.matches.find(m => m.id === s.match_id);
                    return {
                        ...s,
                        matchday: match ? match.matchday : 0,
                        rivalName: match ? match.rival_name : 'Rival desconocido',
                        date: match ? match.date : '',
                        isHome: match ? match.is_home : false,
                        ourScore: match ? (match.is_home ? match.home_score : match.away_score) : 0,
                        rivalScore: match ? (match.is_home ? match.away_score : match.home_score) : 0
                    };
                }).sort((a, b) => b.matchday - a.matchday);

                historyContainer.innerHTML = enrichedStats.map(s => {
                    const statusText = s.minutes_played > 0 
                        ? (s.is_starter ? 'Titular' : 'Suplente')
                        : (s.absence_reason ? `Ausente: ${s.absence_reason}` : 'No convocado');
                    const statusColor = s.minutes_played > 0 
                        ? 'bg-slate-100 text-slate-700' 
                        : 'bg-red-50 text-red-600 border border-red-100';

                    let statsSummary = [];
                    if (s.minutes_played > 0) {
                        statsSummary.push(`${s.minutes_played} min`);
                        if (s.goals > 0) statsSummary.push(`⚽ ${s.goals} G`);
                        if (s.assists > 0) statsSummary.push(`👟 ${s.assists} A`);
                    }

                    return `
                        <div class="flex flex-col gap-1 p-3 bg-slate-50 border border-slate-100 rounded-xl">
                            <div class="flex items-center justify-between">
                                <span class="font-black text-slate-700 text-xs">Jornada ${s.matchday} vs ${s.rivalName}</span>
                                <span class="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full ${statusColor}">${statusText}</span>
                            </div>
                            ${statsSummary.length > 0 ? `
                                <div class="text-[10px] text-slate-500 font-bold flex gap-2 mt-1">
                                    ${statsSummary.map(item => `<span class="bg-white px-2 py-0.5 rounded border border-slate-100">${item}</span>`).join('')}
                                </div>
                            ` : ''}
                        </div>
                    `;
                }).join('');
            }
        }

        // Show modal
        const modal = document.getElementById('player-modal');
        if (modal) {
            modal.classList.remove('hidden');
            // Small timeout for animations
            setTimeout(() => {
                modal.classList.remove('opacity-0');
                modal.querySelector('.transform').classList.remove('scale-95');
            }, 10);
        }

        lucide.createIcons();
    },

    closePlayerModal() {
        const modal = document.getElementById('player-modal');
        if (modal) {
            modal.classList.add('opacity-0');
            modal.querySelector('.transform').classList.add('scale-95');
            setTimeout(() => {
                modal.classList.add('hidden');
            }, 300);
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    MoncofaParents.UI.init();
});
