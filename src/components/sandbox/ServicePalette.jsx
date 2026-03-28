import React from "react";

function ServiceIcon({ icon, color, size = 16 }) {
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

export default function ServicePalette({ services, placedIds, onDrop }) {
  const available = services.filter(s => !placedIds.includes(s.id));
  const placed = services.filter(s => placedIds.includes(s.id));

  const handleDragStart = (e, service) => {
    e.dataTransfer.setData("serviceId", service.id);
  };

  return (
    <div className="flex flex-col gap-3 p-3 h-full overflow-y-auto">
      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1">Services</p>

      {available.length === 0 && (
        <p className="text-xs text-muted-foreground px-1 italic">All placed ✓</p>
      )}

      {available.map(svc => (
        <div
          key={svc.id}
          draggable
          onDragStart={e => handleDragStart(e, svc)}
          className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-grab active:cursor-grabbing transition-all hover:scale-105"
          style={{
            background: `${svc.color}12`,
            border: `1px solid ${svc.color}35`,
          }}
        >
          <ServiceIcon icon={svc.icon} color={svc.color} size={15} />
          <span className="text-xs font-semibold" style={{ color: svc.color }}>
            {svc.label}
          </span>
        </div>
      ))}

      {placed.length > 0 && (
        <>
          <div className="h-px bg-border mt-1" />
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1">Placed</p>
          {placed.map(svc => (
            <div
              key={svc.id}
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg opacity-40"
              style={{ background: `${svc.color}08`, border: `1px dashed ${svc.color}30` }}
            >
              <ServiceIcon icon={svc.icon} color={svc.color} size={15} />
              <span className="text-xs font-semibold" style={{ color: svc.color }}>{svc.label}</span>
            </div>
          ))}
        </>
      )}
    </div>
  );
}