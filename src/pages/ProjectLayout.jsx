import React, { useState, useEffect } from "react";
import { useParams, Link, useLocation, Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Network, BookOpen, ChevronLeft, Loader2 } from "lucide-react";

export default function ProjectLayout() {
  const { projectId } = useParams();
  const location = useLocation();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    base44.entities.ArchitectureProject.get(projectId)
      .then((result) => {
        setProject(result || null);
      })
      .finally(() => setLoading(false));
  }, [projectId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <p className="text-muted-foreground">Project not found.</p>
        <Link to="/" className="text-primary text-sm hover:underline">← Back to projects</Link>
      </div>
    );
  }

  const color = project.color || "#0ea5e9";
  const isDashboard = location.pathname.endsWith("/map") || !location.pathname.endsWith("/guide");
  const isGuide = location.pathname.endsWith("/guide");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Project nav bar */}
      <nav
        className="flex items-center gap-3 px-4 md:px-6 py-3 border-b shrink-0"
        style={{ borderColor: "rgba(255,255,255,0.07)", background: "hsl(222 47% 7% / 0.9)" }}
      >
        {/* Back */}
        <Link
          to="/"
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mr-1"
        >
          <ChevronLeft size={14} />
          <span className="hidden sm:inline">All Projects</span>
        </Link>

        <div className="w-px h-5 bg-border" />

        {/* Project name */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div
            className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
            style={{ background: `${color}20` }}
          >
            <Network size={12} style={{ color }} />
          </div>
          <span className="text-sm font-bold text-foreground truncate">{project.name}</span>
        </div>

        {/* Tab switcher */}
        <div
          className="flex gap-1 p-1 rounded-xl shrink-0"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          {[
            { path: `/project/${projectId}/map`, label: "Architecture Map", icon: Network },
            { path: `/project/${projectId}/guide`, label: "Guide", icon: BookOpen },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = location.pathname === tab.path ||
              (tab.path.endsWith("/map") && !location.pathname.endsWith("/guide"));
            return (
              <Link
                key={tab.path}
                to={tab.path}
                className="relative flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={{ color: isActive ? color : "rgba(180,195,220,0.5)" }}
              >
                {isActive && (
                  <motion.div
                    layoutId="projectTab"
                    className="absolute inset-0 rounded-lg"
                    style={{ background: `${color}15`, border: `1px solid ${color}30` }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  />
                )}
                <Icon size={13} className="relative z-10" />
                <span className="relative z-10 hidden sm:inline">{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Page content */}
      <div className="flex-1 overflow-auto">
        <Outlet context={{ project }} />
      </div>
    </div>
  );
}