import React from "react";
import { motion } from "framer-motion";
import { HelpCircle } from "lucide-react";

// AWS brand colors
const AWS_COLORS = {
  client:   "#8C9BAB",  // neutral slate
  api:      "#ED7100",  // EC2 orange
  dynamodb: "#4B8AF4",  // DynamoDB blue-purple
  sqs:      "#FF4F8B",  // SQS pink
  worker:   "#ED7100",  // EC2 orange (same family)
  dlq:      "#E7157B",  // SQS red-pink variant
  lambda:   "#FF9900",  // Lambda orange/yellow
};

// SVG paths for AWS service icons (simplified)
function AwsIcon({ serviceId, x, y, size = 32, color }) {
  const cx = x;
  const cy = y;
  const s = size;
  const h = s * 0.5;

  if (serviceId === "client") {
    // Monitor outline
    return (
      <g transform={`translate(${cx - h}, ${cy - h})`}>
        <rect x={2} y={2} width={s - 4} height={s * 0.65} rx={2} fill="none" stroke={color} strokeWidth={2} />
        <line x1={s * 0.3} y1={s * 0.67} x2={s * 0.7} y2={s * 0.67} stroke={color} strokeWidth={2} />
        <line x1={s * 0.5} y1={s * 0.67} x2={s * 0.5} y2={s * 0.88} stroke={color} strokeWidth={2} />
        <line x1={s * 0.25} y1={s * 0.88} x2={s * 0.75} y2={s * 0.88} stroke={color} strokeWidth={2} />
      </g>
    );
  }

  if (serviceId === "api" || serviceId === "worker") {
    // EC2 logo: square with small square cut-outs in corners
    return (
      <g transform={`translate(${cx - h}, ${cy - h})`}>
        <rect x={3} y={3} width={s - 6} height={s - 6} rx={3} fill="none" stroke={color} strokeWidth={2} />
        <rect x={0} y={s * 0.35} width={6} height={s * 0.3} rx={1} fill={color} opacity={0.9} />
        <rect x={s - 6} y={s * 0.35} width={6} height={s * 0.3} rx={1} fill={color} opacity={0.9} />
        <line x1={s * 0.3} y1={s * 0.35} x2={s * 0.7} y2={s * 0.35} stroke={color} strokeWidth={1.5} opacity={0.7} />
        <line x1={s * 0.3} y1={s * 0.5} x2={s * 0.7} y2={s * 0.5} stroke={color} strokeWidth={1.5} opacity={0.7} />
        <line x1={s * 0.3} y1={s * 0.65} x2={s * 0.7} y2={s * 0.65} stroke={color} strokeWidth={1.5} opacity={0.7} />
      </g>
    );
  }

  if (serviceId === "dynamodb") {
    // DynamoDB: cylinder shape
    return (
      <g transform={`translate(${cx - h * 0.7}, ${cy - h})`}>
        <ellipse cx={s * 0.35} cy={s * 0.18} rx={s * 0.33} ry={s * 0.12} fill={`${color}30`} stroke={color} strokeWidth={1.8} />
        <line x1={0.02 * s} y1={s * 0.18} x2={0.02 * s} y2={s * 0.82} stroke={color} strokeWidth={1.8} />
        <line x1={s * 0.68} y1={s * 0.18} x2={s * 0.68} y2={s * 0.82} stroke={color} strokeWidth={1.8} />
        <ellipse cx={s * 0.35} cy={s * 0.82} rx={s * 0.33} ry={s * 0.12} fill={`${color}20`} stroke={color} strokeWidth={1.8} />
        <ellipse cx={s * 0.35} cy={s * 0.5} rx={s * 0.33} ry={s * 0.12} fill="none" stroke={color} strokeWidth={1} strokeOpacity={0.4} />
      </g>
    );
  }

  if (serviceId === "sqs" || serviceId === "dlq") {
    // SQS: queue / envelope shape
    return (
      <g transform={`translate(${cx - h}, ${cy - h * 0.75})`}>
        <rect x={2} y={s * 0.1} width={s - 4} height={s * 0.65} rx={3} fill="none" stroke={color} strokeWidth={2} />
        <polyline points={`2,${s * 0.1} ${s / 2},${s * 0.45} ${s - 2},${s * 0.1}`} fill="none" stroke={color} strokeWidth={1.8} />
        {serviceId === "dlq" && (
          <>
            <line x1={s * 0.3} y1={s * 0.85} x2={s * 0.3} y2={s * 1.0} stroke={color} strokeWidth={2} />
            <line x1={s * 0.3} y1={s * 1.0} x2={s * 0.7} y2={s * 1.0} stroke={color} strokeWidth={2} />
            <text x={s * 0.5} y={s * 1.12} textAnchor="middle" fontSize={7} fill={color} fontWeight={700}>DLQ</text>
          </>
        )}
      </g>
    );
  }

  if (serviceId === "lambda") {
    // Lambda: λ symbol
    return (
      <g>
        <text x={cx} y={cy + 11} textAnchor="middle" fontSize={s * 0.95} fontWeight={300} fill={color} fontFamily="serif" opacity={0.95}>λ</text>
      </g>
    );
  }

  // fallback circle
  return <circle cx={cx} cy={cy} r={h * 0.7} fill="none" stroke={color} strokeWidth={2} />;
}

