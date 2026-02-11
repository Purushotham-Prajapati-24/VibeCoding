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

    initialize(v0, angleDeg, gravity, dragCoefficient = 0) {
        this.reset();
        const angleRad = (angleDeg * Math.PI) / 180;
        this.vx = v0 * Math.cos(angleRad);
        this.vy = v0 * Math.sin(angleRad);
        this.g = gravity;
        this.v0 = v0;
        this.angleRad = angleRad;
        this.cd = dragCoefficient; // quadratic drag coefficient (dimensionless, simplified)

        // Push initial state
        this.history.push({ t: 0, x: 0, y: 0, vx: this.vx, vy: this.vy });
    }

    step(dt) {
        // Apply quadratic air drag: a_drag = -Cd * |v| * v (simplified model)
        // This gives deceleration proportional to v² in the direction opposing motion
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);

        let ax = 0;
        let ay = -this.g;

        if (this.cd > 0 && speed > 0.001) {
            // Drag acceleration opposes velocity
            ax -= this.cd * speed * this.vx;
            ay -= this.cd * speed * this.vy;
        }

        // Semi-implicit Euler (velocity first, then position) — more stable than basic Euler
        this.vx += ax * dt;
        this.vy += ay * dt;
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.t += dt;

        // Ground collision
        if (this.y < 0) {
            this.y = 0;
            this.landingPoint = this.x;
            this.vx = 0;
            this.vy = 0;
        }

        // Record history
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
