"use strict";

window.MoncofaApp = window.MoncofaApp || {};

MoncofaApp.StatsEngine = {
    // Calcula los minutos exactos jugados en base a los logs de cambios y los minutos totales
    // matchData debe tener: totalMs (milisegundos jugados), period (periodos jugados), logs (eventos)
    // Asumimos 25 min por parte.
    calculatePlayerStats(matchData, initialLineup, squad, secondHalfLineup = null) {
        const statsMap = {};

        // Inicializar a todos los jugadores convocados
        squad.forEach(p => {
            if (p.calledUp) {
                statsMap[p.id] = {
                    playerId: p.id,
                    mins1st: 0,
                    mins2nd: 0,
                    starts1st: false,
                    subs1st: false,
                    starts2nd: false,
                    subs2nd: false,
                    goals: 0,
                    assists: 0,
                    goalsConceded: 0,
                    penaltiesTaken: 0,
                    penaltiesScored: 0,
                    penaltiesMissed: 0,
                    _activePeriods: [] // para calcular minutos exactos
                };
            }
        });

        // Marcar titulares 1ª parte
        initialLineup.forEach(id => {
            if (id !== null && statsMap[id]) {
                statsMap[id].starts1st = true;
                statsMap[id]._activePeriods.push({ startMin: 0, endMin: 25, period: 1 }); // Asumimos que jugaron todo hasta que se demuestre lo contrario
            }
        });

        let manualMode = false;
        if (secondHalfLineup && secondHalfLineup.length > 0) {
            manualMode = true;
        }

        let currentLineup = [...initialLineup];
        
        // Split logs into first and second half
        const safeLogs = matchData.logs || [];
        const firstHalfLogs = safeLogs.filter(l => parseInt(l.d?.min || 0) <= 25);
        const secondHalfLogs = safeLogs.filter(l => parseInt(l.d?.min || 0) > 25);

        // Process 1st half logs
        firstHalfLogs.forEach(log => {
            const min = parseInt(log.d?.min || 0);

            if (log.type === 'sub') {
                const pOut = log.d.out;
                const pIn = log.d.in;

                // Ajustar al jugador que sale
                if (pOut && pOut.id && statsMap[pOut.id]) {
                    const activeP = statsMap[pOut.id]._activePeriods.find(p => p.period === 1 && p.endMin >= min);
                    if (activeP) {
                        activeP.endMin = min;
                    }
                    const idx = currentLineup.indexOf(pOut.id);
                    if (idx !== -1) currentLineup[idx] = null;
                }

                // Ajustar al jugador que entra
                if (pIn && pIn.id && statsMap[pIn.id]) {
                    statsMap[pIn.id]._activePeriods.push({ startMin: min, endMin: 25, period: 1 });
                    statsMap[pIn.id].subs1st = true;
                    
                    const emptyIdx = currentLineup.indexOf(null);
                    if (emptyIdx !== -1) currentLineup[emptyIdx] = pIn.id;
                }
            } 
            else if (log.type === 'goal') {
                if (log.d.scorer && statsMap[log.d.scorer.id]) statsMap[log.d.scorer.id].goals++;
                if (log.d.assist && statsMap[log.d.assist.id]) statsMap[log.d.assist.id].assists++;
            }
            else if (log.type === 'penalty_scored') {
                if (log.d.player && statsMap[log.d.player.id]) {
                    statsMap[log.d.player.id].penaltiesTaken++;
                    statsMap[log.d.player.id].penaltiesScored++;
                    statsMap[log.d.player.id].goals++; 
                }
            }
            else if (log.type === 'penalty_missed') {
                if (log.d.player && statsMap[log.d.player.id]) {
                    statsMap[log.d.player.id].penaltiesTaken++;
                    statsMap[log.d.player.id].penaltiesMissed++;
                }
            }
            else if (log.type === 'own_goal' || log.type === 'goal_opponent' || log.type === 'penalty_rival_scored') {
                const currentGkId = currentLineup.find(id => {
                    const p = squad.find(player => player.id === id);
                    return p && p.role === 'GK';
                });

                if (currentGkId && statsMap[currentGkId]) {
                    statsMap[currentGkId].goalsConceded++;
                }
            }
        });

        // 2nd Half Transition
        let playedSecondHalf = manualMode || matchData.period === 2 || secondHalfLogs.length > 0;
        
        if (playedSecondHalf) {
            if (manualMode) {
                currentLineup = [...secondHalfLineup];
                secondHalfLineup.forEach(id => {
                    if (id !== null && statsMap[id]) {
                        statsMap[id].starts2nd = true;
                        statsMap[id]._activePeriods.push({ startMin: 25, endMin: 50, period: 2 });
                    }
                });
            } else {
                // Live mode: currentLineup continues into 2nd half
                currentLineup.forEach(id => {
                    if (id !== null && statsMap[id]) {
                        statsMap[id].starts2nd = true; 
                        statsMap[id]._activePeriods.push({ startMin: 25, endMin: 50, period: 2 });
                    }
                });
            }
        }

        // Process 2nd half logs
        secondHalfLogs.forEach(log => {
            const min = parseInt(log.d?.min || 0);

            if (log.type === 'sub') {
                const pOut = log.d.out;
                const pIn = log.d.in;

                // Ajustar al jugador que sale
                if (pOut && pOut.id && statsMap[pOut.id]) {
                    const activeP = statsMap[pOut.id]._activePeriods.find(p => p.period === 2 && p.endMin >= min);
                    if (activeP) {
                        activeP.endMin = min;
                    }
                    const idx = currentLineup.indexOf(pOut.id);
                    if (idx !== -1) currentLineup[idx] = null;
                }

                // Ajustar al jugador que entra
                if (pIn && pIn.id && statsMap[pIn.id]) {
                    statsMap[pIn.id]._activePeriods.push({ startMin: min, endMin: 50, period: 2 });
                    statsMap[pIn.id].subs2nd = true;
                    
                    const emptyIdx = currentLineup.indexOf(null);
                    if (emptyIdx !== -1) currentLineup[emptyIdx] = pIn.id;
                }
            } 
            else if (log.type === 'goal') {
                if (log.d.scorer && statsMap[log.d.scorer.id]) statsMap[log.d.scorer.id].goals++;
                if (log.d.assist && statsMap[log.d.assist.id]) statsMap[log.d.assist.id].assists++;
            }
            else if (log.type === 'penalty_scored') {
                if (log.d.player && statsMap[log.d.player.id]) {
                    statsMap[log.d.player.id].penaltiesTaken++;
                    statsMap[log.d.player.id].penaltiesScored++;
                    statsMap[log.d.player.id].goals++; 
                }
            }
            else if (log.type === 'penalty_missed') {
                if (log.d.player && statsMap[log.d.player.id]) {
                    statsMap[log.d.player.id].penaltiesTaken++;
                    statsMap[log.d.player.id].penaltiesMissed++;
                }
            }
            else if (log.type === 'own_goal' || log.type === 'goal_opponent' || log.type === 'penalty_rival_scored') {
                const currentGkId = currentLineup.find(id => {
                    const p = squad.find(player => player.id === id);
                    return p && p.role === 'GK';
                });

                if (currentGkId && statsMap[currentGkId]) {
                    statsMap[currentGkId].goalsConceded++;
                }
            }
        });

        // Calcular minutos finales por parte
        Object.values(statsMap).forEach(stat => {
            stat.mins1st = stat._activePeriods.filter(p => p.period === 1).reduce((sum, p) => sum + (p.endMin - p.startMin), 0);
            stat.mins2nd = stat._activePeriods.filter(p => p.period === 2).reduce((sum, p) => sum + (p.endMin - p.startMin), 0);
            
            // Si mins > max permitidos, corregir. (Un jugador no puede jugar > 25 mins por parte)
            if (stat.mins1st > 25) stat.mins1st = 25;
            if (stat.mins2nd > 25) stat.mins2nd = 25;

            // Calcular titularidades si existen las alineaciones (Partidos manuales)
            if (initialLineup && initialLineup.length > 0) {
                if (initialLineup.includes(stat.playerId)) {
                    stat.starts1st = true;
                    stat.subs1st = false;
                } else if (stat.mins1st > 0 || (matchData.logs && matchData.logs.some(l => l.period === 1 && l.type === 'sub_in' && l.d.playerIn && l.d.playerIn.id === stat.playerId))) {
                    stat.starts1st = false;
                    stat.subs1st = true;
                }
            }
            
            if (secondHalfLineup && secondHalfLineup.length > 0) {
                if (secondHalfLineup.includes(stat.playerId)) {
                    stat.starts2nd = true;
                    stat.subs2nd = false;
                } else if (stat.mins2nd > 0 || (matchData.logs && matchData.logs.some(l => l.period === 2 && l.type === 'sub_in' && l.d.playerIn && l.d.playerIn.id === stat.playerId))) {
                    stat.starts2nd = false;
                    stat.subs2nd = true;
                }
            }

            // Clean up temporary property
            delete stat._activePeriods;
        });

        return Object.values(statsMap);
    },

    async getGlobalStats(seasonId) {
        let matches = await MoncofaApp.DB.getAllMatches();
        if (seasonId) {
            matches = matches.filter(m => m.seasonId === parseInt(seasonId) || !m.seasonId);
        }
        
        let totalGoals = 0;
        let totalGoalsConceded = 0;
        let cleanSheets = 0;
        
        matches.forEach(m => {
            const isUsHome = m.isHome;
            const gf = parseInt(isUsHome ? m.homeScore : m.awayScore) || 0;
            const gc = parseInt(isUsHome ? m.awayScore : m.homeScore) || 0;
            
            totalGoals += gf;
            totalGoalsConceded += gc;
            if (gc === 0) cleanSheets++;
        });

        return {
            matchesCount: matches.length,
            totalGoals,
            totalGoalsConceded,
            cleanSheets
        };
    },

    async getPlayersStats(seasonId) {
        let allStats = await MoncofaApp.DB.player_stats.toArray();
        if (seasonId) {
            allStats = allStats.filter(s => s.seasonId === parseInt(seasonId) || !s.seasonId);
        }
        const players = await MoncofaApp.DB.getPlayers();
        
        const aggregated = {};
        players.forEach(p => {
            aggregated[p.id] = {
                playerId: p.id,
                matchesPlayed: 0,
                starts1stCount: 0,
                subs1stCount: 0,
                starts2ndCount: 0,
                subs2ndCount: 0,
                goals: 0,
                assists: 0,
                minsTot: 0,
                goalsConceded: 0
            };
        });

        allStats.forEach(stat => {
            if (aggregated[stat.playerId]) {
                const mins = (stat.mins1st || 0) + (stat.mins2nd || 0);
                if (mins > 0) {
                    aggregated[stat.playerId].matchesPlayed++;
                }
                if (stat.starts1st) aggregated[stat.playerId].starts1stCount++;
                if (stat.subs1st) aggregated[stat.playerId].subs1stCount++;
                if (stat.starts2nd) aggregated[stat.playerId].starts2ndCount++;
                if (stat.subs2nd) aggregated[stat.playerId].subs2ndCount++;
                
                aggregated[stat.playerId].goals += stat.goals || 0;
                aggregated[stat.playerId].assists += stat.assists || 0;
                aggregated[stat.playerId].minsTot += mins;
                aggregated[stat.playerId].goalsConceded += stat.goalsConceded || 0;
            }
        });

        return Object.values(aggregated);
    },

    async repairRetroactiveStats() {
        console.log("Starting retroactive stats repair...");
        try {
            const allMatches = await MoncofaApp.DB.getAllMatches();
            const squad = await MoncofaApp.DB.getPlayers();

            for (const m of allMatches) {
                const currentStats = await MoncofaApp.DB.player_stats.where('matchId').equals(m.id).toArray();
                if (!currentStats || currentStats.length === 0) continue;

                // Reconstruct lineups
                const initialLineup = currentStats.filter(s => s.starts1st).map(s => s.playerId);
                const secondHalfLineup = m.isManual ? currentStats.filter(s => s.starts2nd).map(s => s.playerId) : null;

                if (initialLineup.length === 0 && (!secondHalfLineup || secondHalfLineup.length === 0)) {
                    continue; // Skip legacy/manual matches that don't have starting lineups saved
                }

                const processingSquad = squad.map(p => {
                    const pStat = currentStats.find(s => s.playerId === p.id);
                    return {
                        ...p,
                        calledUp: pStat ? pStat.calledUp : false,
                        absenceReason: pStat ? pStat.absenceReason : null
                    };
                });

                // Use the new algorithm to recalculate the exact minutes
                const calculatedStats = this.calculatePlayerStats(m, initialLineup, processingSquad, secondHalfLineup);

                // --- FULL RECOVERY FROM IPAD BLOB (Resurrect deleted stats) ---
                if (window.MoncofaApp && window.MoncofaApp.IpadDataBlob) {
                    const blob = window.MoncofaApp.IpadDataBlob;
                    const jnd = m.matchday;
                    if (jnd) {
                        const sheetKey = Object.keys(blob).find(k => k.toLowerCase().includes(`jornada ${jnd}_`) || k.toLowerCase().includes(`jornada ${jnd} `));
                        if (sheetKey) {
                            const rows = blob[sheetKey].slice(1);
                            rows.forEach(r => {
                                const pStrNum = r[0] ? r[0].toString().trim() : "";
                                const pNameFirst = r[1] ? r[1].toString().split(' ')[0].toLowerCase().trim() : "";
                                const p = processingSquad.find(x => (pStrNum && x.number != null && x.number.toString() === pStrNum) || (pNameFirst && x.name && x.name.toLowerCase().includes(pNameFirst)));
                                if (p) {
                                    let stat = calculatedStats.find(s => s.playerId === p.id);
                                    if (!stat) {
                                        stat = { playerId: p.id, playerName: p.name, mins1st: 0, mins2nd: 0, goals: 0, assists: 0, goalsConceded: 0, penaltiesTaken: 0, starts1st: false, subs1st: false, starts2nd: false, subs2nd: false };
                                        calculatedStats.push(stat);
                                    }
                                    const m1 = Math.round(parseFloat(r[6])*1440) || 0;
                                    const m2 = Math.round(parseFloat(r[10])*1440) || 0;
                                    if (m1 > 0) stat.mins1st = m1;
                                    if (m2 > 0) stat.mins2nd = m2;
                                    if (r[3] === "1") stat.starts1st = true;
                                    if (r[3] === "0") stat.subs1st = true;
                                    if (r[7] === "1") stat.starts2nd = true;
                                    if (r[7] === "0") stat.subs2nd = true;
                                    stat.goals = Math.max(stat.goals, parseInt(r[11]) || 0);
                                    stat.assists = Math.max(stat.assists, parseInt(r[12]) || 0);
                                }
                            });
                        }
                    }
                }
                // --------------------------------------------------------------

                const finalStatsToSave = [];
                currentStats.forEach(oldStat => {
                    const newStat = calculatedStats.find(s => s.playerId === oldStat.playerId) || { playerId: oldStat.playerId };
                    
                    // Recover minutes if calculatePlayerStats yielded 0 (e.g. iPad matches without lineups)
                    newStat.mins1st = newStat.mins1st || oldStat.mins1st || 0;
                    newStat.mins2nd = newStat.mins2nd || oldStat.mins2nd || 0;
                    
                    if (newStat.mins1st > 0 || newStat.mins2nd > 0 || newStat.goals > 0 || newStat.assists > 0 || oldStat.goalsConceded > 0 || newStat.penaltiesTaken > 0 || !oldStat.calledUp) {
                        
                        if (oldStat) {
                            if (m.isManual) {
                                newStat.goalsConceded = oldStat.goalsConceded || 0; // Preserve manual GK goals conceded
                                newStat.goals = oldStat.goals || newStat.goals || 0;
                                newStat.assists = oldStat.assists || newStat.assists || 0;
                                newStat.starts1st = oldStat.starts1st || false;
                                newStat.subs1st = oldStat.subs1st || false;
                                newStat.starts2nd = oldStat.starts2nd || false;
                                newStat.subs2nd = oldStat.subs2nd || false;
                            } else {
                                newStat.goalsConceded = Math.max(newStat.goalsConceded || 0, oldStat.goalsConceded || 0); // Trust new calculation for Live matches
                                newStat.goals = Math.max(newStat.goals || 0, oldStat.goals || 0);
                                newStat.assists = Math.max(newStat.assists || 0, oldStat.assists || 0);
                                newStat.starts1st = newStat.starts1st || oldStat.starts1st || false;
                                newStat.subs1st = newStat.subs1st || oldStat.subs1st || false;
                                newStat.starts2nd = newStat.starts2nd || oldStat.starts2nd || false;
                                newStat.subs2nd = newStat.subs2nd || oldStat.subs2nd || false;
                            }
                            newStat.calledUp = oldStat.calledUp;
                            newStat.absenceReason = oldStat.absenceReason;
                        }
                    }
                });

                // --- DISTRIBUTE UNASSIGNED GOALS CONCEDED ---
                const matchGc = m.isHome ? (m.awayScore || 0) : (m.homeScore || 0);
                let totalGksConceded = 0;
                calculatedStats.forEach(newStat => {
                    totalGksConceded += (newStat.goalsConceded || 0);
                });

                const unassignedGc = Math.max(0, matchGc - totalGksConceded);
                if (unassignedGc > 0) {
                    const playingGks = calculatedStats.filter(s => {
                        const p = processingSquad.find(x => x.id === s.playerId);
                        return p && p.role === 'GK' && ((s.mins1st || 0) + (s.mins2nd || 0)) > 0;
                    });

                    if (playingGks.length === 1) {
                        playingGks[0].goalsConceded += unassignedGc;
                    } else if (playingGks.length > 1) {
                        const totalMinsGks = playingGks.reduce((sum, gk) => sum + ((gk.mins1st||0) + (gk.mins2nd||0)), 0);
                        let remainingUnassigned = unassignedGc;
                        
                        playingGks.forEach(gk => {
                            if (remainingUnassigned > 0) {
                                const gkMins = (gk.mins1st||0) + (gk.mins2nd||0);
                                const gkShare = Math.round((gkMins / totalMinsGks) * unassignedGc);
                                const goalsToAdd = Math.min(remainingUnassigned, gkShare);
                                gk.goalsConceded += goalsToAdd;
                                remainingUnassigned -= goalsToAdd;
                            }
                        });
                        
                        if (remainingUnassigned > 0) {
                            playingGks.sort((a, b) => ((b.mins1st||0) + (b.mins2nd||0)) - ((a.mins1st||0) + (a.mins2nd||0)))[0].goalsConceded += remainingUnassigned;
                        }
                    }
                }
                // ---------------------------------------------

                currentStats.forEach(oldStat => {
                    const newStat = calculatedStats.find(s => s.playerId === oldStat.playerId) || { playerId: oldStat.playerId };
                    newStat.mins1st = newStat.mins1st || oldStat.mins1st || 0;
                    newStat.mins2nd = newStat.mins2nd || oldStat.mins2nd || 0;

                    if (newStat.mins1st > 0 || newStat.mins2nd > 0 || newStat.goals > 0 || newStat.assists > 0 || newStat.goalsConceded > 0 || newStat.penaltiesTaken > 0 || !oldStat.calledUp) {
                        finalStatsToSave.push({
                            ...newStat,
                            matchId: m.id,
                            seasonId: m.seasonId
                        });
                    }
                });

                // Include calculatedStats that weren't in currentStats (i.e. deleted ones we just recovered)
                calculatedStats.forEach(newStat => {
                    const exists = finalStatsToSave.find(s => s.playerId === newStat.playerId);
                    if (!exists && (newStat.mins1st > 0 || newStat.mins2nd > 0 || newStat.goals > 0 || newStat.assists > 0 || newStat.goalsConceded > 0 || newStat.penaltiesTaken > 0)) {
                        finalStatsToSave.push({
                            ...newStat,
                            matchId: m.id,
                            seasonId: m.seasonId
                        });
                    }
                });

                if (finalStatsToSave.length > 0) {
                    await MoncofaApp.DB.player_stats.where('matchId').equals(m.id).delete();
                    await MoncofaApp.DB.player_stats.bulkAdd(finalStatsToSave);
                }
            }
            console.log("Retroactive stats repair completed successfully.");
        } catch (e) {
            console.error("Error repairing stats:", e);
        }
    }
};
