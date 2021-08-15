
import MatterEntity from "./MatterEntity.js";
import Projectile from "./Projectile.js";
import items from "../lists/items.js";

export default class Player extends MatterEntity {
    constructor(data) {
        let { scene, x, y, texture, frame } = data;
        super({ ...data, health: 20, drops: [], name: 'player' });
        this.scene = scene;
        this.touching = [];
        this.isDashing = false;
        this.dashingCooldown = false;
        this.dashVector = new Phaser.Math.Vector2();
        this.isAttacking = false;
        this.attackingCooldown = false;
        this.attackAngle = 0;
        this.bowCharging = 0;
        this.inputMouse = this.scene.input.activePointer;
        this.particleXOffset = 5;
        //this.inventory = new Inventory();

        //Weapon
        this.holdingWeapon = items.basic_sword;
        this.changeWeapon(this.holdingWeapon);

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

    }

    static preload(scene) {
        //scene.load.audio('player', 'assets/audio/player.wav');
    }

    update() {
        if (this.dead) return;
        let speed = 3.5;
        this.playerVelocity = new Phaser.Math.Vector2();
        this.playerAimVector = new Phaser.Math.Vector2();
        this.gamepad = this.scene.input.gamepad;
        if (this.gamepad.total) {
            this.playerVelocity.x = this.gamepad.getPad(0).leftStick.x;
            this.playerVelocity.y = this.gamepad.getPad(0).leftStick.y;
            this.playerAimVector.x = this.gamepad.getPad(0).rightStick.x;
            this.playerAimVector.y = this.gamepad.getPad(0).rightStick.y;
            this.gamepad.on('down', (pad, button, value) => {
                this.gamepadActive = pad;
                switch (button.index) {
                    case 4: //L1
                        this.gamePad_L1 = true;
                        break;
                    case 5: //L2
                        this.gamePad_ATTACK = true;
                    break;
                    case 6: //L2
                        this.gamePad_DASH = true;
                        break;
                    case 7: //R2
                        this.gamePad_R2 = true;
                        break;
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
            this.gamepad.on('up', (pad, button, value) => {
                switch (button.index) {
                    case 4: //L1
                        this.gamePad_L1 = false;
                        break;
                    case 5: //L2
                        this.gamePad_ATTACK = false;
                        break;
                    case 6: //L2
                        this.gamePad_DASH = false;
                        break;
                    case 7: //R2
                        this.gamePad_R2 = false;
                        break;
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


            if (!this.dead) {
                this.setFlipX(this.playerAimVector.x < 0);
                if (this.flipX) {

                    this.particleXOffset = 5;
                } else {
                    this.particleXOffset = -5;
                }
            }
        }

        if (!this.isDashing) {
            this.dashVector = this.playerVelocity;
        }

        if (this.gamePad_L1) {
            switch (this.holdingWeapon.weapon_behaviour) {
                case "sword":
                    this.holdingWeapon = items.basic_bow;
                    break;
                case "bow":
                    this.holdingWeapon = items.basic_staff;
                    break;
                case "spell":
                    this.holdingWeapon = items.basic_sword;
                    break;
            }
            this.changeWeapon(this.holdingWeapon);
        }

        if (!this.dashingCooldown && (this.gamePad_DASH || this.isDashing)) {
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
                    followOffset: { y: 14, x: this.particleXOffset }
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
            this.playerVelocity.x = this.dashVector.x;
            this.playerVelocity.y = this.dashVector.y;
        }
        this.playerVelocity.normalize();
        this.playerVelocity.scale(speed);
        this.setVelocity(this.playerVelocity.x, this.playerVelocity.y);
        if (Math.abs(this.velocity.x) > 0.1 || Math.abs(this.velocity.y) > 0.1) {
            this.anims.play('walk', true);
        } else {
            this.anims.play('idle', true);
        }
        this.weaponUpdate();
    }

    changeWeapon(weapon) {
        if (this.spriteWeapon) this.spriteWeapon.destroy();
        this.spriteWeapon = new Phaser.GameObjects.Sprite(this.scene, 0, 0, 'items', this.holdingWeapon.frame);
        this.spriteWeapon.setScale(this.holdingWeapon.holding_scale);
        this.spriteWeapon.setOrigin(this.holdingWeapon.holding_origin_x, this.holdingWeapon.holding_origin_y);
        this.scene.add.existing(this.spriteWeapon);
    }

    weaponUpdate() {
        var deg = Phaser.Math.RadToDeg(this.playerAimVector.angle());
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
                if (this.gamePad_ATTACK) {
                    this.bowCharging += 1;
                    console.log(`bowCharging: ${this.bowCharging}`);
                } else {
                    if (this.playerAimVector.x != 0 || this.playerAimVector.y != 0) {
                        if (this.bowCharging >= 10) {
                            this.scene.projectiles.push(new Projectile({ scene: this.scene, x: this.spriteWeapon.x + this.particleXOffset, y: this.spriteWeapon.y, texture: 'items', scale: 0.25, name: 'arrow', frame: 9, velocityVect: this.playerAimVector, speed: 5, parentEntity: this }));

                        }
                    }
                    this.bowCharging = 0;
                }
                break;
            case "sword":
                if (this.gamePad_ATTACK && !this.attackingCooldown) {
                    this.attackingCooldown = true;
                    console.log(`swordAttack: ${this.attackingCooldown}`);
                    // need to change this to create a new mattery entity and insta destory?  or maybe there's a less crappy way
                    /* 
                    const { Body, Bodies } = Phaser.Physics.Matter.Matter;
                    let swordSensor = Bodies.circle(this.spriteWeapon.x + this.particleXOffset, this.spriteWeapon.y, 12, { isSensor: true, label: 'swordSensor' });
                    const swordBody = Body.create({
                        parts: [swordSensor],
                        frictionAir: 0.35,
                    });
                    this.spriteWeapon.setExistingBody(swordBody);*/
                }
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