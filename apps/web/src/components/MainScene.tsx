'use client'
import Phaser from "phaser"
import { MapData } from "@/lib/store";

export const initializeGame = (spaceId: string, mapData: MapData) => {

    const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        width: mapData.width || 800,
        height: mapData.height || 600,
        parent: 'game-container',
        physics: mapData.physics || {
            default: 'arcade',
            arcade: { gravity: { x: 0, y: 0 }, debug: true }
        },
        scene: {
            preload: preload,
            create: create,
            update: update
        }
    };

    const game = new Phaser.Game(config);


    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080";
    let ws: WebSocket;

    const otherPlayers: Record<string, Phaser.Physics.Arcade.Sprite> = {};
    let myId: string | null = null;
    let lastMoveData = { x: -1, y: -1, anim: '' };

    let walls: Phaser.Physics.Arcade.StaticGroup;
    let computers: Phaser.Physics.Arcade.StaticGroup;
    let player: Phaser.Physics.Arcade.Sprite;
    let cursors: Phaser.Types.Input.Keyboard.CursorKeys;

    function preload(this: Phaser.Scene) {
        if (mapData.images) {
            mapData.images.forEach((image) => {
                if (image) this.load.image(image.name, image.url);
            });
        }
        if (mapData.sprite) {
            mapData.sprite.forEach((sprite) => {
                if (sprite && sprite.configs) {
                    this.load.spritesheet(sprite.name, sprite.url, sprite.configs);
                }
            });
        }
    }

    function create(this: Phaser.Scene) {
        walls = this.physics.add.staticGroup();
        computers = this.physics.add.staticGroup();

        this.add.image(400, 300, "grey-bg").setScale(1.3);

        //room creation logic
        function createRoom(this: Phaser.Scene, x: number, y: number, w: number, h: number, doorOnTop: boolean = false) {
            const SCALE = 0.3;
            const tile = 64 * SCALE;
            const doorStart = Math.floor(w / 2) - 1;
            const doorEnd = doorStart + 2;

            for (let i = 0; i < w; i++) {
                if (!doorOnTop || i < doorStart || i > doorEnd) {
                    const wall = walls.create(x + i * tile, y, "walls", 0).setOrigin(0).setScale(SCALE);
                    wall.refreshBody();
                }
                if (doorOnTop || i < doorStart || i > doorEnd) {
                    const wall = walls.create(x + i * tile, y + (h - 1) * tile, "walls", 0).setOrigin(0).setScale(SCALE);
                    wall.refreshBody();
                }
            }
            for (let i = 1; i < h - 1; i++) {
                const leftWall = walls.create(x, y + i * tile, "walls", 0).setOrigin(0).setScale(SCALE);
                leftWall.refreshBody();
                const rightWall = walls.create(x + (w - 1) * tile, y + i * tile, "walls", 0).setOrigin(0).setScale(SCALE);
                rightWall.refreshBody();
            }
        }

        createRoom.call(this, 64, 64, 14, 9);
        createRoom.call(this, 448, 64, 14, 9);
        createRoom.call(this, 64, 352, 14, 9, true);
        createRoom.call(this, 448, 352, 14, 9, true);

        computers.create(130, 120, 'computers', 0);
        computers.create(260, 120, 'computers', 1);
        computers.create(570, 120, 'computers', 1);
        computers.create(180, 460, 'computers', 2);
        computers.create(580, 460, 'computers', 3);

        player = this.physics.add.sprite(100, 290, 'harry');
        player.setBounce(0);
        player.setCollideWorldBounds(true);

        this.anims.create({ 
            key: 'turn', frames: [{ key: 'harry', frame: 4 }], 
            frameRate: 20 
        });
        this.anims.create({ 
            key: "walk-down", 
            frames: this.anims.generateFrameNumbers("harry", { start: 43, end: 49 }), 
            frameRate: 10, 
            repeat: -1 
        });
        this.anims.create({ 
            key: "walk-left", 
            frames: this.anims.generateFrameNumbers("harry", { start: 36, end: 41 }), 
            frameRate: 10, 
            repeat: -1 
        });
        this.anims.create({ 
            key: "walk-right", 
            frames: this.anims.generateFrameNumbers("harry", { start: 24, end: 29 }), 
            frameRate: 10, repeat: -1 
        });
        this.anims.create({ 
            key: "walk-up", 
            frames: this.anims.generateFrameNumbers("harry", { start: 30, end: 35 }), 
            frameRate: 10, repeat: -1 
        });

        cursors = this.input.keyboard!.createCursorKeys();
        this.physics.add.collider(player, walls);
        this.physics.add.collider(player, computers);

        ws = new WebSocket(`${wsUrl}?spaceId=${spaceId}`);

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);

            switch (data.type) {
                case 'init':
                    myId = data.id;
                    Object.keys(data.players).forEach((id) => {
                        if (id !== myId) addOtherPlayer(this, id, data.players[id]);
                    });
                    break;
                case 'player_joined':
                    if (data.id !== myId) addOtherPlayer(this, data.id, data.player);
                    break;
                case 'player_moved':
                    if (otherPlayers[data.id]) {
                        otherPlayers[data.id].setPosition(data.x, data.y);
                        if (data.anim) {
                            otherPlayers[data.id].anims.play(data.anim, true);
                        } else {
                            otherPlayers[data.id].anims.stop();
                        }
                    }
                    break;
                case 'player_left':
                    if (otherPlayers[data.id]) {
                        otherPlayers[data.id].destroy();
                        delete otherPlayers[data.id];
                    }
                    break;
            }
        };
    }

    function addOtherPlayer(scene: Phaser.Scene, id: string, playerInfo: any) {
        const sprite = scene.physics.add.sprite(playerInfo.x, playerInfo.y, 'harry');
        sprite.setCollideWorldBounds(true);
        otherPlayers[id] = sprite;
    }

    function update() {
        const SPEED = 150;
        let vx = 0;
        let vy = 0;
        let currentAnim = '';

        if (cursors.left.isDown) {
            vx = -SPEED; currentAnim = "walk-left"; player.anims.play(currentAnim, true);
        } else if (cursors.right.isDown) {
            vx = SPEED; currentAnim = "walk-right"; player.anims.play(currentAnim, true);
        } else if (cursors.up.isDown) {
            vy = -SPEED; currentAnim = "walk-up"; if (vx === 0) player.anims.play(currentAnim, true);
        } else if (cursors.down.isDown) {
            vy = SPEED; currentAnim = "walk-down"; if (vx === 0) player.anims.play(currentAnim, true);
        }

        if (vx !== 0 && vy !== 0) {
            const factor = Math.SQRT1_2; vx *= factor; vy *= factor;
        }

        player.setVelocity(vx, vy);

        if (vx === 0 && vy === 0) {
            player.anims.stop();
            currentAnim = '';
        }

        if (ws && ws.readyState === WebSocket.OPEN) {
            if (player.x !== lastMoveData.x || player.y !== lastMoveData.y || currentAnim !== lastMoveData.anim) {
                ws.send(JSON.stringify({
                    type: 'move',
                    x: Math.round(player.x),
                    y: Math.round(player.y),
                    anim: currentAnim
                }));
                lastMoveData = { x: player.x, y: player.y, anim: currentAnim };
            }
        }
    }

    return () => {
        if (ws) ws.close(); 
        game.destroy(true);
    }
}