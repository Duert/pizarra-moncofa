"use strict";

window.MoncofaApp = window.MoncofaApp || {};

// Initialize Dexie database
const db = new Dexie("MoncofaTacticalDB");

db.version(7).stores({
    matches: '++id, seasonId, date, matchday, rivalName, isHome, homeScore, awayScore, period, leagueMatchId', // Partidos jugados
    player_stats: '++id, seasonId, matchId, playerId, absenceReason', // Estadísticas por jugador y partido
    players: 'id, name, number, role', // Fichas de jugadores
    official_acts: '++id, matchId, date, matchTitle', // Actas oficiales
    seasons: '++id, name, category, isCurrent', // Temporadas (Ej. 26/27)
    league_teams: '++id, seasonId, name', // Equipos de la liga
    calendar_matches: '++id, seasonId, matchday, homeTeamId, awayTeamId, isPlayed, isOurMatch, [seasonId+matchday]' // Partidos del calendario
});

MoncofaApp.DB = {
    // Dynamic access to tables to avoid initialization timing issues
    get matches() { return db.matches; },
    get player_stats() { return db.player_stats; },
    get players() { return db.players; },
    get seasons() { return db.seasons; },
    get league_teams() { return db.league_teams; },
    get calendar_matches() { return db.calendar_matches; },

    async init() {
        try {
            await db.open();
            console.log("Local Database initialized successfully.");
            await this.syncPlayersFromConstants();
        } catch (e) {
            console.error("Failed to initialize database:", e);
        }
    },

    // Sync initial players from Constants to DB if not present
    async syncPlayersFromConstants() {
        if (!MoncofaApp.Constants || !MoncofaApp.Constants.INITIAL_SQUAD) return;
        
        const count = await db.players.count();
        if (count === 0) {
            console.log("Populating players table from Constants...");
            const playersToInsert = MoncofaApp.Constants.INITIAL_SQUAD.map(p => ({
                id: p.id,
                name: p.name,
                number: p.number,
                role: p.role
            }));
            await db.players.bulkPut(playersToInsert);
        }
    },

    // Guardar un partido finalizado
    async saveMatch(matchData, playerStatsData) {
        try {
            const matchId = await db.transaction('rw', db.matches, db.player_stats, async () => {
                let matchId;
                let existing = null;
                
                if (matchData.leagueMatchId) {
                    existing = await db.matches.where('leagueMatchId').equals(parseInt(matchData.leagueMatchId)).first();
                }

                const matchObj = {
                    seasonId: parseInt(matchData.seasonId) || 0,
                    date: matchData.date || new Date().toISOString(),
                    matchday: matchData.matchday || 0,
                    rivalName: matchData.rivalName || 'Rival',
                    isHome: matchData.isHome,
                    homeScore: parseInt(matchData.homeScore) || 0,
                    awayScore: parseInt(matchData.awayScore) || 0,
                    period: matchData.period,
                    totalMs: matchData.totalMs,
                    logs: matchData.logs,
                    leagueMatchId: matchData.leagueMatchId ? parseInt(matchData.leagueMatchId) : null
                };

                if (existing) {
                    matchId = existing.id;
                    await db.matches.update(matchId, {
                        seasonId: matchData.seasonId ? parseInt(matchData.seasonId) : existing.seasonId,
                        matchday: matchData.matchday || existing.matchday,
                        rivalName: matchData.rivalName || existing.rivalName,
                        isHome: matchData.isHome,
                        homeScore: parseInt(matchData.homeScore) || 0,
                        awayScore: parseInt(matchData.awayScore) || 0,
                        period: matchData.period,
                        totalMs: matchData.totalMs,
                        logs: matchData.logs,
                        isManual: matchData.isManual || existing.isManual,
                        leagueMatchId: matchData.leagueMatchId ? parseInt(matchData.leagueMatchId) : null
                    });
                    // Limpiar estadísticas previas para este partido antes de re-insertar
                    await db.player_stats.where('matchId').equals(matchId).delete();
                } else {
                    // Nuevo registro
                    matchId = await db.matches.add({
                        seasonId: matchData.seasonId ? parseInt(matchData.seasonId) : null,
                        date: matchData.date || new Date().toISOString(),
                        matchday: matchData.matchday || null,
                        rivalName: matchData.rivalName || 'Rival',
                        isHome: matchData.isHome,
                        homeScore: parseInt(matchData.homeScore) || 0,
                        awayScore: parseInt(matchData.awayScore) || 0,
                        period: matchData.period,
                        totalMs: matchData.totalMs,
                        logs: matchData.logs,
                        isManual: matchData.isManual || false,
                        leagueMatchId: matchData.leagueMatchId ? parseInt(matchData.leagueMatchId) : null
                    });
                }

                // 3. Guardar Estadísticas
                if (playerStatsData && playerStatsData.length > 0) {
                    const statsToInsert = playerStatsData.map(s => ({
                        ...s,
                        matchId: matchId,
                        seasonId: matchObj.seasonId
                    }));
                    await db.player_stats.bulkAdd(statsToInsert);
                }
                console.log(`Match ${matchId} ${existing ? 'updated' : 'saved'} successfully.`);
                return matchId;
            });

            // Sincronizar en segundo plano con Supabase
            if (window.MoncofaApp && MoncofaApp.SyncManager) {
                MoncofaApp.SyncManager.syncTableBackground('matches');
                MoncofaApp.SyncManager.syncTableBackground('player_stats');
            }
            return matchId;
        } catch (e) {
            console.error("Error in saveMatch transaction:", e);
            throw e;
        }
    },

    async deleteMatch(id) {
        const res = await db.transaction('rw', db.matches, db.player_stats, async () => {
            await db.matches.delete(parseInt(id));
            await db.player_stats.where('matchId').equals(parseInt(id)).delete();
        });

        // Sincronizar en segundo plano con Supabase
        if (window.MoncofaApp && MoncofaApp.SyncManager) {
            MoncofaApp.SyncManager.syncTableBackground('matches');
            MoncofaApp.SyncManager.syncTableBackground('player_stats');
        }
        return res;
    },

    // Obtener todos los partidos
    async getAllMatches() {
        return await db.matches.orderBy('date').reverse().toArray();
    },

    async getMatchById(id) {
        return await db.matches.get(parseInt(id));
    },

    async getPlayerStatsForMatch(matchId) {
        return await db.player_stats.where('matchId').equals(parseInt(matchId)).toArray();
    },

    // Obtener estadísticas globales de un jugador
    async getPlayerGlobalStats(playerId) {
        const stats = await db.player_stats.where('playerId').equals(playerId).toArray();
        
        return stats.reduce((acc, curr) => {
            acc.matchesPlayed += 1;
            acc.minutesPlayed += curr.minutesPlayed || 0;
            acc.goals += curr.goals || 0;
            acc.assists += curr.assists || 0;
            acc.isStarter += curr.isStarter ? 1 : 0;
            return acc;
        }, {
            matchesPlayed: 0,
            minutesPlayed: 0,
            goals: 0,
            assists: 0,
            isStarter: 0
        });
    },

    // Borrar toda la base de datos (Peligro)
    clearAllData() {
        MoncofaApp.UI.showConfirm(
            "⚠️ ¡ADVERTENCIA CRÍTICA! ⚠️",
            "¿Estás MUY seguro de que quieres borrar TODA la base de datos? Esto no se puede deshacer.",
            async () => {
                try {
                    await db.delete();
                    await db.open();
                    await this.syncPlayersFromConstants();
                    MoncofaApp.UI.showToast("Base de datos borrada correctamente.", "success");
                    setTimeout(() => {
                        location.reload();
                    }, 1500);
                } catch (e) {
                    console.error(e);
                    MoncofaApp.UI.showToast("Error al borrar la base de datos: " + e.message, "error");
                }
            }
        );
    },

    // --- PLAYERS MANAGEMENT ---
    async syncPlayersWithState() {
        try {
            if (window.MoncofaApp && window.MoncofaApp.State && window.MoncofaApp.State.squad && window.MoncofaApp.State.squad.length > 0) {
                const playersToInsert = window.MoncofaApp.State.squad.map(p => ({
                    id: p.id,
                    name: p.name,
                    number: p.number,
                    role: p.role,
                    photo: p.photo || null
                }));
                await db.transaction('rw', db.players, async () => {
                    await db.players.clear();
                    await db.players.bulkPut(playersToInsert);
                });
                console.log("Synchronized IndexedDB players with State.squad successfully.");
            }
        } catch(e) {
            console.error("Error syncing players with state:", e);
        }
    },

    async getPlayers() {
        await this.syncPlayersWithState();
        return await db.players.toArray();
    },

    async savePlayer(player) {
        const res = await db.players.put(player);
        // Also update State
        if (window.MoncofaApp && window.MoncofaApp.State && window.MoncofaApp.State.squad) {
            const squad = window.MoncofaApp.State.squad;
            const idx = squad.findIndex(x => x.id === player.id);
            if (idx !== -1) {
                squad[idx] = { ...squad[idx], ...player };
            } else {
                squad.push({ ...player, calledUp: true });
            }
            localStorage.setItem('moncofa_squad', JSON.stringify(squad));
            MoncofaApp.State.saveSession();
        }
        
        // Sincronizar en segundo plano con Supabase
        if (window.MoncofaApp && MoncofaApp.SyncManager) {
            MoncofaApp.SyncManager.syncTableBackground('players');
        }
        return res;
    },

    async updatePlayerPhoto(id, photoB64) {
        const res = await db.players.update(id, { photo: photoB64 });
        // Also update State
        if (window.MoncofaApp && window.MoncofaApp.State && window.MoncofaApp.State.squad) {
            const p = window.MoncofaApp.State.squad.find(x => x.id === id);
            if (p) {
                p.photo = photoB64;
                localStorage.setItem('moncofa_squad', JSON.stringify(window.MoncofaApp.State.squad));
                MoncofaApp.State.saveSession();
            }
        }
        
        // Sincronizar en segundo plano con Supabase
        if (window.MoncofaApp && window.MoncofaApp.SyncManager) {
            MoncofaApp.SyncManager.syncTableBackground('players');
        }
        return res;
    },

    // --- Official Acts Management ---
    async saveOfficialAct(matchId, date, matchTitle, fileData, fileName) {
        try {
            await db.official_acts.add({
                matchId: parseInt(matchId),
                date: date,
                matchTitle: matchTitle,
                fileData: fileData,
                fileName: fileName
            });
        } catch(e) {
            console.error("Error saving official act:", e);
            throw e;
        }
    },

    async getOfficialActByMatch(matchId) {
        return await db.official_acts.where('matchId').equals(parseInt(matchId)).first();
    },

    async getAllOfficialActs() {
        return await db.official_acts.orderBy('date').reverse().toArray();
    },

    async deleteOfficialAct(id) {
        await db.official_acts.delete(parseInt(id));
    },

    // --- LEAGUE & SEASONS ---
    async getSeasons() {
        return await db.seasons.toArray();
    },

    async getCurrentSeason() {
        return await db.seasons.where('isCurrent').equals(1).first();
    },

    async saveSeason(seasonObj) {
        // If this is set to current, unset others
        if (seasonObj.isCurrent) {
            await db.seasons.toCollection().modify({ isCurrent: 0 });
        }
        let resId;
        if (seasonObj.id) {
            await db.seasons.update(seasonObj.id, seasonObj);
            resId = seasonObj.id;
        } else {
            resId = await db.seasons.add(seasonObj);
        }

        // Sincronizar en segundo plano con Supabase
        if (window.MoncofaApp && MoncofaApp.SyncManager) {
            MoncofaApp.SyncManager.syncTableBackground('seasons');
        }
        return resId;
    },

    async deleteSeason(id) {
        await db.seasons.delete(parseInt(id));
        // Also delete teams and matches for this season
        await db.league_teams.where('seasonId').equals(parseInt(id)).delete();
        await db.calendar_matches.where('seasonId').equals(parseInt(id)).delete();

        // Sincronizar en segundo plano con Supabase
        if (window.MoncofaApp && MoncofaApp.SyncManager) {
            MoncofaApp.SyncManager.syncTableBackground('seasons');
            MoncofaApp.SyncManager.syncTableBackground('league_teams');
            MoncofaApp.SyncManager.syncTableBackground('calendar_matches');
        }
    },

    async getLeagueTeams(seasonId) {
        return await db.league_teams.where('seasonId').equals(parseInt(seasonId)).toArray();
    },

    async saveLeagueTeam(teamObj) {
        let resId;
        if (teamObj.id) {
            await db.league_teams.update(teamObj.id, teamObj);
            resId = teamObj.id;
        } else {
            resId = await db.league_teams.add(teamObj);
        }

        // Sincronizar en segundo plano con Supabase
        if (window.MoncofaApp && window.MoncofaApp.SyncManager) {
            MoncofaApp.SyncManager.syncTableBackground('league_teams');
        }
        return resId;
    },

    async deleteLeagueTeam(id) {
        await db.league_teams.delete(parseInt(id));

        // Sincronizar en segundo plano con Supabase
        if (window.MoncofaApp && MoncofaApp.SyncManager) {
            MoncofaApp.SyncManager.syncTableBackground('league_teams');
        }
    },

    async getCalendarMatches(seasonId) {
        return await db.calendar_matches.where('seasonId').equals(parseInt(seasonId)).toArray();
    },

    async getCalendarMatchesByDay(seasonId, matchday) {
        return await db.calendar_matches.where({ seasonId: parseInt(seasonId), matchday: parseInt(matchday) }).toArray();
    },

    async saveCalendarMatch(matchObj) {
        let resId;
        if (matchObj.id) {
            await db.calendar_matches.update(matchObj.id, matchObj);
            resId = matchObj.id;
        } else {
            resId = await db.calendar_matches.add(matchObj);
        }

        // Sincronizar en segundo plano con Supabase
        if (window.MoncofaApp && window.MoncofaApp.SyncManager) {
            MoncofaApp.SyncManager.syncTableBackground('calendar_matches');
        }
        return resId;
    },

    async getCalendarMatch(id) {
        return await db.calendar_matches.get(parseInt(id));
    },

    async deleteCalendarMatch(id) {
        await db.calendar_matches.delete(parseInt(id));

        // Sincronizar en segundo plano con Supabase
        if (window.MoncofaApp && window.MoncofaApp.SyncManager) {
            MoncofaApp.SyncManager.syncTableBackground('calendar_matches');
        }
    },

    // --- IMPORT / EXPORT ENTIRE DB ---
    async exportDatabase() {
        try {
            const data = {
                matches: await db.matches.toArray(),
                player_stats: await db.player_stats.toArray(),
                players: await db.players.toArray(),
                seasons: await db.seasons.toArray(),
                league_teams: await db.league_teams.toArray(),
                calendar_matches: await db.calendar_matches.toArray()
                // Not exporting official_acts due to large file sizes (images/pdf) potentially causing OOM on mobile
            };
            
            const jsonStr = JSON.stringify(data);
            const blob = new Blob([jsonStr], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `MoncofaDB_Backup_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            return true;
        } catch(e) {
            console.error("Error exporting DB", e);
            return false;
        }
    },

    async importDatabase(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            
            // Clear existing tables (except official_acts)
            await db.transaction('rw', db.matches, db.player_stats, db.players, db.seasons, db.league_teams, db.calendar_matches, async () => {
                await db.matches.clear();
                await db.player_stats.clear();
                await db.players.clear();
                await db.seasons.clear();
                await db.league_teams.clear();
                await db.calendar_matches.clear();
                
                // Import
                if (data.matches) await db.matches.bulkAdd(data.matches);
                if (data.player_stats) await db.player_stats.bulkAdd(data.player_stats);
                if (data.players) await db.players.bulkAdd(data.players);
                if (data.seasons) await db.seasons.bulkAdd(data.seasons);
                if (data.league_teams) await db.league_teams.bulkAdd(data.league_teams);
                if (data.calendar_matches) await db.calendar_matches.bulkAdd(data.calendar_matches);
            });
            
            return true;
        } catch(e) {
            console.error("Error importing DB", e);
            return false;
        }
    }
};
