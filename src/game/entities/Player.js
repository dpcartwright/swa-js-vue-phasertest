
import MatterEntity from "./MatterEntity.js";
import items from "../lists/items.js";

export default class Player extends MatterEntity {
    constructor(data) {
        let { scene, x, y, texture, frame } = data;
        super({ ...data, health: 20, drops: [], name: 'player' });
        this.scene = scene;
        this.touching = [];
        this.isDashing = false;
        this.dashingCooldown = false;
        this.dashAngle = '';
        this.isAttacking = false;
        this.attackingCooldown = false;
        this.attackAngle = 0;
        this.bowCharging = 0;
        this.inputMouse = this.scene.input.activePointer;
        //this.inventory = new Inventory();

        //Weapon
        this.holdingWeapon = items.basic_bow;

        this.spriteWeapon = new Phaser.GameObjects.Sprite(this.scene, 0, 0, 'items', this.holdingWeapon.frame);
        this.spriteWeapon.setScale(this.holdingWeapon.holding_scale);
        this.spriteWeapon.setOrigin(this.holdingWeapon.holding_origin_x, this.holdingWeapon.holding_origin_y);
        this.scene.add.existing(this.spriteWeapon);

        const { Body, Bodies } = Phaser.Physics.Matter.Matter;
        var playerCollider = Bodies.circle(this.x, this.y + 10, 10, { isSensor: false, label: 'playerCollider' });
        var playerSensor = Bodies.circle(this.x, this.y, 12, { isSensor: true, label: 'playerSensor' });
        const compoundBody = Body.create({
            parts: [playerCollider, playerSensor],
            frictionAir: 0.35,
        });
        this.setExistingBody(compoundBody);
        this.setFixedRotation();
        this.CreateMiningCollisions(playerSensor);
        this.CreatePickupCollisions(playerCollider);

        this.scene.input.on('pointermove', pointer => { if (!this.dead) this.setFlipX(pointer.worldX < this.x) });
    }

    static preload(scene) {
        //scene.load.audio('player', 'assets/audio/player.wav');
    }

    update() {
        if (this.dead) return;
        if (this.scene.input.gamepad.total) {
            this.scene.input.gamepad.on('down', (pad, button, value) => {
                switch (button.index) {
                    case 12: //up
                        this.gamePadDPAD_UP = true;
                        break;
                    case 13: // down
                        this.gamePadDPAD_DOWN = true;
                        break;
                    case 14: // left
                        this.gamePadDPAD_LEFT = true;
                        break;
                    case 15: // right
                        this.gamePadDPAD_RIGHT = true;
                        break;
                }
            });
            this.scene.input.gamepad.on('up', (pad, button, value) => {
                switch (button.index) {
                    case 12: //up
                        this.gamePadDPAD_UP = false;
                        break;
                    case 13: // down
                        this.gamePadDPAD_DOWN = false;
                        break;
                    case 14: // left
                        this.gamePadDPAD_LEFT = false;
                        break;
                    case 15: // right
                        this.gamePadDPAD_RIGHT = false;
                        break;
                }
            });
        }
        let speed = 2.5;
        let playerVelocity = new Phaser.Math.Vector2();
        if (!this.isDashing) {
            this.dashAngle = Phaser.Math.Angle.BetweenPoints(this.position, { x: this.scene.input.activePointer.worldX, y: this.scene.input.activePointer.worldY });
        }
        if (!this.dashingCooldown && (this.inputKeys.dash.isDown || this.isDashing)) {
            if (!this.isDashing) {
                let particles = this.scene.add.particles('smoke');

                particles.createEmitter({
                    quantity: 10,
                    speedY: { min: 20, max: 50 },
                    speedX: { min: 20, max: 50 },
                    accelerationY: 1000,
                    lifespan: { min: 100, max: 300 },
                    alpha: { start: 0.5, end: 0, ease: "Sine.ease" },
                    scale: { start: 0.005, end: 0.0005 },
                    blendMode: 'ADD',
                    frequency: 50,
                    follow: this,
                    followOffset: { y: 14, x: -5 }
                })

                setTimeout(() => {
                    particles.destroy();
                    this.isDashing = false;
                    this.dashingCooldown = true;
                    setTimeout(() => this.dashingCooldown = false, 1000);
                }, 250);
            }
            this.isDashing = true;
            speed = 5.5;
            playerVelocity.setToPolar(this.dashAngle);
        } else {
            if (this.inputKeys.left.isDown || this.gamePadDPAD_LEFT) {
                playerVelocity.x = -1;
            } else if (this.inputKeys.right.isDown || this.gamePadDPAD_RIGHT) {
                playerVelocity.x = 1;
            }
            if (this.inputKeys.up.isDown || this.gamePadDPAD_UP) {
                playerVelocity.y = -1;
            } else if (this.inputKeys.down.isDown || this.gamePadDPAD_DOWN) {
                playerVelocity.y = 1;
            }
        }
        playerVelocity.normalize();
        playerVelocity.scale(speed);
        this.setVelocity(playerVelocity.x, playerVelocity.y);
        if (Math.abs(this.velocity.x) > 0.1 || Math.abs(this.velocity.y) > 0.1) {
            this.anims.play('walk', true);
        } else {
            this.anims.play('idle', true);
        }
        this.weaponUpdate();
        //console.log(this.leftMouseDown);
        //console.log(this.rightMouseDown);
    }

