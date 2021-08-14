import MatterEntity from "./MatterEntity.js";

export default class Projectile extends MatterEntity {

    static preload(scene) {
    }

    constructor(data) {
        let { scene, x, y, texture, frame, projectile, velocityVect, scale, name, speed, parentEntity } = data;
        super({ scene, x: x, y: y, texture: 'items', name: name, frame });
        this.setScale(scale);
        this.x = x;
        this.y = y;
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

        this.setAngle(Phaser.Math.RadToDeg(this.velocityVect.angle()) + 120);
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
        this.setVelocityX(this.velocityVect.x * this.speed);
        this.setVelocityY(this.velocityVect.y * this.speed);
    }

}