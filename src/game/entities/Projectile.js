import MatterEntity from "./MatterEntity.js";

export default class Projectile extends MatterEntity {

    static preload(scene) {
        scene.load.atlas('projectile', 'assets/images/projectile.png', 'assets/images/projectile_atlas.json');
        scene.load.animation('projectile_anim', 'assets/images/projectile_anim.json');
        scene.load.audio('fireball', 'assets/audio/fireball.wav');
        scene.load.audio('iceball', 'assets/audio/iceball.wav');
        scene.load.audio('shadowball', 'assets/audio/shadowball.wav');
    }

    constructor(data) {
        let { scene, x, y, texture, frame, projectile, velocityVect, scale, angle, name, speed, parentEntity } = data;
        super({ scene, x: x, y: y, texture: 'projectile', frame: `${name}_1_1`, name: name });
        this.setScale(scale);
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.speed = speed;
        this.scene = scene;
        this.velocityVect = velocityVect;
        this.parentEntity = parentEntity;
        const { Bodies } = Phaser.Physics.Matter.Matter;
        var projectileSensor = Bodies.circle(this.x, this.y, 5, { isSensor: true, label: 'projectileSensor' });
        this.setExistingBody(projectileSensor);


        this.scene.matterCollision.addOnCollideStart({
            objectA: [projectileSensor],
            callback: other => {
                if (other.bodyB.isSensor) return;
                if (other.gameObjectB && other.gameObjectB.name != 'player' && other.gameObjectB.name != 'item') this.impact(other.gameObjectB);
            },
            context: this.scene,
        });
        this.scene.matterCollision.addOnCollideActive({
            objectA: [projectileSensor],
            callback: other => {
                if (other.bodyB.isSensor) return;
                if (other.gameObjectB && other.gameObjectB.name != 'player' && other.gameObjectB.name != 'item') this.impact(other.gameObjectB);
            },
            context: this.scene,
        });

        this.setRotation(angle);
    }

    impact = (target) => {
        if (target.dead || this.dead) {
            return;
        }
        target.agro = this.parentEntity;
        target.hit?.(); //only call method if it exists
        if (target.dead) target.destroy();
        this.health = 0;
        this.destroy();
    }

    update() {
        if (this.dead) return;
        this.anims.play(`${this.name}`, true);
        this.setVelocityX(this.velocityVect.x * this.speed);
        this.setVelocityY(this.velocityVect.y * this.speed);
    }

}