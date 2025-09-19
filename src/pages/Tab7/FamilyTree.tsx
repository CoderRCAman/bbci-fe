
import { ReactFlow, applyNodeChanges, applyEdgeChanges, addEdge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useReactFlow } from "@xyflow/react";
import { useCallback, useState } from 'react';
const initialNodes = [
    {
        id: 'n1', position: { x: 0, y: 0 }, data: { label: 'MAAJI' },
        style: {
            width: 80,
            height: 80,
            borderRadius: '50%',
            textAlign: 'center',
            lineHeight: '80px',
            border: '2px solid #555',
            background: '#fce4ec',
        },
    },
    {
        id: 'n2', position: { x: 0, y: 100 }, data: { label: 'BIPASHA CANCER' },
        style: {
            width: 80,
            height: 80,
            borderRadius: '50%',
            textAlign: 'center',
            lineHeight: '80px',
            border: '2px solid #555',
            background: '#fce4ec',
        },
    },
];
const initialEdges = [{ id: 'n1-n2', source: 'n1', target: 'n2' }];
export default function FamilyTree() {
    const [nodes, setNodes] = useState(initialNodes);
    const [edges, setEdges] = useState(initialEdges);

    const onNodesChange = useCallback(
        (changes: any) => setNodes((nodesSnapshot: any) => applyNodeChanges(changes, nodesSnapshot)),
        [],
    );
    const onEdgesChange = useCallback(
        (changes: any) => setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
        [],
    );
    const onConnect = useCallback(
        (params: any) => setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),
        [],
    );
    return (
        <div>
            <div style={{
                width: '700px',
                height: '800px',
            }}>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    fitView
                    defaultViewport={{ zoom:5 }}
                />
            </div>


        </div>
    )
}
