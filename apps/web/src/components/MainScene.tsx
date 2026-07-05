'use client'
import Phaser from "phaser"

const initialState1 = {
    width: 800,
    height: 600,
    physics : {
        default:'arcade',
        arcade: {
            gravity: { x: 0, y: 0 },
            debug: true,
        }
    },
    images : [
        {
            name:'sky', 
            url: '../assets/sky.png'
        },
        {
            name: 'ground',
            url: '../assets/platform.png'
        },
        {
            name: 'star',
            url: '../assets/star.png'
        },
        {
            name: 'bomb',
            url: '../assets/bomb.png'
        }
    ],
    sprite : [
        {
            name: 'dude',
            url: '../assets/dude.png',
            configs: {
                frameWidth: 32,
                frameHeight: 48,
            }
        }
    ]
}

const initialState = {
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { x: 0, y: 0 },
            debug: true,
        }
    },
    images: [
        {
            name:'brick-tiles',
            url:'../assets/tiles/bricks-tiles.png'
        },
        {
            name: 'chair',
            url: '../assets/items/chair.png'
        },
        {
            name :'grey-bg',
            url : '../assets/tiles/grey.png'
        }
    ],
    sprite: [
        {
            name: 'harry',
            url: '../assets/sprites/harry.png',
            configs: {
                frameWidth: 1664/52,
                frameHeight: 48,
            }
        },
        {
            name: 'all-tiles',
            url: '../assets/tiles/all-tiles.png',
            configs : {
                frameWidth : 626/4,
                frameHeight : 626/4
            }
        },
        {
            name: 'walls',
            url: '../assets/tiles/walls.png',
            configs: {
                frameWidth: 64,
                frameHeight: 64
            }
        },
        ,
        {
            name: 'computers',
            url: '../assets/items/computers.png',
            configs : {
                frameWidth: 96,
                frameHeight : 64
            }
        }
    ]
}

export const initializeGame = ()=>{

    const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        width: initialState.width,
        height: initialState.height,
        parent: 'game-container',   
        physics: initialState.physics,
        scene: {
            preload: preload,
            create: create,
            update: update
        }
    };

    const game = new Phaser.Game(config);

    

    function preload(this:Phaser.Scene) {

        initialState.images.forEach((image)=>{
            this.load.image(image.name, image.url);
        })
        initialState.sprite.forEach((sprite)=>{
            this.load.spritesheet(sprite.name, sprite.url,sprite.configs)
        });

    }

    let walls: Phaser.Physics.Arcade.StaticGroup;

    let player: Phaser.Physics.Arcade.Sprite;

    let cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    let keyT : Phaser.Input.Keyboard.Key;
    let stars: Phaser.Physics.Arcade.Group;

    let score = 0; // TypeScript infers number

    let scoreText: Phaser.GameObjects.Text;

    const goLeft = true; // TypeScript infers boolean


    function create(this:Phaser.Scene) {
        walls = this.physics.add.staticGroup();

        this.add.image(400, 300, "grey-bg");

        function createRoom(
            this: Phaser.Scene,
            x: number,
            y: number,
            w: number,
            h: number,
            doorOnTop: boolean = false
        ) {
            const SCALE = 0.3;
            const tile = 64 * SCALE;

            const doorStart = Math.floor(w / 2) - 1;
            const doorEnd = doorStart + 2;

            // Top & Bottom
            for (let i = 0; i < w; i++) {

                // Top wall
                if (!doorOnTop || i < doorStart || i > doorEnd) {
                    const wall = walls.create(x + i * tile, y, "walls", 0)
                        .setOrigin(0)
                        .setScale(SCALE);

                    wall.refreshBody();
                }

                // Bottom wall
                if (doorOnTop || i < doorStart || i > doorEnd) {
                    const wall = walls.create(
                        x + i * tile,
                        y + (h - 1) * tile,
                        "walls",
                        0
                    )
                        .setOrigin(0)
                        .setScale(SCALE);

                    wall.refreshBody();
                }
            }

            // Left & Right
            for (let i = 1; i < h - 1; i++) {

                const leftWall = walls.create(
                    x,
                    y + i * tile,
                    "walls",
                    0
                )
                    .setOrigin(0)
                    .setScale(SCALE);

                leftWall.refreshBody();

                const rightWall = walls.create(
                    x + (w - 1) * tile,
                    y + i * tile,
                    "walls",
                    0
                )
                    .setOrigin(0)
                    .setScale(SCALE);

                rightWall.refreshBody();
            }
        }

        // Top rooms
        createRoom.call(this, 64, 64, 14, 9);
        createRoom.call(this, 448, 64, 14, 9);

        // Bottom rooms
        createRoom.call(this, 64, 352, 14, 9, true);
        createRoom.call(this, 448, 352, 14, 9, true);

        this.physics.add.sprite(130,120,'computers',0)
        this.physics.add.sprite(260, 120, 'computers', 1)
        this.physics.add.sprite(570, 120, 'computers', 1)

        this.physics.add.sprite(180, 460, 'computers', 2)
        this.physics.add.sprite(580, 460, 'computers', 3 )
        // platforms = this.physics.add.staticGroup();

        // platforms.create(400, 568, 'ground').setScale(2).refreshBody();

        // platforms.create(600, 400, 'ground');
        // platforms.create(50, 250, 'ground');
        // platforms.create(750, 220, 'ground');
        

        player = this.physics.add.sprite(100, 450, 'harry');

        player.setBounce(0);
        player.setCollideWorldBounds(true);

        this.anims.create({
            key: 'turn',
            frames: [{ key: 'harry', frame: 4 }],
            frameRate: 20
        });


        this.anims.create({
            key: "walk-down",
            frames: this.anims.generateFrameNumbers("harry", { start: 43, end: 49 }),
            frameRate: 10,
            repeat: -1,
        });

        this.anims.create({
            key: "walk-left",
            frames: this.anims.generateFrameNumbers("harry", { start: 36, end: 41 }),
            frameRate: 10,
            repeat: -1,
        });

        this.anims.create({
            key: "walk-right",
            frames: this.anims.generateFrameNumbers("harry", { start: 24, end: 29 }),
            frameRate: 10,
            repeat: -1,
        });

        this.anims.create({
            key: "walk-up",
            frames: this.anims.generateFrameNumbers("harry", { start: 30, end: 35 }),
            frameRate: 10,
            repeat: -1,
        });

        //this.physics.add.collider(player, platforms);

        cursors = this.input.keyboard!.createCursorKeys();
        keyT = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.T);


       

       

        //this.physics.add.collider(stars, platforms)
        this.physics.add.collider(player, walls);

        scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px' });


    }

    


    function update() {
        const SPEED = 150;

        let vx = 0;
        let vy = 0;

        if (cursors.left.isDown) {
            vx = -SPEED;
            player.anims.play("walk-left", true);
        }
        else if (cursors.right.isDown) {
            vx = SPEED;
            player.anims.play("walk-right", true);
        }

        if (cursors.up.isDown) {
            vy = -SPEED;
            if (vx === 0) player.anims.play("walk-up", true);
        }
        else if (cursors.down.isDown) {
            vy = SPEED;
            if (vx === 0) player.anims.play("walk-down", true);
        }

        // Normalize diagonal movement
        if (vx !== 0 && vy !== 0) {
            const factor = Math.SQRT1_2;
            vx *= factor;
            vy *= factor;
        }

        player.setVelocity(vx, vy);

        if (vx === 0 && vy === 0) {
            player.anims.stop();
        }
    }

    return () => {
        game.destroy(true)
    }

}
