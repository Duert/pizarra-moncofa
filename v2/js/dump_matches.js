const Dexie = require('dexie');
const db = new Dexie('MoncofaAppDB');
db.version(2).stores({
    matches: '++id, seasonId, matchday, rivalName, isPlayed',
    player_stats: '++id, matchId, playerId, seasonId'
});

async function dump() {
    const matches = await db.matches.toArray();
    console.log(JSON.stringify(matches, null, 2));
    process.exit(0);
}
// This won't work easily because I don't have Node with Dexie installed here.
// I'll use the browser instead.
