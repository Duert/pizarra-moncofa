"use strict";

window.MoncofaApp = window.MoncofaApp || {};

MoncofaApp.SquadManager = {
    init() {
        console.log("Squad Manager Initialized");
    },

    openManager() {
        this.renderManagerModal();
    },

    renderManagerModal() {
        const squad = MoncofaApp.State.squad;

        let html = `
            <div class="flex justify-between items-center mb-4 border-b border-slate-100 pb-2">
                <h3 class="font-bold text-xl flex items-center gap-2 text-slate-800">
                    <i data-lucide="users-round" class="w-6 h-6 text-blue-600"></i> 
                    Gestión de Plantilla
                </h3>
                <div class="flex gap-2">
                     <button onclick="MoncofaApp.SquadManager.showAddForm()" 
                        class="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm transition-transform active:scale-95">
                        <i data-lucide="plus" class="w-4 h-4"></i> Crear Jugador
                    </button>
                    <button onclick="MoncofaApp.UI.closeModal()" class="text-slate-400 hover:text-slate-600 p-1">
                        <i data-lucide="x" class="w-6 h-6"></i>
                    </button>
                </div>
            </div>

            <div class="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-4 text-xs text-blue-800 flex items-start gap-2">
                <i data-lucide="info" class="w-4 h-4 mt-0.5 flex-shrink-0"></i>
                <p>Aquí puedes personalizar tu equipo. Los cambios se guardarán automáticamente.</p>
            </div>

            <div class="max-h-[50vh] overflow-y-auto pr-1 space-y-2 custom-scrollbar">
        `;

        // Sort by Number
        const sortedSquad = [...squad].sort((a, b) => parseInt(a.number) - parseInt(b.number));

        if (sortedSquad.length === 0) {
            html += `<div class="text-center py-8 text-slate-400 italic">No hay jugadores en la plantilla.</div>`;
        } else {
            sortedSquad.forEach(p => {
                const isGK = p.role === 'GK';
                html += `
                <div class="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-white hover:shadow-md transition-all group">
                    <!-- Avatar Preview -->
                    <div class="w-10 h-10 rounded-full flex items-center justify-center font-black text-white text-sm shadow-sm border-2 border-white ring-1 ring-black/5
                        ${isGK ? 'bg-yellow-500' : 'bg-red-600'}">
                        ${p.number}
                    </div>
                    
                    <!-- Info -->
                    <div class="flex-1 min-w-0">
                        <div class="font-bold text-slate-800 truncate">${p.name}</div>
                        <div class="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1">
                            ${isGK ? '<span class="text-yellow-600">Portero</span>' : '<span class="text-slate-500">Jugador de Campo</span>'}
                        </div>
                    </div>

                    <!-- Actions -->
                    <div class="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <button onclick="MoncofaApp.SquadManager.showEditForm(${p.id})" 
                            class="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Editar">
                            <i data-lucide="pencil" class="w-4 h-4"></i>
                        </button>
                        <button onclick="MoncofaApp.SquadManager.deletePlayer(${p.id})" 
                            class="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar">
                            <i data-lucide="trash-2" class="w-4 h-4"></i>
                        </button>
                    </div>
                </div>
                `;
            });
        }

        html += `</div>`;

        MoncofaApp.UI.openModal(html);
    },

    showAddForm() {
        this.renderPlayerForm();
    },

    showEditForm(id) {
        const player = MoncofaApp.State.getPlayerById(id);
        if (player) this.renderPlayerForm(player);
    },

    renderPlayerForm(player = null) {
        const isEdit = !!player;
        const title = isEdit ? 'Editar Jugador' : 'Nuevo Jugador';
        const num = player ? player.number : '';
        const name = player ? player.name : '';
        const role = player ? player.role : 'FIELD';

        const html = `
            <div class="flex justify-between items-center mb-6">
                <h3 class="font-bold text-xl text-slate-800">${title}</h3>
                <button onclick="MoncofaApp.SquadManager.openManager()" class="text-slate-400 hover:text-slate-600 flex items-center gap-1 text-xs font-bold uppercase tracking-wider">
                    <i data-lucide="arrow-left" class="w-4 h-4"></i> Volver
                </button>
            </div>

            <form onsubmit="event.preventDefault(); MoncofaApp.SquadManager.savePlayer(${isEdit ? player.id : 'null'})" class="space-y-4">
                
                <div class="grid grid-cols-4 gap-4">
                    <div class="col-span-1">
                        <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Dorsal</label>
                        <input type="number" id="p-number" value="${num}" required min="1" max="99" autoucus
                            class="w-full bg-slate-50 border border-slate-300 text-slate-900 text-center text-lg rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 font-black">
                    </div>
                    <div class="col-span-3">
                        <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Nombre</label>
                        <input type="text" id="p-name" value="${name}" required maxlength="20"
                            class="w-full bg-slate-50 border border-slate-300 text-slate-900 text-lg rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 font-bold" placeholder="Ej. Messi">
                    </div>
                </div>

                <div>
                    <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Posición Principal</label>
                    <div class="grid grid-cols-2 gap-3">
                        <label class="cursor-pointer">
                            <input type="radio" name="p-role" value="FIELD" class="peer sr-only" ${role !== 'GK' ? 'checked' : ''}>
                            <div class="rounded-xl border-2 border-slate-200 bg-white p-3 text-center transition-all hover:bg-slate-50 peer-checked:border-blue-500 peer-checked:bg-blue-50 peer-checked:text-blue-700">
                                <div class="font-bold text-sm">Jugador de Campo</div>
                            </div>
                        </label>
                        <label class="cursor-pointer">
                            <input type="radio" name="p-role" value="GK" class="peer sr-only" ${role === 'GK' ? 'checked' : ''}>
                            <div class="rounded-xl border-2 border-slate-200 bg-white p-3 text-center transition-all hover:bg-slate-50 peer-checked:border-yellow-500 peer-checked:bg-yellow-50 peer-checked:text-yellow-700">
                                <div class="font-bold text-sm">Portero</div>
                            </div>
                        </label>
                    </div>
                </div>

                <div class="pt-4 flex gap-3">
                    <button type="submit" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg hover:shadow-blue-500/30 transition-all active:scale-95 flex justify-center items-center gap-2">
                        <i data-lucide="save" class="w-5 h-5"></i>
                        ${isEdit ? 'Guardar Cambios' : 'Crear Jugador'}
                    </button>
                </div>
            </form>
        `;

        MoncofaApp.UI.openModal(html);
        // Focus name if edit, number if new (simple UX)
        setTimeout(() => document.getElementById(isEdit ? 'p-name' : 'p-number').focus(), 50);
    },

    savePlayer(id) {
        const number = document.getElementById('p-number').value;
        const name = document.getElementById('p-name').value;
        const role = document.querySelector('input[name="p-role"]:checked').value;

        if (!number || !name) return;

        let squad = [...MoncofaApp.State.squad];

        if (id) {
            // EDIT
            const idx = squad.findIndex(p => p.id === id);
            if (idx !== -1) {
                squad[idx] = { ...squad[idx], number, name, role };
            }
        } else {
            // CREATE
            // Generate simple unique ID
            const newId = Date.now();
            squad.push({
                id: newId,
                number,
                name,
                role,
                calledUp: true // Default to available
            });
        }

        this.updateSquadState(squad);
        this.openManager(); // Go back to list
    },

    deletePlayer(id) {
        if (confirm("¿Estás seguro de que quieres eliminar a este jugador?")) {
            const squad = MoncofaApp.State.squad.filter(p => p.id !== id);

            // Also remove from lineup if present
            const lineupIdx = MoncofaApp.State.lineupIds.indexOf(id);
            if (lineupIdx !== -1) {
                MoncofaApp.State.lineupIds[lineupIdx] = null;
            }

            this.updateSquadState(squad);
            this.openManager(); // Refresh list
        }
    },

    updateSquadState(newSquad) {
        // Update State
        MoncofaApp.State.squad = newSquad;

        // Save to LocalStorage
        localStorage.setItem('moncofa_squad', JSON.stringify(newSquad));

        // Also Trigger session save to keep consistency if mid-match
        MoncofaApp.State.saveSession();

        // Update UI background (Squad List, etc)
        MoncofaApp.UI.updateAll();
    }
};
