import { WebSocketServer, WebSocket } from 'ws';
import { parse } from 'url';
import { randomUUID } from 'crypto';

//future update : add jwt token to verify the access during upgradation

const PORT = Number(process.env.PORT) || 8080;
const FRONTEND_URL = process.env.FRONTEND_URL;

const wss = new WebSocketServer({
    port: PORT,
    verifyClient: (info, callback) => {
        const origin = info.origin;
        if (FRONTEND_URL && origin !== FRONTEND_URL) {
            console.warn(`Rejected connection from unauthorized origin: ${origin}`);
            callback(false, 403, 'Forbidden');
            return;
        }
        callback(true);
    }
});

const spaces: Record<string, Record<string, any>> = {};

wss.on('connection', (ws: WebSocket, req) => {

    const { query } = parse(req.url || '', true);
    const spaceId = query.spaceId as string;
    const sprite = query.sprite as string || 'harry'; // NEW: Get the sprite from the URL

    if (!spaceId) {
        ws.close(1008, "spaceId is required");
        return;
    }

    const playerId = randomUUID();

    if (!spaces[spaceId]) {
        spaces[spaceId] = {};
    }

    spaces[spaceId][playerId] = {
        ws: ws,
        x: 100,
        y: 290,
        anim: '',
        sprite: sprite // NEW: Save the sprite in the server state
    };

    console.log(`[${spaceId}] Player ${playerId} (${sprite}) joined.`); // Helpful for debugging

    // NEW: Update the typescript type to include sprite
    const playersList: Record<string, { x: number, y: number, anim: string, sprite: string }> = {};
    for (const id in spaces[spaceId]) {
        const p = spaces[spaceId][id];
        // NEW: Include the sprite in the init list
        playersList[id] = { x: p.x, y: p.y, anim: p.anim, sprite: p.sprite };
    }

    ws.send(JSON.stringify({
        type: 'init',
        id: playerId,
        players: playersList
    }));

    broadcastToSpace(spaceId, playerId, {
        type: 'player_joined',
        id: playerId,
        // NEW: Tell everyone else which sprite this new player is
        player: { x: 100, y: 290, anim: '', sprite: sprite }
    });

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message.toString());

            if (data.type === 'move') {
                const player = spaces[spaceId][playerId];
                if (player) {
                    player.x = data.x;
                    player.y = data.y;
                    player.anim = data.anim;

                    broadcastToSpace(spaceId, playerId, {
                        type: 'player_moved',
                        id: playerId,
                        x: data.x,
                        y: data.y,
                        anim: data.anim
                    });
                }
            }
            else if (data.type === 'offer' || data.type === 'answer' || data.type === 'ice-candidate') {
                const targetId = data.targetId;

                if (targetId && spaces[spaceId][targetId]) {
                    const targetWs = spaces[spaceId][targetId].ws;

                    if (targetWs.readyState === WebSocket.OPEN) {
                        targetWs.send(JSON.stringify(data));
                    }
                }
            }
        } catch (err) {
            console.error("Invalid message format received", err);
        }
    });

    ws.on('close', () => {
        if (spaces[spaceId] && spaces[spaceId][playerId]) {
            console.log(`[${spaceId}] Player ${playerId} left.`);
            delete spaces[spaceId][playerId];

            broadcastToSpace(spaceId, playerId, {
                type: 'player_left',
                id: playerId
            });

            if (Object.keys(spaces[spaceId]).length === 0) {
                console.log(`[${spaceId}] Space empty. Closing room.`);
                delete spaces[spaceId];
            }
        }
    });
});

function broadcastToSpace(spaceId: string, excludePlayerId: string, payload: any) {
    const space = spaces[spaceId];
    if (!space) return;

    const messageString = JSON.stringify(payload);

    for (const id in space) {
        if (id !== excludePlayerId) {
            const clientWs = space[id].ws;
            if (clientWs.readyState === WebSocket.OPEN) {
                clientWs.send(messageString);
            }
        }
    }
}

console.log('WebSocket server is running on PORT : 8080');