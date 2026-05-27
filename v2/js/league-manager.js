"use strict";

window.MoncofaApp = window.MoncofaApp || {};

MoncofaApp.LeagueManager = {
    // Generates the sorted standings array for a given season
    async generateStandings(seasonId) {
        // 1. Fetch all teams for this season
        const teams = await MoncofaApp.DB.getLeagueTeams(seasonId);
        if (!teams || teams.length === 0) return [];

        // 2. Fetch all matches
        const matches = await MoncofaApp.DB.getCalendarMatches(seasonId);

        // 3. Initialize stats map
        const stats = {};
        teams.forEach(t => {
            stats[t.id] = {
                teamId: t.id,
                teamName: t.name,
                teamLogo: t.logo, // base64 string
                isUs: t.isUs,     // Boolean: is it our team?
                played: 0,
                won: 0,
                drawn: 0,
                lost: 0,
                gf: 0,
                gc: 0,
                points: 0,
                h2hMatches: [] // Store direct matches for H2H tiebreakers
            };
        });

        // 4. Process all played matches
        const playedMatches = matches.filter(m => m.isPlayed);
        
        playedMatches.forEach(m => {
            const home = stats[m.homeTeamId];
            const away = stats[m.awayTeamId];

            if (!home || !away) return; // Team might have been deleted?

            // Update GF / GC
            const hg = parseInt(m.homeScore) || 0;
            const ag = parseInt(m.awayScore) || 0;

            home.gf += hg;
            home.gc += ag;
            away.gf += ag;
            away.gc += hg;

            home.played++;
            away.played++;

            // Store H2H references
            home.h2hMatches.push(m);
            away.h2hMatches.push(m);

            // Points
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

        // 5. Convert to array and sort
        const standingsArray = Object.values(stats);
        
        standingsArray.sort((a, b) => {
            // Criterio 1: Puntos
            if (a.points !== b.points) {
                return b.points - a.points; 
            }

            // Criterio 2: Enfrentamiento Directo (H2H)
            // Buscar partidos entre a y b
            let h2hPointsA = 0;
            let h2hPointsB = 0;
            
            const directMatches = playedMatches.filter(m => 
                (m.homeTeamId === a.teamId && m.awayTeamId === b.teamId) ||
                (m.homeTeamId === b.teamId && m.awayTeamId === a.teamId)
            );

            directMatches.forEach(m => {
                const hg = parseInt(m.homeScore);
                const ag = parseInt(m.awayScore);
                if (m.homeTeamId === a.teamId) {
                    if (hg > ag) h2hPointsA += 3;
                    else if (hg < ag) h2hPointsB += 3;
                    else { h2hPointsA += 1; h2hPointsB += 1; }
                } else {
                    if (ag > hg) h2hPointsA += 3;
                    else if (ag < hg) h2hPointsB += 3;
                    else { h2hPointsA += 1; h2hPointsB += 1; }
                }
            });

            if (h2hPointsA !== h2hPointsB) {
                return h2hPointsB - h2hPointsA;
            }

            // Criterio 3: Diferencia de Goles General
            const aDiff = a.gf - a.gc;
            const bDiff = b.gf - b.gc;
            if (aDiff !== bDiff) {
                return bDiff - aDiff;
            }

            // Criterio 4: Goles a Favor General
            if (a.gf !== b.gf) {
                return b.gf - a.gf;
            }

            // Criterio 5: Goles en Contra (El que menos recibe gana)
            if (a.gc !== b.gc) {
                return a.gc - b.gc;
            }

            // If still tied, return alphabetical
            return a.teamName.localeCompare(b.teamName);
        });

        // 6. Assign Positions
        standingsArray.forEach((team, index) => {
            team.position = index + 1;
            team.gd = team.gf - team.gc;
        });

        return standingsArray;
    }
};
