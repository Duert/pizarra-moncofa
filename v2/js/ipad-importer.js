"use strict";

window.MoncofaApp = window.MoncofaApp || {};

MoncofaApp.IpadImporter = {
    async importFromJSON() {
        try {
            console.log("Starting ULTIMATE FOOLPROOF iPad JSON Import (v4)...");
            
            const data = MoncofaApp.IpadDataBlob;
            if (!data) throw new Error("No se han cargado los datos del iPad correctamente.");

            const season = await MoncofaApp.DB.seasons.where('name').equals('Temporada 2025/26').first();
            if (!season) throw new Error("Temporada 2025/26 no encontrada. Importa FFCV primero.");
            const seasonId = season.id;
            
            await MoncofaApp.DB.syncPlayersFromConstants();
            const players = await MoncofaApp.DB.getPlayers();
            const ourCalMatches = await MoncofaApp.DB.calendar_matches.where({ seasonId, isOurMatch: 1 }).toArray();
            const teams = await MoncofaApp.DB.league_teams.where('seasonId').equals(seasonId).toArray();
            const teamMapping = {}; teams.forEach(t => teamMapping[t.id] = t.name);

            const normalize = (s) => (s || "").toString().trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            
            const findPlayer = (name, number) => {
                if (!name && !number) return null;
                const normName = normalize(name ? name.split('(')[0].trim() : "");
                const strNum = number ? number.toString().trim() : "";
                if (strNum) {
                    const p = players.find(p => p.number.toString() === strNum);
                    if (p) return p;
                }
                if (normName) {
                    const p = players.find(p => normalize(p.name) === normName);
                    if (p) return p;
                }
                if (normName) {
                    const p = players.find(p => normalize(p.name).includes(normName) || normName.includes(normalize(p.name)));
                    if (p) return p;
                }
                return null;
            };

            const findMatchByJnd = (jnd) => {
                if (!jnd) return null;
                const j = parseInt(jnd.toString().replace(/\D/g, ""));
                return ourCalMatches.find(m => m.matchday === j);
            };

            // 2. Cleanup
            await MoncofaApp.DB.matches.where('seasonId').equals(seasonId).delete();
            await MoncofaApp.DB.player_stats.where('seasonId').equals(seasonId).delete();

            // 3. Extract Summary Data
            const goalsLog = {}; 
            const assistsLog = {}; 
            const absencesMap = {}; 
            const summaryConceded = {};

            // Parse specialized sheets (NOW INCLUDED IN BLOB)
            if (data['Estadísticas Pretemporada _Goles']) {
                data['Estadísticas Pretemporada _Goles'].slice(1).forEach(row => {
                    const m = findMatchByJnd(row[2]);
                    if (!m) return;
                    const p = findPlayer(row[1]);
                    
                    if (!goalsLog[m.matchday]) goalsLog[m.matchday] = [];
                    
                    if (p) {
                        goalsLog[m.matchday].push({ 
                            pId: p.id, pName: p.name, pNum: p.number, 
                            min: Math.round(parseFloat(row[3])*1440)||10, 
                            isP: (row[1]||"").includes('(P)') 
                        });
                    } else if (normalize(row[1]).includes('propia')) {
                        goalsLog[m.matchday].push({ 
                            pId: 'pp', pName: 'GOL P.P. (Rival)', pNum: '', 
                            min: Math.round(parseFloat(row[3])*1440)||10, 
                            isP: false 
                        });
                    }
                });
            }
            if (data['Estadísticas Pretemporada _Asistencias']) {
                data['Estadísticas Pretemporada _Asistencias'].slice(1).forEach(row => {
                    const m = findMatchByJnd(row[2]);
                    if (!m) return;
                    const p = findPlayer(row[1]);
                    if (!p) return;
                    if (!assistsLog[m.matchday]) assistsLog[m.matchday] = [];
                    assistsLog[m.matchday].push({ pId: p.id, pName: p.name });
                });
            }
            if (data['Estadísticas Pretemporada _Descansos']) {
                data['Estadísticas Pretemporada _Descansos'].slice(1).forEach(row => {
                    const mday = parseInt(row[0]); if (isNaN(mday)) return;
                    absencesMap[mday] = absencesMap[mday] || {};
                    for (let c=3; c<=6; c++) {
                        const v = (row[c]||"").trim(); if (!v) continue;
                        const p = findPlayer(v); if (p) absencesMap[mday][p.id] = v.includes('(') ? v.split('(')[1].replace(')','') : 'Descanso';
                    }
                });
            }
            if (data['Estadísticas Pretemporada _Tabla 1-1']) {
                const h = data['Estadísticas Pretemporada _Tabla 1-1'][0].map(v => normalize(v));
                const jIdx = h.indexOf('jorge'); const vIdx = h.indexOf('valentino');
                const r1 = data['Estadísticas Pretemporada _Tabla 1-1'][1];
                if (jIdx!==-1) summaryConceded['Jorge'] = parseInt(r1[jIdx]) || 0;
                if (vIdx!==-1) summaryConceded['Valentino'] = parseInt(r1[vIdx]) || 0;
            }

            // 4. Main Processing
            const playerStatsFinal = [];
            const jSheets = Object.keys(data).filter(k => normalize(k).includes('jornada'));
            
            for (const sName of jSheets) {
                const mdayMatch = sName.match(/Jornada\s+(\d+)/i);
                if (!mdayMatch) continue;
                const mday = parseInt(mdayMatch[1]);
                const calM = ourCalMatches.find(m => m.matchday === mday);
                if (!calM) continue;

                const isHome = teamMapping[calM.homeTeamId].includes("Platges de Moncofa");
                const rivalName = isHome ? teamMapping[calM.awayTeamId] : teamMapping[calM.homeTeamId];
                
                // Build Logs for UI
                const logs = [];
                (goalsLog[mday] || []).forEach(g => {
                    const type = g.isP ? 'penalty_scored' : 'goal';
                    const d = g.isP ? { player: { id: g.pId, name: g.pName }, min: g.min } : { scorer: { id: g.pId, name: g.pName, number: g.pNum }, min: g.min };
                    logs.push({ type, d });
                });
                (assistsLog[mday] || []).forEach(a => {
                    const goalWithoutAssist = logs.find(l => l.type === 'goal' && !l.d.assist);
                    if (goalWithoutAssist) goalWithoutAssist.d.assist = { id: a.pId, name: a.pName };
                    else logs.push({ type: 'assist', d: { assistant: { id: a.pId, name: a.pName } } });
                });

                // Sort logs by minute within each match
                logs.sort((a, b) => (a.d?.min || 0) - (b.d?.min || 0));

                const realMatchId = await MoncofaApp.DB.matches.add({
                    seasonId, date: calM.date || new Date().toISOString(),
                    matchday: mday, rivalName, isHome: isHome ? 1 : 0,
                    homeScore: calM.homeScore || 0, awayScore: calM.awayScore || 0,
                    period: 2, logs, leagueMatchId: calM.id
                });

                data[sName].slice(1).forEach(cols => {
                    if (cols.length < 5) return;
                    const p = findPlayer(cols[1], cols[0]);
                    if (!p) return;
                    let m1 = Math.round(parseFloat(cols[6])*1440) || 0;
                    let m2 = Math.round(parseFloat(cols[10])*1440) || 0;
                    if (m1===0 && m2===0 && cols[14]==="1") { m1=12; m2=13; }
                    const gCount = (goalsLog[mday] || []).filter(g => g.pId === p.id).length || parseInt(cols[11]) || 0;
                    const aCount = (assistsLog[mday] || []).filter(a => a.pId === p.id).length || parseInt(cols[12]) || 0;
                    
                    let starts1st = undefined, subs1st = undefined;
                    let starts2nd = undefined, subs2nd = undefined;
                    
                    if (cols[3] === "1") starts1st = true;
                    if (cols[3] === "0") subs1st = true;
                    if (cols[7] === "1") starts2nd = true;
                    if (cols[7] === "0") subs2nd = true;

                    playerStatsFinal.push({
                        seasonId, matchId: realMatchId, playerId: p.id, playerName: p.name,
                        goals: gCount, assists: aCount, mins1st: m1, mins2nd: m2,
                        starts1st, subs1st, starts2nd, subs2nd,
                        goalsConceded: 0, absenceReason: (absencesMap[mday] || {})[p.id] || null
                    });
                });
            }

            // 5. GKs Sync
            ['Jorge', 'Valentino'].forEach(name => {
                const tot = summaryConceded[name];
                const stats = playerStatsFinal.filter(s => s.playerName === name);
                if (tot && stats.length > 0) {
                    let r = tot, l = stats.length;
                    stats.forEach(s => { const v = Math.ceil(r/l); s.goalsConceded = v; r -= v; l--; });
                }
            });

            playerStatsFinal.forEach(s => delete s.playerName);
            await MoncofaApp.DB.player_stats.bulkAdd(playerStatsFinal);

            MoncofaApp.UI.showCustomModal("Éxito", "Sincronización Maestra Finalizada. Goles, Asistencias y Porteros OK.");
            return { success: true };

        } catch (e) {
            console.error("Master Sync Error:", e);
            MoncofaApp.UI.showCustomModal("Error", "Error: " + e.message);
            return { success: false };
        }
    }
};
