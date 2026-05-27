"use strict";

window.MoncofaApp = window.MoncofaApp || {};

MoncofaApp.Animation = {
    frames: [], // Array of { customPositions: {}, ballPosition: {x,y} }
    currentFrameIndex: -1,
    isPlaying: false,
    intervalId: null,
    fps: 2, // Slow tactical movement (frames per second) for manual steps
    // Or better: interpolated movement? 
    // Let's start with clear "Step by Step" then we can smooth it out.
    // User asked for "Record Frame 1 -> Record Frame 2 -> Play".
    // Smooth transition is best using requestAnimationFrame and interpolation.

    config: {
        baseDuration: 1000,
        transitionDuration: 1000, // ms between frames
    },

    setSpeed(multiplier) {
        this.config.transitionDuration = this.config.baseDuration / parseFloat(multiplier);
        console.log("Animation Speed Set: " + this.config.transitionDuration + "ms");
        // If playing, restart to apply new speed? For simplicity, apply on next play or frame.
        // Ideally we update transition state immediately.
        if (this.isPlaying) {
            this.setTransitionState(true);
            // Restart interval?
            this.stop();
            this.play();
        }
    },

    init() {
        console.log("Animation Module Initialized");
        this.updateUI();
    },

    // --- Core Logic ---
    addFrame() {
        // Capture ACTUAL DOM positions to ensure WYSIWYG
        const frame = {
            id: Date.now(),
            customPositions: this.capturePlayerPositions(),
            ballPosition: this.getBallPosition()
        };
        this.frames.push(frame);
        console.log("Frame Added", this.frames.length, frame);
        this.flashPitch();
        this.updateUI();
    },

    capturePlayerPositions() {
        // Instead of trusting State (which might be pending update), read DOM
        const positions = {};
        document.querySelectorAll('.player-avatar').forEach(el => {
            const pid = el.dataset.playerId;
            // Get current % positions directly from style
            // If style is empty (default CSS), we need computed style converted to %?
            // Actually, renderPitch always sets Left/Top if in customPositions.
            // If not in customPositions, it uses default formation.
            // We should capture the CURRENT EFFECTIVE position.

            let left = el.style.left;
            let top = el.style.top;

            // If no inline style, calculate from offset (fallback for initial state)
            if (!left || !top) {
                const parent = el.offsetParent;
                if (parent) {
                    const lPx = el.offsetLeft;
                    const tPx = el.offsetTop;
                    const pW = parent.offsetWidth;
                    const pH = parent.offsetHeight;
                    left = (lPx / pW * 100).toFixed(2) + '%';
                    top = (tPx / pH * 100).toFixed(2) + '%';
                }
            }

            positions[pid] = { left, top };
        });
        return positions;
    },

    getBallPosition() {
        const ball = document.getElementById('training-ball');
        if (!ball) return null;
        return {
            left: ball.style.left || '50%',
            top: ball.style.top || '50%'
        };
    },

    clearFrames() {
        if (confirm("¿Borrar todos los pasos de la animación?")) {
            this.frames = [];
            this.updateUI();
            this.stop();
            // Reset transitions to instant
            this.setTransitionState(false);
        }
    },

    togglePlay() {
        if (this.isPlaying) {
            this.stop();
        } else {
            this.play();
        }
    },

    play() {
        if (this.frames.length < 2) {
            alert("Graba al menos 2 pasos para animar.");
            return;
        }
        this.isPlaying = true;
        this.currentFrameIndex = 0;
        this.updateUI();

        // Enable Transitions
        this.setTransitionState(true);

        // Start Animation Loop
        // Apply Frame 0 immediately
        this.applyFrame(0);

        let step = 0;
        const totalSteps = this.frames.length;

        // Loop logic
        this.intervalId = setInterval(() => {
            step++;
            if (step >= totalSteps) {
                step = 0; // Loopback
                // Optional: Pause at end? No, loop is good for tactics.
                // For smoother loopback, we might want a momentary jump?
                // Transitions handle jump gracefully (it just slides back).
            }
            this.applyFrame(step);
        }, this.config.transitionDuration);
    },

    stop() {
        this.isPlaying = false;
        clearInterval(this.intervalId);
        this.intervalId = null;
        this.updateUI();
        // Disable transitions so user can drag immediately without lag
        this.setTransitionState(false);
    },

    applyFrame(index) {
        if (index < 0 || index >= this.frames.length) return;

        const frame = this.frames[index];

        // BALON
        const ball = document.getElementById('training-ball');
        if (ball && frame.ballPosition) {
            ball.style.left = frame.ballPosition.left;
            ball.style.top = frame.ballPosition.top;
        }

        // PLAYERS
        document.querySelectorAll('.player-avatar').forEach(el => {
            const pid = el.dataset.playerId;
            const pos = frame.customPositions[pid]; // Now {left: "X%", top: "Y%"}
            if (pos) {
                el.style.left = pos.left;
                el.style.top = pos.top;
            }
        });
    },

    setTransitionState(enable) {
        // Only animate left/top properties to be performant
        const duration = enable ? `${this.config.transitionDuration}ms` : '0s';
        const timing = 'ease-in-out';

        const css = enable ? `left ${duration} ${timing}, top ${duration} ${timing}` : 'none';

        document.querySelectorAll('.player-avatar, #training-ball').forEach(el => {
            el.style.transition = css;
        });
    },

    flashPitch() {
        const pitch = document.getElementById('pitch');
        const original = pitch.style.borderColor;
        pitch.style.borderColor = '#4ade80'; // Green flash
        setTimeout(() => pitch.style.borderColor = original, 200);
    },

    updateUI() {
        const countSpan = document.getElementById('anim-frame-count');
        const playBtn = document.getElementById('anim-play-btn');

        if (countSpan) countSpan.textContent = this.frames.length;
        if (playBtn) {
            if (this.isPlaying) {
                playBtn.innerHTML = '<i data-lucide="square" class="w-4 h-4 fill-white"></i>';
                playBtn.classList.replace('bg-green-600', 'bg-red-600');
            } else {
                playBtn.innerHTML = '<i data-lucide="play" class="w-4 h-4 fill-white"></i>';
                playBtn.classList.replace('bg-red-600', 'bg-green-600');
            }
            lucide.createIcons();
        }
    }
};
