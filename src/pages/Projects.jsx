import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Network, ArrowRight, Plus, Tag, Loader2 } from "lucide-react";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.ArchitectureProject.list("-created_date")
      .then(setProjects)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative overflow-hidden border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        {/* Background grid */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(14,165,233,0.4) 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />
        {/* Glow blobs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl" style={{ background: "#0ea5e9" }} />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl" style={{ background: "#8b5cf6" }} />

        <div className="relative max-w-5xl mx-auto px-6 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-3 mb-6"
          >
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: "rgba(14,165,233,0.15)", border: "1px solid rgba(14,165,233,0.3)" }}>
              <Network size={24} className="text-primary" />
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4"
          >
            <span className="text-primary">AWS</span>{" "}
            <span className="text-foreground">Architecture</span>
            <br />
            <span className="text-foreground">Explorer</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground text-lg max-w-xl mx-auto"
          >
            Interactive cloud architecture diagrams with step-by-step deployment guides.
            Learn how real AWS systems are built.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-center gap-4 mt-8"
          >
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <span>{projects.length} architecture{projects.length !== 1 ? "s" : ""} available</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Projects grid */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : projects.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-foreground">All Projects</h2>
              <span className="text-sm text-muted-foreground font-mono">{projects.length} total</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {projects.map((project, i) => (
                <ProjectCard key={project.id} project={project} index={i} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ProjectCard({ project, index }) {
  const color = project.color || "#0ea5e9";
  const serviceCount = project.services ? Object.keys(project.services).length : 0;
  const stepCount = project.guide_steps ? project.guide_steps.length : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
    >
      <Link to={`/project/${project.id}`} className="block group">
        <div
          className="rounded-2xl border p-6 transition-all duration-300 hover:scale-[1.02]"
          style={{
            borderColor: `${color}20`,
            background: `linear-gradient(135deg, ${color}08, ${color}03)`,
            boxShadow: `0 0 0 1px ${color}10`,
          }}
        >
          {/* Top accent line */}
          <div className="h-0.5 w-12 rounded-full mb-5" style={{ background: `linear-gradient(to right, ${color}, transparent)` }} />

          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-extrabold text-foreground tracking-tight group-hover:text-primary transition-colors truncate">
                {project.name}
              </h3>
              <p className="text-sm mt-1.5 leading-relaxed line-clamp-2" style={{ color: "rgba(180,195,220,0.7)" }}>
                {project.description}
              </p>
            </div>
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all group-hover:scale-110"
              style={{ background: `${color}20`, boxShadow: `0 0 16px ${color}30` }}
            >
              <Network size={18} style={{ color }} />
            </div>
          </div>

          {/* Tags */}
          {project.tags && project.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {project.tags.slice(0, 4).map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{ background: `${color}15`, color }}
                >
                  <Tag size={9} />
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Stats + CTA */}
          <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span><span className="font-bold" style={{ color }}>{serviceCount}</span> services</span>
              <span><span className="font-bold" style={{ color }}>{stepCount}</span> guide steps</span>
            </div>
            <div
              className="flex items-center gap-1.5 text-xs font-semibold transition-all group-hover:gap-2.5"
              style={{ color }}
            >
              Explore <ArrowRight size={12} />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-24 text-center"
    >
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6" style={{ background: "rgba(14,165,233,0.1)", border: "1px solid rgba(14,165,233,0.2)" }}>
        <Plus size={28} className="text-primary" />
      </div>
      <h3 className="text-xl font-bold text-foreground mb-2">No projects yet</h3>
      <p className="text-sm text-muted-foreground max-w-sm">
        Add your first architecture project via the database to get started.
      </p>
    </motion.div>
  );
}