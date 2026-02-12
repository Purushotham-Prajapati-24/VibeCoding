
export class PendulumRealtimeEngine {
    constructor() {
        this.t = 0;
        this.theta = 0; // Angle from vertical (radians)
        this.omega = 0; // Angular velocity (rad/s)
        this.alpha = 0; // Angular acceleration (rad/s^2)
        this.history = [];

        // Params
        this.length = 1;
        this.gravity = 9.81;
        this.damping = 0;
        this.mass = 1;
    }

    initialize(params) {
        this.length = Math.max(0.1, parseFloat(params.length) || 1);
        this.gravity = Math.max(0.1, parseFloat(params.gravity) || 9.81);
        this.mass = parseFloat(params.mass) || 1;
        this.damping = parseFloat(params.damping) || 0;

        const amplitudeDeg = parseFloat(params.amplitude) || 15;
        this.theta = (amplitudeDeg * Math.PI) / 180; // Convert to radians
        this.omega = 0; // Start release from rest

        this.t = 0;
        this.history = [];
        this.saveState();
    }

    reset() {
        this.t = 0;
        this.theta = 0;
        this.omega = 0;
        this.history = [];
    }

    step(dt) {
        // Simple Pendulum Equation (Small Angle approx is theta'' = -g/L * theta)
        // Full Equation: theta'' = -(g/L) * sin(theta) - (damping * theta')

        const g = this.gravity;
        const L = this.length;
        const b = this.damping; // Damping factor

        // Calculate angular acceleration
        // alpha = - (g/L) * sin(theta) - b * omega
        this.alpha = -(g / L) * Math.sin(this.theta) - (b * this.omega);

        // Euler-Cromer integration (more stable than simple Euler for oscillatory)
        this.omega += this.alpha * dt;
        this.theta += this.omega * dt;

        this.t += dt;

        // Save history every few frames to save memory? Or every frame?
        // For projectile we save every frame but only limited history.
        // For pendulum, we might loop forever.

        // Let's save just the last 300 points for a trail?
        this.saveState();

        return {
            t: this.t,
            theta: this.theta,
            omega: this.omega,
            x: L * Math.sin(this.theta), // Cartesian X (0 is center)
            y: L * Math.cos(this.theta)  // Cartesian Y (0 is anchor, positive down)
        };
    }

    saveState() {
        // We can just keep a sliding window of history for the trail
        const x = this.length * Math.sin(this.theta);
        const y = this.length * Math.cos(this.theta);

        this.history.push({ x, y, t: this.t });
        if (this.history.length > 500) {
            this.history.shift();
        }
    }
}
