import React, { useMemo, useState, useCallback } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  MiniMap,
  MarkerType,
  type Node,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
  applyNodeChanges,
  applyEdgeChanges,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { DecisionNode } from './DecisionNode';
import { ClaimNode } from './ClaimNode';
import { AssumptionNode } from './AssumptionNode';
import { RiskGhostNode } from './RiskGhostNode';
import type { Decision, Analysis, Claim, HiddenAssumption, OverlookedRisk } from '../../types';
import { ValueNode } from './ValueNode';
import { analyzeSayVsDo } from '../../lib/sayVsDoAnalyzer';
import { Info, AlertTriangle, Eye, Layers, Compass, HelpCircle } from 'lucide-react';

const nodeTypes = {
  decision: DecisionNode,
  claim: ClaimNode,
  assumption: AssumptionNode,
  risk: RiskGhostNode,
  value: ValueNode,
};

interface ReasoningMapProps {
  decision: Decision;
  analysis: Analysis;
  onSelectNode: (nodeInfo: {
    type: 'decision' | 'claim' | 'assumption' | 'risk' | 'contradiction';
    data: any;
  }) => void;
}

export function ReasoningMap({ decision, analysis, onSelectNode }: ReasoningMapProps) {
  const [hoveredEdgeId, setHoveredEdgeId] = useState<string | null>(null);

  // Generate layout nodes and edges
  const { initialNodes, initialEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // 0. Stated Values Nodes (Say vs Do)
    const sayVsDo = analyzeSayVsDo(decision, analysis);
    sayVsDo.valueCards.forEach((card, idx) => {
      const valNodeId = `val_${idx}`;
      const vx = 180 + idx * 270;
      const vy = 50;

      nodes.push({
        id: valNodeId,
        type: 'value',
        position: { x: vx, y: vy },
        data: {
          value: card.value,
          isMatch: card.isMatch,
          matchCount: card.matchCount,
          totalReasons: card.totalReasons,
        },
      });

      // Subtle edge to center decision node
      edges.push({
        id: `e_dec_${valNodeId}`,
        source: 'decision_center',
        target: valNodeId,
        style: {
          stroke: card.isMatch ? '#10b98166' : '#f59e0b66',
          strokeWidth: 1.5,
          strokeDasharray: '2 2',
        },
      });

      // Draw RED EDGE on map between that value and the reasons that crowd it out!
      if (!card.isMatch && card.crowdingClaims.length > 0) {
        card.crowdingClaims.slice(0, 3).forEach((crowdClaim) => {
          edges.push({
            id: `e_crowd_${valNodeId}_${crowdClaim.id}`,
            source: valNodeId,
            target: crowdClaim.id,
            animated: true,
            label: '⚡ Crowds Out',
            labelStyle: {
              fill: '#fecaca',
              fontWeight: 700,
              fontSize: 9,
              fontFamily: 'monospace',
            },
            labelBgStyle: {
              fill: '#7f1d1d',
              fillOpacity: 0.95,
              rx: 4,
              ry: 4,
            },
            style: {
              stroke: '#ef4444',
              strokeWidth: 2.5,
              strokeDasharray: '4 4',
            },
          });
        });
      }
    });

    // 1. Center Decision Node
    nodes.push({
      id: 'decision_center',
      type: 'decision',
      position: { x: 380, y: 340 },
      data: {
        title: decision.title,
        initialStance: decision.initialStance,
        initialConfidence: decision.initialConfidence,
        statedPriorities: decision.statedPriorities,
      },
    });

    // 2. Claims Nodes
    const claims = analysis.claims || [];
    const claimPositions: Record<string, { x: number; y: number }> = {};

    claims.forEach((claim, index) => {
      // Position claims in a semi-radial pattern to the left and top/bottom
      const angle = (index / Math.max(claims.length, 1)) * Math.PI * 1.4 - Math.PI * 0.7;
      const radius = 340;
      const cx = 380 - Math.cos(angle) * radius;
      const cy = 320 + Math.sin(angle) * (radius * 0.85);

      claimPositions[claim.id] = { x: cx, y: cy };

      nodes.push({
        id: claim.id,
        type: 'claim',
        position: { x: cx, y: cy },
        data: claim as any,
      });

      // Edge from decision to claim
      edges.push({
        id: `e_dec_${claim.id}`,
        source: 'decision_center',
        target: claim.id,
        style: { stroke: '#78716c', strokeWidth: 1.5 },
      });
    });

    // 3. Hidden Assumption Nodes (Attached to their claims)
    const assumptions = analysis.hiddenAssumptions || [];
    const claimAssumptionCount: Record<string, number> = {};

    assumptions.forEach((assump) => {
      const parentPos = claimPositions[assump.linkedClaimId] || { x: 100, y: 200 };
      const count = claimAssumptionCount[assump.linkedClaimId] || 0;
      claimAssumptionCount[assump.linkedClaimId] = count + 1;

      // Position outward from parent claim
      const ax = parentPos.x - 290;
      const ay = parentPos.y + (count === 0 ? -40 : count * 150);

      nodes.push({
        id: assump.id,
        type: 'assumption',
        position: { x: ax, y: ay },
        data: assump as any,
      });

      edges.push({
        id: `e_claim_${assump.id}`,
        source: assump.linkedClaimId,
        target: assump.id,
        style: { stroke: '#f59e0b', strokeWidth: 1.5, strokeDasharray: '4 4' },
      });
    });

    // 4. Overlooked Risks (Placed in clearly labelled "Missing / Blind Spots" territory)
    const risks = analysis.overlookedRisks || [];
    const missingAreaX = 820;
    const missingAreaY = 120;

    risks.forEach((risk, idx) => {
      const rx = missingAreaX;
      const ry = missingAreaY + idx * 190;

      nodes.push({
        id: risk.id,
        type: 'risk',
        position: { x: rx, y: ry },
        data: risk as any,
      });

      // Subtle ghost edge to center
      edges.push({
        id: `e_ghost_${risk.id}`,
        source: 'decision_center',
        target: risk.id,
        style: { stroke: '#ef444455', strokeWidth: 1.5, strokeDasharray: '3 6' },
      });
    });

    // 5. Contradiction Edges (RED between nodes)
    const contradictions = analysis.contradictions || [];
    contradictions.forEach((contra) => {
      let src = contra.between[0];
      let tgt = contra.between[1];

      // Handle value:priority references
      if (src.startsWith('value:')) {
        src = 'decision_center';
      }
      if (tgt.startsWith('value:')) {
        tgt = 'decision_center';
      }

      // Ensure nodes exist
      const hasSrc = nodes.some((n) => n.id === src);
      const hasTgt = nodes.some((n) => n.id === tgt);

      if (hasSrc && hasTgt && src !== tgt) {
        edges.push({
          id: `contra_${contra.id}`,
          source: src,
          target: tgt,
          animated: true,
          label: '⚡ Contradiction',
          labelStyle: {
            fill: '#fecaca',
            fontWeight: 700,
            fontSize: 10,
            fontFamily: 'monospace',
          },
          labelBgStyle: {
            fill: '#7f1d1d',
            fillOpacity: 0.9,
            rx: 4,
            ry: 4,
          },
          style: {
            stroke: '#ef4444',
            strokeWidth: 3,
          },
          data: contra as any,
        });
      }
    });

    return { initialNodes: nodes, initialEdges: edges };
  }, [decision, analysis]);

  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);

  // Sync state if initial inputs change
  React.useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges]);

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      onSelectNode({
        type: node.type as any,
        data: node.data,
      });
    },
    [onSelectNode]
  );

  const onEdgeClick = useCallback(
    (_event: React.MouseEvent, edge: Edge) => {
      if (edge.data) {
        onSelectNode({
          type: 'contradiction',
          data: edge.data,
        });
      }
    },
    [onSelectNode]
  );

  return (
    <div className="relative w-full h-[620px] rounded-2xl overflow-hidden border border-stone-800 bg-stone-950 shadow-2xl">
      {/* Background Section Labels on Canvas */}
      <div className="absolute top-4 right-6 pointer-events-none z-10 text-right">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950/40 border border-red-900/50 text-red-300 text-xs font-mono font-medium backdrop-blur-md">
          <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
          Missing Territory / Unexamined Blind Spots
        </div>
        <p className="text-[10px] text-stone-400 font-mono mt-1">
          Factors overlooked or absent from stated reasoning
        </p>
      </div>

      <div className="absolute top-4 left-6 pointer-events-none z-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-900/70 border border-stone-800 text-stone-300 text-xs font-mono font-medium backdrop-blur-md">
          <Layers className="w-3.5 h-3.5 text-amber-400" />
          Stated Territory & Underlying Premises
        </div>
      </div>

      {/* Legend Badge Overlay */}
      <div className="absolute bottom-4 left-4 z-10 bg-stone-900/90 border border-stone-800/80 rounded-xl p-3 shadow-xl backdrop-blur-md text-xs font-mono space-y-1.5 max-w-xs">
        <div className="text-[10px] text-stone-400 uppercase tracking-wider font-semibold border-b border-stone-800 pb-1 mb-1">
          Map Legend
        </div>
        <div className="flex items-center gap-2 text-amber-300">
          <span className="w-3.5 h-3.5 rounded bg-amber-950 border-2 border-amber-500 inline-block" />
          <span>Value (Top Priority)</span>
        </div>
        <div className="flex items-center gap-2 text-stone-300">
          <span className="w-3.5 h-3.5 rounded bg-stone-800 border-2 border-stone-500 inline-block" />
          <span>Solid = Stated Reason</span>
        </div>
        <div className="flex items-center gap-2 text-amber-300">
          <span className="w-3.5 h-3.5 rounded bg-stone-900 border-2 border-dashed border-amber-500 inline-block" />
          <span>Dotted = Unverified assumption</span>
        </div>
        <div className="flex items-center gap-2 text-red-300">
          <span className="w-3.5 h-3.5 rounded bg-stone-950 border-2 border-dashed border-red-500/80 inline-flex items-center justify-center text-[9px] font-bold">
            ?
          </span>
          <span>Ghost (?) = Missing blind spot</span>
        </div>
        <div className="flex items-center gap-2 text-rose-400">
          <span className="w-4 h-0.5 bg-red-500 inline-block shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
          <span>Dashed Red = Value crowded out</span>
        </div>
      </div>

      {/* React Flow Canvas */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        fitView
        fitViewOptions={{ padding: 0.18 }}
        minZoom={0.3}
        maxZoom={1.6}
        className="bg-stone-950"
      >
        <Background color="#44403c" gap={24} size={1} />
        <Controls className="!bg-stone-900 !border-stone-800 !text-stone-300 !rounded-xl !shadow-lg" />
        <MiniMap
          nodeColor={(n) => {
            if (n.type === 'value') return '#f59e0b';
            if (n.type === 'decision') return '#f59e0b';
            if (n.type === 'claim') return '#78716c';
            if (n.type === 'assumption') return '#d97706';
            if (n.type === 'risk') return '#ef4444';
            return '#57534e';
          }}
          className="!bg-stone-900 !border-stone-800 !rounded-xl !shadow-lg"
        />
      </ReactFlow>
    </div>
  );
}
