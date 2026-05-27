"use strict";

window.MoncofaApp = window.MoncofaApp || {};

MoncofaApp.TacticsManager = {
    tactics: [],

    async init() {
        await this.loadTactics();
    },

    async loadTactics() {
        // 1. Load Local First (Speed)
        try {
            const saved = localStorage.getItem('moncofa_tactics');
            if (saved) {
                this.tactics = JSON.parse(saved);
            }
        } catch (e) {
            console.error("Error loading local tactics", e);
            this.tactics = [];
        }

        // 2. Fetch Cloud and Merge
        if (MoncofaApp.State.supabase) {
            const { data, error } = await MoncofaApp.State.loadTacticalBoards();
            if (!error && data) {
                // We trust Cloud as "Master" for simple sync. 
                // Alternatively, we could merge. valid strategy: Replace local with Cloud.
                this.tactics = data;
                this.persist(); // Update local cache
            } else {
                console.warn("Cloud load failed", error);
            }
        }
    },

    async saveCurrentTactic() {
        // Prompt for name
        const name = prompt("Nombre de la Táctica:");
        if (!name) return;

        // Capture State
        const tactic = {
            name,
            formation: MoncofaApp.State.currentFormation,
            lineup: MoncofaApp.State.lineupIds,
            positions: MoncofaApp.State.customPositions,
            drawings: MoncofaApp.Drawing ? MoncofaApp.Drawing.paths : [],
            date: new Date().toISOString()
        };

        // UI Feedback
        const btn = document.getElementById('btn-save-tactic');
        if (btn) btn.innerHTML = '<i class="w-4 h-4 animate-spin" data-lucide="loader-2"></i> Guardando...';

        // Save Cloud
        let cloudId = null;
        if (MoncofaApp.State.supabase) {
            const { data, error } = await MoncofaApp.State.saveTacticalBoard(tactic);
            if (!error && data && data[0]) {
                cloudId = data[0].id; // Use UUID from DB
                tactic.id = cloudId;
                tactic.created_at = data[0].created_at;
            } else {
                alert("Error guardando en la Nube. Se guardará localmente.");
            }
        }

        // Fallback ID if no cloud
        if (!tactic.id) tactic.id = Date.now();

        this.tactics.push(tactic);
        this.persist();

        // Refresh UI
        this.showLoadModal();
        alert("Táctica guardada correctamente.");
    },

    async deleteTactic(id) {
        if (confirm("¿Eliminar esta táctica?")) {
            // Optimistic Update
            this.tactics = this.tactics.filter(t => t.id !== id);
            this.persist();
            this.showLoadModal(); // Immediate Refresh

            // Cloud Delete
            if (MoncofaApp.State.supabase) {
                await MoncofaApp.State.deleteTacticalBoard(id);
            }
        }
    },

    persist() {
        localStorage.setItem('moncofa_tactics', JSON.stringify(this.tactics));
    },

    showLoadModal() {
        const isOnline = !!MoncofaApp.State.supabase;
        const statusHtml = isOnline
            ? '<span class="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold flex items-center gap-1"><i data-lucide="cloud" class="w-3 h-3"></i> Conectado</span>'
            : '<span class="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded-full font-bold flex items-center gap-1"><i data-lucide="cloud-off" class="w-3 h-3"></i> Local</span>';

        let html = `
            <div class="flex justify-between items-center mb-4 border-b border-slate-100 pb-2">
                <h3 class="font-bold text-xl flex items-center gap-2 text-slate-800">
                    <i data-lucide="library" class="w-6 h-6 text-fuchsia-600"></i> 
                    Biblioteca de Tácticas
                </h3>
                ${statusHtml}
                <button onclick="MoncofaApp.UI.closeModal()" class="text-slate-400 hover:text-slate-600 p-1">
                    <i data-lucide="x" class="w-6 h-6"></i>
                </button>
            </div>
            
            <div class="max-h-[50vh] overflow-y-auto pr-1 space-y-2 custom-scrollbar">
        `;

        if (this.tactics.length === 0) {
            html += `<div class="text-center py-8 text-slate-400 italic">No hay tácticas guardadas.</div>`;
        } else {
            // Sort newest first
            [...this.tactics].sort((a, b) => new Date(b.created_at || b.date) - new Date(a.created_at || a.date)).forEach(t => {
                const dateRaw = t.created_at || t.date || new Date();
                const date = new Date(dateRaw).toLocaleDateString();
                const isCloud = !!t.created_at; // quick check heuristic
                const icon = isCloud ? '<i data-lucide="cloud" class="w-3 h-3 text-sky-500"></i>' : '<i data-lucide="hard-drive" class="w-3 h-3 text-stone-400"></i>';

                html += `
                <div class="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white hover:shadow-md transition-all group">
                    <div>
                        <div class="font-bold text-slate-800 flex items-center gap-2">${t.name} ${icon}</div>
                        <div class="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                            ${t.formation} • ${date}
                        </div>
                    </div>
                    <div class="flex gap-1">
                        <button onclick="MoncofaApp.TacticsManager.loadTactic('${t.id}')" 
                            class="px-3 py-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors">
                            <i data-lucide="upload" class="w-3 h-3"></i> Cargar
                        </button>
                        <button onclick="MoncofaApp.TacticsManager.deleteTactic('${t.id}')" 
                            class="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar">
                            <i data-lucide="trash-2" class="w-4 h-4"></i>
                        </button>
                    </div>
                </div>
                `;
            });
        }

        html += `</div>
        <div class="mt-4 pt-4 border-t flex justify-center">
            <button id="btn-save-tactic" onclick="MoncofaApp.TacticsManager.saveCurrentTactic()" 
                class="bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-bold py-2 px-6 rounded-xl shadow-lg hover:shadow-fuchsia-500/30 transition-all active:scale-95 flex items-center gap-2">
                <i data-lucide="save" class="w-4 h-4"></i> Guardar Estado Actual
            </button>
        </div>
        `;

        MoncofaApp.UI.openModal(html);
        lucide.createIcons();
    }
};
