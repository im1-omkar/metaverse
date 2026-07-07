import { WebSocketServer, WebSocket } from 'ws';
import { parse } from 'url';
import { randomUUID } from 'crypto';

const PORT = 8080;
const wss = new WebSocketServer({ port: PORT });



const spaces: Record<string, Record<string, any>> = {};

wss.on('connection', (ws: WebSocket, req) => {
    
    const { query } = parse(req.url || '', true);
    const spaceId = query.spaceId as string;

    
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
        anim: ''
    };

    console.log(`[${spaceId}] Player ${playerId} joined.`);

    
    
    const playersList: Record<string, { x: number, y: number, anim: string }> = {};
    for (const id in spaces[spaceId]) {
        const p = spaces[spaceId][id];
        playersList[id] = { x: p.x, y: p.y, anim: p.anim };
    }

    ws.send(JSON.stringify({
        type: 'init',
        id: playerId,
        players: playersList
    }));

    
    broadcastToSpace(spaceId, playerId, {
        type: 'player_joined',
        id: playerId,
        player: { x: 100, y: 290, anim: '' }
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

console.log(' WebSocket server is running on PORT : 3000')