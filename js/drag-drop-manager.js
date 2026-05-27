"use strict";

window.MoncofaApp = window.MoncofaApp || {};

MoncofaApp.DragManager = {
    // State
    dragState: {
        active: null,
        rect: null
    },

    init() {
        this.setupDragAndDrop();
        console.log("DragManager Initialized");
    },

    spawnBall() {
        const pitch = document.getElementById('pitch');
        if (document.getElementById('training-ball')) return; // Only one ball for now

        const ball = document.createElement('div');
        ball.id = 'training-ball';
        ball.className = 'draggable-item absolute w-7 h-7 cursor-move z-[60] rounded-full shadow-lg';
        ball.style.left = '50%';
        ball.style.top = '50%';
        ball.style.transform = 'translate(-50%, -50%)';
        ball.draggable = true;

        const img = document.createElement('img');
        img.src = 'assets/ball.jpg';
        img.className = 'w-full h-full object-cover rounded-full pointer-events-none';
        ball.appendChild(img);

        pitch.appendChild(ball);

        // Track ball persistence if needed? 
        // For now, it spawns on click.
    },

    setupDragAndDrop() {
        const pitch = document.getElementById('pitch');
        if (!pitch) return;

        let draggedItem = null;
        let dragOffset = { x: 0, y: 0 };

        // --- MOUSE EVENTS (Desktop) ---
        pitch.addEventListener('dragstart', (e) => {
            const avatar = e.target.closest('.player-avatar');
            const item = e.target.closest('.draggable-item');

            const target = avatar || item;
            if (!target) return;

            const isTactical = pitch.classList.contains('tactical-mode');
            const isMoveActive = pitch.classList.contains('move-active');

            // Allow dragging always if NOT in tactical mode, or if Move tool is active
            if (isTactical && !isMoveActive) {
                e.preventDefault();
                return;
            }

            draggedItem = target;
            const id = avatar ? avatar.dataset.playerId : target.id;
            e.dataTransfer.setData('text/plain', id);
            e.dataTransfer.setData('source', avatar ? 'pitch-player' : 'pitch-item');
            e.dataTransfer.effectAllowed = 'move';

            const rect = target.getBoundingClientRect();
            // Offset to keep cursor center
            e.dataTransfer.setDragImage(target, rect.width / 2, rect.height / 2);

            setTimeout(() => target.classList.add('dragging'), 0);
        });

        pitch.addEventListener('dragend', (e) => {
            if (draggedItem) {
                draggedItem.classList.remove('dragging');

                // If it was a pitch player and it was dropped OUTSIDE the pitch
                const isPitchPlayer = draggedItem.classList.contains('player-avatar');
                if (isPitchPlayer) {
                    const rect = pitch.getBoundingClientRect();
                    const isOutside = e.clientX < rect.left || e.clientX > rect.right ||
                        e.clientY < rect.top || e.clientY > rect.bottom;

                    if (isOutside) {
                        const playerId = draggedItem.dataset.playerId;
                        if (confirm(`¿Quitar a ${MoncofaApp.State.getPlayerById(playerId).name} del campo?`)) {
                            MoncofaApp.Main.removePlayerFromPitch(playerId);
                        }
                    }
                }
            }
            draggedItem = null;
        });

        pitch.addEventListener('dragenter', (e) => {
            e.preventDefault();
            pitch.classList.add('pitch-drag-over');
        });

        pitch.addEventListener('dragleave', (e) => {
            // Only remove if we are actually leaving the pitch, not entering a child
            if (e.relatedTarget === null || !pitch.contains(e.relatedTarget)) {
                pitch.classList.remove('pitch-drag-over');
            }
        });

        pitch.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
        });

        pitch.addEventListener('drop', (e) => {
            e.preventDefault();
            pitch.classList.remove('pitch-drag-over');
            const id = e.dataTransfer.getData('text/plain');
            const source = e.dataTransfer.getData('source');
            if (!id) return;

            const pitchRect = pitch.getBoundingClientRect();
            const x = e.clientX - pitchRect.left;
            const y = e.clientY - pitchRect.top;

            let xPct = (x / pitchRect.width) * 100;
            let yPct = (y / pitchRect.height) * 100;

            xPct = Math.max(0, Math.min(100, xPct));
            yPct = Math.max(0, Math.min(100, yPct));

            // Logic 1: External Player (from Squad List)
            if (source === 'squad-player') {
                const targetAvatar = e.target.closest('.player-avatar');
                const targetSlot = e.target.closest('.slot-button');

                if (targetAvatar) {
                    // SUBSTITUTION
                    const playerOutId = targetAvatar.dataset.playerId;
                    const playerInId = id;
                    MoncofaApp.DragManager.performSubstitution(playerOutId, playerInId);
                    return;
                } else if (targetSlot) {
                    // ADD to specific slot
                    const slotIdx = [...document.querySelectorAll('.slot-button')].indexOf(targetSlot);
                    // Finding the correct slot index is tricky because DOM order might change.
                    // Let's use the layout data to find which slot it is.
                    const formation = MoncofaApp.State.getCurrentFormationData();
                    const index = formation.findIndex(pos => {
                        const slotRect = targetSlot.getBoundingClientRect();
                        const slotX = (slotRect.left + slotRect.width / 2 - pitchRect.left) / pitchRect.width * 100;
                        const slotY = (slotRect.top + slotRect.height / 2 - pitchRect.top) / pitchRect.height * 100;
                        return Math.abs(slotX - pos.x) < 1 && Math.abs(slotY - pos.y) < 1;
                    });

                    if (index !== -1) {
                        MoncofaApp.Main.addPlayerToPitch(parseInt(id), index);
                    } else {
                        // Fallback: search for first empty
                        const emptyIdx = MoncofaApp.State.lineupIds.indexOf(null);
                        if (emptyIdx !== -1) MoncofaApp.Main.addPlayerToPitch(parseInt(id), emptyIdx);
                    }
                    return;
                } else {
                    // Dropped on empty pitch: Add to first available slot or nearest?
                    // For simplicity, find first empty
                    const emptyIdx = MoncofaApp.State.lineupIds.indexOf(null);
                    if (emptyIdx !== -1) {
                        MoncofaApp.Main.addPlayerToPitch(parseInt(id), emptyIdx);
                        // Also set custom position to drop point
                        MoncofaApp.State.customPositions[id] = { x: xPct, y: yPct };
                        MoncofaApp.UI.renderPitch();
                    }
                    return;
                }
            }

            // Logic 2: Pitch Item (Ball)
            if (id === 'training-ball') {
                const ball = document.getElementById('training-ball');
                if (ball) {
                    ball.style.left = `${xPct}%`;
                    ball.style.top = `${yPct}%`;
                    ball.style.transform = 'translate(-50%, -50%)';
                    MoncofaApp.State.ballPosition = { x: xPct, y: yPct };
                    MoncofaApp.State.saveSession();
                }
            } else if (source === 'pitch-player') {
                // Moving existing player
                // Check if dropped on another player -> Substitution?
                const targetAvatar = e.target.closest('.player-avatar');
                if (targetAvatar && targetAvatar.dataset.playerId !== id) {
                    // Swap? Or Sub?
                    // If match is running, maybe they want a sub. 
                    // But usually, they just want to swap roles.
                    // For now, let's just move them to the position.
                }

                MoncofaApp.State.customPositions[id] = { x: xPct, y: yPct };
                MoncofaApp.UI.renderPitch();
                MoncofaApp.State.saveSession();
            }
        });

        // --- TOUCH EVENTS (Mobile) ---
        let touchDragItem = null;
        let touchStartId = null;

        // Use passive: false to allow preventDefault()
        pitch.addEventListener('touchstart', (e) => {
            // Find target (Player or Ball)
            const avatar = e.target.closest('.player-avatar');
            const item = e.target.closest('.draggable-item');
            const target = avatar || item;

            // If we didn't touch a draggable item, ignore (allows drawing canvas to handle it if active)
            if (!target) return;

            // Check Modes
            const isTactical = pitch.classList.contains('tactical-mode');
            const isMoveActive = pitch.classList.contains('move-active');

            // Logic:
            // 1. If Tactical Mode (Pizarra) AND Move Tool NOT Active -> BLOCK Dragging (return)
            //    Exception: If it's the BALL (item), should we allow? 
            //    Consistency: If we block players, we should block ball to avoid accidents while drawing.
            //    User must select "Move" tool.

            if (isTactical && !isMoveActive) {
                // If we are touching an item but in drawing mode, we do NOTHING here.
                // The touch might pass through to canvas? No, canvas is on top if Pen mode.
                // If canvas is on top, we shouldn't even get this event for Players (Z-0).
                // BUT Ball is Z-50. So Ball gets this.
                // We must prevent drag.
                return;
            }

            // If we are here, Dragging is Allowed.
            if (e.cancelable) e.preventDefault(); // Stop Scroll/Zoom
            e.stopPropagation(); // Stop bubbling to avoid unwanted side effects

            touchDragItem = target;
            touchStartId = avatar ? avatar.dataset.playerId : target.id;

            touchDragItem.classList.add('dragging');
        }, { passive: false });

        pitch.addEventListener('touchmove', (e) => {
            if (!touchDragItem) return;
            if (e.cancelable) e.preventDefault();

            const touch = e.touches[0];
            const pitchRect = pitch.getBoundingClientRect();

            // Calculate Position
            const x = touch.clientX - pitchRect.left;
            const y = touch.clientY - pitchRect.top;

            let xPct = (x / pitchRect.width) * 100;
            let yPct = (y / pitchRect.height) * 100;

            // Clamp
            xPct = Math.max(0, Math.min(100, xPct));
            yPct = Math.max(0, Math.min(100, yPct));

            // Live Update (Visual)
            touchDragItem.style.left = `${xPct}%`;
            touchDragItem.style.top = `${yPct}%`;
            touchDragItem.style.transform = 'translate(-50%, -50%)';
        }, { passive: false });

        pitch.addEventListener('touchend', (e) => {
            if (!touchDragItem) return;

            // Finalize Position
            // We need to recalculate last known pos from style or just use the last move event?
            // Actually, since we updated style.left/top in touchmove, we can just parse that 
            // OR simpler: we rely on the visual state being correct and just saving the style values back to state.

            // However, style is string "50%".
            const xPct = parseFloat(touchDragItem.style.left);
            const yPct = parseFloat(touchDragItem.style.top);

            if (touchStartId === 'training-ball') {
                MoncofaApp.State.ballPosition = { x: xPct, y: yPct };
                MoncofaApp.State.saveSession();
            } else if (touchStartId) {
                // BUG FIX/FEATURE: If touch end is OUTSIDE the pitch, remove player
                const touch = e.changedTouches[0];
                const pitchRect = pitch.getBoundingClientRect();
                const isOutside = touch.clientX < pitchRect.left || touch.clientX > pitchRect.right ||
                    touch.clientY < pitchRect.top || touch.clientY > pitchRect.bottom;

                if (isOutside) {
                    if (confirm(`¿Quitar a ${MoncofaApp.State.getPlayerById(touchStartId).name} del campo?`)) {
                        MoncofaApp.Main.removePlayerFromPitch(touchStartId);
                    } else {
                        MoncofaApp.UI.renderPitch(); // Reset position
                    }
                } else {
                    MoncofaApp.State.customPositions[touchStartId] = { x: xPct, y: yPct };
                    MoncofaApp.UI.renderPitch();
                    MoncofaApp.State.saveSession();
                }
            }

            touchDragItem.classList.remove('dragging');
            touchDragItem = null;
            touchStartId = null;
        });
    },

    handleSquadDragStart(e) {
        const item = e.target.closest('.squad-player-item');
        const id = item ? item.dataset.playerId : null;
        if (!id) return;

        e.dataTransfer.setData('text/plain', id);
        e.dataTransfer.setData('source', 'squad-player');
        e.dataTransfer.effectAllowed = 'move';

        // Add a class for visual feedback if needed
        e.target.classList.add('dragging-from-list');
    },

    performSubstitution(playerOutId, playerInId) {
        const playerOut = MoncofaApp.State.getPlayerById(parseInt(playerOutId));
        const playerIn = MoncofaApp.State.getPlayerById(parseInt(playerInId));

        if (!playerOut || !playerIn) return;

        const time = MoncofaApp.State.match.displayMs ? Math.floor(MoncofaApp.State.match.displayMs / 60000) : 0;

        if (confirm(`¿Realizar cambio: Entra ${playerIn.name} por ${playerOut.name} (Min ${time}')?`)) {
            const outIdx = MoncofaApp.State.lineupIds.indexOf(parseInt(playerOutId));
            if (outIdx !== -1) {
                // Perform Sub
                MoncofaApp.State.lineupIds[outIdx] = parseInt(playerInId);

                // Clear custom position of the one going out
                delete MoncofaApp.State.customPositions[playerOutId];

                // Keep the position of the one coming in if it was dropped exactly there? 
                // Actually UI.renderPitch will put it in the formation slot unless we set customPos.
                // For a sub, usually they take the same spot.

                // Log and Update
                MoncofaApp.State.addLog('sub', `Cambio: Entra ${playerIn.name} por ${playerOut.name}`, { min: time, in: playerIn, out: playerOut });
                MoncofaApp.UI.updateAll();
                MoncofaApp.State.saveSession();
            }
        }
    }
};
