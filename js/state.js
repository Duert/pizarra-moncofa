"use strict";

window.MoncofaApp = window.MoncofaApp || {};

MoncofaApp.State = {
    // Current configuration
    currentFormation: '3-3-1',

    // Global Config
    config: {
        coachName: 'Loren Collado',
        delegateName: 'Domi Sanchez',
        rival: 'RIVAL',
        rivalLogo: null,
        venue: 'home',
        isHomeGame: true
    },

    rivals: [], // Database of rivals

    // Application Data
    squad: [],                 // Will be initialized from Constants
    lineupIds: Array(8).fill(null),
    squad: [],                 // Will be initialized from Constants
    lineupIds: Array(8).fill(null),
    customPositions: {},
    kitColors: {},             // New: In-memory kit colors

    // Match Status
    match: {
        period: 1,
        isRunning: false,
        startTime: null,
        accumulatedMs: 0,
        displayMs: 0,
        intervalId: null
    },

    score: { home: 0, away: 0 },
    logs: [],

    // Initialization
    supabase: null,
    clientId: Math.random().toString(36).substring(7), // Unique ID for this tab/client
    saveCloudTimeout: null,

    init() {
        this.initSupabase();
        this.loadSquad();
        this.loadRivals();
        // Initial Cloud Load
        if (this.supabase) this.loadCloudSession();
    },

    initSupabase() {
        // Hardcoded credentials as requested by user
        const SUPABASE_URL = 'https://rrvbdcjyeidplaojwnee.supabase.co';
        const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJydmJkY2p5ZWlkcGxhb2p3bmVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3MjIwMjksImV4cCI6MjA4MTI5ODAyOX0.Fo0ufR1gHSjT8KoTjMpQCWeNBQaiPcvj_d1RhxAMvXc';

        if (window.supabase) {
            this.supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
            console.log("Supabase initialized. Client ID:", this.clientId);

            // Subscribe to Realtime Changes
            this.supabase
                .channel('room_match')
                .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'match_sessions' }, payload => {
                    const newData = payload.new;
                    if (newData.id === 'live' && newData.client_id !== this.clientId) {
                        console.log("Remote update received!", newData);
                        this.applyRemoteState(newData.state);
                    }
                })
                .subscribe();
        }
    },

    loadSquad() {
        try {
            const saved = localStorage.getItem('moncofa_squad');
            if (saved) {
                this.squad = JSON.parse(saved);
            }

            // Safety Check: If loaded but empty, force defaults
            if (!this.squad || this.squad.length === 0) {
                this.squad = JSON.parse(JSON.stringify(MoncofaApp.Constants.INITIAL_SQUAD));
            }
        } catch (e) {
            console.error("Error loading squad", e);
            this.squad = JSON.parse(JSON.stringify(MoncofaApp.Constants.INITIAL_SQUAD));
        }
    },

    async loadRivals() {
        // 1. Try Cloud
        if (this.supabase) {
            const { data, error } = await this.supabase.from('rival_teams').select('*');
            if (!error && data) {
                this.rivals = data;
                localStorage.setItem('moncofa_rivals', JSON.stringify(this.rivals)); // Update cache
                return;
            } else {
                console.warn("Could not fetch from Supabase (maybe table missing?), using local cache.", error);
            }
        }

        // 2. Fallback Local
        try {
            const saved = localStorage.getItem('moncofa_rivals');
            if (saved) this.rivals = JSON.parse(saved);
        } catch (e) { console.error("Error loading rivals", e); }
    },

    saveRivals() {
        // Local Cache Only - Cloud uses atomic operations
        try {
            localStorage.setItem('moncofa_rivals', JSON.stringify(this.rivals));
        } catch (e) {
            if (e.name === 'QuotaExceededError') alert("Memoria llena local. Borra equipos.");
        }
    },

    async addRival(name, logo, shortName) {
        if (!name) return;
        // Use UUID if possible, else Date
        const id = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : Date.now().toString();

        const newRival = { id, name, logo, shortName };

        // Optimistic UI
        this.rivals.push(newRival);
        this.saveRivals(); // Update Cache

        // Async Cloud
        if (this.supabase) {
            const { error } = await this.supabase.from('rival_teams').insert([newRival]);
            if (error) {
                console.error("Error inserting to Supabase:", error);
                alert("Error al guardar en la nube. Revisa que hayas creado la tabla 'rival_teams'.");
            }
        }
        return id;
    },

    async updateRival(id, name, logo, shortName) {
        const idx = this.rivals.findIndex(r => r.id === id);
        if (idx === -1) return;

        const updated = { ...this.rivals[idx], name, logo, shortName };
        this.rivals[idx] = updated;
        this.saveRivals();

        if (this.supabase) {
            const { error } = await this.supabase.from('rival_teams').update({ name, logo, shortName }).eq('id', id);
            if (error) console.error("Update error Supabase:", error);
        }
    },

    async removeRival(id) {
        // Optimistic UI
        this.rivals = this.rivals.filter(r => r.id !== id);
        this.saveRivals(); // Update Cache

        // Async Cloud
        if (this.supabase) {
            const { error } = await this.supabase.from('rival_teams').delete().eq('id', id);
            if (error) console.error("Error deleting from Supabase:", error);
        }
    },

    // --- Cloud Tactics ---
    async saveTacticalBoard(tactic) {
        if (!this.supabase) return { error: 'No connection' };

        // Ensure we have a valid object and no undefineds
        const payload = {
            name: tactic.name,
            formation: tactic.formation,
            lineup: tactic.lineup,
            positions: tactic.positions,
            drawings: tactic.drawings,
            created_at: new Date().toISOString()
        };

        const { data, error } = await this.supabase.from('tactical_boards').insert([payload]).select();
        return { data, error };
    },

    async loadTacticalBoards() {
        if (!this.supabase) return { data: [], error: 'No connection' };

        const { data, error } = await this.supabase
            .from('tactical_boards')
            .select('*')
            .order('created_at', { ascending: false });

        return { data, error };
    },

    async deleteTacticalBoard(id) {
        if (!this.supabase) return { error: 'No connection' };
        const { error } = await this.supabase.from('tactical_boards').delete().eq('id', id);
        return { error };
    },

    // Helpers
    getPlayerById(id) {
        return this.squad.find(p => p.id === parseInt(id));
    },

    getStarters() {
        return this.lineupIds.map(id => this.getPlayerById(id)).filter(Boolean);
    },

    getBench() {
        return this.squad.filter(p => p.calledUp && !this.lineupIds.includes(p.id));
    },

    getUncalled() {
        return this.squad.filter(p => !p.calledUp);
    },

    getCurrentFormationData() {
        return MoncofaApp.Constants.FORMATIONS[this.currentFormation];
    },

    // Actions
    addLog(type, text, data) {
        const entry = {
            id: Date.now() + Math.random(), // Ensure uniqueness
            time: MoncofaApp.Utils.formatTime(this.match.displayMs).t,
            type,
            text,
            d: data
        };
        this.logs.push(entry);

        // Update Score automatically based on log type
        const isHome = this.config.isHomeGame;

        if (type === 'goal' || type === 'own_goal_rival') {
            // We scored (or rival scored in own net)
            if (isHome) this.score.home++; else this.score.away++;
        }
        if (type === 'own_goal' || type === 'goal_opponent') {
            // Opponent scored (or we scored in own net)
            if (isHome) this.score.away++; else this.score.home++;
        }

        return entry;
    },

    removeLog(id) {
        const log = this.logs.find(x => x.id === id);
        if (log) {
            const isHome = this.config.isHomeGame;

            if (log.type === 'goal') {
                if (isHome) this.score.home--; else this.score.away--;
            }
            if (log.type === 'own_goal' || log.type === 'goal_opponent' || log.type === 'goal_away') {
                if (isHome) this.score.away--; else this.score.home--;
            }

            this.logs = this.logs.filter(x => x.id !== id);
            this.saveSession(); // Auto-save
        }
        return log;
    },

    // --- Persistence & Sync ---
    saveSession() {
        const session = {
            config: this.config,
            currentFormation: this.currentFormation,
            lineupIds: this.lineupIds,
            customPositions: this.customPositions,
            match: {
                period: this.match.period,
                accumulatedMs: this.match.accumulatedMs,
                displayMs: this.match.displayMs,
                startTime: this.match.startTime,
                isRunning: this.match.isRunning
            },
            score: this.score,
            logs: this.logs,
            score: this.score,
            logs: this.logs,
            squad: this.squad,
            kitColors: this.kitColors
            // Drawings logic could be synced too if accessible from State,  
            // but drawings paths are inside MoncofaApp.Drawing.paths.
            // For now syncing core state.
        };
        try {
            localStorage.setItem('moncofa_session', JSON.stringify(session));
            this.saveCloudSession(session);
        } catch (e) { console.error("Session Save Error", e); }
    },

    saveCloudSession(session) {
        if (!this.supabase) return;

        // Debounce to avoid flooding DB
        if (this.saveCloudTimeout) clearTimeout(this.saveCloudTimeout);

        this.saveCloudTimeout = setTimeout(async () => {
            const { error } = await this.supabase
                .from('match_sessions')
                .upsert({ id: 'live', state: session, client_id: this.clientId }, { onConflict: 'id' });

            if (error) console.error("Cloud Sync Error:", error);
            else console.log("Cloud Sync saved");
        }, 300); // 300ms debounce
    },

    async loadCloudSession() {
        if (!this.supabase) return;
        // Fetch on init
        const { data, error } = await this.supabase
            .from('match_sessions')
            .select('state')
            .eq('id', 'live')
            .single();

        if (data && data.state) {
            console.log("Downloading Initial Cloud State...");
            this.applyRemoteState(data.state);
        }
    },

    applyRemoteState(session) {
        if (!session) return;

        // Merge State
        this.config = { ...this.config, ...session.config };
        this.currentFormation = session.currentFormation || this.currentFormation;
        this.lineupIds = session.lineupIds || Array(11).fill(null);
        this.customPositions = session.customPositions || {};
        this.score = session.score || { home: 0, away: 0 };
        this.logs = session.logs || [];
        if (session.squad) this.squad = session.squad;

        // Apply Kit Colors FIRST (before render)
        if (session.kitColors) {
            try {
                this.kitColors = session.kitColors; // Sync memory
                Object.keys(session.kitColors).forEach(key => document.documentElement.style.setProperty(key, session.kitColors[key]));
                localStorage.setItem('moncofa_kit_colors', JSON.stringify(session.kitColors));
            } catch (e) { console.error("Error syncing kit colors", e); }
        }

        // Match Logic (Tricky to sync timers, but basic vars ok)
        if (session.match) {
            // We just trust the cloud time?
            // If running, we might face race conditions, but for now take it.
            this.match.period = session.match.period;
            this.match.isRunning = session.match.isRunning;
            this.match.startTime = session.match.startTime;
            this.match.accumulatedMs = session.match.accumulatedMs;

            // Recalculate displayMs if running to avoid glitches?
            // UI.updateScoreBoard handles displayMs from State
            if (!this.match.isRunning) this.match.displayMs = session.match.displayMs;
        }

        // Apply to UI
        MoncofaApp.UI.init();
        MoncofaApp.UI.renderPitch();
        MoncofaApp.UI.updateAll();

        // Also save to local to keep in sync if offline next time
        localStorage.setItem('moncofa_session', JSON.stringify(session));
    },

    loadSession() {
        try {
            const saved = localStorage.getItem('moncofa_session');
            if (saved) {
                const session = JSON.parse(saved);

                this.config = { ...this.config, ...session.config };
                this.currentFormation = session.currentFormation || this.currentFormation;
                this.lineupIds = session.lineupIds || Array(11).fill(null);
                this.customPositions = session.customPositions || {};
                this.score = session.score || { home: 0, away: 0 };
                this.logs = session.logs || [];
                if (session.squad) this.squad = session.squad;

                // Load Kit Colors from session if available
                if (session.kitColors) this.kitColors = session.kitColors;
                // Determine if we need to apply them to DOM (handled in Main.loadSavedKit usually but good here too)

                if (session.match) {
                    this.match.period = session.match.period;
                    this.match.accumulatedMs = session.match.accumulatedMs;

                    if (session.match.isRunning && session.match.startTime) {
                        // "Catch up" timestamp logic:
                        // accumulatedMs stored the time UP TO the last start.
                        // We need to add (Now - startTime) to it.
                        const now = Date.now();
                        const diff = now - session.match.startTime;
                        // Avoid resuming with crazy times (e.g. > 24h?) - Assuming valid range
                        this.match.accumulatedMs += diff;
                        this.match.startTime = now; // Resume effectively from now with new base
                        this.match.isRunning = true;
                        this.match.displayMs = this.match.accumulatedMs;
                    } else {
                        this.match.displayMs = session.match.displayMs;
                        this.match.isRunning = false;
                        this.match.startTime = null;
                    }
                }
                return true;
            }
        } catch (e) { console.error("Session Load Error", e); }
        return false;
    },

    clearSession() {
        if (confirm("¿Estás seguro de que quieres empezar un NUEVO PARTIDO? Se borrará todo el progreso actual.")) {
            // 1. Clear Storage
            localStorage.removeItem('moncofa_session');

            // 2. Reset Memory State
            this.match = {
                period: 1,
                isRunning: false,
                startTime: null,
                accumulatedMs: 0,
                displayMs: 0,
                intervalId: null
            };
            this.score = { home: 0, away: 0 };
            this.logs = [];
            this.lineupIds = Array(11).fill(null);
            this.customPositions = {};
            // Keep Squad options, but reset lineup selections
            // Reset player 'calledUp' status if we want a full wipe? 
            // Usually "New Match" keeps the squad but resets the game events.
            // If we want a FULL FULL reset, we might want to re-load squad from constants.
            // But usually user wants to keep the players availability.

            // However, to be safe and mimic reload:
            // Reload keeps LocalStorage 'moncofa_squad' but 'moncofa_session' is gone.

            // 3. Clear Cloud
            if (this.supabase) {
                this.supabase.from('match_sessions').delete().eq('id', 'live').then(() => console.log("Cloud cleared"));
            }

            // 4. Re-Render
            MoncofaApp.UI.init();
            MoncofaApp.UI.renderPitch();
            MoncofaApp.UI.updateAll();

            alert("Partido reiniciado.");
        }
    }
};

// Utils Namespace for helpers needed by State or UI
MoncofaApp.Utils = {
    formatTime(ms) {
        const totalSeconds = Math.floor(ms / 1000);
        // Limit is always 25 minutes (1500 seconds)
        const limit = 1500;

        if (totalSeconds <= limit) {
            const mins = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
            const secs = (totalSeconds % 60).toString().padStart(2, '0');
            return { t: `${mins}:${secs}`, isAddedTime: false };
        } else {
            // Added time
            const addedSeconds = totalSeconds - limit;
            const addedMins = Math.floor(addedSeconds / 60);
            const addedSecs = (addedSeconds % 60).toString().padStart(2, '0');
            return { t: `25:00 +${addedMins}:${addedSecs}`, isAddedTime: true };
        }
    },

    getCssVar(name) {
        return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    }
};
