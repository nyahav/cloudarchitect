import React, { useState, useCallback, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import { Trash2, RotateCcw } from "lucide-react";
import SandboxCanvas from "@/components/sandbox/SandboxCanvas";
import ServicePalette from "@/components/sandbox/ServicePalette";
import ValidationPanel from "@/components/sandbox/ValidationPanel";

const NODE_W = 110;
const NODE_H = 60;

// Canvas viewport the project was designed for (from serviceData.js / project.services coords)
const DESIGN_W = 940;
const DESIGN_H = 540;
// Our actual canvas area (minus palette 176px and panel 224px, height minus topbar ~56px)
const CANVAS_W = 700;
const CANVAS_H = 480;
const PADDING = 60;

export default function ProjectSandbox() {
  const { project } = useOutletContext();

  // Build palette services from the project's own services object
  const paletteServices = Object.values(project.services || {}).map(s => ({
    id: s.id,
    label: s.label,
    icon: s.icon,
    color: s.color,
  }));

  // Build placeholder positions by scaling the project's original service coordinates
  const placeholders = useMemo(() => {
    const svcList = Object.values(project.services || {});
    if (svcList.length === 0) return [];
    // Find bounds of original design coords
    const xs = svcList.map(s => s.x ?? 0);
    const ys = svcList.map(s => s.y ?? 0);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);
    const rangeX = (maxX - minX) || 1;
    const rangeY = (maxY - minY) || 1;
    const usableW = CANVAS_W - PADDING * 2 - NODE_W;
    const usableH = CANVAS_H - PADDING * 2 - NODE_H;
    return svcList.map(s => ({
      id: s.id,
      label: s.label,
      icon: s.icon,
      color: s.color,
      x: PADDING + ((( s.x ?? 0) - minX) / rangeX) * usableW,
      y: PADDING + (((s.y ?? 0) - minY) / rangeY) * usableH,
    }));
  }, [project.services]);

  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [drawingEdge, setDrawingEdge] = useState(null);
  const [selectedEdge, setSelectedEdge] = useState(null);

  const placedIds = nodes.map(n => n.id);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const serviceId = e.dataTransfer.getData("serviceId");
    if (!serviceId) return;
    const already = nodes.find(n => n.id === serviceId);
    if (already) return;

    const svc = paletteServices.find(s => s.id === serviceId);
    if (!svc) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - NODE_W / 2;
    const y = e.clientY - rect.top - NODE_H / 2;

    setNodes(prev => [...prev, { ...svc, x, y }]);
  }, [nodes, paletteServices]);

  const handleDragOver = (e) => e.preventDefault();

  const removeNode = (id) => {
    setNodes(prev => prev.filter(n => n.id !== id));
    setEdges(prev => prev.filter(ed => ed.from !== id && ed.to !== id));
  };

  const removeEdge = (edgeId) => {
    setEdges(prev => prev.filter(ed => ed.id !== edgeId));
    setSelectedEdge(null);
  };

  const reset = () => {
    setNodes([]);
    setEdges([]);
    setDrawingEdge(null);
    setSelectedEdge(null);
  };

  const color = project.color || "#0ea5e9";

  return (
    <div className="flex h-full min-h-0" style={{ height: "calc(100vh - 56px)" }}>
      {/* Left Palette */}
      <div
        className="w-44 shrink-0 border-r overflow-y-auto"
        style={{ background: "hsl(222 47% 8%)", borderColor: "rgba(255,255,255,0.07)" }}
      >
        <ServicePalette
          services={paletteServices}
          placedIds={placedIds}
          onDrop={() => {}}
        />
      </div>

      {/* Canvas */}
      <div
        className="flex-1 relative overflow-hidden"
        style={{ background: "hsl(222 47% 6%)" }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {/* Top bar */}
        <div
          className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between px-3 py-2 rounded-xl"
          style={{ background: "hsl(222 47% 9% / 0.95)", border: "1px solid rgba(255,255,255,0.07)", backdropFilter: "blur(8px)" }}
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: color }} />
            <span className="text-xs font-bold text-foreground">{project.name}</span>
            <span className="text-xs text-muted-foreground">— Architecture Sandbox</span>
          </div>
          <div className="flex items-center gap-2">
            {selectedEdge && (
              <button
                onClick={() => removeEdge(selectedEdge)}
                className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded-lg transition-colors"
                style={{ background: "rgba(239,68,68,0.1)" }}
              >
                <Trash2 className="w-3 h-3" /> Remove Edge
              </button>
            )}
            <button
              onClick={reset}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded-lg transition-colors"
              style={{ background: "rgba(255,255,255,0.05)" }}
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          </div>
        </div>

        {/* Empty state */}
        {nodes.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 pointer-events-none">
            <div className="text-4xl opacity-20">⬅</div>
            <p className="text-sm text-muted-foreground opacity-60">Drag services from the palette onto the canvas</p>
            <p className="text-xs text-muted-foreground opacity-40">Then draw connections between them and validate</p>
          </div>
        )}

        {/* Instructions overlay */}
        {nodes.length > 0 && edges.length === 0 && !drawingEdge && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none">
            <p className="text-xs text-muted-foreground opacity-60 bg-black/30 px-3 py-1.5 rounded-full">
              Hover a node and drag from the ● handle to draw a connection
            </p>
          </div>
        )}

        <SandboxCanvas
          nodes={nodes}
          setNodes={setNodes}
          edges={edges}
          setEdges={setEdges}
          drawingEdge={drawingEdge}
          setDrawingEdge={setDrawingEdge}
          onEdgeClick={setSelectedEdge}
          selectedEdge={selectedEdge}
          placeholders={placeholders}
        />
      </div>

      {/* Right Panel */}
      <div
        className="w-56 shrink-0 border-l p-3 flex flex-col gap-3 overflow-y-auto"
        style={{ background: "hsl(222 47% 8%)", borderColor: "rgba(255,255,255,0.07)" }}
      >
        <ValidationPanel nodes={nodes} edges={edges} project={project} />

        {/* Edge list */}
        {edges.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1">Connections</p>
            {edges.map(ed => (
              <div
                key={ed.id}
                onClick={() => setSelectedEdge(selectedEdge === ed.id ? null : ed.id)}
                className="flex items-center gap-1.5 text-xs px-2 py-1.5 rounded-lg cursor-pointer transition-all"
                style={{
                  background: selectedEdge === ed.id ? "rgba(239,68,68,0.1)" : "rgba(255,255,255,0.04)",
                  border: selectedEdge === ed.id ? "1px solid rgba(239,68,68,0.4)" : "1px solid rgba(255,255,255,0.06)",
                  color: selectedEdge === ed.id ? "#fca5a5" : "rgba(180,195,220,0.7)",
                }}
              >
                <span className="font-mono">{ed.from}</span>
                <span className="text-muted-foreground">→</span>
                <span className="font-mono">{ed.to}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}