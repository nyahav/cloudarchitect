import React from "react";

function getNodeCenter(serviceId, services) {
  const s = services[serviceId];
  if (!s) return { x: 0, y: 0 };
  return { x: s.x + 40, y: s.y + 40 };
}

function getPath(from, to, services) {
  const start = getNodeCenter(from, services);
  const end = getNodeCenter(to, services);

  const dx = end.x - start.x;
  const dy = end.y - start.y;

  // Straight-ish with slight curve
  const midX = start.x + dx * 0.5;
  const midY = start.y + dy * 0.5;

  // Offset the control point perpendicular to the line for a subtle curve
  const offset = Math.abs(dx) > Math.abs(dy) ? dy * 0.15 : dx * 0.15;

  return `M ${start.x} ${start.y} Q ${midX + offset} ${midY - offset} ${end.x} ${end.y}`;
}

export default function ConnectionLines({ activeConnection, services = {}, connections = [] }) {
  return (
    <g>
      {/* Define arrow markers */}
      <defs>
        {connections.map((conn, i) => {
          const s = services[conn.to];
          if (!s) return null;
          return (
            <marker
              key={`arrow-${i}`}
              id={`arrow-${conn.from}-${conn.to}`}
              viewBox="0 0 10 8"
              refX="9"
              refY="4"
              markerWidth={6}
              markerHeight={5}
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 4 L 0 8 z" fill={s.color} opacity={0.6} />
            </marker>
          );
        })}
      </defs>

      {connections.map((conn, i) => {
        const isActive = activeConnection === `${conn.from}-${conn.to}`;
        const path = getPath(conn.from, conn.to, services);
        const color = services[conn.to]?.color || "#0ea5e9";

        return (
          <g key={i}>
            {/* Shadow line */}
            <path
              d={path}
              fill="none"
              stroke={color}
              strokeWidth={isActive ? 3 : 1.5}
              strokeOpacity={isActive ? 0.8 : 0.25}
              strokeDasharray={isActive ? "none" : "6 4"}
              markerEnd={`url(#arrow-${conn.from}-${conn.to})`}
            />

            {/* Glow for active line */}
            {isActive && (
              <path
                d={path}
                fill="none"
                stroke={color}
                strokeWidth={10}
                strokeOpacity={0.25}
                filter="url(#textGlow)"
              />
            )}

            {/* Label */}
            {(() => {
              const start = getNodeCenter(conn.from, services);
              const end = getNodeCenter(conn.to, services);
              const mx = (start.x + end.x) / 2;
              const my = (start.y + end.y) / 2;
              const isVertical = Math.abs(end.y - start.y) > Math.abs(end.x - start.x);

              return (
                <text
                  x={mx + (isVertical ? 14 : 0)}
                  y={my + (isVertical ? 0 : -10)}
                  textAnchor="middle"
                  fill={color}
                  fontSize={10}
                  fontWeight={600}
                  fontFamily="var(--font-inter)"
                  opacity={isActive ? 1 : 0.75}
                  filter={isActive ? "url(#textGlow)" : undefined}
                >
                  {conn.label}
                </text>
              );
            })()}
          </g>
        );
      })}
    </g>
  );
}