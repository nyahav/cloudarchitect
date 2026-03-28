import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Lightbulb } from "lucide-react";
import { SERVICES } from "./serviceData";

export default function WhyPanel({ serviceId, onClose }) {
  const service = serviceId ? SERVICES[serviceId] : null;

  return (
    <AnimatePresence>
      {service && (
        <motion.div
          initial={{ opacity: 0, x: 20, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 20, scale: 0.95 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="absolute top-4 left-4 w-80 z-50"
        >
          <div
            className="rounded-xl border backdrop-blur-xl p-5 shadow-2xl"
            style={{
              background: `linear-gradient(135deg, hsl(222 47% 10% / 0.98), hsl(222 47% 14% / 0.98))`,
              borderColor: `${service.color}50`,
              boxShadow: `0 0 20px ${service.color}20`,
            }}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: `${service.color}20` }}
                >
                  <Lightbulb size={16} style={{ color: service.color }} />
                </div>
                <h3
                  className="font-bold text-sm"
                  style={{ color: service.color }}
                >
                  {service.why.title}
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-md hover:bg-white/10 transition-colors"
              >
                <X size={14} className="text-muted-foreground" />
              </button>
            </div>

            {/* Content */}
            <p className="text-sm leading-relaxed" style={{ color: "rgba(210,220,240,0.85)" }}>
              {service.why.text}
            </p>

            {/* Decorative line */}
            <div
              className="mt-4 h-0.5 rounded-full opacity-20"
              style={{ background: `linear-gradient(to left, transparent, ${service.color})` }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}