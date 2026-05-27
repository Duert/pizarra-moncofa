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
                    alert("Error al generar imagen: " + err.message);
                    if (document.body.contains(container)) document.body.removeChild(container);
                    loadingMsg.remove();
                });
            }, 500);

        } catch (e) {
            console.error("Setup Error:", e);
            alert("Error preparando la imagen: " + e.message);
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
    }
};
