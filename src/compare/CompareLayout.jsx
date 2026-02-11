/**
 * CompareLayout — Switchable layout: single-canvas or dual-canvas compare mode.
 * Smooth CSS transition between modes.
 */
import React from 'react';
import { useCompareContext } from './CompareContext';
import DualCanvasView from './DualCanvasView';
import DifferencePanel from './DifferencePanel';

const CompareLayout = ({ singleCanvasElement, graphPanel }) => {
    const { compareMode } = useCompareContext();

    if (!compareMode) {
        // Single mode - render original canvas + graph
        return (
            <div className="flex flex-col gap-4 h-full transition-all duration-500">
                <div className="flex-1 relative">
                    {singleCanvasElement}
                </div>
                {graphPanel}
            </div>
        );
    }

    // Compare mode - dual canvases + difference panel + graph
    return (
        <div className="flex flex-col gap-3 h-full transition-all duration-500">
            <div className="flex-1 min-h-0 flex items-center justify-center">
                <div className="w-full h-full max-h-full aspect-[2.2/1]">
                    <DualCanvasView />
                </div>
            </div>
            <div className="flex-none">
                <DifferencePanel />
            </div>
            {graphPanel}
        </div>
    );
};

export default CompareLayout;
