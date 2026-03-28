import React, { useRef, useState, useCallback, useEffect } from "react";

const NODE_W = 110;
const NODE_H = 60;

function getCenter(node) {
  return { x: node.x + NODE_W / 2, y: node.y + NODE_H / 2 };
}

function ServiceIcon({ icon, color, size = 18 }) {
  const icons = {
    Monitor: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>,
    Server: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><circle cx="6" cy="6" r="1" fill={color}/><circle cx="6" cy="18" r="1" fill={color}/></svg>,
    Database: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14a9 3 0 0018 0V5"/><path d="M3 12a9 3 0 0018 0"/></svg>,
    Mail: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 8l10 6 10-6"/></svg>,
    Cog: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>,
    AlertTriangle: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
    Zap: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  };
  return icons[icon] || icons.Server;
}

export default function SandboxCanvas({
  nodes, setNodes,
  edges, setEdges,
  drawingEdge, setDrawingEdge,
  placeholders = [],
}) {
  const svgRef = useRef(null);
  // Use a ref for dragging so the global mouseup handler always sees current value
  const draggingRef = useRef(null);
  const [dragging, setDragging] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [hoveredNode, setHoveredNode] = useState(null);

  const getSVGPoint = useCallback((clientX, clientY) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    return { x: clientX - rect.left, y: clientY - rect.top };
  }, []);

  // Global mouseup — fixes the "stuck dragging" bug when mouse is released outside SVG
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (draggingRef.current) {
        draggingRef.current = null;
        setDragging(null);
      }
    };
    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () => window.removeEventListener("mouseup", handleGlobalMouseUp);
  }, []);

  const onMouseMove = useCallback((e) => {
    const pt = getSVGPoint(e.clientX, e.clientY);
    setMousePos(pt);
    if (draggingRef.current) {
      const d = draggingRef.current;
      setNodes(prev => prev.map(n =>
        n.id === d.id
          ? { ...n, x: pt.x - d.offsetX, y: pt.y - d.offsetY }
          : n
      ));
    }
  }, [getSVGPoint, setNodes]);

  const onNodeMouseDown = useCallback((e, node) => {
    e.stopPropagation();
    if (drawingEdge) return;
    const pt = getSVGPoint(e.clientX, e.clientY);
    const d = { id: node.id, offsetX: pt.x - node.x, offsetY: pt.y - node.y };
    draggingRef.current = d;
    setDragging(d);
  }, [drawingEdge, getSVGPoint]);

  const onConnectorMouseDown = useCallback((e, node) => {
    e.stopPropagation();
    e.preventDefault();
    const center = getCenter(node);
    setDrawingEdge({ fromId: node.id, x1: center.x, y1: center.y });
  }, [setDrawingEdge]);

  const onNodeMouseUp = useCallback((e, node) => {
    e.stopPropagation();
    // Stop dragging
    draggingRef.current = null;
    setDragging(null);
    // Complete edge drawing
    if (drawingEdge && drawingEdge.fromId !== node.id) {
      const key = `${drawingEdge.fromId}->${node.id}`;
      const exists = edges.some(ed => ed.from === drawingEdge.fromId && ed.to === node.id);
      if (!exists) {
        setEdges(prev => [...prev, { id: key, from: drawingEdge.fromId, to: node.id }]);
      }
      setDrawingEdge(null);
    }
  }, [drawingEdge, edges, setEdges, setDrawingEdge]);

  const onSVGMouseUp = useCallback(() => {
    if (drawingEdge) setDrawingEdge(null);
    draggingRef.current = null;
    setDragging(null);
  }, [drawingEdge, setDrawingEdge]);

  const edgePath = (x1, y1, x2, y2) => {
    const mx = (x1 + x2) / 2;
    return `M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`;
  };

  return (
    <svg
      ref={svgRef}
      className="w-full h-full"
      style={{ cursor: drawingEdge ? "crosshair" : dragging ? "grabbing" : "default" }}
      onMouseMove={onMouseMove}
      onMouseUp={onSVGMouseUp}
    >
      <defs>
        <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
          <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.8" />
        </pattern>
        <marker id="arrow-drawing" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L0,6 L8,3 z" fill="#0ea5e9" />
        </marker>
        {nodes.map(n => (
          <marker key={`arrow-${n.id}`} id={`arrow-${n.id}`} markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill={n.color} />
          </marker>
        ))}
      </defs>

      <rect width="100%" height="100%" fill="url(#grid)" />

      {/* Placeholder slots */}
      {placeholders.map(ph => {
        const isPlaced = nodes.some(n => n.id === ph.id);
        if (isPlaced) return null;
        return (
          <g key={`ph-${ph.id}`} transform={`translate(${ph.x},${ph.y})`} opacity="0.35">
            <rect
              x="0" y="0" width={NODE_W} height={NODE_H} rx="10"
              fill="transparent"
              stroke={ph.color}
              strokeWidth="1.5"
              strokeDasharray="6 3"
              strokeOpacity="0.5"
            />
            <text
              x={NODE_W / 2} y={NODE_H / 2 + 4}
              textAnchor="middle"
              fill={ph.color}
              fontSize="9"
              fontFamily="var(--font-inter)"
              fontWeight="600"
              fillOpacity="0.6"
            >
              {ph.label.length > 14 ? ph.label.slice(0, 13) + "…" : ph.label}
            </text>
          </g>
        );
      })}

      {/* Committed edges */}
      {edges.map(ed => {
        const from = nodes.find(n => n.id === ed.from);
        const to = nodes.find(n => n.id === ed.to);
        if (!from || !to) return null;
        const c1 = getCenter(from);
        const c2 = getCenter(to);
        return (
          <path
            key={ed.id}
            d={edgePath(c1.x, c1.y, c2.x, c2.y)}
            fill="none"
            stroke={from.color}
            strokeWidth="2"
            strokeOpacity="0.7"
            markerEnd={`url(#arrow-${from.id})`}
          />
        );
      })}

      {/* In-progress edge */}
      {drawingEdge && (() => {
        const fromNode = nodes.find(n => n.id === drawingEdge.fromId);
        if (!fromNode) return null;
        const c = getCenter(fromNode);
        return (
          <path
            d={edgePath(c.x, c.y, mousePos.x, mousePos.y)}
            fill="none"
            stroke="#0ea5e9"
            strokeWidth="2"
            strokeDasharray="6 4"
            markerEnd="url(#arrow-drawing)"
          />
        );
      })()}

      {/* Nodes */}
      {nodes.map(node => {
        const isHovered = hoveredNode === node.id;
        return (
          <g
            key={node.id}
            transform={`translate(${node.x},${node.y})`}
            onMouseDown={e => onNodeMouseDown(e, node)}
            onMouseUp={e => onNodeMouseUp(e, node)}
            onMouseEnter={() => setHoveredNode(node.id)}
            onMouseLeave={() => { if (!draggingRef.current) setHoveredNode(null); }}
            style={{ cursor: drawingEdge ? "pointer" : dragging?.id === node.id ? "grabbing" : "grab" }}
          >
            {isHovered && (
              <rect x="-4" y="-4" width={NODE_W + 8} height={NODE_H + 8} rx="14"
                fill={node.color} fillOpacity="0.08" />
            )}
            <rect
              x="0" y="0" width={NODE_W} height={NODE_H} rx="10"
              fill="hsl(222 47% 10%)"
              stroke={node.color}
              strokeWidth={isHovered ? 2 : 1.5}
              strokeOpacity={isHovered ? 1 : 0.6}
            />
            <foreignObject x="10" y="10" width="22" height="22">
              <div xmlns="http://www.w3.org/1999/xhtml">
                <ServiceIcon icon={node.icon} color={node.color} size={18} />
              </div>
            </foreignObject>
            <text x={NODE_W / 2} y={NODE_H - 12} textAnchor="middle" fill="rgba(210,220,240,0.9)" fontSize="9" fontFamily="var(--font-inter)" fontWeight="600">
              {node.label.length > 14 ? node.label.slice(0, 13) + "…" : node.label}
            </text>
            {(isHovered || drawingEdge) && (
              <circle
                cx={NODE_W}
                cy={NODE_H / 2}
                r="7"
                fill={node.color}
                fillOpacity="0.9"
                stroke="white"
                strokeWidth="1.5"
                style={{ cursor: "crosshair" }}
                onMouseDown={e => onConnectorMouseDown(e, node)}
                onMouseUp={e => onNodeMouseUp(e, node)}
              />
            )}
          </g>
        );
      })}
    </svg>
  );
}