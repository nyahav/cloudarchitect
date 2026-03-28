import React from "react";
import { motion } from "framer-motion";
import { Server, Database, Mail, Cog, Zap, AlertTriangle, Monitor, HelpCircle } from "lucide-react";

const iconMap = {
  Server,
  Database,
  Mail,
  Cog,
  Zap,
  AlertTriangle,
  Monitor,
};

export default function ServiceNode({ service, isActive, isSelected, onClick, onWhyClick, animatingTo }) {
  const Icon = iconMap[service.icon] || Server;

  return (
    <g
      style={{ cursor: "pointer" }}
      onClick={() => onClick(service.id)}
    >
      {/* Glow effect */}
      <motion.circle
        cx={service.x + 40}
        cy={service.y + 40}
        r={52}
        fill="none"
        stroke={service.color}
        strokeWidth={isSelected ? 3 : 1.5}
        strokeOpacity={isSelected ? 0.6 : 0.15}
        animate={{
          r: isActive ? [52, 58, 52] : 52,
          strokeOpacity: isActive ? [0.3, 0.6, 0.3] : isSelected ? 0.6 : 0.15,
        }}
        transition={{ duration: 2, repeat: isActive ? Infinity : 0 }}
      />

      {/* Background circle */}
      <motion.circle
        cx={service.x + 40}
        cy={service.y + 40}
        r={42}
        fill={`${service.color}15`}
        stroke={service.color}
        strokeWidth={isSelected ? 2.5 : 1.5}
        whileHover={{ r: 46, fill: `${service.color}25` }}
        transition={{ type: "spring", stiffness: 300 }}
      />

      {/* Icon */}
      <foreignObject
        x={service.x + 16}
        y={service.y + 16}
        width={48}
        height={48}
      >
        <div className="flex items-center justify-center w-full h-full">
          <Icon
            size={28}
            style={{ color: service.color }}
          />
        </div>
      </foreignObject>

      {/* Label */}
      <text
        x={service.x + 40}
        y={service.y + 100}
        textAnchor="middle"
        fill={service.color}
        fontSize={12}
        fontWeight={600}
        fontFamily="var(--font-inter)"
      >
        {service.labelHe}
      </text>

      {/* "Why" button */}
      <g
        onClick={(e) => {
          e.stopPropagation();
          onWhyClick(service.id);
        }}
        style={{ cursor: "pointer" }}
      >
        <circle
          cx={service.x + 68}
          cy={service.y + 8}
          r={10}
          fill={`${service.color}30`}
          stroke={service.color}
          strokeWidth={1}
        />
        <foreignObject
          x={service.x + 58}
          y={service.y - 2}
          width={20}
          height={20}
        >
          <div className="flex items-center justify-center w-full h-full">
            <HelpCircle size={12} style={{ color: service.color }} />
          </div>
        </foreignObject>
      </g>

      {/* Pulse ring when animating to this node */}
      {animatingTo && (
        <motion.circle
          cx={service.x + 40}
          cy={service.y + 40}
          r={42}
          fill="none"
          stroke={service.color}
          strokeWidth={3}
          initial={{ r: 42, opacity: 0.8 }}
          animate={{ r: 65, opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      )}
    </g>
  );
}