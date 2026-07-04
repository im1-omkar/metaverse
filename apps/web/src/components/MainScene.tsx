'use client'

import Phaser from "phaser"

export const initializeGame = ()=>{

    const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        width: 800,
        height: 600,
        parent: 'game-container',
        physics: {
            default: "arcade",
            arcade: {
                gravity: { x: 0, y: 300 },
                debug: false, // turn this on temporarily 👀
            },
        },
        scene: {
            preload: preload,
            create: create,
            update: update
        }
    };

    const game = new Phaser.Game(config);

    function preload(this:Phaser.Scene) {

        this.load.image("sky", "../assets/sky.png");
        this.load.image("ground", "../assets/platform.png");
        this.load.image("star", "../assets/star.png");
        this.load.image("bomb", "../assets/bomb.png");
        this.load.spritesheet("dude", "../assets/dude.png", {
            frameWidth: 32,
            frameHeight: 48,
        });

    }

    let platforms: Phaser.Physics.Arcade.StaticGroup;

    let player: Phaser.Physics.Arcade.Sprite;

    let cursors: Phaser.Types.Input.Keyboard.CursorKeys;

    let stars: Phaser.Physics.Arcade.Group;

    let score = 0; // TypeScript infers number

    let scoreText: Phaser.GameObjects.Text;

    const goLeft = true; // TypeScript infers boolean


    function create(this:Phaser.Scene) {

        this.add.image(400, 300, 'sky');

        platforms = this.physics.add.staticGroup();

        platforms.create(400, 568, 'ground').setScale(2).refreshBody();

        platforms.create(600, 400, 'ground');
        platforms.create(50, 250, 'ground');
        platforms.create(750, 220, 'ground');

        player = this.physics.add.sprite(100, 450, 'dude');

        player.setBounce(0.1);
        player.setCollideWorldBounds(true);

        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'turn',
            frames: [{ key: 'dude', frame: 4 }],
            frameRate: 20
        });

        console.log(this.anims.exists("turn"));
        console.log(this.anims.exists("left"));
        console.log(this.anims.exists("right"));

        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
            frameRate: 10,
            repeat: -1
        });

        this.physics.add.collider(player, platforms);

        cursors = this.input.keyboard!.createCursorKeys();


        stars = this.physics.add.group({
            key: 'star',
            repeat: 11,
            setXY: { x: 12, y: 0, stepX: 70 }
        });

        stars.getChildren().forEach( (child)=>{
            const star = child as Phaser.Physics.Arcade.Sprite;

            star.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));

        });

        this.physics.add.collider(stars, platforms)
        this.physics.add.overlap(player, stars, collectStar, undefined, this);

        scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px' });

    }

    function collectStar(
        object1:
            | Phaser.Types.Physics.Arcade.GameObjectWithBody
            | Phaser.Physics.Arcade.Body
            | Phaser.Physics.Arcade.StaticBody
            | Phaser.Tilemaps.Tile,
        object2:
            | Phaser.Types.Physics.Arcade.GameObjectWithBody
            | Phaser.Physics.Arcade.Body
            | Phaser.Physics.Arcade.StaticBody
            | Phaser.Tilemaps.Tile
    ) {
        const player = object1 as Phaser.Physics.Arcade.Sprite;
        const star = object2 as Phaser.Physics.Arcade.Sprite;

        star.disableBody(true, true);

        score += 10;
        scoreText.setText(`Score: ${score}`);
    }


    function update(this : Phaser.Scene) {
        if (cursors.left.isDown) {
            player.setVelocityX(-160);

            player.anims.play('left', true);
        }
        else if (cursors.right.isDown) {
            player.setVelocityX(160);

            player.anims.play('right', true);
        }
        else {
            player.setVelocityX(0);

            player.anims.play('turn');
        }

        if (cursors.up.isDown   && player.body!.touching.down) {
            player.setVelocityY(-330);
        }
    }

    return () => {
        game.destroy(true)
    }

}
