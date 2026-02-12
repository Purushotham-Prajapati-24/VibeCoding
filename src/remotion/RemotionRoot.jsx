/**
 * RemotionRoot — Composition registry for Remotion CLI/Studio.
 * Used only for `npx remotion studio` preview.
 * Not imported by the main app (the app uses @remotion/player directly).
 */
import React from 'react';
import { Composition } from 'remotion';
import SimulationComposition from './SimulationComposition';
import ReplayComposition from './ReplayComposition';
import DualReplayComposition from './DualReplayComposition';
import HeroTeaserComposition from './HeroTeaserComposition';
import ShowcaseComposition from './ShowcaseComposition';
import ConceptExplainerComposition from './ConceptExplainerComposition';

const defaultProps = {
    v0: 50,
    angle: 45,
    gravity: 9.81,
    drag: 0,
};

const dualDefaultProps = {
    paramsA: { v0: 50, angle: 45, gravity: 9.81, drag: 0, label: '🌍 Earth' },
    paramsB: { v0: 50, angle: 45, gravity: 1.62, drag: 0, label: '🌙 Moon' },
};

export const RemotionRoot = () => {
    return (
        <>
            <Composition
                id="HeroTeaser"
                component={HeroTeaserComposition}
                durationInFrames={150}
                fps={30}
                width={1280}
                height={720}
            />
            <Composition
                id="PhysicsShowcase"
                component={ShowcaseComposition}
                durationInFrames={300}
                fps={30}
                width={1280}
                height={720}
            />
            <Composition
                id="CinematicReplay"
                component={SimulationComposition}
                durationInFrames={180}
                fps={30}
                width={1280}
                height={720}
                defaultProps={defaultProps}
            />
            <Composition
                id="EducationalWalkthrough"
                component={ReplayComposition}
                durationInFrames={360}
                fps={30}
                width={1280}
                height={720}
                defaultProps={defaultProps}
            />
            <Composition
                id="DualCompareReplay"
                component={DualReplayComposition}
                durationInFrames={300}
                fps={30}
                width={1100}
                height={380}
                defaultProps={dualDefaultProps}
            />
            <Composition
                id="ConceptExplainer"
                component={ConceptExplainerComposition}
                durationInFrames={300}
                fps={30}
                width={1280}
                height={720}
                defaultProps={defaultProps}
            />
        </>
    );
};