    weaponUpdate() {
        let aimingDirection = Phaser.Math.Angle.BetweenPoints(this.position, { x: this.scene.input.activePointer.worldX, y: this.scene.input.activePointer.worldY });
        var deg = Phaser.Math.RadToDeg(aimingDirection);
        if (!this.flipX) {
            this.spriteWeapon.setOrigin(this.holdingWeapon.holding_origin_x, this.holdingWeapon.holding_origin_y);
            this.spriteWeapon.setAngle(this.holdingWeapon.holding_angle + deg);
            this.spriteWeapon.setPosition(this.x + this.holdingWeapon.holding_offset_x, this.y + this.holdingWeapon.holding_offset_y);
        } else {
            this.spriteWeapon.setOrigin(this.holdingWeapon.holding_origin_x_flipped, this.holdingWeapon.holding_origin_y_flipped);
            this.spriteWeapon.setAngle(this.holdingWeapon.holding_angle_flipped + deg);
            this.spriteWeapon.setPosition(this.x + this.holdingWeapon.holding_offset_x_flipped, this.y + this.holdingWeapon.holding_offset_y_flipped);
        }
        switch (this.holdingWeapon.weapon_behaviour) {
            case "bow":
                this.aimingAngle = Phaser.Math.Angle.BetweenPoints(this.position, { x: this.scene.input.activePointer.worldX, y: this.scene.input.activePointer.worldY });
                if (this.inputMouse.buttons === 1) {
                    this.bowCharging += 1; // left click
                    console.log(`bowCharging: ${this.bowCharging}`);
                }
                /*
                let speed = 3;
                let angle = Phaser.Math.Angle.BetweenPoints(this.position, { x: this.scene.input.activePointer.worldX, y: this.scene.input.activePointer.worldY });
                const velocityVect = new Phaser.Math.Vector2();
                velocityVect.setToPolar(angle);

                this.scene.projectiles.push(new Projectile({ scene: this.scene, x: this.x, y: this.y, texture: 'projectiles', frame: `${name}_1_1`, scale: 0.5, angle: angle, name: projectileType, velocityVect: velocityVect, speed: speed, parentEntity: this }));
                */
                break;
            case "sword":
                break;
            case "spell":
                break;
        }

    }

    CreateMiningCollisions(playerSensor) {
        this.scene.matterCollision.addOnCollideStart({
            objectA: [playerSensor],
            callback: other => {
                if (other.bodyB.isSensor) return;
                this.touching.push(other.gameObjectB);
                console.log(this.touching.length, other.gameObjectB.name);
            },
            context: this.scene,
        });
        this.scene.matterCollision.addOnCollideEnd({
            objectA: [playerSensor],
            callback: other => {
                this.touching = this.touching.filter(gameObject => gameObject != other.gameObjectB);
            },
            context: this.scene,
        });
    }

    onDeath = () => {
        this.anims.stop();
        this.setTexture('items', 0);
        this.setOrigin(0.5);
        this.spriteWeapon.destroy();

    }

    CreatePickupCollisions(playerCollider) {
        this.scene.matterCollision.addOnCollideStart({
            objectA: [playerCollider],
            callback: other => {
                if (other.gameObjectB && other.gameObjectB.pickup) other.gameObjectB.pickup();
            },
            context: this.scene,
        });
        this.scene.matterCollision.addOnCollideActive({
            objectA: [playerCollider],
            callback: other => {
                if (other.gameObjectB && other.gameObjectB.pickup) other.gameObjectB.pickup();
            },
            context: this.scene,
        });
    }

    whackStuff() {
        this.touching = this.touching.filter(gameObject => gameObject.hit && !gameObject.dead);
        this.touching.forEach(gameObject => {
            gameObject.hit();
            if (gameObject.dead) gameObject.destroy();
        })
    }

    shootStuff(projectileType) {
        let speed = 3;
        let angle = Phaser.Math.Angle.BetweenPoints(this.position, { x: this.scene.input.activePointer.worldX, y: this.scene.input.activePointer.worldY });
        const velocityVect = new Phaser.Math.Vector2();
        velocityVect.setToPolar(angle);

        this.scene.projectiles.push(new Projectile({ scene: this.scene, x: this.x, y: this.y, texture: 'projectiles', frame: `${name}_1_1`, scale: 0.5, angle: angle, name: projectileType, velocityVect: velocityVect, speed: speed, parentEntity: this }));
    }
}