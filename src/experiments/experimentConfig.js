
import { Activity, Anchor, BarChart2, Circle, CloudRain, Droplet, GitGraph, Globe, Layers, Magnet, Repeat, Sun, Zap, ZoomIn } from 'lucide-react';

export const EXPERIMENTS = [
    {
        id: 'projectile', // The OG
        title: 'Projectile Motion',
        icon: Activity,
        description: 'Explore the kinematics of projectile motion in 2D space.',
        category: 'Kinematics',
        path: '/lab/projectile', // Keeps existing route compatibility if needed, or we migrate
        controls: ['v0', 'angle', 'height', 'gravity', 'drag'],
        status: 'active'
    },
    {
        id: 'pendulum',
        title: 'Simple Pendulum',
        icon: Activity,
        description: 'Analyze the period and harmonic motion of a simple pendulum.',
        category: 'Oscillations',
        path: '/lab/pendulum',
        controls: ['length', 'mass', 'gravity', 'amplitude', 'damping'],
        status: 'planned'
    },
    {
        id: 'spring-mass',
        title: 'Mass-Spring System',
        icon: Repeat,
        description: 'Investigate Hooke\'s Law and damped harmonic oscillations.',
        category: 'Oscillations',
        path: '/lab/spring-mass',
        controls: ['k', 'mass', 'damping', 'gravity'],
        status: 'planned'
    },
    {
        id: 'incline',
        title: 'Forces on Incline',
        icon: GitGraph, // Vectors
        description: 'Decompose forces and study friction on an inclined plane.',
        category: 'Forces',
        path: '/lab/incline',
        controls: ['angle', 'mass', 'mu_s', 'mu_k', 'applied_force'],
        status: 'planned'
    },
    {
        id: 'collisions',
        title: 'Collision Lab',
        icon: Circle,
        description: 'Simulate elastic and inelastic collisions in 1D/2D.',
        category: 'Momentum',
        path: '/lab/collisions',
        controls: ['m1', 'm2', 'v1', 'v2', 'elasticity'],
        status: 'planned'
    },
    {
        id: 'orbit',
        title: 'Gravitational Orbits',
        icon: Globe,
        description: 'Visualize Kepler\'s laws and planetary orbits.',
        category: 'Gravitation',
        path: '/lab/orbit',
        controls: ['star_mass', 'planet_mass', 'velocity', 'distance'],
        status: 'planned'
    },
    {
        id: 'optics',
        title: 'Geometric Optics',
        icon: ZoomIn,
        description: 'Ray tracing with converging/diverging lenses and mirrors.',
        category: 'Optics',
        path: '/lab/optics',
        controls: ['focal_length', 'object_pos', 'object_height', 'type'],
        status: 'planned'
    },
    {
        id: 'interference',
        title: 'Wave Interference',
        icon: Layers,
        description: 'Observe constructive and destructive interference of waves.',
        category: 'Waves',
        path: '/lab/interference',
        controls: ['frequency', 'separation', 'amplitude', 'wavelength'],
        status: 'planned'
    },
    {
        id: 'circuit',
        title: 'DC Circuit Builder',
        icon: Zap,
        description: 'Build circuits with resistors, batteries, and switches.',
        category: 'Electricity',
        path: '/lab/circuit',
        controls: ['voltage', 'resistance', 'schematic_mode'],
        status: 'planned'
    },
    {
        id: 'buoyancy',
        title: 'Buoyancy Lab',
        icon: Droplet,
        description: 'Explore Archimedes\' principle and fluid density.',
        category: 'Fluids',
        path: '/lab/buoyancy',
        controls: ['fluid_density', 'object_density', 'volume', 'gravity'],
        status: 'planned'
    },
    {
        id: 'doppler',
        title: 'Doppler Effect',
        icon: CloudRain, // Sound waves
        description: 'Visualize the shift in frequency for moving sources.',
        category: 'Waves',
        path: '/lab/doppler',
        controls: ['source_speed', 'observer_speed', 'frequency'],
        status: 'planned'
    }
];