export default function ServiceNode({ service, isActive, isSelected, onClick, onWhyClick, animatingTo }) {
  const color = AWS_COLORS[service.id] || service.color;

  return (
    <g style={{ cursor: "pointer" }} onClick={() => onClick(service.id)}>
      {/* Outer glow ring */}
      <motion.circle
        cx={service.x + 40}
        cy={service.y + 40}
        r={50}
        fill="none"
        stroke={color}
        strokeWidth={isSelected ? 2 : 1}
        strokeOpacity={isSelected ? 0.5 : 0.12}
        animate={{
          r: isActive ? [50, 56, 50] : 50,
          strokeOpacity: isActive ? [0.25, 0.55, 0.25] : isSelected ? 0.5 : 0.12,
        }}
        transition={{ duration: 2, repeat: isActive ? Infinity : 0 }}
      />

      {/* Background circle — AWS dark panel feel */}
      <motion.circle
        cx={service.x + 40}
        cy={service.y + 40}
        r={40}
        fill="#0d1f33"
        stroke={color}
        strokeWidth={isSelected ? 2.5 : 1.8}
        strokeOpacity={isSelected ? 1 : 0.65}
        whileHover={{ r: 44, fill: `#112440` }}
        transition={{ type: "spring", stiffness: 300 }}
      />

      {/* Inner subtle fill */}
      <circle
        cx={service.x + 40}
        cy={service.y + 40}
        r={38}
        fill={`${color}12`}
      />

      {/* AWS service icon */}
      <AwsIcon
        serviceId={service.id}
        x={service.x + 40}
        y={service.y + 40}
        size={30}
        color={color}
      />

      {/* Label — with dark pill background for readability */}
      <rect
        x={service.x + 40 - 46}
        y={service.y + 86}
        width={92}
        height={16}
        rx={4}
        fill="#07111f"
        fillOpacity={0.9}
      />
      <text
        x={service.x + 40}
        y={service.y + 98}
        textAnchor="middle"
        fill={color}
        fontSize={11}
        fontWeight={700}
        fontFamily="var(--font-inter)"
      >
        {service.label}
      </text>

      {/* "Why" button */}
      <g
        onClick={(e) => { e.stopPropagation(); onWhyClick(service.id); }}
        style={{ cursor: "pointer" }}
      >
        <circle
          cx={service.x + 68}
          cy={service.y + 6}
          r={9}
          fill="#0d1f33"
          stroke={color}
          strokeWidth={1}
          strokeOpacity={0.7}
        />
        <text
          x={service.x + 68}
          y={service.y + 10}
          textAnchor="middle"
          fill={color}
          fontSize={10}
          fontWeight={700}
          fontFamily="serif"
          opacity={0.85}
        >?</text>
      </g>

      {/* Pulse ring on animation */}
      {animatingTo && (
        <motion.circle
          cx={service.x + 40}
          cy={service.y + 40}
          r={40}
          fill="none"
          stroke={color}
          strokeWidth={3}
          initial={{ r: 40, opacity: 0.8 }}
          animate={{ r: 64, opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      )}
    </g>
  );
}