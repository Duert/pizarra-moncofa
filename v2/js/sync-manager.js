"use strict";

window.MoncofaApp = window.MoncofaApp || {};

MoncofaApp.SyncManager = {
    isSyncing: false,

    // Helper to check if Supabase is available and online
    isOnline() {
        return !!(navigator.onLine && MoncofaApp.State && MoncofaApp.State.supabase);
    },

    // 1. Core Upsert function for a table
    async syncTable(tableName, dexieTable, mapFn) {
        if (!this.isOnline()) {
            console.warn(`Sync skipped for ${tableName} (offline)`);
            return;
        }

        try {
            const localData = await dexieTable.toArray();
            if (localData.length === 0) {
                console.log(`Table ${tableName} is empty locally. No sync needed.`);
                return;
            }

            const mappedData = localData.map(mapFn);

            // Execute upsert in chunks of 50 to avoid any URL/Payload size issues
            const chunkSize = 50;
            for (let i = 0; i < mappedData.length; i += chunkSize) {
                const chunk = mappedData.slice(i, i + chunkSize);
                const { error } = await MoncofaApp.State.supabase
                    .from(tableName)
                    .upsert(chunk, { onConflict: 'id' });

                if (error) {
                    console.error(`Error upserting chunk to Supabase table ${tableName}:`, error);
                    throw error;
                }
            }
            console.log(`Successfully synced ${mappedData.length} records to Supabase table ${tableName}`);
        } catch (error) {
            console.error(`Failed to sync table ${tableName}:`, error);
            throw error;
        }
    },

    // 2. Clean up obsolete records in Supabase (which were deleted locally)
    async cleanObsoleteRecords(tableName, dexieTable) {
        if (!this.isOnline()) return;

        try {
            const localData = await dexieTable.toArray();
            const localIds = localData.map(d => d.id).filter(id => id !== undefined && id !== null);

            // Fetch all IDs in Supabase
            const { data, error } = await MoncofaApp.State.supabase
                .from(tableName)
                .select('id');

            if (error) {
                console.error(`Error reading IDs from Supabase table ${tableName}:`, error);
                return;
            }

            const supabaseIds = data.map(d => d.id);
            const toDelete = supabaseIds.filter(id => !localIds.includes(id));

            if (toDelete.length > 0) {
                console.log(`Cleaning up ${toDelete.length} obsolete records from Supabase table ${tableName}:`, toDelete);
                
                // Supabase delete with .in('id', array)
                const { error: delError } = await MoncofaApp.State.supabase
                    .from(tableName)
                    .delete()
                    .in('id', toDelete);

                if (delError) {
                    console.error(`Error deleting obsolete records from Supabase table ${tableName}:`, delError);
                }
            }
        } catch (error) {
            console.error(`Failed to clean obsolete records in table ${tableName}:`, error);
        }
    },

    // 3. Sync single table in background (silent, auto-triggered on writes)
    async syncTableBackground(tableName) {
        if (!this.isOnline()) return;

        // Map tables
        let dexieTable, mapFn;
        switch (tableName) {
            case 'seasons':
                dexieTable = MoncofaApp.DB.seasons;
                mapFn = s => ({ id: s.id, name: s.name, category: s.category || null, is_current: s.isCurrent ? 1 : 0 });
                break;
            case 'players':
                dexieTable = MoncofaApp.DB.players;
                mapFn = p => ({ id: p.id, name: p.name, number: p.number || null, role: p.role || null, photo: p.photo || null });
                break;
            case 'league_teams':
                dexieTable = MoncofaApp.DB.league_teams;
                mapFn = t => ({ id: t.id, season_id: t.seasonId || null, name: t.name, logo: t.logo || null });
                break;
            case 'matches':
                dexieTable = MoncofaApp.DB.matches;
                mapFn = m => ({
                    id: m.id,
                    season_id: m.seasonId ? parseInt(m.seasonId) : null,
                    date: m.date,
                    matchday: m.matchday ? parseInt(m.matchday) : null,
                    rival_name: m.rivalName,
                    is_home: !!m.isHome,
                    home_score: parseInt(m.homeScore) || 0,
                    away_score: parseInt(m.awayScore) || 0,
                    period: m.period || null,
                    total_ms: m.totalMs || null,
                    logs: m.logs || [],
                    is_manual: !!m.isManual,
                    league_match_id: m.leagueMatchId ? parseInt(m.leagueMatchId) : null
                });
                break;
            case 'player_stats':
                dexieTable = MoncofaApp.DB.player_stats;
                mapFn = s => ({
                    id: s.id,
                    season_id: s.seasonId ? parseInt(s.seasonId) : null,
                    match_id: s.matchId ? parseInt(s.matchId) : null,
                    player_id: s.playerId ? parseInt(s.playerId) : null,
                    minutes_played: (parseInt(s.mins1st) || 0) + (parseInt(s.mins2nd) || 0),
                    goals: parseInt(s.goals) || 0,
                    assists: parseInt(s.assists) || 0,
                    is_starter: !!s.starts1st,
                    absence_reason: s.absenceReason || null
                });
                break;
            case 'calendar_matches':
                dexieTable = MoncofaApp.DB.calendar_matches;
                mapFn = c => ({
                    id: c.id,
                    season_id: c.seasonId ? parseInt(c.seasonId) : null,
                    matchday: parseInt(c.matchday) || 0,
                    home_team_id: c.homeTeamId ? parseInt(c.homeTeamId) : null,
                    away_team_id: c.awayTeamId ? parseInt(c.awayTeamId) : null,
                    is_played: !!c.isPlayed,
                    is_our_match: !!c.isOurMatch,
                    home_score: c.homeScore !== undefined && c.homeScore !== null ? parseInt(c.homeScore) : null,
                    away_score: c.awayScore !== undefined && c.awayScore !== null ? parseInt(c.awayScore) : null
                });
                break;
            default:
                return;
        }

        try {
            if (MoncofaApp.UI) MoncofaApp.UI.updateSyncStatus('syncing');
            
            // Sync current items
            await this.syncTable(tableName, dexieTable, mapFn);
            
            // Sync deletions
            await this.cleanObsoleteRecords(tableName, dexieTable);
            
            if (MoncofaApp.UI) MoncofaApp.UI.updateSyncStatus('connected');
        } catch (e) {
            console.error(`Failed background sync for ${tableName}:`, e);
            if (MoncofaApp.UI) MoncofaApp.UI.updateSyncStatus('offline');
        }
    },

    // 4. Full Sync All Tables in Dependency Order
    async syncAll(onProgress = null) {
        if (this.isSyncing) return;
        if (!this.isOnline()) {
            if (MoncofaApp.UI) {
                MoncofaApp.UI.showToast("Sin conexión a internet o Supabase no inicializado", "error");
            }
            return false;
        }

        this.isSyncing = true;
        if (MoncofaApp.UI) MoncofaApp.UI.updateSyncStatus('syncing');

        const steps = [
            {
                name: 'seasons',
                label: 'Temporadas',
                dexieTable: MoncofaApp.DB.seasons,
                mapFn: s => ({ id: s.id, name: s.name, category: s.category || null, is_current: s.isCurrent ? 1 : 0 })
            },
            {
                name: 'players',
                label: 'Jugadores',
                dexieTable: MoncofaApp.DB.players,
                mapFn: p => ({ id: p.id, name: p.name, number: p.number || null, role: p.role || null, photo: p.photo || null })
            },
            {
                name: 'league_teams',
                label: 'Equipos de la Liga',
                dexieTable: MoncofaApp.DB.league_teams,
                mapFn: t => ({ id: t.id, season_id: t.seasonId || null, name: t.name, logo: t.logo || null })
            },
            {
                name: 'matches',
                label: 'Partidos Guardados',
                dexieTable: MoncofaApp.DB.matches,
                mapFn: m => ({
                    id: m.id,
                    season_id: m.seasonId ? parseInt(m.seasonId) : null,
                    date: m.date,
                    matchday: m.matchday ? parseInt(m.matchday) : null,
                    rival_name: m.rivalName,
                    is_home: !!m.isHome,
                    home_score: parseInt(m.homeScore) || 0,
                    away_score: parseInt(m.awayScore) || 0,
                    period: m.period || null,
                    total_ms: m.totalMs || null,
                    logs: m.logs || [],
                    is_manual: !!m.isManual,
                    league_match_id: m.leagueMatchId ? parseInt(m.leagueMatchId) : null
                })
            },
            {
                name: 'player_stats',
                label: 'Estadísticas de Jugadores',
                dexieTable: MoncofaApp.DB.player_stats,
                mapFn: s => ({
                    id: s.id,
                    season_id: s.seasonId ? parseInt(s.seasonId) : null,
                    match_id: s.matchId ? parseInt(s.matchId) : null,
                    player_id: s.playerId ? parseInt(s.playerId) : null,
                    minutes_played: (parseInt(s.mins1st) || 0) + (parseInt(s.mins2nd) || 0),
                    goals: parseInt(s.goals) || 0,
                    assists: parseInt(s.assists) || 0,
                    is_starter: !!s.starts1st,
                    absence_reason: s.absenceReason || null
                })
            },
            {
                name: 'calendar_matches',
                label: 'Calendario de la Liga',
                dexieTable: MoncofaApp.DB.calendar_matches,
                mapFn: c => ({
                    id: c.id,
                    season_id: c.seasonId ? parseInt(c.seasonId) : null,
                    matchday: parseInt(c.matchday) || 0,
                    home_team_id: c.homeTeamId ? parseInt(c.homeTeamId) : null,
                    away_team_id: c.awayTeamId ? parseInt(c.awayTeamId) : null,
                    is_played: !!c.isPlayed,
                    is_our_match: !!c.isOurMatch,
                    home_score: c.homeScore !== undefined && c.homeScore !== null ? parseInt(c.homeScore) : null,
                    away_score: c.awayScore !== undefined && c.awayScore !== null ? parseInt(c.awayScore) : null
                })
            }
        ];

        try {
            // 1. Sync all records (Dependency Order)
            for (let i = 0; i < steps.length; i++) {
                const step = steps[i];
                if (onProgress) onProgress(`Sincronizando ${step.label}...`, Math.round(((i + 1) / (steps.length * 2)) * 100));
                await this.syncTable(step.name, step.dexieTable, step.mapFn);
            }

            // 2. Clean up deleted records (Reverse Dependency Order to avoid Foreign Key errors)
            const cleanSteps = [...steps].reverse();
            for (let i = 0; i < cleanSteps.length; i++) {
                const step = cleanSteps[i];
                if (onProgress) onProgress(`Limpiando ${step.label} obsoletos...`, Math.round((0.5 + ((i + 1) / (cleanSteps.length * 2))) * 100));
                await this.cleanObsoleteRecords(step.name, step.dexieTable);
            }

            if (MoncofaApp.UI) {
                MoncofaApp.UI.updateSyncStatus('connected');
                MoncofaApp.UI.showToast("Sincronización completa con Supabase", "success");
            }
            this.isSyncing = false;
            return true;
        } catch (e) {
            console.error("Critical error in full database sync:", e);
            if (MoncofaApp.UI) {
                MoncofaApp.UI.updateSyncStatus('offline');
                MoncofaApp.UI.showToast("Error crítico durante la sincronización: " + e.message, "error");
            }
            this.isSyncing = false;
            return false;
        }
    }
};
