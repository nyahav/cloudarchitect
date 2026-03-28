import React from "react";
import { SERVICES, CONNECTIONS } from "./serviceData";

function getNodeCenter(serviceId) {
  const s = SERVICES[serviceId];
  return { x: s.x + 40, y: s.y + 40 };
}

function getPath(from, to) {
  const start = getNodeCenter(from);
  const end = getNodeCenter(to);

  const dx = end.x - start.x;
  const dy = end.y - start.y;

  // Straight-ish with slight curve
  const midX = start.x + dx * 0.5;
  const midY = start.y + dy * 0.5;

  // Offset the control point perpendicular to the line for a subtle curve
  const offset = Math.abs(dx) > Math.abs(dy) ? dy * 0.15 : dx * 0.15;

  return `M ${start.x} ${start.y} Q ${midX + offset} ${midY - offset} ${end.x} ${end.y}`;
}

export default function ConnectionLines({ activeConnection }) {
  return (
    <g>
      {/* Define arrow markers */}
      <defs>
        {CONNECTIONS.map((conn, i) => {
          const s = SERVICES[conn.to];
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

      {CONNECTIONS.map((conn, i) => {
        const isActive = activeConnection === `${conn.from}-${conn.to}`;
        const path = getPath(conn.from, conn.to);
        const color = SERVICES[conn.to].color;

        return (
          <g key={i}>
            {/* Shadow line */}
            <path
              d={path}
              fill="none"
              stroke={color}
              strokeWidth={isActive ? 3 : 1.5}
              strokeOpacity={isActive ? 0.4 : 0.1}
              strokeDasharray={isActive ? "none" : "6 4"}
              markerEnd={`url(#arrow-${conn.from}-${conn.to})`}
            />

            {/* Glow for active line */}
            {isActive && (
              <path
                d={path}
                fill="none"
                stroke={color}
                strokeWidth={6}
                strokeOpacity={0.15}
                filter="blur(4px)"
              />
            )}

            {/* Label */}
            {(() => {
              const start = getNodeCenter(conn.from);
              const end = getNodeCenter(conn.to);
              const mx = (start.x + end.x) / 2;
              const my = (start.y + end.y) / 2;
              const isVertical = Math.abs(end.y - start.y) > Math.abs(end.x - start.x);

              return (
                <text
                  x={mx + (isVertical ? 12 : 0)}
                  y={my + (isVertical ? 0 : -10)}
                  textAnchor="middle"
                  fill={color}
                  fontSize={9}
                  fontWeight={500}
                  fontFamily="var(--font-inter)"
                  opacity={isActive ? 1 : 0.5}
                >
                  {conn.labelHe}
                </text>
              );
            })()}
          </g>
        );
      })}
    </g>
  );
}