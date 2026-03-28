import React, { useState, useCallback } from "react";
import { SERVICES } from "./serviceData";
import ServiceNode from "./ServiceNode";
import ConnectionLines from "./ConnectionLines";
import DataPacket from "./DataPacket";

export default function ArchitectureMap({
  activeNodes,
  activeConnection,
  packets,
  onPacketComplete,
  onNodeClick,
  onWhyClick,
  selectedNode,
}) {
  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-border/30" style={{ background: "hsl(222 47% 5% / 0.6)" }}>
      <svg
        viewBox="0 0 940 540"
        className="w-full h-auto"
        style={{ minHeight: "340px" }}
      >
        {/* Background grid */}
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.3" strokeOpacity="0.04" />
          </pattern>
          <filter id="packetGlow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="textGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <radialGradient id="bgGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.03" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect width="940" height="540" fill="url(#bgGlow)" />
        <rect width="940" height="540" fill="url(#grid)" />

        {/* Region label */}
        <rect x="20" y="15" width="900" height="510" rx="12" fill="none" stroke="white" strokeWidth="0.5" strokeOpacity="0.06" strokeDasharray="8 4" />
        <text x="470" y="38" textAnchor="middle" fill="white" fillOpacity="0.15" fontSize="11" fontFamily="var(--font-mono)">
          AWS Region: us-east-1 (N. Virginia)
        </text>

        {/* Connection lines */}
        <ConnectionLines activeConnection={activeConnection} />

        {/* Service nodes */}
        {Object.values(SERVICES).map((service) => (
          <ServiceNode
            key={service.id}
            service={service}
            isActive={activeNodes.includes(service.id)}
            isSelected={selectedNode === service.id}
            onClick={onNodeClick}
            onWhyClick={onWhyClick}
            animatingTo={packets.some(p => p.to === service.id)}
          />
        ))}

        {/* Data packets */}
        {packets.map((packet) => (
          <DataPacket
            key={packet.id}
            from={packet.from}
            to={packet.to}
            color={packet.color}
            label={packet.label}
            onComplete={() => onPacketComplete(packet.id)}
          />
        ))}
      </svg>
    </div>
  );
}