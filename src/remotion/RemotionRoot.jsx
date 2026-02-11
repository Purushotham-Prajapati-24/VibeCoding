/**
 * RemotionRoot — Composition registry for Remotion CLI/Studio.
 * Used only for `npx remotion studio` preview.
 * Not imported by the main app (the app uses @remotion/player directly).
 */
import React from 'react';
import { Composition } from 'remotion';
import SimulationComposition from './SimulationComposition';
import ReplayComposition from './ReplayComposition';

const defaultProps = {
    v0: 50,
    angle: 45,
    gravity: 9.81,
    drag: 0,
};

export const RemotionRoot = () => {
    return (
        <>
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
        </>
    );
};
