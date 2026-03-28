import React from "react";
import { motion } from "framer-motion";
import { SERVICES } from "./serviceData";

function getNodeCenter(serviceId) {
  const s = SERVICES[serviceId];
  if (!s) return { x: 0, y: 0 };
  return { x: s.x + 40, y: s.y + 40 };
}

export default function DataPacket({ from, to, color, onComplete, label }) {
  const start = getNodeCenter(from);
  const end = getNodeCenter(to);

  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const midX = start.x + dx * 0.5;
  const midY = start.y + dy * 0.5;
  const offset = Math.abs(dx) > Math.abs(dy) ? dy * 0.15 : dx * 0.15;

  return (
    <g>
      {/* Glowing packet */}
      <motion.circle
        r={7}
        fill={color}
        filter="url(#packetGlow)"
        initial={{ cx: start.x, cy: start.y, opacity: 0 }}
        animate={{
          cx: [start.x, midX + offset, end.x],
          cy: [start.y, midY - offset, end.y],
          opacity: [0, 1, 1, 0],
        }}
        transition={{
          duration: 1.2,
          ease: "easeInOut",
          opacity: { times: [0, 0.1, 0.85, 1] },
        }}
        onAnimationComplete={onComplete}
      />

      {/* Trail */}
      <motion.circle
        r={4}
        fill={color}
        opacity={0.4}
        initial={{ cx: start.x, cy: start.y }}
        animate={{
          cx: [start.x, midX + offset, end.x],
          cy: [start.y, midY - offset, end.y],
          opacity: [0, 0.4, 0],
        }}
        transition={{
          duration: 1.2,
          ease: "easeInOut",
          delay: 0.15,
        }}
      />

      {/* Label following the packet */}
      {label && (
        <motion.text
          textAnchor="middle"
          fill={color}
          fontSize={9}
          fontWeight={600}
          fontFamily="var(--font-mono)"
          initial={{ x: start.x, y: start.y - 14, opacity: 0 }}
          animate={{
            x: [start.x, midX + offset, end.x],
            y: [start.y - 14, midY - offset - 14, end.y - 14],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 1.2,
            ease: "easeInOut",
            opacity: { times: [0, 0.2, 1] },
          }}
        >
          {label}
        </motion.text>
      )}
    </g>
  );
}