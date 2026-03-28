import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, Cloud, Lightbulb, Database, Mail, Package, Shield, Server, Zap, ChevronDown } from "lucide-react";

const iconMap = { Link, Cloud, Lightbulb, Database, Mail, Package, Shield, Server, Zap };

export default function ConceptCards({ concepts, color }) {
  const [expanded, setExpanded] = useState(0);

  return (
    <div className="space-y-2">
      {concepts.map((c, i) => {
        const Icon = iconMap[c.icon] || Lightbulb;
        const isOpen = expanded === i;

        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="rounded-xl overflow-hidden border transition-all"
            style={{ borderColor: isOpen ? `${c.color || color}30` : "rgba(255,255,255,0.06)" }}
          >
            <button
              onClick={() => setExpanded(isOpen ? -1 : i)}
              className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left transition-colors"
              style={{ background: isOpen ? `${c.color || color}10` : "rgba(255,255,255,0.02)" }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: `${c.color || color}20` }}
                >
                  <Icon size={14} style={{ color: c.color || color }} />
                </div>
                <span
                  className="text-sm font-semibold"
                  style={{ color: isOpen ? (c.color || color) : "rgba(210,220,240,0.85)" }}
                >
                  {c.title}
                </span>
              </div>
              <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronDown size={14} className="text-muted-foreground" />
              </motion.div>
            </button>

            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="px-4 pb-4 pt-2">
                    <p className="text-sm leading-relaxed" style={{ color: "rgba(180,195,220,0.85)" }}>
                      {c.text}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}