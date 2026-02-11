export class ProjectileEngine {
    constructor() {
        this.reset();
    }

    reset() {
        this.t = 0;
        this.x = 0;
        this.y = 0;
        this.vx = 0;
        this.vy = 0;
        this.history = []; // Array of {t, x, y, vx, vy}
        this.landingPoint = null;
    }

    initialize(v0, angleDeg, gravity) {
        this.reset();
        const angleRad = (angleDeg * Math.PI) / 180;
        this.vx = v0 * Math.cos(angleRad);
        this.vy = v0 * Math.sin(angleRad);
        this.g = gravity;
        this.v0 = v0;
        this.angleRad = angleRad;

        // Push initial state
        this.history.push({ t: 0, x: 0, y: 0, vx: this.vx, vy: this.vy });
    }

    step(dt) {
        // Basic Euler integration for now (sufficient for simple projectile)
        // x = x + vx * dt
        // vy = vy - g * dt
        // y = y + vy * dt

        this.x += this.vx * dt;
        this.vy -= this.g * dt;
        this.y += this.vy * dt;
        this.t += dt;

        // Ground collision
        if (this.y < 0) {
            this.y = 0;
            this.landingPoint = this.x;
            // Stop simulation in a real engine, or bounce. 
            // For this educational tool, we usually stop or just clamp.
            // Let's bounce with damping for fun? 
            // User said "continuously bouncing" was a bug, so let's STOP at ground for now to be precise.
            this.vx = 0;
            this.vy = 0;
        }

        // Record history for graphs
        // We don't want to record EVERY frame for charts (too much data), maybe every 5th frame?
        // handled by consumer or just record all for now.
        this.history.push({
            t: this.t,
            x: this.x,
            y: this.y,
            vx: this.vx,
            vy: this.vy
        });

        return {
            x: this.x,
            y: this.y,
            vx: this.vx,
            vy: this.vy,
            t: this.t,
            isLanded: this.y <= 0 && this.t > 0
        };
    }
}
