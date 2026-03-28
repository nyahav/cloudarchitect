import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Network, BookOpen } from "lucide-react";
import { motion } from "framer-motion";

const TABS = [
  { path: "/", label: "Architecture Map", icon: Network },
  { path: "/guide", label: "Step-by-Step Guide", icon: BookOpen },
];

export default function AppShell({ children }) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Nav */}
      <nav className="flex items-center gap-1 px-4 md:px-8 pt-4 pb-0 shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-2 mr-4">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(14,165,233,0.2)" }}>
            <span className="text-xs font-black text-primary">AE</span>
          </div>
          <span className="text-sm font-bold text-foreground hidden sm:block">AWS Explorer</span>
        </div>

        {/* Tab buttons */}
        <div
          className="flex gap-1 p-1 rounded-xl"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = location.pathname === tab.path;
            return (
              <Link
                key={tab.path}
                to={tab.path}
                className="relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                style={{ color: isActive ? "#0ea5e9" : "rgba(180,195,220,0.5)" }}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 rounded-lg"
                    style={{ background: "rgba(14,165,233,0.12)", border: "1px solid rgba(14,165,233,0.2)" }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  />
                )}
                <Icon size={14} className="relative z-10" />
                <span className="relative z-10 hidden sm:inline">{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}