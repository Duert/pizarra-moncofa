const DEFAULT_MONCOFA_LOGO_BASE64 = "data:image/png;base64,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";
"use strict";

window.MoncofaApp = window.MoncofaApp || {};

MoncofaApp.ExportManager = {
    // --- JPG GENERATION ---
    downloadLineupImage() {
        if (!window.html2canvas) return MoncofaApp.UI.showCustomModal('Error', 'Librería de imagen no cargada.');

        const teamName = document.getElementById('app-team-name').innerText;

        // Show loading
        const loadingMsg = document.createElement('div');
        loadingMsg.innerText = "Generando Imagen...";
        Object.assign(loadingMsg.style, {
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
            background: 'rgba(0,0,0,0.8)', color: 'white', padding: '20px', borderRadius: '10px', zIndex: '9999'
        });
        document.body.appendChild(loadingMsg);

        // 1. MAIN CONTAINER
        const container = document.createElement('div');
        Object.assign(container.style, {
            position: 'absolute', top: '-9999px', left: '0',
            width: '1200px',
            display: 'flex',
            background: '#1f2937',
            fontFamily: 'system-ui, -apple-system, sans-serif'
        });
        document.body.appendChild(container);

        try {
            // --- LEFT: PITCH SECTION ---
            const pitchWrapper = document.createElement('div');
            Object.assign(pitchWrapper.style, {
                width: '800px',
                padding: '40px',
                background: 'linear-gradient(135deg, #2d6a4f 0%, #1b4332 100%)',
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                position: 'relative'
            });

            const pitchOriginal = document.getElementById('pitch');
            const pitchClone = pitchOriginal.cloneNode(true);
            Object.assign(pitchClone.style, {
                width: '100%', height: 'auto', aspectRatio: '4/5', flexShrink: '0',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                border: '8px solid white', borderRadius: '8px',
                overflow: 'visible'
            });

            pitchClone.querySelectorAll('.remove-btn').forEach(btn => btn.style.display = 'none');
            pitchClone.querySelectorAll('.player-avatar').forEach(avatar => {
                const nameText = avatar.querySelector('.player-name-tag p')?.innerText || 'Jugador';
                const existingSvg = avatar.querySelector('svg');

                avatar.innerHTML = '';
                avatar.style.transform = 'translate(-50%, -50%)';
                avatar.style.width = 'auto';
                avatar.style.display = 'flex';
                avatar.style.flexDirection = 'column';
                avatar.style.alignItems = 'center';
                avatar.style.justifyContent = 'center';

                if (existingSvg) {
                    // Update Size for Export (Larger 72x108)
                    existingSvg.setAttribute('width', '72');
                    existingSvg.setAttribute('height', '108');
                    existingSvg.style.width = '72px';
                    existingSvg.style.height = '108px';
                    existingSvg.style.display = 'block';
                    existingSvg.style.filter = 'drop-shadow(0 5px 8px rgba(0,0,0,0.5))';
                    avatar.appendChild(existingSvg);
                }

                const badge = document.createElement('div');
                badge.innerText = nameText;
                Object.assign(badge.style, {
                    background: '#111827',
                    color: 'white',
                    padding: '4px 12px',
                    minHeight: '26px',
                    borderRadius: '20px',
                    fontSize: '14px',
                    fontWeight: '800',
                    fontFamily: 'Arial, sans-serif',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 3px 6px rgba(0,0,0,0.4)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    marginTop: '-5px',
                    zIndex: '20'
                });
                avatar.appendChild(badge);
            });

            pitchWrapper.appendChild(pitchClone);
            container.appendChild(pitchWrapper);


            // --- RIGHT: SIDEBAR ---
            const sidebar = document.createElement('div');
            Object.assign(sidebar.style, {
                width: '400px',
                background: 'linear-gradient(180deg, #1f2937 0%, #111827 100%)',
                borderLeft: '4px solid #3aafa9',
                display: 'flex', flexDirection: 'column',
                padding: '40px 30px',
                color: 'white',
                boxSizing: 'border-box'
            });

            const logoImg = document.getElementById('team-logo').src;
            sidebar.innerHTML = `
                <div style="text-align:center; margin-bottom:30px; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:20px;">
                    <img src="${logoImg}" style="max-width:140px; max-height:140px; width:auto; height:auto; object-fit:contain; filter:drop-shadow(0 4px 10px rgba(0,0,0,0.5)); margin-bottom:15px; display:block; margin-left:auto; margin-right:auto;">
                    <h1 style="margin:0; font-size:32px; line-height:1; font-weight:900; text-transform:uppercase; letter-spacing:1px; color:white;">${teamName}</h1>
                    <div style="color:#3aafa9; font-weight:bold; margin-top:5px; font-size:16px;">${MoncofaApp.State.currentFormation}</div>
                </div>
            `;

            const subBox = document.createElement('div');
            subBox.style.flex = '1';

            const subHeader = document.createElement('div');
            subHeader.innerText = 'SUPLENTES';
            Object.assign(subHeader.style, {
                background: '#3aafa9', color: '#111827', padding: '12px',
                textAlign: 'center', fontWeight: '900', fontSize: '18px', letterSpacing: '2px',
                marginBottom: '25px', borderRadius: '6px'
            });
            subBox.appendChild(subHeader);

            MoncofaApp.State.getBench().sort((a, b) => a.number - b.number).forEach(p => {
                const row = document.createElement('div');
                Object.assign(row.style, { display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '12px' });

                const shirtColor = p.role === 'GK' ? MoncofaApp.Utils.getCssVar('--gk-shirt') : MoncofaApp.Utils.getCssVar('--team-shirt');

                // NO CLIP-PATH (Causes Errors)
                const shirtDiv = document.createElement('div');
                Object.assign(shirtDiv.style, {
                    width: '32px', height: '32px', background: shirtColor,
                    borderRadius: '6px', border: '2px solid rgba(255,255,255,0.3)'
                });

                row.appendChild(shirtDiv);

                const infoDiv = document.createElement('div');
                infoDiv.innerHTML = `<span style="color:#3aafa9; font-weight:900; font-size:22px; margin-right:10px;">${p.number}</span><span style="color:#e5e7eb; font-weight:700; font-size:18px;">${p.name}</span>`;
                row.appendChild(infoDiv);

                subBox.appendChild(row);
            });
            sidebar.appendChild(subBox);
            container.appendChild(sidebar);

            // MISTER
            const managerBox = document.createElement('div');
            managerBox.style.marginTop = '30px';
            managerBox.innerHTML = `
                <div style="background:#3aafa9; color:#111827; padding:10px; text-align:center; font-weight:900; letter-spacing:1px; border-radius:4px 4px 0 0; font-size:14px; text-transform:uppercase;">Entrenador</div>
                <div style="background:#111827; color:white; padding:15px; text-align:center; font-weight:bold; border:2px solid #3aafa9; border-top:none; border-radius:0 0 4px 4px; font-size:18px;">
                    ${MoncofaApp.State.config.coachName}
                </div>
            `;
            sidebar.appendChild(managerBox);

            setTimeout(() => {
                window.html2canvas(container, {
                    useCORS: true,
                    scale: 2,
                    logging: true,
                    backgroundColor: '#1f2937'
                }).then(canvas => {
                    const link = document.createElement('a');
                    link.download = `alineacion_${teamName.replace(/\s+/g, '_').toLowerCase()}.jpg`;
                    link.href = canvas.toDataURL('image/jpeg', 0.95);
                    link.click();
                    document.body.removeChild(container);
                    loadingMsg.remove();
                }).catch(err => {
                    console.error("Error generating image:", err);
                    MoncofaApp.UI.showToast("Error al generar imagen: " + err.message, "error");
                    if (document.body.contains(container)) document.body.removeChild(container);
                    loadingMsg.remove();
                });
            }, 500);

        } catch (e) {
            console.error("Setup Error:", e);
            MoncofaApp.UI.showToast("Error preparando la imagen: " + e.message, "error");
            if (document.body.contains(container)) document.body.removeChild(container);
            loadingMsg.remove();
        }
    },

    // --- PDF GENERATION ---
    async downloadPDF() {
        if (!window.jspdf) return MoncofaApp.UI.showCustomModal('Error', 'Librería PDF no cargada.');

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        const loadImageProps = (src) => new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve({ w: img.width, h: img.height });
            img.onerror = () => resolve(null);
            img.src = src;
        });

        // Colors
        const primaryColor = [30, 41, 59]; // Slate 800

        // Header
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.setTextColor(...primaryColor);

        const config = MoncofaApp.State.config;
        const ourTeam = document.getElementById('app-team-name').innerText;
        const rivalTeam = config.rivalName || 'RIVAL';
        const titleText = config.isHomeGame ? `${ourTeam} vs ${rivalTeam}` : `${rivalTeam} vs ${ourTeam}`;

        // Logos
        const homeLogo = MoncofaApp.Constants.DEFAULT_LOGO;
        const rivalLogo = config.rivalLogo;

        // Determine Left/Right logos based on who is Home in the title
        const logo1Src = config.isHomeGame ? homeLogo : (rivalLogo || null);
        const logo2Src = config.isHomeGame ? (rivalLogo || null) : homeLogo;

        // Handle Long Text: Scale down font if needed
        let textWidth = doc.getTextWidth(titleText);
        const MAX_TEXT_WIDTH = 130; // Safe width to leave room for logos (Total ~210mm)

        if (textWidth > MAX_TEXT_WIDTH) {
            const newSize = 16 * (MAX_TEXT_WIDTH / textWidth);
            doc.setFontSize(Math.max(8, newSize)); // Don't shrink below 8pt
            textWidth = doc.getTextWidth(titleText);
        }

        const centerX = 105;
        const startX = centerX - (textWidth / 2);
        const endX = centerX + (textWidth / 2);

        doc.text(titleText, 105, 20, { align: 'center' });

        // Helper to fit image in box (Max 14x14)
        const MAX_SIZE = 14;
        const drawLogo = async (src, baseX, y) => {
            if (!src) return;
            try {
                const dims = await loadImageProps(src);
                if (!dims) return;

                let finalW = MAX_SIZE;
                let finalH = MAX_SIZE;

                // Aspect Ratio Logic
                if (dims.w > dims.h) {
                    finalH = (dims.h / dims.w) * MAX_SIZE;
                    finalW = MAX_SIZE;
                } else {
                    finalW = (dims.w / dims.h) * MAX_SIZE;
                    finalH = MAX_SIZE;
                }

                // Center in the square box
                const xOffset = (MAX_SIZE - finalW) / 2;
                const yOffset = (MAX_SIZE - finalH) / 2;

                const format = src.includes('image/jpeg') ? 'JPEG' : 'PNG';
                doc.addImage(src, format, baseX + xOffset, y + yOffset, finalW, finalH);

            } catch (e) { console.error("PDF Logo Error", e); }
        };

        // Add Logo 1 (Left of Title) - Shifted left to fit box
        await drawLogo(logo1Src, startX - 16, 10);

        // Add Logo 2 (Right of Title)
        await drawLogo(logo2Src, endX + 2, 10);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(100);
        const date = new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
        doc.text(`Generado: ${date}`, 105, 28, { align: 'center' });
        doc.text(`Entrenador: ${config.coachName}  |  Delegado: ${config.delegateName}`, 105, 33, { align: 'center' });

        // Score Board
        const homeScore = String(MoncofaApp.State.score.home);
        const awayScore = String(MoncofaApp.State.score.away);

        doc.setFillColor(248, 250, 252); // Slate 50
        doc.rect(70, 35, 70, 25, 'F');

        doc.setFontSize(28);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(34, 197, 94); // Green
        doc.text(homeScore, 95, 52, { align: 'right' });

        doc.setTextColor(0);
        doc.text("-", 105, 52, { align: 'center' });

        doc.setTextColor(239, 68, 68); // Red
        doc.text(awayScore, 115, 52, { align: 'left' });

        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text("RESULTADO FINAL", 105, 65, { align: 'center' });

        // Match Log Table
        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.text("Minuto a Minuto", 14, 80);

        const rows = MoncofaApp.State.logs.map(log => {
            let cleanText = log.text.replace(/<[^>]*>/g, '');
            // Append lineup details if available
            if (log.type === 'lineup' && log.d && log.d.plainText) {
                cleanText += "\n" + log.d.plainText;
            }

            let typeEs = log.type.toUpperCase();
            if (log.type === 'goal') typeEs = 'GOL';
            else if (log.type === 'own_goal') typeEs = 'P.P.';
            else if (log.type === 'own_goal_rival') typeEs = 'P.P. RIVAL';
            else if (log.type === 'goal_opponent') typeEs = 'GOL RIVAL';
            else if (log.type === 'sub') typeEs = 'CAMBIO';
            else if (log.type === 'lineup') typeEs = 'ALINEACIÓN';
            else if (log.type === 'match_evt') typeEs = 'EVENTO';

            const minuteDisplay = log.time || log.min || '-';

            return [minuteDisplay, typeEs, cleanText, log.type]; // Pass type as hidden 4th col
        });

        doc.autoTable({
            startY: 85,
            head: [['Min', 'Evento', 'Descripción']],
            body: rows,
            theme: 'grid',
            headStyles: { fillColor: primaryColor, halign: 'center' },
            columnStyles: { 0: { halign: 'center', fontStyle: 'bold', width: 25 }, 1: { fontStyle: 'bold', width: 35 } },
            styles: { fontSize: 9, cellPadding: 3 },
            didParseCell: function (data) {
                if (data.section === 'body') {
                    const type = data.row.raw[3];
                    let textColor = [0, 0, 0];

                    if (type === 'goal') textColor = [22, 163, 74]; // Green
                    else if (type === 'own_goal') textColor = [220, 38, 38]; // Red
                    else if (type === 'own_goal_rival') textColor = [22, 163, 74]; // Green (Same as favor)
                    else if (type === 'goal_opponent') textColor = [220, 38, 38]; // Red
                    else if (type === 'sub') textColor = [37, 99, 235]; // Blue
                    else if (type === 'lineup') textColor = [234, 88, 12]; // Orange
                    else if (type === 'match_evt') textColor = [71, 85, 105]; // Slate

                    data.cell.styles.textColor = textColor;
                }
            }
        });

        // Squads
        let finalY = doc.lastAutoTable.finalY + 15;

        // Check page break
        if (finalY > 250) { doc.addPage(); finalY = 20; }

        doc.setFontSize(12);
        doc.setFontSize(12);
        doc.text("Alineación Inicial (Orden Táctico)", 14, finalY);

        // Sort by Position (X) and Group by Role
        const startersIds = MoncofaApp.State.lineupIds;
        const formationValues = MoncofaApp.State.getCurrentFormationData();
        const grouped = { 'GK': [], 'DEF': [], 'MED': [], 'DEL': [] };

        formationValues.forEach((pos, i) => {
            const pid = startersIds[i];
            if (pid) {
                const p = MoncofaApp.State.getPlayerById(pid);
                if (grouped[pos.role]) grouped[pos.role].push({ p, x: pos.x });
            }
        });

        // Flatten: GK -> DEF -> MED -> DEL, sorted by X
        const sortedRows = [];
        ['GK', 'DEF', 'MED', 'DEL'].forEach(role => {
            grouped[role].sort((a, b) => a.x - b.x);
            grouped[role].forEach(item => {
                let roleName = role;
                if (role === 'GK') roleName = 'Portero';
                if (role === 'DEF') roleName = 'Defensa';
                if (role === 'MED') roleName = 'Medio';
                if (role === 'DEL') roleName = 'Delantero';

                sortedRows.push([item.p.number, item.p.name, roleName]);
            });
        });

        doc.autoTable({
            startY: finalY + 5,
            head: [['#', 'Jugador', 'Posición']],
            body: sortedRows,
            theme: 'striped',
            headStyles: { fillColor: [22, 163, 74] }, // Green
            styles: { fontSize: 9 },
            columnStyles: { 0: { halign: 'center', fontStyle: 'bold' } }
        });

        // Bench
        finalY = doc.lastAutoTable.finalY + 10;
        if (finalY > 250) { doc.addPage(); finalY = 20; }

        doc.setFontSize(12);
        doc.text("Suplentes y No Convocados", 14, finalY);

        const bench = MoncofaApp.State.getBench().sort((a, b) => a.number - b.number).map(p => [p.number, p.name, p.calledUp ? 'Suplente' : 'No Convocado']);

        doc.autoTable({
            startY: finalY + 5,
            head: [['#', 'Jugador', 'Estado']],
            body: bench,
            theme: 'striped',
            headStyles: { fillColor: [59, 130, 246] }, // Blue
            styles: { fontSize: 9 },
            columnStyles: { 0: { halign: 'center', fontStyle: 'bold' } }
        });

        doc.save(`acta_moncofa_${new Date().toISOString().split('T')[0]}.pdf`);
    },

    // --- WHATSAPP SHARING ---
    async shareMatchWhatsApp(matchId) {
        const match = await MoncofaApp.DB.getCalendarMatch(matchId);
        const teams = await MoncofaApp.DB.getLeagueTeams(match.seasonId);
        const home = teams.find(t => t.id === match.homeTeamId);
        const away = teams.find(t => t.id === match.awayTeamId);

        let text = `⚽ *RESUMEN DEL PARTIDO* ⚽\n`;
        text += `---------------------------\n`;
        text += `🏆 *Jornada ${match.matchday}*\n`;
        text += `${home.isUs ? '🏠' : '🚌'} *${home.name} ${match.homeScore} - ${match.awayScore} ${away.name}*\n\n`;

        if (match.logs && match.logs.length > 0) {
            const goals = match.logs.filter(l => l.type === 'goal' || l.type === 'penalty_scored' || l.type === 'own_goal' || l.type === 'own_goal_rival');
            if (goals.length > 0) {
                text += `*GOLES:* \n`;
                goals.forEach(g => {
                    let icon = '⚽';
                    let desc = '';
                    if (g.type === 'goal') {
                        desc = `${g.d.min}' ${g.d.scorer.name}`;
                        if (g.d.assist) desc += ` (Asist: ${g.d.assist.name})`;
                    } else if (g.type === 'penalty_scored') {
                        icon = '🎯';
                        desc = `${g.d.min}' ${g.d.player.name} (Penalti)`;
                    } else if (g.type === 'own_goal') {
                        icon = '❌';
                        desc = `${g.d.min}' Gol en propia`;
                    } else if (g.type === 'own_goal_rival') {
                        icon = '🎁';
                        desc = `${g.d.min}' Gol en propia (rival)`;
                    }
                    text += `${icon} ${desc}\n`;
                });
                text += `\n`;
            }

            const subs = match.logs.filter(l => l.type === 'sub');
            if (subs.length > 0) {
                text += `*CAMBIOS:* \n`;
                subs.forEach(s => {
                    text += `🔄 ${s.d.min}' ⬆️ ${s.d.in.name} ⬇️ ${s.d.out.name}\n`;
                });
                text += `\n`;
            }
        }

        text += `💪 #VamosMoncofa #PlatgesDeMoncofa`;

        const encoded = encodeURIComponent(text);
        window.open(`https://wa.me/?text=${encoded}`, '_blank');
    },

    // --- GLOBAL STATS PDF ---
    async exportStatsImage() {
        if (!window.html2canvas) return MoncofaApp.UI.showCustomModal('Error', 'Librería de imagen no cargada.');

        const btn = document.querySelector('button[onclick*="exportStatsImage"]');
        const originalBtnContent = btn ? btn.innerHTML : '';
        if (btn) {
            btn.innerHTML = `<i class="animate-spin inline-block mr-2">⏳</i> Generando...`;
            btn.disabled = true;
        }

        try {
            // Find the currently active container. Inside stats-content-area, the second child is the content.
            const statsArea = document.getElementById('stats-content-area');
            const container = statsArea ? statsArea.children[1] : null;
            if (!container) throw new Error("No hay contenido para exportar");

            // Fix letter-spacing bug for html2canvas (causes off-center text)
            const trackingElements = container.querySelectorAll('[class*="tracking-"]');
            const originalClasses = new Map();
            trackingElements.forEach(el => {
                const classes = Array.from(el.classList).filter(c => c.startsWith('tracking-'));
                originalClasses.set(el, classes);
                classes.forEach(c => el.classList.remove(c));
            });

            // Make sure the container has a background (it might be transparent)
            const originalBg = container.style.backgroundColor;
            const originalPadding = container.style.padding;
            const originalBorderRadius = container.style.borderRadius;
            
            container.style.backgroundColor = '#f8fafc'; // slate-50
            container.style.padding = '20px'; // Add some padding for the image
            container.style.borderRadius = '16px';

            // Hide elements that shouldn't be in the export (e.g. FIFA cards)
            const hideElements = container.querySelectorAll('.export-hide');
            const originalDisplays = new Map();
            hideElements.forEach(el => {
                originalDisplays.set(el, el.style.display);
                el.style.display = 'none';
            });

            // Small delay to allow reflow
            await new Promise(r => setTimeout(r, 150));

            const canvas = await window.html2canvas(container, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#f8fafc',
                logging: false
            });

            // Restore styles and tracking classes
            trackingElements.forEach(el => {
                const classes = originalClasses.get(el);
                if (classes) classes.forEach(c => el.classList.add(c));
            });
            hideElements.forEach(el => {
                el.style.display = originalDisplays.get(el);
            });
            container.style.backgroundColor = originalBg;
            container.style.padding = originalPadding;
            container.style.borderRadius = originalBorderRadius;

            const link = document.createElement('a');
            const currentTab = MoncofaApp.StatsUI.currentTab || 'informe';
            link.download = `estadisticas_${currentTab}_moncofa.jpg`;
            link.href = canvas.toDataURL('image/jpeg', 0.95);
            link.click();
        } catch (e) {
            console.error("Error exporting stats image", e);
            MoncofaApp.UI.showToast("No se pudo generar la imagen. " + e.message, "error");
        } finally {
            if (btn) {
                btn.innerHTML = originalBtnContent;
                btn.disabled = false;
                lucide.createIcons();
            }
        }
    },

    async downloadPapisImage(matchId) {
        if (!window.html2canvas) return MoncofaApp.UI.showCustomModal('Error', 'Librería de imagen no cargada.');

        const match = await MoncofaApp.DB.getMatchById(parseInt(matchId));
        if (!match) return;

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
        const myLogo = localStorage.getItem('moncofa_team_logo') || DEFAULT_MONCOFA_LOGO_BASE64;
        const rivalLogo = rivalTeamObj?.logo || localStorage.getItem('moncofa_rival_logo') || '';

        // Helper to convert images to safe Base64 data URLs via AllOrigins CORS proxy
        async function getSafeLogoBase64(url) {
            if (!url) return null;
            if (url.startsWith('data:')) return url;
            
            let srcUrl = url;
            if (url.startsWith('http')) {
                srcUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
            }

            try {
                return await new Promise((resolve) => {
                    const img = new Image();
                    img.crossOrigin = 'anonymous';
                    img.onload = () => {
                        try {
                            const canvas = document.createElement('canvas');
                            canvas.width = img.naturalWidth;
                            canvas.height = img.naturalHeight;
                            const ctx = canvas.getContext('2d');
                            ctx.drawImage(img, 0, 0);
                            resolve(canvas.toDataURL('image/png'));
                        } catch (e) {
                            resolve(null);
                        }
                    };
                    img.onerror = () => {
                        if (srcUrl !== url) {
                            const directImg = new Image();
                            directImg.crossOrigin = 'anonymous';
                            directImg.onload = () => {
                                try {
                                    const canvas = document.createElement('canvas');
                                    canvas.width = directImg.naturalWidth;
                                    canvas.height = directImg.naturalHeight;
                                    const ctx = canvas.getContext('2d');
                                    ctx.drawImage(directImg, 0, 0);
                                    resolve(canvas.toDataURL('image/png'));
                                } catch (e) {
                                    resolve(null);
                                }
                            };
                            directImg.onerror = () => resolve(null);
                            directImg.src = url;
                        } else {
                            resolve(null);
                        }
                    };
                    img.src = srcUrl;
                });
            } catch (e) {
                return null;
            }
        }

        const myLogoBase64 = await getSafeLogoBase64(myLogo) || myLogo;
        const rivalLogoBase64 = await getSafeLogoBase64(rivalLogo);

        // myLogo is safe to load directly as relative image img/logo.png or data: URL, never taints canvas!
        const myLogoHtml = `<img src="${myLogo}" style="height: 70px; width: auto; max-width: 90px; margin-bottom: 8px; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.15)); display: block; margin-left: auto; margin-right: auto;" />`;

        const rivalInitials = rivalName.split(' ')
            .filter(w => w.length > 1 && !['c.f.', 'cf', 'u.d.', 'ud', 'de', 'el', 'la', 'los', 'c.d.', 'cd'].includes(w.toLowerCase()))
            .map(w => w[0].replace(/['"“Flip”]/g, ''))
            .filter(c => c.match(/[a-zA-Z0-9]/))
            .join('')
            .slice(0, 2)
            .toUpperCase() || rivalName.slice(0, 2).toUpperCase();

        const rivalLogoHtml = rivalLogoBase64 && rivalLogoBase64.startsWith('data:')
            ? `<img src="${rivalLogoBase64}" style="height: 70px; width: auto; max-width: 90px; margin-bottom: 8px; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.15)); display: block; margin-left: auto; margin-right: auto;" />`
            : `<div style="width: 70px; height: 70px; border-radius: 50%; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); border: 2px solid rgba(255,255,255,0.25); display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 900; margin: 0 auto 8px auto; box-shadow: 0 4px 6px rgba(0,0,0,0.15); color: white; text-transform: uppercase; ">${rivalInitials}</div>`;

        const localLogoHtml = isHome ? myLogoHtml : rivalLogoHtml;
        const visitorLogoHtml = isHome ? rivalLogoHtml : myLogoHtml;

        // Show loading
        const loadingMsg = document.createElement('div');
        loadingMsg.innerText = "Generando Imagen para los Papis...";
        Object.assign(loadingMsg.style, {
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
            background: 'rgba(0,0,0,0.8)', color: 'white', padding: '20px', borderRadius: '10px', zIndex: '99999',
            fontFamily: 'system-ui, sans-serif', fontWeight: 'bold'
        });
        document.body.appendChild(loadingMsg);

        // Create Container inside a viewport-friendly hidden wrapper
        const wrapper = document.createElement('div');
        Object.assign(wrapper.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '800px',
            height: '600px',
            opacity: '0.001',
            zIndex: '-99999',
            pointerEvents: 'none'
        });
        const container = document.createElement('div');
        Object.assign(container.style, {
            width: '800px',
            boxSizing: 'border-box',
            fontFamily: 'system-ui, -apple-system, sans-serif'
        });

        const goals = (match.logs || []).filter(l => l.type === 'goal' || l.type === 'penalty_scored' || l.type === 'own_goal' || l.type === 'own_goal_rival' || l.type === 'goal_opponent');
        let goalsListHtml = '';
        if (goals.length === 0) {
            goalsListHtml = `<div style="padding: 24px; text-align: center; color: #94a3b8; font-style: italic; font-size: 16px;">No hay goles registrados.</div>`;
        } else {
            goalsListHtml = `<div style="display: flex; flex-direction: column; gap: 12px;">`;
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
                    text = `<span style="font-weight: 800; color: #1e293b;">${scorerName}</span>`;
                    if (assistName) {
                        text += ` (Asistencia de <span style="font-weight: 700; color: #64748b;">${assistName}</span>)`;
                    }
                } else if (g.type === 'penalty_scored') {
                    icon = '🎯';
                    const penaltyPlayerId = g.d?.player?.id;
                    const penaltyPlayer = penaltyPlayerId ? players.find(p => p.id === parseInt(penaltyPlayerId)) : null;
                    const penaltyPlayerName = penaltyPlayer ? penaltyPlayer.name : (g.d?.player?.name || 'Jugador');
                    text = `<span style="font-weight: 800; color: #1e293b;">${penaltyPlayerName}</span> (Penalti)`;
                } else if (g.type === 'own_goal') {
                    icon = '❌';
                    const ownGoalPlayerId = g.d?.player?.id;
                    const ownGoalPlayer = ownGoalPlayerId ? players.find(p => p.id === parseInt(ownGoalPlayerId)) : null;
                    const ownGoalPlayerName = ownGoalPlayer ? ownGoalPlayer.name : (g.d?.player?.name || 'Jugador');
                    text = `<span style="font-weight: 700; color: #dc2626;">Gol en propia puerta de ${ownGoalPlayerName}</span>`;
                } else if (g.type === 'own_goal_rival') {
                    icon = '🎁';
                    text = `<span style="font-weight: 700; color: #16a34a;">Gol en propia puerta del rival</span>`;
                } else if (g.type === 'goal_opponent') {
                    icon = '⚽';
                    text = `<span style="font-weight: 700; color: #dc2626;">Gol del Rival (${rivalName})</span>`;
                }

                goalsListHtml += `
                    <div style="display: flex; align-items: center; gap: 12px; background: #f8fafc; border: 1px solid #f1f5f9; border-radius: 12px; padding: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
                        <span style="font-size: 20px;">${icon}</span>
                        <div style="flex: 1; text-align: left; font-size: 15px; font-weight: 600; color: #334155;">${text}</div>
                        <div style="background: #dbeafe; color: #1d4ed8; font-size: 11px; font-weight: 900; display: inline-block; width: 95px; height: 22px; border-radius: 12px; text-transform: uppercase;  font-family: system-ui, -apple-system, sans-serif; position: relative; vertical-align: middle;">
                            <span style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); white-space: nowrap; line-height: 1;">${relMin}' (${periodText})</span>
                        </div>
                    </div>
                `;
            });
            goalsListHtml += `</div>`;
        }

        container.innerHTML = `
            <div style="background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%); border-radius: 24px; padding: 40px; color: white; position: relative; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.3);">
                <div style="position: absolute; top: 0; right: 0; width: 300px; height: 300px; background: rgba(255,255,255,0.03); border-radius: 9999px; transform: translate(100px, -100px); filter: blur(40px);"></div>
                
                <div style="position: relative; z-index: 10;">
                    <!-- Top Header -->
                    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 20px; margin-bottom: 24px;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <div style="background: #3b82f6; color: white; font-size: 11px; font-weight: 900; display: inline-block; width: 130px; height: 24px; border-radius: 12px; text-transform: uppercase;  font-family: system-ui, -apple-system, sans-serif; position: relative; vertical-align: middle;">
                                <span style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); white-space: nowrap; line-height: 1;">RESUMEN PARTIDO</span>
                            </div>
                            <span style="font-size: 12px; font-weight: 700; color: #94a3b8; text-transform: uppercase;">${date}</span>
                        </div>
                        <span style="font-size: 13px; font-weight: 900; color: #cbd5e1; text-transform: uppercase; ">Jornada ${match.matchday || '-'}</span>
                    </div>

                    <!-- Score Layout -->
                    <div style="display: flex; align-items: center; justify-content: space-between; padding: 24px 0;">
                        <div style="text-align: center; width: 35%; display: flex; flex-direction: column; align-items: center;">
                            ${localLogoHtml}
                            <span style="font-size: 13px; font-weight: 700; color: #a5b4fc; text-transform: uppercase;  display: block; margin-bottom: 6px;">Local</span>
                            <span style="font-size: 18px; font-weight: 900; color: ${isHome ? '#f59e0b' : 'white'}; text-transform: uppercase; display: block; line-height: 1.1;">${isHome ? 'PLATGES DE MONCOFA' : rivalName}</span>
                        </div>
                        <div style="text-align: center; width: 30%;">
                            <div style="font-size: 36px; font-weight: 900; color: white; background: #2563eb; width: 120px; height: 56px; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.3); margin: 0 auto; font-family: system-ui, -apple-system, sans-serif; position: relative;">
                                <span style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); white-space: nowrap; line-height: 1;">${scoreText}</span>
                            </div>
                            <span style="font-size: 10px; font-weight: 800; color: #64748b; display: block; margin-top: 10px; text-transform: uppercase; ">Resultado Final</span>
                        </div>
                        <div style="text-align: center; width: 35%; display: flex; flex-direction: column; align-items: center;">
                            ${visitorLogoHtml}
                            <span style="font-size: 13px; font-weight: 700; color: #a5b4fc; text-transform: uppercase;  display: block; margin-bottom: 6px;">Visitante</span>
                            <span style="font-size: 18px; font-weight: 900; color: ${!isHome ? '#f59e0b' : 'white'}; text-transform: uppercase; display: block; line-height: 1.1;">${!isHome ? 'PLATGES DE MONCOFA' : rivalName}</span>
                        </div>
                    </div>

                    <!-- Goals List -->
                    <div style="background: white; border-radius: 16px; padding: 24px; color: #1e293b; box-shadow: 0 10px 30px rgba(0,0,0,0.2); margin-top: 24px;">
                        <h4 style="font-size: 14px; font-weight: 900; color: #94a3b8; text-transform: uppercase;  margin: 0 0 16px 0; padding-bottom: 10px; border-bottom: 1px solid #f1f5f9; text-align: left;">⚽ Goles y Asistencias del Partido</h4>
                        ${goalsListHtml}
                    </div>

                    <!-- Watermark -->
                    <div style="margin-top: 30px; text-align: center; font-size: 11px; font-weight: 800; color: #475569; text-transform: uppercase; ">
                        💪 #VamosMoncofa • Platges de Moncofa
                    </div>
                </div>
            </div>
        `;

        wrapper.appendChild(container);
        document.body.appendChild(wrapper);

        setTimeout(() => {
            window.html2canvas(container, {
                useCORS: true,
                scale: 2,
                backgroundColor: '#0f172a',
                scrollX: 0,
                scrollY: 0,
                x: 0,
                y: 0
            }).then(canvas => {
                const link = document.createElement('a');
                link.download = `resumen_papis_jornada_${match.matchday || 'x'}.jpg`;
                link.href = canvas.toDataURL('image/jpeg', 0.95);
                link.click();
                document.body.removeChild(wrapper);
                loadingMsg.remove();
            }).catch(err => {
                console.error("Error generating papis image:", err);
                MoncofaApp.UI.showToast("Error al generar imagen: " + err.message, "error");
                if (document.body.contains(wrapper)) document.body.removeChild(wrapper);
                loadingMsg.remove();
            });
        }, 500);
    },

    async downloadCoachesImage(matchId) {
        if (!window.html2canvas) return MoncofaApp.UI.showCustomModal('Error', 'Librería de imagen no cargada.');

        const match = await MoncofaApp.DB.getMatchById(parseInt(matchId));
        if (!match) return;

        const playerStats = await MoncofaApp.DB.getPlayerStatsForMatch(matchId);
        const players = await MoncofaApp.DB.getPlayers();
        if (playerStats.length === 0) {
            MoncofaApp.UI.showToast("Este partido no tiene estadísticas registradas.", "warning");
            return;
        }

        const scoreText = `${match.homeScore} - ${match.awayScore}`;
        const date = new Date(match.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });

        // Show loading
        const loadingMsg = document.createElement('div');
        loadingMsg.innerText = "Generando Acta del Entrenador...";
        Object.assign(loadingMsg.style, {
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
            background: 'rgba(0,0,0,0.8)', color: 'white', padding: '20px', borderRadius: '10px', zIndex: '99999',
            fontFamily: 'system-ui, sans-serif', fontWeight: 'bold'
        });
        document.body.appendChild(loadingMsg);

        // Create Container inside a viewport-friendly hidden wrapper
        const wrapper = document.createElement('div');
        Object.assign(wrapper.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '1000px',
            height: '1000px',
            opacity: '0.001',
            zIndex: '-99999',
            pointerEvents: 'none'
        });
        const container = document.createElement('div');
        Object.assign(container.style, {
            width: '1000px',
            boxSizing: 'border-box',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            background: '#f8fafc',
            padding: '24px'
        });

        let tableRowsHtml = '';
        playerStats.forEach(stat => {
            const p = players.find(x => x.id === stat.playerId);
            if (!p) return;
            
            const totalMins = (stat.mins1st || 0) + (stat.mins2nd || 0);
            const minsText = `${totalMins}' <span style="font-size: 10px; color: #64748b; font-weight: normal;">(${stat.mins1st || 0}'+${stat.mins2nd || 0}')</span>`;
            
            // Format movement tags
            const movements = [];
            if (stat.starts1st) movements.push(`<span style="background: #e0e7ff; color: #4338ca; font-size: 10px; font-weight: 800; padding: 3px 8px; border-radius: 4px; border: 1px solid #c7d2fe; white-space: nowrap;">Titular 1ªT</span>`);
            if (stat.starts2nd) movements.push(`<span style="background: #e0e7ff; color: #4338ca; font-size: 10px; font-weight: 800; padding: 3px 8px; border-radius: 4px; border: 1px solid #c7d2fe; white-space: nowrap;">Titular 2ªT</span>`);
            
            const matchSubs = (match.logs || []).filter(l => l.type === 'sub').sort((a, b) => (a.d?.min || 0) - (b.d?.min || 0));
            matchSubs.forEach(l => {
                const min = l.d?.min || 0;
                const period = min <= 25 ? '1ªT' : '2ªT';
                if (l.d?.in?.id === p.id) {
                    movements.push(`<span style="background: #dcfce7; color: #15803d; font-size: 10px; font-weight: 800; padding: 3px 8px; border-radius: 4px; border: 1px solid #bbf7d0; white-space: nowrap;">⬆️ Entra ${min}' (${period})</span>`);
                }
                if (l.d?.out?.id === p.id) {
                    movements.push(`<span style="background: #fee2e2; color: #b91c1c; font-size: 10px; font-weight: 800; padding: 3px 8px; border-radius: 4px; border: 1px solid #fecaca; white-space: nowrap;">⬇️ Sale ${min}' (${period})</span>`);
                }
            });

            const movementsHtml = movements.length > 0 ? `<div style="display: flex; flex-wrap: wrap; gap: 4px;">${movements.join('')}</div>` : `<span style="font-size: 11px; color: #94a3b8; font-style: italic;">No conv. / No jugó</span>`;
            const gkStatsHtml = p.role === 'GK' ? `<span style="font-weight: 900; color: #dc2626; font-size: 15px;">${stat.goalsConceded || 0}</span>` : `<span style="color: #cbd5e1;">-</span>`;

            tableRowsHtml += `
                <tr style="border-bottom: 1px solid #e2e8f0; background: white;">
                    <td style="padding: 12px; text-align: center;">
                        <div style="background: #1e293b; color: white; font-weight: 900; font-size: 12px; width: 26px; height: 26px; border-radius: 50%; position: relative; margin: 0 auto; font-family: system-ui, -apple-system, sans-serif; vertical-align: middle;">
                            <span style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); white-space: nowrap; line-height: 1;">${p.number}</span>
                        </div>
                    </td>
                    <td style="padding: 12px; font-weight: 800; color: #334155; text-align: left; font-size: 13px;">
                        ${p.name}
                    </td>
                    <td style="padding: 12px; text-align: center; font-weight: 800; color: #334155; font-size: 13px; white-space: nowrap;">${minsText}</td>
                    <td style="padding: 12px; text-align: left;">${movementsHtml}</td>
                    <td style="padding: 12px; text-align: center; font-weight: 900; color: #16a34a; font-size: 16px;">${stat.goals || 0}</td>
                    <td style="padding: 12px; text-align: center; font-weight: 900; color: #2563eb; font-size: 16px;">${stat.assists || 0}</td>
                    <td style="padding: 12px; text-align: center; font-weight: 800;">${gkStatsHtml}</td>
                </tr>
            `;
        });

        container.innerHTML = `
            <div style="background: white; border-radius: 20px; border: 1px solid #e2e8f0; box-shadow: 0 10px 30px rgba(0,0,0,0.05); overflow: hidden;">
                <!-- Header -->
                <div style="background: #022c22; border-bottom: 2px solid #042f1a; padding: 24px; color: white; display: flex; justify-content: space-between; align-items: center; box-sizing: border-box;">
                    <div style="text-align: left;">
                        <h4 style="margin: 0; font-size: 20px; font-weight: 900; text-transform: uppercase; ">Acta Técnica del Partido</h4>
                        <p style="margin: 6px 0 0 0; font-size: 12px; color: #a7f3d0; font-weight: 800; text-transform: uppercase; ">CF Platges de Moncofa • Temporada Activa</p>
                    </div>
                    <div style="text-align: right;">
                        <span style="font-size: 11px; font-weight: 800; color: #a7f3d0; text-transform: uppercase; display: block; margin-bottom: 4px; ">Jornada ${match.matchday || '-'} • ${date}</span>
                        <div style="background: #064e3b; color: white; font-weight: 900; font-size: 18px; padding: 6px 16px; border-radius: 10px; border: 1px solid #047857;  display: inline-block;">${scoreText}</div>
                    </div>
                </div>

                <!-- Table -->
                <table style="width: 100%; border-collapse: collapse; margin: 0;">
                    <thead>
                        <tr style="background: #f8fafc; border-bottom: 2px solid #e2e8f0; color: #64748b; font-size: 11px; font-weight: 900; text-transform: uppercase; ">
                            <th style="padding: 12px; text-align: center; width: 60px;">#</th>
                            <th style="padding: 12px; text-align: left;">Jugador</th>
                            <th style="padding: 12px; text-align: center; width: 120px;">Minutos</th>
                            <th style="padding: 12px; text-align: left;">Cronología de Cambios y Rotaciones</th>
                            <th style="padding: 12px; text-align: center; width: 70px;">Goles</th>
                            <th style="padding: 12px; text-align: center; width: 70px;">Asist</th>
                            <th style="padding: 12px; text-align: center; width: 70px;">🧤 Enc</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRowsHtml}
                    </tbody>
                </table>

            </div>
        `;

        wrapper.appendChild(container);
        document.body.appendChild(wrapper);

        setTimeout(() => {
            window.html2canvas(container, {
                useCORS: true,
                scale: 2,
                backgroundColor: '#f8fafc',
                scrollX: 0,
                scrollY: 0,
                x: 0,
                y: 0
            }).then(canvas => {
                const link = document.createElement('a');
                link.download = `acta_tecnica_entrenador_jornada_${match.matchday || 'x'}.jpg`;
                link.href = canvas.toDataURL('image/jpeg', 0.95);
                link.click();
                document.body.removeChild(wrapper);
                loadingMsg.remove();
            }).catch(err => {
                console.error("Error generating coaches image:", err);
                MoncofaApp.UI.showToast("Error al generar acta técnica: " + err.message, "error");
                if (document.body.contains(wrapper)) document.body.removeChild(wrapper);
                loadingMsg.remove();
            });
        }, 500);
    }
};
