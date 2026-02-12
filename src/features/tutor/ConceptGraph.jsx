import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import ReactFlow, {
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState,
    MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';

const initialNodes = [
    {
        id: 'kinematics',
        position: { x: 250, y: 0 },
        data: { label: 'Kinematics' },
        style: { background: '#1e293b', color: '#fff', border: '1px solid #3b82f6', borderRadius: '12px', padding: '10px', width: 150, textAlign: 'center' }
    },
    {
        id: 'projectile',
        position: { x: 250, y: 100 },
        data: { label: 'Projectile Motion' },
        style: { background: '#1e293b', color: '#fff', border: '1px solid #8b5cf6', borderRadius: '12px', padding: '10px', width: 150, textAlign: 'center' }
    },
    {
        id: 'forces',
        position: { x: 100, y: 200 },
        data: { label: 'Forces & Newton\'s Laws' },
        style: { background: '#1e293b', color: '#fff', border: '1px solid #10b981', borderRadius: '12px', padding: '10px', width: 180, textAlign: 'center' }
    },
    {
        id: 'energy',
        position: { x: 400, y: 200 },
        data: { label: 'Energy Conservation' },
        style: { background: '#1e293b', color: '#fff', border: '1px solid #f59e0b', borderRadius: '12px', padding: '10px', width: 180, textAlign: 'center' }
    },
    {
        id: 'gravity',
        position: { x: 250, y: 300 },
        data: { label: 'Universal Gravity' },
        style: { background: '#1e293b', color: '#fff', border: '1px solid #ef4444', borderRadius: '12px', padding: '10px', width: 150, textAlign: 'center' }
    },
];

const initialEdges = [
    { id: 'e1-2', source: 'kinematics', target: 'projectile', animated: true, style: { stroke: '#3b82f6' } },
    { id: 'e2-3', source: 'projectile', target: 'forces', animated: true, style: { stroke: '#8b5cf6' } },
    { id: 'e2-4', source: 'projectile', target: 'energy', animated: true, style: { stroke: '#8b5cf6' } },
    { id: 'e3-5', source: 'forces', target: 'gravity', type: 'smoothstep', style: { stroke: '#10b981' } },
    { id: 'e4-5', source: 'energy', target: 'gravity', type: 'smoothstep', style: { stroke: '#f59e0b' } },
];

const ConceptGraph = () => {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    return (
        <div className="w-full h-[300px] bg-slate-900/50 rounded-xl border border-slate-700/50 overflow-hidden relative group">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                fitView
                className="bg-slate-900/50"
                minZoom={0.5}
                maxZoom={1.5}
                attributionPosition="bottom-right"
            >
                <Background color="#334155" gap={16} />
                <Controls showInteractive={false} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </ReactFlow>

            {/* Overlay Title */}
            <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700 text-xs text-slate-300 font-bold z-10 pointer-events-none">
                Interactive Knowledge Map
            </div>
        </div>
    );
};

export default ConceptGraph;
