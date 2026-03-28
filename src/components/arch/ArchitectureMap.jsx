import React, { useState, useCallback } from "react";
import ServiceNode from "./ServiceNode";
import ConnectionLines from "./ConnectionLines";
import DataPacket from "./DataPacket";

export default function ArchitectureMap({
  services = {},
  connections = [],
  activeNodes,
  activeConnection,
  packets,
  onPacketComplete,
  onNodeClick,
  onWhyClick,
  selectedNode,
}) {
  return (
    <div className="relative w-full overflow-hidden rounded-xl border" style={{ background: "#07111f", borderColor: "#00a8e820" }}>
      <svg
        viewBox="0 0 940 540"
        className="w-full h-auto"
        style={{ minHeight: "340px" }}
      >
        {/* Background grid */}
        <defs>
          {/* Cyber grid: small cells + major lines every 5 */}
          <pattern id="cyberGridSmall" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#00a8e8" strokeWidth="0.4" strokeOpacity="0.07" />
          </pattern>
          <pattern id="cyberGridMajor" width="100" height="100" patternUnits="userSpaceOnUse">
            <path d="M 100 0 L 0 0 0 100" fill="none" stroke="#00a8e8" strokeWidth="0.8" strokeOpacity="0.13" />
            {/* Corner dots */}
            <circle cx="0" cy="0" r="1.5" fill="#00a8e8" fillOpacity="0.25" />
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
          <filter id="labelBg" x="-10%" y="-20%" width="120%" height="140%">
            <feFlood floodColor="#0a1628" floodOpacity="0.85" result="bg" />
            <feMerge>
              <feMergeNode in="bg" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <radialGradient id="bgGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00a8e8" stopOpacity="0.04" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Dark base */}
        <rect width="940" height="540" fill="#07111f" />
        <rect width="940" height="540" fill="url(#cyberGridSmall)" />
        <rect width="940" height="540" fill="url(#cyberGridMajor)" />
        <rect width="940" height="540" fill="url(#bgGlow)" />

        {/* Region label */}
        <rect x="20" y="15" width="900" height="510" rx="12" fill="none" stroke="#00a8e8" strokeWidth="0.6" strokeOpacity="0.12" strokeDasharray="8 4" />
        {/* AWS logo + region label */}
        <g transform="translate(36, 24)">
          {/* AWS orange smile logo simplified */}
          <text fontSize="10" fontWeight="700" fontFamily="var(--font-mono)" fill="#FF9900" fillOpacity="0.7">AWS</text>
        </g>
        <text x="470" y="38" textAnchor="middle" fill="#00a8e8" fillOpacity="0.25" fontSize="10" fontFamily="var(--font-mono)">
          us-east-1 · N. Virginia
        </text>

        {/* Connection lines */}
        <ConnectionLines activeConnection={activeConnection} services={services} connections={connections} />

        {/* Service nodes */}
        {Object.values(services).map((service) => (
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