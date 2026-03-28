import React from "react";
import { motion } from "framer-motion";
import { Network, Database, Mail, Package, Shield, Server, Zap, TestTube, CheckCircle } from "lucide-react";

const iconMap = { Network, Database, Mail, Package, Shield, Server, Zap, TestTube };

export default function StepSidebar({ steps = [], activeStep, completedSteps, onSelect }) {
  return (
    <div className="flex flex-col gap-1 py-2">
      {steps.map((step, i) => {
        const Icon = iconMap[step.icon] || Server;
        const isActive = activeStep === step.id;
        const isDone = completedSteps.includes(step.id);

        return (
          <motion.button
            key={step.id}
            onClick={() => onSelect(step.id)}
            whileHover={{ x: 2 }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all group relative"
            style={{
              background: isActive ? `${step.color}18` : "transparent",
              borderLeft: isActive ? `2px solid ${step.color}` : "2px solid transparent",
            }}
          >
            {/* Step number / done check */}
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold transition-all"
              style={{
                background: isActive ? step.color : isDone ? `${step.color}30` : "rgba(255,255,255,0.05)",
                color: isActive ? "#0a0f1a" : isDone ? step.color : "rgba(255,255,255,0.35)",
                boxShadow: isActive ? `0 0 10px ${step.color}60` : "none",
              }}
            >
              {isDone && !isActive ? <CheckCircle size={13} /> : step.id}
            </div>

            {/* Label */}
            <div className="flex-1 min-w-0">
              <div
                className="text-xs font-semibold leading-tight truncate transition-colors"
                style={{ color: isActive ? step.color : isDone ? "rgba(210,220,240,0.75)" : "rgba(210,220,240,0.45)" }}
              >
                {step.title}
              </div>
            </div>

            {/* Active glow dot */}
            {isActive && (
              <motion.div
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ background: step.color, boxShadow: `0 0 6px ${step.color}` }}
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}