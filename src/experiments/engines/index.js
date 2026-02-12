
import { calculateProjectile, INITIAL_PROJECTILE_STATE } from './projectileEngine';
import { calculatePendulum, INITIAL_PENDULUM_STATE } from './pendulumEngine';

export const PHYSICS_ENGINES = {
    'projectile': {
        calculate: calculateProjectile,
        initialParams: INITIAL_PROJECTILE_STATE
    },
    'projectile_motion': { // Alias for legacy support
        calculate: calculateProjectile,
        initialParams: INITIAL_PROJECTILE_STATE
    },
    'pendulum': {
        calculate: calculatePendulum,
        initialParams: INITIAL_PENDULUM_STATE
    }
};

export const getEngine = (type) => {
    return PHYSICS_ENGINES[type] || PHYSICS_ENGINES['projectile'];
};
